# ATS Resume Checker

An ATS (Applicant Tracking System) Resume Checker that analyzes a resume against a job description, calculates a match score, and highlights matched vs. missing keywords — helping candidates optimize their resumes before applying.

🔗 **Live Demo:** [https://vercel.com/black-hat-assassins/ats-resume-checker/6Y6vf82G9hscdeBV2FrrXZcGUkgh]
🔗 **Backend API:** [https://ats-resume-checker-aoq9.onrender.com]

## 📸 Screenshot

![alt text](image-1.png)

## ✨ Features

- Upload a resume in PDF or DOCX format
- Paste any job description
- Get an instant match score (%)
- See matched keywords (skills present in both resume and JD)
- See missing keywords (skills the JD wants but the resume lacks)

## 🛠️ Tech Stack

**Frontend:** React, Vite, Axios
**Backend:** FastAPI (Python), Uvicorn
**Resume Parsing:** pdfplumber, python-docx
**Deployment:** Vercel (frontend), Render (backend)
**CI/CD:** GitHub Actions (lint + test on every push)

## ⚙️ How It Works

1. User uploads a resume and pastes a job description
2. Backend extracts raw text from the resume (PDF/DOCX)
3. Keywords are extracted from both the resume and the job description using a curated skills dictionary
4. The two keyword sets are compared to calculate a match score
5. Matched and missing keywords are returned and displayed on the frontend

## 🚀 Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000` (interactive API docs at `/docs`)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## 📁 Project Structure

```
ats-resume-checker/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # API endpoints (resume upload, analyze)
│   │   ├── services/          # Core logic: parser, keyword extractor, scorer
│   │   └── main.py            # FastAPI entry point
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/
│       ├── services/           # API calls to backend
│       └── App.jsx
├── data/
│   └── keyword_dictionaries/   # Reference skills used for matching
└── .github/workflows/          # CI/CD pipeline
```

## 🔮 Future Improvements

- Formatting checks (detect tables/columns that break real ATS parsers)
- Support for more resume sections (certifications, projects)
- User accounts to save past analyses

## 👤 Author
**Team :- BlackHat Assassins.**
**[Shravan lilare]**
**[Parth masram]**
**[Sunny paji]**
GitHub: [@shravanlilare22-arch](https://github.com/shravanlilare22-arch)