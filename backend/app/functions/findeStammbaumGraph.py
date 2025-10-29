from collections import deque
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

    process_graph = {}
    eingangs_grad = {}
    gen_0_knoten = []
    stammbaum = StammbaumGraph()

    for person in allePersonen:
        person_connection = PersonConnection(
            vorname = person.vorname,
            nachname = person.nachname,
            geburtstag = person.geburtstag,
            tenant = person.tenant
        )
        verbindung = leseVerbindungen(driver, person_connection)
        kinder_ids = [kind.id for kind in verbindung.kinder]
        eltern_ids = [mapa.id for mapa in verbindung.eltern]
        partner_ids = [partner.id for partner in verbindung.ehepartner]
        key = verbindung.bezugsperson.id

        knoten = StammbaumKnoten(
            id = key,
            name = f"{person.vorname} {person.nachname}, {person.geburtstag}",
            vorgaenger = eltern_ids,
            nachfolger = kinder_ids,
            partner = partner_ids,
            generation = 0
        )
        stammbaum.graph.append(knoten)

        process_graph.update({key:kinder_ids})
        eingangs_grad.update({key:len(eltern_ids)})
        if(len(eltern_ids)<1):
            gen_0_knoten.append(key)

    # Berechnung der Generation:
    generations = {} 
    queue = deque()

    for knoten_id in gen_0_knoten:
        queue.append(knoten_id)
        generations.update({knoten_id:0})

    while queue:
        queue_element = queue.popleft()
        current_generation = generations[queue_element]

        for v in process_graph.get(queue_element, []):
            eingangs_grad[v] -= 1

            if eingangs_grad[v] == 0:
                generations[v] = current_generation + 1
                queue.append(v)

    g_max_value = max(generations.values())
    g_max_keys = [key for key in generations if generations[key] == g_max_value]

    # update der generation anhand des längsten weges = größte generation
    queue.clear()
    for id in g_max_keys:
        queue.append(id)

    already_updated = set(queue)
    while queue:
        queue_element = queue.popleft()
        current_generation = generations[queue_element]

        knoten = next(
            (k for k in stammbaum.graph if k.id == queue_element), 
            None
        )

        for elternteil_id in knoten.vorgaenger:
            if not (elternteil_id in already_updated):
                if generations[elternteil_id] != (current_generation-1):
                    generations[elternteil_id] = current_generation-1
                already_updated.add(elternteil_id)
                queue.append(elternteil_id)

        for partner_id in knoten.partner:
            if not (partner_id in already_updated):
                if generations[partner_id] != current_generation:
                    generations[partner_id] = current_generation
                already_updated.add(partner_id)
                queue.append(partner_id)

        for kind_id in knoten.nachfolger:
            if not (kind_id in already_updated):
                if generations[kind_id] != (current_generation+1):
                    generations[kind_id] = (current_generation+1)
                already_updated.add(kind_id)
                queue.append(kind_id)
    if len(already_updated) != len(stammbaum.graph):
        print("findeStammbaumGraph: nicht alle knoten wurden korrigiert?")

    for knoten in stammbaum.graph:
        knoten.generation = generations[knoten.id]

    return stammbaum
