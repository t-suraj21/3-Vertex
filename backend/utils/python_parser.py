import sys
import fitz

def extract_pdf(file_path):
    try:
        text = ""
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text() + "\n"
        print(text.strip())
    except Exception as e:
        # Errors printed to STDERR
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("ERROR: No file path provided.", file=sys.stderr)
        sys.exit(1)
    
    extract_pdf(sys.argv[1])
