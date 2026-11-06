from pydantic import BaseModel, ConfigDict


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    scheduled_time: str
    is_completed: bool
    subject_id: int | None

    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(BaseModel):
    is_completed: bool