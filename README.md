# ATS-RESUME-CHECKER
1 author: shravan lilare
2 author: parth masram
3 author: sunny paji
# working flow 
User Resume Upload Karta Hai + Job Description Deta Hai
                    ↓
        Backend Dono Ko Process Karta Hai
                    ↓
        Keywords Match Karta Hai (Resume vs JD)
                    ↓
        ATS Score + Suggestions Generate Hote Hain
                    ↓
        Frontend Pe Result Dikhta Hai User Ko

   # detailed explanation
   # ATS Resume Checker — Poora Working Flow


## Detailed Step-by-Step Flow

### **Step 1: User Resume Upload Karta Hai**
- Frontend (`UploadResume.jsx`) pe user apna resume (PDF/DOCX) select karta hai
- Saath mein ek Job Description bhi paste karta hai (`JobDescriptionInput.jsx`)

### **Step 2: Frontend → Backend Request Bhejta Hai**
- `frontend/src/services/api.js` file resume file aur JD ko backend API ko bhejti hai (jo humne abhi test kiya tha Swagger docs se)

### **Step 3: Backend Resume Ko Parse Karta Hai** ✅ (Yeh hum kar chuke hain)
- `resume.py` (route) file ko receive karta hai
- `parser.py` PDF/DOCX se **raw text nikalta hai**

### **Step 4: Keywords Extract Hote Hain** ⬅️ (Agla Step)
- `keyword_extractor.py` resume ke text mein se important cheezein dhundta hai:
  - Skills (Python, SQL, React, etc.)
  - Job titles, experience duration
  - Education details
- Yeh `keyword_dictionaries/` (jo `data/` folder mein hai) ka use karta hai reference ke liye

### **Step 5: Job Description Bhi Process Hoti Hai**
- Job description mein se bhi required skills/keywords nikalte hain (same `keyword_extractor.py` use hoga)

### **Step 6: Scoring Hoti Hai**
- `scorer.py` dono lists (resume keywords vs JD keywords) ko **compare** karta hai
- Calculate karta hai:
  - Kitne % keywords match hue
  - Konse important keywords **missing** hain resume mein
  - Formatting issues hain kya (tables, columns — jo ATS parse nahi kar pata) — yeh `formatter_check.py` dekhega

### **Step 7: Result Backend Se Frontend Ko Jaata Hai**
- API response mein yeh sab JSON format mein jaata hai:
```json
{
  "match_score": 72,
  "matched_keywords": ["Python", "SQL", "Docker"],
  "missing_keywords": ["AWS", "Kubernetes"],
  "formatting_issues": ["Resume mein tables detected — ATS parse nahi kar sakta"]
}
```

### **Step 8: Frontend Result Dikhata Hai**
- `ScoreDashboard.jsx` — score ko visually dikhata hai (progress bar/percentage)
- `SuggestionsPanel.jsx` — missing keywords aur improvement suggestions dikhata hai

---

## Abhi Tak Kaha Pahuche Hai

```
✅ Step 1-3: Resume upload + parsing (WORKING)
⬜ Step 4: Keyword extraction (AGLA STEP)
⬜ Step 5-6: JD processing + Scoring
⬜ Step 7-8: Frontend connect karna
```

## Simple Analogy Samjhne Ke Liye

Socho tum ek **teacher** ho jo do cheezein compare kar rahe ho:
- **Answer key** (Job Description ke required skills)
- **Student ka paper** (Resume ke skills)

Tum dono ko match karte ho aur batate ho **kitne marks aaye** (score) aur **kya missing tha** (suggestions) — bas yehi ATS checker karta hai, automatically.

---

Ab chalte hain **Step 4 — `keyword_extractor.py`** pe? Yeh agla logical piece hai jo tumhara project ko real ATS checker banayega.