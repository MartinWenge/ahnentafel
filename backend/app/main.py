from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
from neo4j import GraphDatabase
from datetime import date
from typing import List, Optional
from models.person import (
    PersonConnection,
    PersonOut,
    PersonIn,
    PersonenZumVerbinden,
    PersonMitVerbindungen,
)
from functions.leseAllePersonen import leseAllePersonen
from functions.erstelleNeuePerson import erstelleNeuePerson
from functions.loeschePerson import loeschePerson
from functions.loescheVerbindung import loescheVerbindung
from functions.leseVerbindungen import leseVerbindungen
from functions.erstelleNeueVerbindung import erstelleNeueVerbindung

NEO4J_USER: str = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_URI: str = os.environ.get("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_PASSWORD: str = os.environ.get("NEO4J_PASSWORD", "AnkerDinoSchiff")

app = FastAPI()
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

origins = [
    "http://localhost:4200",  # development env
    "http://wengenmayr-ahnentafel.de",  # hetzner server nginx http server
    "https://wengenmayr-ahnentafel.de",  # hetzner server nginx https server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Erlaubt alle HTTP-Methoden (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Erlaubt alle Header
)


def close_driver():
    if driver:
        driver.close()


@app.get("/api/accesstoken")
async def get_verbindungen(
    token: str = Query(..., description="vom Benutzer eingegebener Token")
):
    validToken = "12stelligerT"
    if token == validToken:
        return {"tenantId": "b50d4bb8-e6a0-4015-afed-115f4e0d9d35"}
    else:
        raise HTTPException(status_code=401, detail="Token invalide")


@app.get("/api/personen", response_model=List[PersonOut])
async def alle_personen(
    tenant: str = Query(..., description="Kunden ID des aktuellen tenants")
):
    try:
        persons = leseAllePersonen(driver, tenant)
        return persons
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.post("/api/neueperson")
async def neue_person(person_in: PersonIn):
    try:
        response = erstelleNeuePerson(driver, person_in)
        return response
    except Exception as e:
        if e.status_code == 409:
            raise HTTPException(status_code=409, detail=f"{e.detail}")
        else:
            raise HTTPException(status_code=500, detail=f"{e}")


@app.post("/api/neueverbindung")
async def neue_verbindung(persons: PersonenZumVerbinden):
    try:
        response = erstelleNeueVerbindung(driver, persons)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.post("/api/deleteperson")
async def delete_person(person: PersonConnection):
    try:
        response = loeschePerson(driver, person)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")

@app.post("/api/deleteverbindung")
async def delete_verbindung(verbindung: PersonenZumVerbinden):
    try:
        response = loescheVerbindung(driver, verbindung)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")

@app.get("/api/verbindungen")
async def get_verbindungen(
    vorname: str = Query(..., description="Vorname der Bezugsperson"),
    nachname: str = Query(..., description="Nachname der Bezugsperson"),
    geburtstag: date = Query(
        ..., description="Geburtstag der Bezugsperson im Format YYYY-MM-DD"
    ),
    tenant: str = Query(..., description="Kunden ID des aktuellen tenants"),
):
    bezugsperson_data = {
        "vorname": vorname,
        "nachname": nachname,
        "geburtstag": geburtstag,
        "tenant": tenant,
    }
    bezugsperson = PersonConnection(**bezugsperson_data)

    try:
        verbindungen: PersonMitVerbindungen = leseVerbindungen(driver, bezugsperson)
        return verbindungen
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.on_event("shutdown")
def shutdown_event():
    close_driver()


from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
