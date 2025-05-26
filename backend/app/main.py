from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
from neo4j import GraphDatabase
from datetime import date
from typing import List, Optional
from models.person import PersonConnection, PersonOut, PersonIn, PersonMitVerbindungen

NEO4J_USER: str = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_URI: str = os.environ.get("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_PASSWORD: str = os.environ.get("NEO4J_PASSWORD", "AnkerDinoSchiff")

app = FastAPI()
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

origins = [
    "http://localhost:4200", # development env
    "http://wengenmayr-ahnentafel.de", # hetzner server nginx http server
    "https://wengenmayr-ahnentafel.de", # hetzner server nginx https server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Erlaubt alle HTTP-Methoden (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Erlaubt alle Header
)

def close_driver():
    if driver:
        driver.close()

@app.get("/api/personen", response_model=List[PersonOut])
async def alle_personen():
    try:
        with driver.session() as session:
            query = "MATCH (p:person) RETURN id(p) AS id, p"
            result = session.run(query)
            persons = []
            for record in result:
                person_data = record["p"]
                persons.append(PersonOut(
                    id=record["id"],
                    vorname=person_data.get("vorname"),
                    nachname=person_data.get("nachname"),
                    geburtsname=person_data.get("geburtsname"),
                    geschlecht=person_data.get("geschlecht"),
                    geburtstag=person_data.get("geburtstag"),
                    geburtsort=person_data.get("geburtsort"),
                    todestag=person_data.get("todestag") if len(person_data.get("todestag")) > 1 else None,
                    todesort=person_data.get("todesort"),
                    beruf=person_data.get("beruf")
                ))
            return persons
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")

@app.post("/api/neueperson")
async def neue_person(person_in: PersonIn):
    try:
        with driver.session() as session:
            query = """CREATE (neu:person {
                vorname: $vorname,
                nachname: $nachname,
                geburtsname: $geburtsname,
                geschlecht: $geschlecht,
                geburtstag: $geburtstag,
                geburtsort: $geburtsort,
                todestag: $todestag,
                todesort: $todesort,
                beruf: $beruf })
                RETURN (neu)
                """
            
            result = session.run(query,
                vorname=person_in.vorname,
                nachname=person_in.nachname,
                geburtsname=person_in.geburtsname,
                geschlecht=person_in.geschlecht,
                geburtstag=str(person_in.geburtstag),
                geburtsort=person_in.geburtsort,
                todestag=str(person_in.todestag) if person_in.todestag else None,
                todesort=person_in.todesort,
                beruf=person_in.beruf)
            
            recordNode = result.single()

            if recordNode:
                created_person = dict(recordNode["neu"])
                relation1 = "rel_ehepartner" if (person_in.verbindungsart == "EHEPARTNER") else ( "rel_kind" if (person_in.verbindungsart == "KIND") else "rel_elternteil")
                relation2 = "rel_ehepartner" if (person_in.verbindungsart == "EHEPARTNER") else ( "rel_elternteil" if (person_in.verbindungsart == "KIND") else "rel_kind")

                query = f"""
                    MATCH 
                    (bestand:person {{ 
                        vorname: $bestVorname,
                        nachname: $bestNachname,
                        geburtstag: $bestGeburtstag
                     }}), 
                    (neu:person {{
                        vorname: $vorname,
                        nachname: $nachname,
                        geburtstag: $geburtstag
                    }})
                    CREATE (neu)-[:{relation1}]->(bestand)
                    CREATE (bestand)-[:{relation2}]->(neu)
                    RETURN (neu)"""
                
                result = session.run(query,
                    bestVorname=person_in.verbindungMit.vorname,
                    bestNachname=person_in.verbindungMit.nachname,
                    bestGeburtstag=str(person_in.verbindungMit.geburtstag),
                    vorname=person_in.vorname,
                    nachname=person_in.nachname,
                    geburtstag=str(person_in.geburtstag)
                )

                connectionNode = result.single()

                if connectionNode:
                    created_person = dict(connectionNode["neu"])
                    return {
                        "message": 'Knoten {} {} erstellt'.format(
                            created_person.get('vorname'),
                            created_person.get('nachname')
                        ),"status_code": 200}
                else:
                    raise HTTPException(status_code=500, detail="Datenbankfehler beim erstellen Verknüpfungen")
            else:
                raise HTTPException(status_code=500, detail="Datenbankfehler beim erstellen Person")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")

@app.get("/api/nodes")
async def get_nodes():
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN collect(n)")
        nodes = [record["collect(n)"] for record in result]
        return {"nodes": nodes}
    
@app.post("/api/deleteperson")
async def delete_person(person: PersonConnection):
    try:
        with driver.session() as session:
            query = """MATCH (p:person {
                        vorname: $vorname,
                        nachname: $nachname,
                        geburtstag: $geburtstag
                        }) RETURN (p)"""
            
            result = session.run(query,
                                 vorname = person.vorname,
                                 nachname = person.nachname,
                                 geburtstag = str(person.geburtstag))
            
            connectionNode = result.single()

            if(connectionNode):
                query_1 = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            })-[r:%]->(o:person) DELETE(r)"""
                
                result_1 = session.run(query_1,
                                    vorname = person.vorname,
                                    nachname = person.nachname,
                                    geburtstag = str(person.geburtstag))

                query_2 = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            })<-[r:%]-(o:person) DELETE(r)"""
                
                result_2 = session.run(query_2,
                                    vorname = person.vorname,
                                    nachname = person.nachname,
                                    geburtstag = str(person.geburtstag))

                query_3 = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            }) DELETE(p)"""
                
                result_3 = session.run(query_3,
                                    vorname = person.vorname,
                                    nachname = person.nachname,
                                    geburtstag = str(person.geburtstag))
                
                return {"message": f"{person.vorname} {person.nachname} gelöscht","status_code": 200}
            else:
                return {"message": "Angeforderter Knoten existiert nicht", "status_code": 204}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")

@app.get("/api/verbindungen")
async def get_verbindungen(
    vorname: str = Query(..., description="Vorname der Bezugsperson"),
    nachname: str = Query(..., description="Nachname der Bezugsperson"),
    geburtstag: date = Query(..., description="Geburtstag der Bezugsperson im Format YYYY-MM-DD")
):
    bezugsperson_data = {
        "vorname": vorname,
        "nachname": nachname,
        "geburtstag": geburtstag
    }
    bezugsperson = PersonConnection(**bezugsperson_data)

    try:
        with driver.session() as session:
            query = """MATCH (p: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            }) RETURN id(p) AS id, (p)"""
            
            result = session.run(query,
                                 vorname = bezugsperson.vorname,
                                 nachname = bezugsperson.nachname,
                                 geburtstag = str(bezugsperson.geburtstag))
            
            nodeBezugsPerson = result.single()
            dictsBezugsPerson = dict(nodeBezugsPerson["p"])
            bezugspersonKomplett = PersonOut(
                id=nodeBezugsPerson["id"],
                vorname=dictsBezugsPerson.get("vorname"),
                nachname=dictsBezugsPerson.get("nachname"),
                geburtsname=dictsBezugsPerson.get("geburtsname"),
                geschlecht=dictsBezugsPerson.get("geschlecht"),
                geburtstag=dictsBezugsPerson.get("geburtstag"),
                geburtsort=dictsBezugsPerson.get("geburtsort"),
                todestag=dictsBezugsPerson.get("todestag") if len(dictsBezugsPerson.get("todestag")) > 1 else None,
                todesort=dictsBezugsPerson.get("todesort"),
                beruf=dictsBezugsPerson.get("beruf")

            )

            query_1 = """MATCH (bezug: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            })-[r:rel_kind]->(p: person) RETURN  id(p) AS id, (p)"""
            
            result_1 = session.run(query_1,
                                    vorname = bezugsperson.vorname,
                                    nachname = bezugsperson.nachname,
                                    geburtstag = str(bezugsperson.geburtstag))
            
            kinderListe = []
            for record in result_1:
                person_data = record["p"]
                kinderListe.append(PersonOut(
                    id=record["id"],
                    vorname=person_data.get("vorname"),
                    nachname=person_data.get("nachname"),
                    geburtsname=person_data.get("geburtsname"),
                    geschlecht=person_data.get("geschlecht"),
                    geburtstag=person_data.get("geburtstag"),
                    geburtsort=person_data.get("geburtsort"),
                    todestag=person_data.get("todestag") if len(person_data.get("todestag")) > 1 else None,
                    todesort=person_data.get("todesort"),
                    beruf=person_data.get("beruf")
                ))

            query_2 = """MATCH (bezug: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            })-[r:rel_elternteil]->(p: person) RETURN  id(p) AS id, (p)"""
            
            result_2 = session.run(query_2,
                                    vorname = bezugsperson.vorname,
                                    nachname = bezugsperson.nachname,
                                    geburtstag = str(bezugsperson.geburtstag))
            
            elternListe = []
            for record in result_2:
                person_data = record["p"]
                elternListe.append(PersonOut(
                    id=record["id"],
                    vorname=person_data.get("vorname"),
                    nachname=person_data.get("nachname"),
                    geburtsname=person_data.get("geburtsname"),
                    geschlecht=person_data.get("geschlecht"),
                    geburtstag=person_data.get("geburtstag"),
                    geburtsort=person_data.get("geburtsort"),
                    todestag=person_data.get("todestag") if len(person_data.get("todestag")) > 1 else None,
                    todesort=person_data.get("todesort"),
                    beruf=person_data.get("beruf")
                ))

            query_3 = """MATCH (bezug: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag
                            })-[r:rel_ehepartner]->(p: person) RETURN  id(p) AS id, (p)"""
            
            result_3 = session.run(query_3,
                                    vorname = bezugsperson.vorname,
                                    nachname = bezugsperson.nachname,
                                    geburtstag = str(bezugsperson.geburtstag))
            
            ehepartnerListe = []
            for record in result_3:
                person_data = record["p"]
                ehepartnerListe.append(PersonOut(
                    id=record["id"],
                    vorname=person_data.get("vorname"),
                    nachname=person_data.get("nachname"),
                    geburtsname=person_data.get("geburtsname"),
                    geschlecht=person_data.get("geschlecht"),
                    geburtstag=person_data.get("geburtstag"),
                    geburtsort=person_data.get("geburtsort"),
                    todestag=person_data.get("todestag") if len(person_data.get("todestag")) > 1 else None,
                    todesort=person_data.get("todesort"),
                    beruf=person_data.get("beruf")
                ))

            verbindungen = PersonMitVerbindungen(
                bezugsperson = bezugspersonKomplett,
                kinder = kinderListe,
                eltern = elternListe,
                ehepartner = ehepartnerListe
            )

            if(verbindungen):
                return verbindungen

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.on_event("shutdown")
def shutdown_event():
    close_driver()

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
