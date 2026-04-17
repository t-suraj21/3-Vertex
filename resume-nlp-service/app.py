from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models.response_model import ResumeAnalysisResponse
from utils.parser import extract_text
from utils.nlp_engine import process_text, extract_experience, extract_education
from utils.skills import extract_skills_from_text
from utils.job_matcher import get_recommended_jobs
from utils.scorer import calculate_resume_score

app = FastAPI(title="Resume NLP Microservice", description="AI Resume Matcher Backend")

# CORS Support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(file: UploadFile = File(...)):
    """
    Accepts resume files (PDF/DOCX)
    Extracts text, uses NLP, and returns structured insights.
    """
    # 1. Validate File
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty file provided")
    
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are supported.")
        
    try:
        file_bytes = await file.read()
        
        # 2. Text Extraction
        raw_text = extract_text(file_bytes, file.filename)
        
        if not raw_text or len(raw_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract meaningful text from the file.")
            
        # 3. NLP Processing (normalization)
        clean_text = process_text(raw_text)
        
        # 4. Skill Extraction
        detected_skills = extract_skills_from_text(raw_text)
        
        # 5. Experience Detection
        experience_lvl = extract_experience(raw_text)
        
        # 6. Education Extraction
        education_lvl = extract_education(raw_text)
        
        # 7. Job Recommendation Engine
        recommended_jobs = get_recommended_jobs(detected_skills)
        
        # 8 & 9. Resume Scoring & Improvements
        score, improvements = calculate_resume_score(
            skills=detected_skills, 
            education=education_lvl, 
            experience=experience_lvl, 
            text_length=len(raw_text)
        )
        
        # 10. Return Structured Response
        return ResumeAnalysisResponse(
            skills=detected_skills,
            education=education_lvl,
            experience=experience_lvl,
            recommended_jobs=recommended_jobs,
            score=score,
            improvements=improvements
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# 13. Run Instructions
# To run this server: uvicorn app:app --reload --port 8000
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
