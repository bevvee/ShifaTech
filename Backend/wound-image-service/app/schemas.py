from pydantic import BaseModel

class WoundRequest(BaseModel):
    image_name: str
    visit_id: int