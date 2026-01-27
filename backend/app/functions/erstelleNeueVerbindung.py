from fastapi import HTTPException
from models.person import PersonenZumVerbinden


def erstelleNeueVerbindung(driver, persons: PersonenZumVerbinden, tenantId):
    with driver.session() as session:
        query = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            }) RETURN p"""

        result = session.run(
            query,
            vorname=persons.person1.vorname,
            nachname=persons.person1.nachname,
            geburtstag=str(persons.person1.geburtstag),
            tenant=tenantId,
        )

        personNode1 = result.single()

        if personNode1 is None:
            raise HTTPException(
                status_code=404,
                detail=f"Person {persons.person1.vorname} {persons.person1.nachname} nicht in DB gefunden",
            )

        result = session.run(
            query,
            vorname=persons.person2.vorname,
            nachname=persons.person2.nachname,
            geburtstag=str(persons.person2.geburtstag),
            tenant=tenantId,
        )

        personNode2 = result.single()

        if personNode2 is None:
            raise HTTPException(
                status_code=404,
                detail=f"Person {persons.person2.vorname} {persons.person2.nachname} nicht in DB gefunden",
            )

        verbindungsart: str = persons.verbindungsart

        if (
            (verbindungsart == "EHEPARTNER")
            or (verbindungsart == "KIND")
            or (verbindungsart == "ELTERNTEIL")
        ):
            relation1 = (
                "rel_ehepartner"
                if (verbindungsart == "EHEPARTNER")
                else ("rel_kind" if (verbindungsart == "KIND") else "rel_elternteil")
            )
            relation2 = (
                "rel_ehepartner"
                if (verbindungsart == "EHEPARTNER")
                else ("rel_elternteil" if (verbindungsart == "KIND") else "rel_kind")
            )
        else:
            raise HTTPException(status_code=409, detail="ungültiger Verbindungstyp")
        
        query = f"""MATCH 
                        (p1:person {{ 
                            vorname: $p1Vorname,
                            nachname: $p1Nachname,
                            geburtstag: $p1Geburtstag
                        }})-[r:{relation2}]->
                        (p2:person {{
                            vorname: $p2Vorname,
                            nachname: $p2Nachname,
                            geburtstag: $p2Geburtstag
                        }})
                        RETURN (r)"""
        
        result = session.run(
            query,
            p1Vorname=persons.person1.vorname,
            p1Nachname=persons.person1.nachname,
            p1Geburtstag=str(persons.person1.geburtstag),
            p2Vorname=persons.person2.vorname,
            p2Nachname=persons.person2.nachname,
            p2Geburtstag=str(persons.person2.geburtstag),
        )

        connectionTest = result.single()

        if connectionTest:
            raise HTTPException(status_code=409, detail="Verbindung existiert bereits")

        query = f"""MATCH 
                        (p1:person {{ 
                            vorname: $p1Vorname,
                            nachname: $p1Nachname,
                            geburtstag: $p1Geburtstag
                        }}), 
                        (p2:person {{
                            vorname: $p2Vorname,
                            nachname: $p2Nachname,
                            geburtstag: $p2Geburtstag
                        }})
                        CREATE (p1)-[r:{relation2}]->(p2)
                        CREATE (p2)-[:{relation1}]->(p1)
                        RETURN (r)"""

        result = session.run(
            query,
            p1Vorname=persons.person1.vorname,
            p1Nachname=persons.person1.nachname,
            p1Geburtstag=str(persons.person1.geburtstag),
            p2Vorname=persons.person2.vorname,
            p2Nachname=persons.person2.nachname,
            p2Geburtstag=str(persons.person2.geburtstag),
        )

        connectionNode = result.single()
        if connectionNode:
            return {
                "message": f"Verbindung {persons.person1.vorname} zu {persons.person2.vorname} erstellt",
                "status_code": 201,
            }
        else:
            raise HTTPException(
                status_code=500, detail="Verbindung erstellen fehlgeschlagen"
            )
