from pydantic import BaseModel


class TopicBase(BaseModel):
    name: str
    description: str = ""
    progress: int = 0
    status: str = "learning"


class TopicCreate(TopicBase):
    subject_id: int


class TopicResponse(TopicBase):
    id: int
    subject_id: int

    class Config:
        from_attributes = True