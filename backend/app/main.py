from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

NEO4J_URI = "bolt://neo4j:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "AnkerDinoSchiff"

app = FastAPI()
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

origins = [
    "http://localhost:55506",  # Typische Angular Entwicklungsumgebung
    "http://localhost:4200",
    "http://static.255.83.99.91.clients.your-server.de:4200", # hetzner server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Erlaubt alle HTTP-Methoden (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Erlaubt alle Header
)

class PersonIn(BaseModel):
    vorname: str = Field(..., description="Vorname der Person")
    nachname: str = Field(..., description="Nachname der Person")
    geburtstag: date = Field(..., description="Geburtsdatum der Person im Format YYYY-MM-TT")
    geburtsort: Optional[str] = Field(None, description="Geburtsort der Person (optional)")
    todestag: Optional[date] = Field(None, description="Todestag der Person im Format YYYY-MM-TT (optional)")
    todesort: Optional[str] = Field(None, description="Todesort der Person (optional)")
    beruf: Optional[str] = Field(None, description="Beruf der Person (optional)")

class PersonOut(BaseModel):
    id: int
    vorname: str
    nachname: str
    geburtstag: date
    geburtsort: Optional[str] = None
    todestag: Optional[date] = None
    todesort: Optional[str] = None
    beruf: Optional[str] = None

def close_driver():
    if driver:
        driver.close()

@app.get("/api/nodes")
async def get_nodes():
    with driver.session() as session:
        result = session.run("MATCH (n) RETURN collect(n)")
        nodes = [record["collect(n)"] for record in result]
        return {"nodes": nodes}

@app.post("/api/neueperson")
async def create_person(person: PersonIn):
    """
    Erstellt eine neue Person, wenn die Pflichtfelder gesetzt sind.
    """
    # Hier kannst du auf die einzelnen Felder zugreifen:
    # person.vorname, person.nachname, person.geburtstag, etc.

    # Wenn die Validierung durch Pydantic erfolgreich ist, sind die Pflichtfelder gesetzt.
    # Wir können hier später die Logik zum Speichern in Neo4j hinzufügen.
    return {"message": "Daten sind gültig.", "status_code": 200}

@app.get("/api/personen/", response_model=List[PersonOut])
async def get_all_persons():
    """
    Gibt eine Liste aller Personen zurück. (Aktuell gemockt)
    """
    mock_persons = [
        PersonOut(
            id=1,
            vorname="Max",
            nachname="Mustermann",
            geburtstag=date(1985, 7, 20),
            beruf="Softwareentwickler"
        ),
        PersonOut(
            id=2,
            vorname="Erika",
            nachname="Schmidt",
            geburtstag=date(1992, 3, 15),
            geburtsort="Berlin"
        )
    ]
    return mock_persons

@app.on_event("shutdown")
def shutdown_event():
    close_driver()

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
