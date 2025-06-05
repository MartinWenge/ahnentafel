from models.person import PersonConnection, PersonMitVerbindungen, PersonOut


def leseVerbindungen(driver, bezugsperson: PersonConnection):
    with driver.session() as session:
        query = """MATCH (p: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            }) RETURN id(p) AS id, (p)"""

        result = session.run(
            query,
            vorname=bezugsperson.vorname,
            nachname=bezugsperson.nachname,
            geburtstag=str(bezugsperson.geburtstag),
            tenant=bezugsperson.tenant,
        )

        nodeBezugsPerson = result.single()
        dictsBezugsPerson = dict(nodeBezugsPerson["p"])
        bezugspersonKomplett = PersonOut(
            id=nodeBezugsPerson["id"],
            tenant=dictsBezugsPerson.get("tenant"),
            vorname=dictsBezugsPerson.get("vorname"),
            nachname=dictsBezugsPerson.get("nachname"),
            geburtsname=dictsBezugsPerson.get("geburtsname"),
            geschlecht=dictsBezugsPerson.get("geschlecht"),
            geburtstag=dictsBezugsPerson.get("geburtstag"),
            geburtsort=dictsBezugsPerson.get("geburtsort"),
            todestag=(
                dictsBezugsPerson.get("todestag")
                if len(dictsBezugsPerson.get("todestag")) > 1
                else None
            ),
            todesort=dictsBezugsPerson.get("todesort"),
            beruf=dictsBezugsPerson.get("beruf"),
        )

        query_1 = """MATCH (bezug: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            })-[r:rel_kind]->(p: person) RETURN  id(p) AS id, (p)"""

        result_1 = session.run(
            query_1,
            vorname=bezugsperson.vorname,
            nachname=bezugsperson.nachname,
            geburtstag=str(bezugsperson.geburtstag),
            tenant=bezugsperson.tenant,
        )

        kinderListe = []
        for record in result_1:
            person_data = record["p"]
            kinderListe.append(
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

        query_2 = """MATCH (bezug: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            })-[r:rel_elternteil]->(p: person) RETURN  id(p) AS id, (p)"""

        result_2 = session.run(
            query_2,
            vorname=bezugsperson.vorname,
            nachname=bezugsperson.nachname,
            geburtstag=str(bezugsperson.geburtstag),
            tenant=bezugsperson.tenant,
        )

        elternListe = []
        for record in result_2:
            person_data = record["p"]
            elternListe.append(
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

        query_3 = """MATCH (bezug: person {
                            vorname: $vorname,
                            nachname: $nachname,
                            geburtstag: $geburtstag,
                            tenant: $tenant
                            })-[r:rel_ehepartner]->(p: person) RETURN  id(p) AS id, (p)"""

        result_3 = session.run(
            query_3,
            vorname=bezugsperson.vorname,
            nachname=bezugsperson.nachname,
            geburtstag=str(bezugsperson.geburtstag),
            tenant=bezugsperson.tenant,
        )

        ehepartnerListe = []
        for record in result_3:
            person_data = record["p"]
            ehepartnerListe.append(
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

        verbindungen = PersonMitVerbindungen(
            bezugsperson=bezugspersonKomplett,
            kinder=kinderListe,
            eltern=elternListe,
            ehepartner=ehepartnerListe,
        )

        if verbindungen:
            return verbindungen
