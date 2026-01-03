from fastapi import HTTPException
from models.person import PersonIn


def erstelleNeuePerson(driver, person_in: PersonIn, tenantId):
    with driver.session() as session:
        query = """MATCH (p:person {
                        vorname: $vorname,
                        nachname: $nachname,
                        geburtstag: $geburtstag,
                        tenant: $tenant
                        }) RETURN (p)"""

        result = session.run(
            query,
            vorname=person_in.vorname,
            nachname=person_in.nachname,
            geburtstag=str(person_in.geburtstag),
            tenant=tenantId,
        )

        connectionNode = result.single()

        if connectionNode:
            raise HTTPException(
                status_code=409,
                detail="Fehler: Person {} {} existert bereits in Datenbank.".format(
                    person_in.vorname, person_in.nachname
                ),
            )
        else:
            query = """CREATE (neu:person {
                    vorname: $vorname,
                    nachname: $nachname,
                    tenant: $tenant,
                    geburtsname: $geburtsname,
                    geschlecht: $geschlecht,
                    geburtstag: $geburtstag,
                    geburtsort: $geburtsort,
                    todestag: $todestag,
                    todesort: $todesort,
                    beruf: $beruf })
                    RETURN (neu)
                    """

            result = session.run(
                query,
                vorname=person_in.vorname,
                nachname=person_in.nachname,
                tenant=tenantId,
                geburtsname=person_in.geburtsname,
                geschlecht=person_in.geschlecht,
                geburtstag=str(person_in.geburtstag),
                geburtsort=person_in.geburtsort,
                todestag=str(person_in.todestag) if person_in.todestag else "",
                todesort=person_in.todesort,
                beruf=person_in.beruf,
            )

            recordNode = result.single()

            if recordNode:
                created_person = dict(recordNode["neu"])
                if (
                    (person_in.verbindungsart == "EHEPARTNER")
                    or (person_in.verbindungsart == "KIND")
                    or (person_in.verbindungsart == "ELTERNTEIL")
                ):
                    relation1 = (
                        "rel_ehepartner"
                        if (person_in.verbindungsart == "EHEPARTNER")
                        else (
                            "rel_kind"
                            if (person_in.verbindungsart == "KIND")
                            else "rel_elternteil"
                        )
                    )
                    relation2 = (
                        "rel_ehepartner"
                        if (person_in.verbindungsart == "EHEPARTNER")
                        else (
                            "rel_elternteil"
                            if (person_in.verbindungsart == "KIND")
                            else "rel_kind"
                        )
                    )
                else:
                    raise HTTPException(
                        status_code=409, detail="ungültiger Verbindungstyp"
                    )

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
                        CREATE (neu)-[:{relation2}]->(bestand)
                        CREATE (bestand)-[:{relation1}]->(neu)
                        RETURN (neu)"""

                result = session.run(
                    query,
                    bestVorname=person_in.verbindungMit.vorname,
                    bestNachname=person_in.verbindungMit.nachname,
                    bestGeburtstag=str(person_in.verbindungMit.geburtstag),
                    vorname=person_in.vorname,
                    nachname=person_in.nachname,
                    geburtstag=str(person_in.geburtstag),
                )

                connectionNode = result.single()

                if connectionNode:
                    created_person = dict(connectionNode["neu"])
                    return {
                        "message": "Knoten {} {} erstellt".format(
                            created_person.get("vorname"),
                            created_person.get("nachname"),
                        ),
                        "status_code": 201,
                    }
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="Datenbankfehler beim erstellen Verknüpfungen",
                    )
            else:
                raise HTTPException(
                    status_code=500, detail="Datenbankfehler beim erstellen Person"
                )
