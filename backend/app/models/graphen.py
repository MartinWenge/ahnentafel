from pydantic import BaseModel, Field

class StammbaumKnoten(BaseModel):
    id: int = Field(..., description="id des aktuellen Knotens im Graph")
    vorgaenger: list[int] = Field(default_factory=list, description="Liste der IDs der Vorgängerknoten (Eltern/Vorfahren)")
    nachfolger: list[int] = Field(default_factory=list, description="Liste der IDs der Nachfolgerknoten (Kinder)")

class StammbaumGraph(BaseModel):
    graph: list[StammbaumKnoten] = Field(default_factory=list, description="Liste mit Knoten im Stammbaum")
