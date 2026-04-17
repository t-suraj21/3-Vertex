import fitz  # PyMuPDF
import docx
import io

def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    If PDF -> use PyMuPDF
    If DOCX -> use python-docx
    """
    text = ""
    filename_lower = filename.lower()
    
    try:
        if filename_lower.endswith('.pdf'):
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text() + "\n"
        elif filename_lower.endswith('.docx'):
            doc = docx.Document(io.BytesIO(file_bytes))
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        else:
            raise ValueError("Unsupported file type. Please upload a PDF or DOCX file.")
    except Exception as e:
        raise Exception(f"Failed to parse document: {str(e)}")
        
    return text.strip()
