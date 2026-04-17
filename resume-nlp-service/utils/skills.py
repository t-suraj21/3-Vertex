# Predefined skill database
PREDEFINED_SKILLS = [
    "python", "java", "react", "node.js", "mongodb", "machine learning", "sql",
    "javascript", "typescript", "express", "aws", "docker", "kubernetes",
    "flutter", "react native", "ui/ux", "figma", "framer", "next.js", "vue",
    "angular", "c++", "data science", "devops", "firebase", "redux", "tailwind",
    "bootstrap", "html", "css", "c#", ".net", "go", "rust", "php", "ruby",
    "scikit-learn", "pandas", "numpy", "tensorflow", "pytorch", "fastapi", "django"
]

def extract_skills_from_text(text: str) -> list:
    """
    Match skills using Keyword matching against the predefined database.
    """
    text_lower = text.lower()
    detected_skills = set()
    
    for skill in PREDEFINED_SKILLS:
        # Simple substring match; could be enhanced with regex for word boundaries
        if skill in text_lower:
            detected_skills.add(skill)
            
    return list(detected_skills)
