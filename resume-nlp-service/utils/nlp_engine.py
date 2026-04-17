import spacy

def load_nlp():
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        from spacy.cli import download 
        download("en_core_web_sm")
        return spacy.load("en_core_web_sm")

nlp = load_nlp()

def process_text(text: str) -> str:
    """
    Process text using spaCy to tokenize and normalize 
    (lowercase, remove stopwords, etc)
    """
    doc = nlp(text.lower())
    
    clean_tokens = [
        token.lemma_ for token in doc 
        if not token.is_stop and not token.is_punct and not token.is_space
    ]
    
    return " ".join(clean_tokens)

def extract_experience(text: str) -> str:
    """
    Experience detection based on keywords.
    """
    text_lower = text.lower()
    if any(word in text_lower for word in ["intern", "fresher", "entry level", "student", "graduate"]):
        return "Fresher"
    elif any(word in text_lower for word in ["2 years", "3 years", "4 years", "intermediate"]):
        return "Intermediate"
    elif any(word in text_lower for word in ["5 years", "6 years", "7 years", "senior", "lead", "manager", "architect"]):
        return "Experienced"
    
    # Default fallback
    return "Fresher"

def extract_education(text: str) -> str:
    """
    Education detection based on keywords.
    """
    text_lower = text.lower()
    
    # Order matters: highest first
    if any(word in text_lower for word in ["m.tech", "mba", "master", "m.sc", "mca"]):
        return "Postgraduate (M.Tech / MBA / Masters)"
    elif any(word in text_lower for word in ["b.tech", "b.e", "b.sc", "bca", "bachelor", "degree"]):
        return "Undergraduate (B.Tech / B.Sc / Bachelors)"
    elif "diploma" in text_lower:
        return "Diploma"
    
    return "Not Specified"
