from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from neo4j import GraphDatabase
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

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

class PersonIn(BaseModel):
    id: Optional[int] = Field(None, description="Id der Person in der Datenbank")
    vorname: str = Field(..., description="Vorname der Person")
    nachname: str = Field(..., description="Nachname der Person")
    geburtstag: date = Field(..., description="Geburtsdatum der Person im Format YYYY-MM-TT")
    geschlecht: str = Field(..., description="Geschlecht (männlich:m, weiblich:w)")
    geburtsname: Optional[str] = Field(None, description="Geburtsname, falls vorhanden (optional)")
    geburtsort: Optional[str] = Field(None, description="Geburtsort der Person (optional)")
    todestag: Optional[date] = Field(None, description="Todestag der Person im Format YYYY-MM-TT (optional)")
    todesort: Optional[str] = Field(None, description="Todesort der Person (optional)")
    beruf: Optional[str] = Field(None, description="Beruf der Person (optional)")
    verbindungMit: int = Field(..., description="ID der zu verbindenden Person")
    verbindungsart: str = Field(..., description="Verbindungstyp: KIND, ELTERNTEIL, EHEPARTNER")

class PersonOut(BaseModel):
    id: int
    vorname: str
    nachname: str
    geburtstag: date
    geschlecht: str
    geburtsname: Optional[str] = None
    geburtsort: Optional[str] = None
    todestag: Optional[date] = None
    todesort: Optional[str] = None
    beruf: Optional[str] = None

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

    relation1 = "rel_ehepartner" if (person_in.verbindungsart == "EHEPARTNER") else ( "rel_kind" if (person_in.verbindungsart == "KIND") else "rel_elternteil")
    relation2 = "rel_ehepartner" if (person_in.verbindungsart == "EHEPARTNER") else ( "rel_elternteil" if (person_in.verbindungsart == "KIND") else "rel_kind")
    
    try:
        with driver.session() as session:
            query = """CREATE (neu:person {
                vorname: $vorname,
                nachname: $nachname,
                geburtsname: $geburtsname,
                geschlecht: $geschlecht,
                geburtstag: date($geburtstag),
                geburtsort: $geburtsort,
                todestag: date($todestag),
                todesort: $todesort,
                beruf: $beruf })
                
                MATCH (bestand:person {
                id:$IDVerknuepftePerson
                })
                CREATE (neu)-[:$relTyp1]->(bestand)
                CREATE (bestand)-[:relTyp2]->(neu)
                
                RETURN p"""
            result = session.run(query,
                vorname=person_in.vorname,
                nachname=person_in.nachname,
                geburtsname=person_in.geburtsname,
                geschlecht=person_in.geschlecht,
                geburtstag=str(person_in.geburtstag),
                geburtsort=person_in.geburtsort,
                todestag=str(person_in.todestag) if person_in.todestag else None,
                todesort=person_in.todesort,
                beruf=person_in.beruf,
                IDVerknuepftePerson=person_in.verbindungMit,
                relTyp1=relation1,
                relTyp2=relation2)

            recordNode = result.single()

            if recordNode:
                created_person = dict(recordNode["neu"])
                return {
                    "message": 'Knoten {} {} erstellt'.format(
                        created_person.get('vorname'),
                        created_person.get('nachname')
                    ),"status_code": 200}
            else:
                raise HTTPException(status_code=500, detail="Fehler beim Erstellen des Person-Knotens.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")

@app.get("/api/nodes")
async def get_nodes():
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN collect(n)")
        nodes = [record["collect(n)"] for record in result]
        return {"nodes": nodes}

@app.on_event("shutdown")
def shutdown_event():
    close_driver()

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
