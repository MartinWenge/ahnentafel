from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class PersonConnection(BaseModel):
    vorname: str = Field(..., description="Vorname der zu verbindenden Person")
    nachname: str = Field(..., description="Nachname der zu verbindenden Person")
    geburtstag: date = Field(..., description="Geburtsdatum der zu verbindenden Person im Format YYYY-MM-TT")
    tenant: str = Field(..., description="guid für die Zuordnung des aktuellen tenant")

class PersonIn(BaseModel):
    id: Optional[int] = Field(None, description="Id der Person in der Datenbank")
    tenant: str = Field(..., description="guid für die Zuordnung des aktuellen tenant")
    vorname: str = Field(..., description="Vorname der Person")
    nachname: str = Field(..., description="Nachname der Person")
    geburtstag: date = Field(..., description="Geburtsdatum der Person im Format YYYY-MM-TT")
    geschlecht: str = Field(..., description="Geschlecht (männlich:m, weiblich:w)")
    geburtsname: Optional[str] = Field(None, description="Geburtsname, falls vorhanden (optional)")
    geburtsort: Optional[str] = Field(None, description="Geburtsort der Person (optional)")
    todestag: Optional[date] = Field(None, description="Todestag der Person im Format YYYY-MM-TT (optional)")
    todesort: Optional[str] = Field(None, description="Todesort der Person (optional)")
    beruf: Optional[str] = Field(None, description="Beruf der Person (optional)")
    verbindungMit: PersonConnection = Field(..., description="Informationen zur verbundenen Person")
    verbindungsart: str = Field(..., description="Verbindungstyp: KIND, ELTERNTEIL, EHEPARTNER")

class PersonOut(BaseModel):
    id: int
    tenant: str
    vorname: str
    nachname: str
    geburtstag: date
    geschlecht: str
    geburtsname: Optional[str] = None
    geburtsort: Optional[str] = None
    todestag: Optional[date] = None
    todesort: Optional[str] = None
    beruf: Optional[str] = None

class PersonMitVerbindungen(BaseModel):
    bezugsperson: PersonOut
    kinder: list[PersonOut]
    eltern: list[PersonOut]
    ehepartner: list[PersonOut]

class PersonenZumVerbinden(BaseModel):
    person1: PersonConnection
    person2: PersonConnection
    verbindungsart: str = Field(..., description="Verbindungstyp: KIND, ELTERNTEIL, EHEPARTNER")
