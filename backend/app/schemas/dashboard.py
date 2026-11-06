from pydantic import BaseModel


class DashboardResponse(BaseModel):
    subject_count: int
    topic_count: int
    average_progress: int
    completed_tasks: int
    total_tasks: int