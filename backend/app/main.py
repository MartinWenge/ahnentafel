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
from models.user import UserIn, UserOut, UserLocal
from models.graphen import StammbaumGraph
from functions.leseAllePersonen import leseAllePersonen
from functions.erstelleNeuePerson import erstelleNeuePerson
from functions.loeschePerson import loeschePerson
from functions.loescheVerbindung import loescheVerbindung
from functions.leseVerbindungen import leseVerbindungen
from functions.erstelleNeueVerbindung import erstelleNeueVerbindung
from functions.findeStammbaumGraph import findeStammbaumGraph
from functions.korrigierePerson import korrigierePerson
from functions.einloggen import einloggen
from functions.nutzerVerwalten import nutzer_verwalten_loeschen, nutzer_verwalten_neu
from utility.security import CurrentUser

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
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


def close_driver():
    if driver:
        driver.close()


@app.post("/api/login", response_model=UserOut)
async def login(user_in: UserIn):
    try:
        response = einloggen(driver, user_in)
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail="Login fehlgeschlagen")


@app.post("/api/addnutzer")
async def neuer_nutzer(token: CurrentUser, user_neu: UserLocal):
    try:
        response = nutzer_verwalten_neu(driver, user_neu)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail="Nutzer anlegen fehlgeschlagen")


@app.post("/api/deletenutzer")
async def neuer_nutzer(token: CurrentUser, user_alt: UserLocal):
    try:
        response = nutzer_verwalten_loeschen(driver, user_alt)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail="Nutzer löschen fehlgeschlagen")


@app.get("/api/personen", response_model=List[PersonOut])
async def alle_personen(
    token: CurrentUser
):
    try:
        persons = leseAllePersonen(driver, token["tenant"])
        return persons
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.get("/api/stammbaum", response_model=StammbaumGraph)
async def lese_stammbaum(
    token: CurrentUser
):
    try:
        stammbaum = findeStammbaumGraph(driver, token["tenant"])
        return stammbaum
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")


@app.post("/api/neueperson")
async def neue_person(token: CurrentUser, person_in: PersonIn):
    try:
        response = erstelleNeuePerson(driver, person_in, token["tenant"])
        return response
    except Exception as e:
        if e.status_code == 409:
            raise HTTPException(status_code=409, detail=f"{e.detail}")
        else:
            raise HTTPException(status_code=500, detail=f"{e}")


@app.post("/api/neueverbindung")
async def neue_verbindung(token: CurrentUser, persons: PersonenZumVerbinden):
    try:
        response = erstelleNeueVerbindung(driver, persons, token["tenant"])
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.post("/api/deleteperson")
async def delete_person(person: PersonConnection, token: CurrentUser):
    try:
        response = loeschePerson(driver, person)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.post("/api/deleteverbindung")
async def delete_verbindung(verbindung: PersonenZumVerbinden, token: CurrentUser):
    try:
        response = loescheVerbindung(driver, verbindung)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Datenbankfehler: {e}")


@app.post("/api/korrekturperson")
async def fix_person(person: PersonOut, token: CurrentUser):
    try:
        response = korrigierePerson(driver, person)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backendfehler: {e}")


@app.get("/api/verbindungen")
async def get_verbindungen(
    token: CurrentUser,
    vorname: str = Query(..., description="Vorname der Bezugsperson"),
    nachname: str = Query(..., description="Nachname der Bezugsperson"),
    geburtstag: date = Query(
        ..., description="Geburtstag der Bezugsperson im Format YYYY-MM-DD"
    )
):
    tenant = token["tenant"]
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
