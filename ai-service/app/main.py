from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import datetime, re

app = FastAPI(title="City Complaint Triage AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Taxonomy ─────────────────────────────────────────────────────────────────

DEPARTMENT_RULES = [
    {
        "department": "Sanitation Department",
        "category": "Garbage Collection",
        "keywords": ["garbage","kachra","waste","trash","dustbin","safai","sewage","sewer","kuda","dump"],
        "urgency_keywords": ["days","din","week","overflowing","smell","disease"]
    },
    {
        "department": "Water Supply Department",
        "category": "Water Leakage",
        "keywords": ["water","paani","leak","pipe","supply","flooding","flood","pani","leakage"],
        "urgency_keywords": ["burst","toot","bhar gaya","no water","major","toot gayi"]
    },
    {
        "department": "Roads & Infrastructure",
        "category": "Pothole",
        "keywords": ["road","pothole","sadak","gaddha","crack","broken road","damage","accident","highway"],
        "urgency_keywords": ["accident","large","bada","main road","flooding","injury"]
    },
    {
        "department": "Street Lighting",
        "category": "Light Failure",
        "keywords": ["light","street light","lamp","bijli","electricity","dark","bulb","pole","electric"],
        "urgency_keywords": ["school","accident","crime","week","month","dangerous"]
    },
    {
        "department": "Parks & Horticulture",
        "category": "Park Maintenance",
        "keywords": ["park","garden","tree","plant","grass","playground","bench","swing"],
        "urgency_keywords": ["broken","fallen","dangerous","blocked","child","children"]
    },
    {
        "department": "Drainage Department",
        "category": "Drain Blockage",
        "keywords": ["drain","nali","gutter","sewer","blocked","overflow","clogged","blockage"],
        "urgency_keywords": ["road par","overflow","flooding","bhar","overflowing"]
    },
]

LOCALITIES = {
    "Arera Colony": "42",
    "MP Nagar": "55",
    "Bairagarh": "1",
    "Kolar": "31",
    "Saket Nagar": "21",
    "TT Nagar": "14",
    "Habibganj": "48",
    "Shyamla Hills": "19",
    "Misrod": "67",
    "Ayodhya Nagar": "73",
    "Berasia": "77"
}

HINDI_WORDS = ['hai','nahi','din','paani','kachra','sadak','bijli','rasta','gayi','gaya','hua','se','ke','ki','ka','mein','par','tak']
HINDI_CHAR_RANGE = re.compile(r'[\u0900-\u097F]')

CRITICAL_PHRASES = ['accident','injury','open manhole','fire','electrocution','collapsed','critical','school ke paas']
HIGH_PHRASES = ['3 days','flood','burst pipe','no water','days tak','toot gayi','bhar gaya','road blocked','ganda paani','3 din']
LOW_PHRASES = ['minor','small','not urgent','please fix']

# ── Helper Functions ──────────────────────────────────────────────────────────

def detect_language(text: str) -> str:
    if HINDI_CHAR_RANGE.search(text):
        return "Hindi"
    lower = text.lower()
    words = lower.split()
    count = sum(1 for w in HINDI_WORDS if w in words)
    if count >= 3:
        return "Hindi"
    if count >= 1:
        return "Hinglish"
    return "English"

def classify_department(text: str) -> dict:
    lower = text.lower()
    best = None
    best_score = 0
    for rule in DEPARTMENT_RULES:
        score = sum(1 for k in rule["keywords"] if k in lower)
        if score > best_score:
            best_score = score
            best = rule
    if not best or best_score == 0:
        return {
            "department": "General Administration",
            "category": "General Complaint",
            "confidence": 0.45,
            "matched_keywords": [],
            "explanation": "No specific department keywords found. Manual review required."
        }
    matched = [k for k in best["keywords"] if k in lower]
    confidence = min(0.97, 0.60 + len(matched) * 0.08)
    return {
        "department": best["department"],
        "category": best["category"],
        "confidence": round(confidence, 2),
        "matched_keywords": matched,
        "urgency_keywords": best["urgency_keywords"],
        "explanation": f'Keywords found: {", ".join(matched)} → {best["department"]}'
    }

def detect_urgency(text: str, urgency_kw: list) -> dict:
    lower = text.lower()
    if any(p in lower for p in CRITICAL_PHRASES):
        return {"urgency": "CRITICAL", "score": 0.95, "reason": "Critical safety hazard detected."}
    urgency_hits = sum(1 for k in urgency_kw if k in lower)
    if any(p in lower for p in HIGH_PHRASES) or urgency_hits >= 2:
        return {"urgency": "HIGH", "score": 0.78, "reason": "Duration or severity indicators suggest high urgency."}
    if any(p in lower for p in LOW_PHRASES):
        return {"urgency": "LOW", "score": 0.30, "reason": "Language suggests non-critical issue."}
    if urgency_hits >= 1:
        return {"urgency": "MEDIUM", "score": 0.60, "reason": "Some urgency indicators found."}
    return {"urgency": "MEDIUM", "score": 0.55, "reason": "Standard complaint — medium urgency by default."}

def extract_locality(text: str) -> dict:
    for name, ward in LOCALITIES.items():
        if name.lower() in text.lower():
            return {"locality": name, "ward": ward, "confidence": 0.92}
    return {}

# ── Schemas ───────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    text: str
    language: Optional[str] = "English"
    location: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class TranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language: Optional[str] = "English"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    text = req.text or ""
    lang = detect_language(text)
    dept_result = classify_department(text)
    urgency_kw = dept_result.get("urgency_keywords", [])
    urgency_result = detect_urgency(text, urgency_kw)
    locality_result = extract_locality(text)

    # Merge provided location
    if req.location and req.location.get("locality"):
        locality_result = {"locality": req.location["locality"], "ward": req.location.get("ward"), "confidence": 0.95}

    dept_conf = dept_result["confidence"]
    loc_conf = locality_result.get("confidence", 0.3)
    urg_conf = urgency_result["score"]
    overall = round((dept_conf * 0.4 + loc_conf * 0.3 + urg_conf * 0.3), 2)

    return {
        "department": dept_result["department"],
        "category": dept_result["category"],
        "urgency": urgency_result["urgency"],
        "locality": locality_result.get("locality"),
        "ward": locality_result.get("ward"),
        "detectedLanguage": lang,
        "keywords": dept_result.get("matched_keywords", []),
        "confidence": {
            "department": dept_conf,
            "category": dept_conf,
            "urgency": urg_conf,
            "location": loc_conf,
            "overall": overall
        },
        "explanation": [
            dept_result["explanation"],
            urgency_result["reason"],
            f"Locality: {locality_result.get('locality', 'Not detected')}"
        ]
    }

@app.post("/transcribe")
def transcribe(req: TranscribeRequest):
    return {
        "success": True,
        "transcript": "[Speech-to-text unavailable — configure an STT provider such as Google Cloud Speech or OpenAI Whisper]",
        "language": req.language,
        "confidence": 0.0,
        "note": "Mock response. Integrate a real STT service in production."
    }
