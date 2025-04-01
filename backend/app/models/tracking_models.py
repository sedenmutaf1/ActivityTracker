import datetime
from pydantic import BaseModel
from typing import List

# Gaze point (position of the gaze in each frame)
class GazePoint(BaseModel):
    x: float  # X-coordinate of gaze (normalized to 0-1)
    y: float  # Y-coordinate of gaze (normalized to 0-1)
    timestamp: datetime

# Gaze heatmap (complete set of gaze points for a session)
class GazeHeatmap(BaseModel):
    session_id: str
    gaze_points: List[GazePoint]  # List of all gaze points during the session
