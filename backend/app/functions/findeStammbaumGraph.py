from models.graphen import (
    StammbaumGraph,
    StammbaumKnoten
)
from models.person import (
    PersonConnection
)
from functions.leseAllePersonen import leseAllePersonen
from functions.leseVerbindungen import leseVerbindungen

def findeStammbaumGraph(driver, tenant):
    allePersonen = leseAllePersonen(driver, tenant)

    erstePerson = allePersonen[0]
    erstePersonConnection = PersonConnection(
        vorname = erstePerson.vorname,
        nachname = erstePerson.nachname,
        geburtstag = erstePerson.geburtstag,
        tenant = erstePerson.tenant
    ) 
    ersteVerbindung = leseVerbindungen(driver, erstePersonConnection)
    kinder_ids = [kind.id for kind in ersteVerbindung.kinder]
    eltern_ids = [mapa.id for mapa in ersteVerbindung.eltern]

    knoten = StammbaumKnoten(
        id = ersteVerbindung.bezugsperson.id,
        vorgaenger = eltern_ids,
        nachfolger = kinder_ids
    )

    stammbaum = StammbaumGraph()
    stammbaum.graph.append(knoten)

    return stammbaum
