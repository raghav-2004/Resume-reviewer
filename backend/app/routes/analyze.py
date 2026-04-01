"""
Analysis Route
POST /api/analyze - Main endpoint for resume analysis
"""

import json
import traceback
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.services.parser import parse_resume
from app.services.llm_service import extract_structured_data, evaluate_candidate, evaluate_candidate_final
from app.services.matcher import compute_rule_based_score
from pydantic import BaseModel

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(..., description="Resume PDF or DOCX file"),
    job_role: str = Form(..., description="Target job role/title"),
    required_skills: str = Form(..., description="Comma-separated list of required skills"),
    min_experience: Optional[str] = Form("", description="Minimum years of experience"),
    preferred_education: Optional[str] = Form("", description="Preferred education level"),
):
    """
    Main analysis endpoint.
    
    1. Parse the uploaded resume file
    2. Extract structured data using LLM
    3. Run rule-based matching
    4. Run LLM-based evaluation
    5. Return merged results
    """
    # --- Validate file ---
    if resume.size and resume.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")

    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
    ]
    if resume.content_type and resume.content_type not in allowed_types:
        # Be lenient - also check filename extension
        fname = resume.filename or ""
        if not any(fname.lower().endswith(ext) for ext in [".pdf", ".docx", ".doc", ".txt"]):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {resume.content_type}. Please upload PDF or DOCX."
            )

    # --- Parse skills ---
    skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]
    if not skills_list:
        raise HTTPException(status_code=400, detail="Please provide at least one required skill.")

    try:
        # Step 1: Read file bytes
        file_bytes = await resume.read()
        
        # Step 2: Extract text from resume
        resume_text = parse_resume(file_bytes, resume.filename or "resume.pdf")
        
        if len(resume_text) < 50:
            raise HTTPException(
                status_code=422,
                detail="Could not extract meaningful text from the resume. Please ensure the file is not scanned/image-only."
            )

        # Step 3: Extract structured data via LLM
        structured_data = await extract_structured_data(resume_text)

        # Step 4: Rule-based matching
        rule_results = compute_rule_based_score(
            structured_data,
            skills_list,
            min_experience or "",
            preferred_education or "",
        )

        # Step 5: LLM-based evaluation
        llm_results = await evaluate_candidate(
            structured_data=structured_data,
            job_role=job_role,
            required_skills=skills_list,
            min_experience=min_experience or "",
            preferred_education=preferred_education or "",
            rule_based_score=rule_results["rule_based_score"],
            skill_match_pct=rule_results["skill_match_percentage"],
        )

        # Step 6: Return preliminary results with questions
        response = {
            "status": "success",
            "candidate": {
                "name": structured_data.get("name", "Unknown"),
                "email": structured_data.get("email", ""),
                "summary": structured_data.get("summary", ""),
                "years_of_experience": structured_data.get("years_of_experience", ""),
                "skills": structured_data.get("skills", []),
                # Pass back for the finalize step
                "full_structured_data": structured_data,
            },
            "questions": llm_results.get("clarification_questions", []),
            "preliminary_analysis": {
                "rule_based_score": rule_results["rule_based_score"],
                "skill_match_percentage": rule_results["skill_match_percentage"],
                "matched_skills": rule_results["matched_skills"],
                "missing_skills": rule_results["missing_skills"],
            },
            "job": {
                "role": job_role,
                "required_skills": skills_list,
                "min_experience": min_experience or "",
                "preferred_education": preferred_education or "",
            }
        }

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


class FinalizeRequest(BaseModel):
    candidate: dict
    job: dict
    answers: List[dict]
    rule_results: dict


@router.post("/finalize")
async def finalize_analysis(req: FinalizeRequest):
    """
    Step 2: Get final evaluation based on recruiter answers.
    """
    try:
        final_results = await evaluate_candidate_final(
            structured_data=req.candidate.get("full_structured_data", req.candidate),
            job_role=req.job["role"],
            required_skills=req.job["required_skills"],
            min_experience=req.job["min_experience"],
            preferred_education=req.job["preferred_education"],
            rule_based_score=req.rule_results["rule_based_score"],
            skill_match_pct=req.rule_results["skill_match_percentage"],
            recruiter_answers=req.answers,
        )

        return {
            "status": "success",
            "analysis": {
                **final_results,
                "rule_based_score": req.rule_results["rule_based_score"],
                "skill_match_percentage": req.rule_results["skill_match_percentage"],
            }
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
