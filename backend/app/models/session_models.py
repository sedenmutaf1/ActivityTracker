from pydantic import BaseModel
from typing import Dict

# Session start request (start a new session)
class SessionStartRequest(BaseModel):
    user_id: str
    session_duration: int



# Session end request (ending the session)
class SessionEndRequest(BaseModel):
    session_id: str

# Session report (detailed results after session ends)
class SessionReport(BaseModel):
    session_id: str
    focus_time: int  # Time spent focused in seconds
    distraction_time: int  # Time spent distracted in seconds
    session_report: Dict[str, int]  # A dictionary of activity types (e.g., reading, browsing) and time spent
