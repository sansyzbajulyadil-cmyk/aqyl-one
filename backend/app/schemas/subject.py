from pydantic import BaseModel, ConfigDict


class TopicResponse(BaseModel):
    id: int
    name: str
    description: str
    progress: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class SubjectResponse(BaseModel):
    id: int
    name: str
    teacher: str
    topics: list[TopicResponse] = []

    model_config = ConfigDict(from_attributes=True)