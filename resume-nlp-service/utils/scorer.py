def calculate_resume_score(skills: list, education: str, experience: str, text_length: int) -> tuple:
    """
    Score based on:
    Skills: 40%
    Education: 20%
    Experience: 20%
    Structure (Text Length): 20%
    """
    score = 0
    improvements = []
    
    # Skills (up to 40 points)
    num_skills = len(skills)
    if num_skills >= 8:
        score += 40
    elif num_skills >= 4:
        score += 30
        improvements.append("Consider adding more specialized technical skills.")
    elif num_skills > 0:
        score += 15
        improvements.append("Your skills section is lacking. Add more relevant keywords.")
    else:
        improvements.append("No technical skills detected. Please add a skills section.")
        
    # Education (up to 20 points)
    if education != "Not Specified":
        score += 20
    else:
        improvements.append("Education details missing. Include your degree and university.")
        
    # Experience (up to 20 points)
    if experience == "Experienced":
        score += 20
    elif experience == "Intermediate":
        score += 15
    else:
        score += 10
        improvements.append("As a fresher, try adding more real-world projects and internships.")
        
    # Structure/Length (up to 20 points)
    if text_length > 1500:
        score += 20
    elif text_length > 800:
        score += 15
    else:
        score += 5
        improvements.append("Your resume is very brief. Improve the summary and experience descriptions.")
        
    return score, improvements
