from app.services.parser import extract_resume_text
from app.services.keyword_extractor import extract_keywords
from app.services.scorer import calculate_match_score

# Resume process karo
resume_text = extract_resume_text("../data/sample_resumes/resume.pdf")
resume_keywords = extract_keywords(resume_text)

# Job description process karo
with open("../data/sample_job_descriptions/job1.txt", "r", encoding="utf-8") as f:
    jd_text = f.read()
jd_keywords = extract_keywords(jd_text)

# Score nikaalo
result = calculate_match_score(resume_keywords, jd_keywords)

print("Resume Keywords:", resume_keywords)
print("JD Keywords:", jd_keywords)
print("Result:", result)