def get_recommended_jobs(skills: list) -> list:
    """
    Map skills to job roles. Returns top 3 job roles.
    """
    job_scores = {
        "Frontend Developer": 0,
        "Backend Developer": 0,
        "Fullstack Developer": 0,
        "Data Scientist": 0,
        "Data Analyst": 0,
        "DevOps Engineer": 0,
        "Mobile App Developer": 0,
    }
    
    frontend_skills = ["react", "javascript", "typescript", "html", "css", "vue", "angular", "tailwind", "figma"]
    backend_skills = ["python", "node.js", "java", "sql", "mongodb", "express", "go", "php"]
    data_skills = ["machine learning", "data science", "python", "sql", "scikit-learn", "pandas", "tensorflow"]
    devops_skills = ["aws", "docker", "kubernetes", "devops", "python", "go"]
    mobile_skills = ["flutter", "react native", "java", "swift", "kotlin"]
    
    for skill in skills:
        s = skill.lower()
        if s in frontend_skills:
            job_scores["Frontend Developer"] += 1
            job_scores["Fullstack Developer"] += 0.5
        if s in backend_skills:
            job_scores["Backend Developer"] += 1
            job_scores["Fullstack Developer"] += 0.5
        if s in data_skills:
            job_scores["Data Scientist"] += 1
            job_scores["Data Analyst"] += 0.8
        if s in devops_skills:
            job_scores["DevOps Engineer"] += 1
        if s in mobile_skills:
            job_scores["Mobile App Developer"] += 1
            
    # Sort roles by score descending
    sorted_jobs = sorted(job_scores.items(), key=lambda item: item[1], reverse=True)
    
    # Return top 3 that have a score > 0
    top_jobs = [job[0] for job in sorted_jobs if job[1] > 0][:3]
    
    # Fallback
    if not top_jobs:
        return ["Software Engineer"]
        
    return top_jobs
