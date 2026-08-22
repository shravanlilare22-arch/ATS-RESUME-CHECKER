import pdfplumber
from docx import Document


def extract_text_from_pdf(file_path: str) -> str:
    """PDF file se saara text extract karta hai"""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """DOCX file se saara text extract karta hai"""
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()


def extract_resume_text(file_path: str) -> str:
    """File extension check karke sahi function call karta hai"""
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Only PDF and DOCX files are supported")