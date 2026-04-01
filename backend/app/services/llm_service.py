"""
LLM Service - Groq API Integration
Handles all AI-powered analysis using Groq's LLaMA/Mixtral models
"""

import json
import os
import re
from typing import Any, Dict, List, Optional
import httpx

async def call_groq(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> str:
    """
    Make an async call to Groq API.
    Returns the model's text response.
    """
    api_key = os.getenv("GROQ_API_KEY", "")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    api_url = "https://api.groq.com/openai/v1/chat/completions"

    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": 2048,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(api_url, json=payload, headers=headers)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            error_body = response.text
            print(f"Groq API Error: {e.response.status_code} - {error_body}")
            raise ValueError(f"Groq API Error ({e.response.status_code}): {error_body}") from e
        
        data = response.json()
        return data["choices"][0]["message"]["content"]


def safe_parse_json(text: str) -> Dict[str, Any]:
    """
    Safely extract and parse JSON from LLM response.
    Handles markdown code blocks and stray text.
    """
    # Try to find JSON block in markdown code fence
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        text = match.group(1)
    
    # Try to find raw JSON object
    json_match = re.search(r"\{[\s\S]+\}", text)
    if json_match:
        text = json_match.group(0)
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from LLM response: {e}\nRaw text: {text[:500]}")


async def extract_structured_data(resume_text: str) -> Dict[str, Any]:
    """
    Use LLM to extract structured candidate data from raw resume text.
    Returns a dict with name, skills, experience, education, projects, certifications.
    """
    system_prompt = """You are an expert resume parser. Extract structured information from resumes.
Always respond with ONLY valid JSON, no other text. No markdown, no explanation."""

    user_prompt = f"""Extract the following information from this resume and return as JSON:

{{
  "name": "candidate full name",
  "email": "email if present",
  "phone": "phone if present",
  "skills": ["list", "of", "technical", "and", "soft", "skills"],
  "years_of_experience": "total years or estimate like '3-4 years'",
  "experience": [
    {{
      "title": "job title",
      "company": "company name",
      "duration": "duration",
      "description": "key responsibilities"
    }}
  ],
  "education": [
    {{
      "degree": "degree name",
      "institution": "institution name",
      "year": "graduation year"
    }}
  ],
  "projects": [
    {{
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"]
    }}
  ],
  "certifications": ["list of certifications"],
  "summary": "brief 2-sentence professional summary"
}}

RESUME TEXT:
{resume_text[:4000]}

Return ONLY the JSON object, nothing else."""

    raw = await call_groq(system_prompt, user_prompt, temperature=0.1)
    return safe_parse_json(raw)


async def evaluate_candidate(
    structured_data: Dict[str, Any],
    job_role: str,
    required_skills: list,
    min_experience: str = "",
    preferred_education: str = "",
    rule_based_score: float = 0.0,
    skill_match_pct: float = 0.0,
) -> Dict[str, Any]:
    """
    Use LLM to deeply evaluate candidate suitability.
    Returns score, strengths, weaknesses, recommendation, questions.
    """
    system_prompt = """You are a senior technical recruiter AI with 15+ years of experience.
You provide structured, fair, and insightful candidate evaluations.
Always respond with ONLY valid JSON. No markdown, no explanation outside JSON."""

    candidate_json = json.dumps(structured_data, indent=2)
    skills_str = ", ".join(required_skills)

    user_prompt = f"""Perform a deep evaluation of this candidate for the specified job.

JOB REQUIREMENTS:
- Role: {job_role}
- Required Skills: {skills_str}
- Minimum Experience: {min_experience or "Not specified"}
- Preferred Education: {preferred_education or "Not specified"}

RULE-BASED PRE-ANALYSIS:
- Skill Match: {skill_match_pct:.1f}%
- Rule-Based Score: {rule_based_score:.1f}/10

CANDIDATE PROFILE:
{candidate_json}

INSTRUCTIONS:
1. Deeply analyze the candidate's experiences and projects.
2. Generate EXACTLY 5 "Recruiter Validation Questions". These are YES/NO questions for the RECRUITER to answer while reviewing.
3. These questions should target areas where the resume might be ambiguous or show high-potential despite gaps.
4. Focus on skill equivalence (e.g. "Candidate has PyTorch, which is equivalent to required TensorFlow - should we accept this?").
5. Focus on potential over explicit experience (e.g. "Candidate built a full-stack project in Python but has no angular experience - do they show enough potential?").

Return this JSON structure:
{{
  "llm_score": <number 0-10, one decimal>,
  "final_score": <weighted average: 40% rule-based + 60% llm score, one decimal>,
  "match_percentage": <overall match 0-100, integer>,
  "recommendation": "Hire" or "Reject" or "Maybe",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "..."],
  "reasoning": "2-3 sentence internal recruiter note",
  "clarification_questions": [
    {{
      "id": 1,
      "question": "Is the candidate's proficiency in [Alternative Skill] sufficient to replace required [Skill]?",
      "context": "Context for recruiter explaining why this was suggested as an alternative."
    }},
    ... and so on for all 5 questions
  ]
}}

Return ONLY the JSON object."""

    raw = await call_groq(system_prompt, user_prompt, temperature=0.3)
    return safe_parse_json(raw)


async def evaluate_candidate_final(
    structured_data: Dict[str, Any],
    job_role: str,
    required_skills: list,
    min_experience: str,
    preferred_education: str,
    rule_based_score: float,
    skill_match_pct: float,
    recruiter_answers: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Final evaluation step considering both the resume and the recruiter's answers.
    """
    system_prompt = """You are a senior technical recruiter AI. 
Provide a final, definitive candidate assessment based on the resume AND the recruiter's validation of specific points."""

    candidate_json = json.dumps(structured_data, indent=2)
    skills_str = ", ".join(required_skills)
    answers_json = json.dumps(recruiter_answers, indent=2)

    user_prompt = f"""Finalize the evaluation for this candidate based on the resume and the Recruiter's validation answers.

JOB: {job_role} (Skills: {skills_str})

RECRUITER VALIDATION ANSWERS:
{answers_json}

CANDIDATE PROFILE:
{candidate_json}

INSTRUCTIONS:
1. Adjust the final score and match percentage based on the Recruiter's answers.
2. If the recruiter answered "YES" to a skill equivalence question, treat that skill as matched.
3. Provide a definitive recommendation and a final recruiter note.

Return this JSON:
{{
  "llm_score": <numeric 0-10>,
  "final_score": <numeric 0-10>,
  "match_percentage": <0-100>,
  "recommendation": "Hire" or "Reject" or "Maybe",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "reasoning": "Final conclusive note considering recruiter input"
}}"""

    raw = await call_groq(system_prompt, user_prompt, temperature=0.2)
    return safe_parse_json(raw)
