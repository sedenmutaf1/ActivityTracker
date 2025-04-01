from pydantic import BaseModel
from datetime import datetime

# Real-time tracking data
class ActivityData(BaseModel):
    timestamp: datetime  # Timestamp when the data is recorded
    gaze_direction: str  # "left", "right", "focused", etc.
    activity: str  # "reading", "browsing", "watching", "distracted", etc.
    blink_rate: float  # Blink rate per minute
