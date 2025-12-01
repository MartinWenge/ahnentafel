from fastapi import HTTPException
from models.person import PersonOut


def korrigierePerson(driver, person: PersonOut):
    with driver.session() as session:
        query = """MATCH (p:person) WHERE elementId(p) = $id RETURN (p)"""

        result = session.run(query, id=person.id)

        connectionNode = result.single()

        if connectionNode:
            query = """MATCH (p:person) WHERE elementId(p) = $id SET
                    p.vorname = $vorname,
                    p.nachname = $nachname,
                    p.geburtstag = $geburtstag,
                    p.geschlecht = $geschlecht,
                    p.geburtsname = $geburtsname,
                    p.geburtsort = $geburtsort,
                    p.todestag = $todestag,
                    p.todesort = $todesort,
                    p.beruf = $beruf
                    """

            resultUpdate = session.run(
                query,
                id=person.id,
                vorname=person.vorname,
                nachname=person.nachname,
                geburtstag=str(person.geburtstag),
                geburtsname=person.geburtsname,
                geburtsort=person.geburtsort,
                geschlecht=person.geschlecht,
                beruf=person.beruf,
                todestag=str(person.todestag) if person.todestag else "",
                todesort=person.todesort,
            )

            return {
                "message": f"Person {person.vorname} {person.nachname} aktualisiert",
                "status_code": 200,
            }

        else:
            raise HTTPException(
                status_code=409,
                detail="Fehler: Person {} {} existert nicht in Datenbank.".format(
                    person.vorname, person.nachname
                ),
            )
