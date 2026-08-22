from app.services.parser import extract_resume_text

text = extract_resume_text("../data/sample_resumes/resume.pdf")
print(text)