from models.person import PersonOut

def leseAllePersonen(driver, tenant):
    with driver.session() as session:
            query = """MATCH (p:person {
                                tenant: $tenantIn
                                }) RETURN elementId(p) AS id, p"""
            result = session.run(query, tenantIn=tenant)
            persons = []
            for record in result:
                person_data = record["p"]
                persons.append(
                    PersonOut(
                        id=record["id"],
                        tenant=person_data.get("tenant"),
                        vorname=person_data.get("vorname"),
                        nachname=person_data.get("nachname"),
                        geburtsname=person_data.get("geburtsname"),
                        geschlecht=person_data.get("geschlecht"),
                        geburtstag=person_data.get("geburtstag"),
                        geburtsort=person_data.get("geburtsort"),
                        todestag=(
                            person_data.get("todestag")
                            if len(person_data.get("todestag")) > 1
                            else None
                        ),
                        todesort=person_data.get("todesort"),
                        beruf=person_data.get("beruf"),
                    )
                )
            return persons