from fastapi import HTTPException
from models.person import PersonenZumVerbinden


def loescheVerbindung(driver, verbindungZumLoeschen: PersonenZumVerbinden):
    with driver.session() as session:
        query = """MATCH (p1:person {
                            vorname: $vorname1,
                            nachname: $nachname1,
                            geburtstag: $geburtstag1,
                            tenant: $tenant1
                            })-[r]-(p2:person {
                            vorname: $vorname2,
                            nachname: $nachname2,
                            geburtstag: $geburtstag2,
                            tenant: $tenant2
                            }) RETURN type(r) AS relation_type"""

        result = session.run(
            query,
            vorname1=verbindungZumLoeschen.person1.vorname,
            nachname1=verbindungZumLoeschen.person1.nachname,
            geburtstag1=str(verbindungZumLoeschen.person1.geburtstag),
            tenant1=verbindungZumLoeschen.person1.tenant,
            vorname2=verbindungZumLoeschen.person2.vorname,
            nachname2=verbindungZumLoeschen.person2.nachname,
            geburtstag2=str(verbindungZumLoeschen.person2.geburtstag),
            tenant2=verbindungZumLoeschen.person2.tenant,
        )

        records = result.data()

        if not records:
            raise HTTPException(
                status_code=204,
                detail=f"Personen {verbindungZumLoeschen.person1.vorname} und {verbindungZumLoeschen.person2.vorname} sind nicht verbunden.",
            )

        relation_types = [record["relation_type"] for record in records]
        queryLoeschen = """MATCH (p1:person {
                            vorname: $vorname1,
                            nachname: $nachname1,
                            geburtstag: $geburtstag1,
                            tenant: $tenant1
                            })-[r]-(p2:person {
                            vorname: $vorname2,
                            nachname: $nachname2,
                            geburtstag: $geburtstag2,
                            tenant: $tenant2
                            }) DELETE r"""

        loeschen = session.run(
            queryLoeschen,
            vorname1=verbindungZumLoeschen.person1.vorname,
            nachname1=verbindungZumLoeschen.person1.nachname,
            geburtstag1=str(verbindungZumLoeschen.person1.geburtstag),
            tenant1=verbindungZumLoeschen.person1.tenant,
            vorname2=verbindungZumLoeschen.person2.vorname,
            nachname2=verbindungZumLoeschen.person2.nachname,
            geburtstag2=str(verbindungZumLoeschen.person2.geburtstag),
            tenant2=verbindungZumLoeschen.person2.tenant,
        )

        return {
            "message": f"Verbindung {verbindungZumLoeschen.person1.vorname}-{verbindungZumLoeschen.person2.vorname} gelöscht",
            "status_code": 200,
        }
