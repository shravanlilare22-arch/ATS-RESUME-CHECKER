# ATS Resume Checker

An AI-powered resume analyzer that shows how well your resume fits a target role before you apply. Upload your resume, enter the role you want, and get an ATS-style score, honest feedback, and an AI assistant for follow-up questions.

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black)

**Live demo:** https://ats-resume-checker-jet.vercel.app/
**API docs:** https://ats-resume-checker-kto8.onrender.com/docs

> The backend runs on Render's free tier. If nobody has used the app for a while, the first request can take up to a minute while the server wakes up.

## Screenshots

![Dashboard](<Screenshot 2026-10-26 093124.png>)
![login pge](<Screenshot 2026-10-26 093323.png>)
![Analysis](<Screenshot 2026-10-26 093422.png>)
## Why this project

Many companies use Applicant Tracking Systems (ATS) to filter applications before a recruiter reads them. Most candidates never find out why their resume was filtered out. This project gives a quick, role-specific review so you can fix problems before you apply, instead of guessing.

## Features

- **Email verification with OTP.** Users verify their email with a 6-digit code (valid for 15 minutes) before using the tool.
- **Role-specific analysis.** The resume is reviewed against the target role you enter, not against generic keywords.
- **ATS score with a gauge chart.** A score out of 100 with a short verdict.
- **Score by category.** Expandable categories (for example technical skills and formatting) with the reason behind each score.
- **Strengths, weaknesses, missing skills and suggestions.** Clear and actionable, with an overall strengths-versus-weaknesses balance bar.
- **AI chat assistant.** Ask follow-up questions about your resume. The assistant remembers the conversation.
- **Daily free limit.** Each verified email gets 3 free analyses per day. The counter resets at midnight IST and is shown on the page.
- **Friendly error handling.** Clear messages for wrong file types, large files, unreadable PDFs, expired sessions, AI downtime and a sleeping server, with a Try again button where it helps.
- **Responsive design.** Works on desktop and mobile, with an animated dark theme.

## How it works

1. The user enters their name and email and receives a 6-digit OTP.
2. After verification, the backend issues an access token that protects the analysis endpoints.
3. The user uploads a resume (PDF, DOCX or TXT, up to 10 MB) and enters a target role.
4. The backend extracts the text (`pdfplumber` for PDF, `python-docx` for DOCX).
5. Google Gemini analyzes the text for that role and returns a structured result: score, verdict, strengths, weaknesses, missing skills, suggestions and category scores.
6. The result is saved to MongoDB and shown in the UI. The user can then chat with the AI about it.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Framer Motion, Axios |
| Backend | FastAPI, Uvicorn, pdfplumber, python-docx |
| Database | MongoDB Atlas (PyMongo) |
| AI | Google Gemini (`google-genai`) |
| Email (OTP) | EmailJS |
| Auth | OTP email verification and a token-based session |
| CI/CD | GitHub Actions (automated tests on every push) |
| Hosting | Vercel (frontend), Render (backend) |

## Project structure

```
ATS-RESUME-CHECKER/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app and routers
│   │   ├── api/
│   │   │   ├── deps.py        # token check for protected routes
│   │   │   └── routes/        # analyze, chat, history, OTP and visitor routes
│   │   ├── services/          # resume parser, AI analyzer and other helpers
│   │   └── db/                # MongoDB connection and queries
│   ├── tests/                 # pytest tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/             # landing page and ATS checker page
│       ├── components/        # name/email/OTP modal
│       ├── services/api.js    # all backend calls
│       ├── utils/validation.js
│       └── App.jsx
└── .github/workflows/         # CI pipeline
```

## Getting started

### Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (Gemini)
- An [EmailJS](https://www.emailjs.com/) account for sending OTP emails

### 1. Clone the repository

```bash
git clone https://github.com/shravanlilare22-arch/ATS-RESUME-CHECKER.git
cd ATS-RESUME-CHECKER
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (see the next section), then start the server:

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` and the interactive docs are at `http://localhost:8000/docs`.

### 3. Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your own values:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_atlas_connection_string
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
```

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio |
| `MONGO_URI` | MongoDB Atlas, Connect, Drivers |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` | EmailJS dashboard |
| `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY` | EmailJS dashboard, Account |

Never commit the `.env` file. It is already listed in `.gitignore`.

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. For local development, open `frontend/src/services/api.js` and set `API_BASE_URL` to `http://localhost:8000`.

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-otp` | Send a 6-digit verification code to the user's email |
| POST | `/verify-otp` | Verify the code and return an access token |
| POST | `/visitor` | Save the verified visitor's name and email |
| GET | `/usage` | Today's free-analysis usage (needs the access token) |
| POST | `/analyze` | Analyze a resume for a target role (needs the access token) |
| POST | `/chat` | Ask a follow-up question about the analyzed resume |
| GET | `/history` | Saved analyses |

Protected routes expect the header `Authorization: Bearer <access_token>`. The full and always up-to-date list is available at `/docs`.

## Data and privacy

- The uploaded file is written to a temporary file and deleted right after the text is extracted.
- The extracted resume text and the analysis result are saved in MongoDB so past analyses can be shown.
- Name and email are stored for verification and for tracking who uses the tool.
- API keys and secrets live only in `.env` and are never committed.

## Deployment

- **Frontend:** Vercel, deployed automatically from the `main` branch.
- **Backend:** Render, deployed automatically from the `main` branch. All variables from the table above are set in Render's environment settings.
- **Database:** MongoDB Atlas.
- **CI:** GitHub Actions runs the tests on every push.

## Roadmap

- AI-generated improved resume using the user's real details
- Downloadable PDF report of the analysis
- ATS formatting checks (tables, columns, images)
- Compare several resume versions for the same role

## Team

| Name              |        Role |
|---                |          ---|
| Shravan Lilare    | Team Leader |
| Parth Masram      | Team Member |
| Sumit Mende       | Team Member |

Built as a college capstone project.