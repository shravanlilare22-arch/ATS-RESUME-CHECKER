from app.services.parser import extract_resume_text
from app.services.ai_analyzer import analyze_resume_with_ai

resume_text = extract_resume_text("../data/sample_resumes/resume.pdf")

result = analyze_resume_with_ai(resume_text, "Frontend Developer")


import json
print(json.dumps(result, indent=2))