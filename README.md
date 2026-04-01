# RecruitIQ — AI Resume Reviewer

A production-ready full-stack application for AI-powered resume screening. Built with **FastAPI**, **React**, **Tailwind CSS**, and **Groq API (LLaMA 3)**.

---

## 🖥️ Tech Stack

| Layer      | Technology                             |
|------------|----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS           |
| Backend    | FastAPI, Uvicorn, Python 3.10+         |
| AI Model   | Groq API (LLaMA 3 70B / Mixtral)       |
| Parsing    | pdfplumber, pypdf, python-docx         |
| HTTP       | httpx (async), axios                   |

---

## 📁 Project Structure

```
resume-reviewer/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── routes/
│   │   │   └── analyze.py        # POST /api/analyze endpoint
│   │   └── services/
│   │       ├── parser.py         # PDF/DOCX text extraction
│   │       ├── matcher.py        # Rule-based skill/exp/edu matching
│   │       └── llm_service.py    # Groq API integration
│   ├── requirements.txt
│   ├── run.sh
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx               # Main application
    │   ├── components/
    │   │   ├── FileUpload.jsx    # Drag-and-drop uploader
    │   │   ├── SkillTagInput.jsx # Tag-based skill input
    │   │   ├── ScoreRing.jsx     # Animated score circle
    │   │   ├── ResultsPanel.jsx  # Full analysis results
    │   │   ├── ClarificationQuestions.jsx  # YES/NO checkbox questions
    │   │   └── LoadingState.jsx  # Animated loading steps
    │   └── services/
    │       └── api.js            # Axios API client
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# REQUIRED
GROQ_API_KEY=your_groq_api_key_here

# OPTIONAL (defaults shown)
GROQ_MODEL=llama3-70b-8192
```

Get your free Groq API key at: https://console.groq.com/keys

---

## 🚀 Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Groq API key**

---

### Step 1: Backend Setup

```bash
cd resume-reviewer/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start backend
bash run.sh
# OR directly:
uvicorn app.main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**
API docs (Swagger): **http://localhost:8000/docs**

---

### Step 2: Frontend Setup

```bash
cd resume-reviewer/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will be live at: **http://localhost:3000**

---

## 🔌 API Reference

### `POST /api/analyze`

Analyzes a resume against job requirements.

**Request** (`multipart/form-data`):

| Field               | Type   | Required | Description                        |
|---------------------|--------|----------|------------------------------------|
| `resume`            | File   | ✅        | PDF or DOCX resume file            |
| `job_role`          | string | ✅        | Target job title                   |
| `required_skills`   | string | ✅        | Comma-separated skills             |
| `min_experience`    | string | ❌        | e.g. "3 years", "5+ years"         |
| `preferred_education` | string | ❌     | e.g. "Bachelor's", "Master's"      |

**Response** (`application/json`):

```json
{
  "status": "success",
  "candidate": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "skills": ["React", "TypeScript", "Node.js"],
    "years_of_experience": "4 years",
    "experience": [...],
    "education": [...],
    "projects": [...],
    "certifications": [...]
  },
  "analysis": {
    "final_score": 7.8,
    "rule_based_score": 7.2,
    "llm_score": 8.1,
    "match_percentage": 78,
    "skill_match_percentage": 75.0,
    "matched_skills": ["React", "TypeScript"],
    "missing_skills": ["GraphQL"],
    "recommendation": "Hire",
    "strengths": ["Strong React ecosystem knowledge", ...],
    "weaknesses": ["No GraphQL experience", ...],
    "reasoning": "Candidate shows strong frontend skills...",
    "clarification_questions": [
      {
        "id": 1,
        "question": "Has the candidate worked with GraphQL in any personal projects?",
        "context": "GraphQL is required for the backend integration work"
      },
      ...
    ]
  },
  "job": {
    "role": "Senior Frontend Engineer",
    "required_skills": ["React", "TypeScript", "GraphQL"],
    "min_experience": "3 years",
    "preferred_education": "Bachelor's"
  }
}
```

---

## 🧠 How the AI Analysis Works

```
Resume File (PDF/DOCX)
        ↓
   Text Extraction
   (pdfplumber / python-docx)
        ↓
   LLM Extraction (Groq)
   → Structured JSON: name, skills, experience, projects...
        ↓
        ├─── Rule-Based Matching
        │    • Skill overlap %
        │    • Experience comparison
        │    • Education comparison
        │    → Rule score (0–10)
        │
        └─── LLM Evaluation (Groq)
             • Context-aware skill evaluation
             • Projects as proof of skills
             • Strengths & weaknesses
             • YES/NO clarification questions
             → LLM score (0–10)
                    ↓
            Final Score = 40% rule + 60% LLM
                    ↓
            Hire / Maybe / Reject
```

---

## 🎨 Features

- **Drag-and-drop** resume upload (PDF, DOCX, DOC)
- **Tag-based skill input** with keyboard shortcuts
- **Animated score ring** (0–10 with color coding)
- **Skill match visualization** (matched vs missing tags)
- **Strengths & weaknesses** AI-generated list
- **Clarification questions** — 5 YES/NO questions for recruiter review
- **Collapsible sections** for experience, projects, education
- **Loading animation** with step-by-step progress

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `GROQ_API_KEY not set` | Add key to `backend/.env` |
| `Could not parse PDF` | Ensure PDF is text-based, not scanned |
| Frontend can't reach backend | Check backend is running on port 8000 |
| `Module not found` errors | Run `pip install -r requirements.txt` again |
| CORS errors | Backend already allows `localhost:3000` and `localhost:5173` |

---

## 📦 Available Groq Models

Set `GROQ_MODEL` in `.env` to one of:

- `llama3-70b-8192` ← **Recommended** (best quality)
- `llama3-8b-8192` (faster, less accurate)
- `mixtral-8x7b-32768` (long context)
