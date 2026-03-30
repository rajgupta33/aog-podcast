import sys
from pypdf import PdfReader

def extract_text(pdf_path, out_path):
    reader = PdfReader(pdf_path)
    with open(out_path, "w", encoding="utf-8") as f:
        for page in reader.pages:
            f.write(page.extract_text() + "\n")

if __name__ == "__main__":
    extract_text("COLLAB DETAILS.pdf", "extracted_collab.txt")
