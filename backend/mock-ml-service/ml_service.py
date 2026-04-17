# AI Microservice Proxy
# Simulates a connection between Node.js and a Python NLP engine backend

import sys
import json

def process_resume(resume_text):
    # This simulates spaCy NLP skill extraction and scikit-learn matching
    # In production, you would run:
    # doc = nlp(resume_text)
    # entities = [ent.text for ent in doc.ents if ent.label_ == 'SKILL']
    
    mock_extracted_skills = ["React.js", "Node.js", "MongoDB", "Redux", "TypeScript"]
    
    # Simulate a calculated ATS score based on semantic keywords
    mock_ats_score = 88
    
    return {
        "success": True,
        "extractedSkills": mock_extracted_skills,
        "atsScore": mock_ats_score,
        "recommendedRoles": ["Frontend Developer", "Full Stack Engineer", "React Native Developer"]
    }

if __name__ == "__main__":
    # Expecting raw text passed via arguments from Node.js child_process
    try:
        raw_text = sys.argv[1] if len(sys.argv) > 1 else ""
        result = process_resume(raw_text)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
