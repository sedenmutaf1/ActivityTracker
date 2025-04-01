from pydantic import BaseModel

# Report summary (time spent in different activities)
class SessionReportSummary(BaseModel):
    session_id: str
    reading_time: int
    browsing_time: int
    watching_time: int
    focus_time: int
    distraction_time: int
