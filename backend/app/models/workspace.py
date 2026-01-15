from pydantic import BaseModel

class Workspace(BaseModel):
    id: int
    name: str
