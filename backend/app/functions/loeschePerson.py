from models.person import PersonConnection


def loeschePerson(driver, person: PersonConnection):
    with driver.session() as session:
        query = """MATCH (p:person {
                        vorname: $vorname,
                        nachname: $nachname,
                        geburtstag: $geburtstag,
                        tenant: $tenant
                        }) RETURN (p)"""

        result = session.run(
            query,
            vorname=person.vorname,
            nachname=person.nachname,
            geburtstag=str(person.geburtstag),
            tenant=person.tenant,
        )

        connectionNode = result.single()

        if connectionNode:
            query_1 = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            })-[r:%]->(o:person) DELETE(r)"""

            result_1 = session.run(
                query_1,
                vorname=person.vorname,
                nachname=person.nachname,
                geburtstag=str(person.geburtstag),
                tenant=person.tenant,
            )

            query_2 = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            })<-[r:%]-(o:person) DELETE(r)"""

            result_2 = session.run(
                query_2,
                vorname=person.vorname,
                nachname=person.nachname,
                geburtstag=str(person.geburtstag),
                tenant=person.tenant,
            )

            query_3 = """MATCH (p:person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            }) DELETE(p)"""

            result_3 = session.run(
                query_3,
                vorname=person.vorname,
                nachname=person.nachname,
                geburtstag=str(person.geburtstag),
                tenant=person.tenant,
            )

            return {
                "message": f"{person.vorname} {person.nachname} gelöscht",
                "status_code": 200,
            }
        else:
            return {
                "message": "Angeforderter Knoten existiert nicht",
                "status_code": 204,
            }
