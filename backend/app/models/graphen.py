from pydantic import BaseModel, Field

class StammbaumKnoten(BaseModel):
    id: str = Field(..., description="id des aktuellen Knotens im Graph")
    generation: int = Field(..., description="Generation des aktuellen Knotens")
    name: str = Field(..., description="Name der Person des aktuellen Knotens")
    vorgaenger: list[str] = Field(default_factory=list, description="Liste der IDs der Vorgängerknoten (Eltern/Vorfahren)")
    nachfolger: list[str] = Field(default_factory=list, description="Liste der IDs der Nachfolgerknoten (Kinder)")
    partner: list[str] = Field(default_factory=list, description="Liste der IDs der Partnerknoten (Ehepartner)")
    


class StammbaumGraph(BaseModel):
    graph: list[StammbaumKnoten] = Field(default_factory=list, description="Liste mit Knoten im Stammbaum")
