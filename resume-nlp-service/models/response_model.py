from pydantic import BaseModel
from typing import List

class ResumeAnalysisResponse(BaseModel):
    skills: List[str]
    education: str
    experience: str
    recommended_jobs: List[str]
    score: int
    improvements: List[str]
