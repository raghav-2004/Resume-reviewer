"""
Rule-Based Matching Engine
Computes skill match, experience match, and education match scores.
"""

import re
from typing import Dict, List, Any, Tuple


def normalize(text: str) -> str:
    """Lowercase and strip whitespace for comparison."""
    return text.lower().strip()


def skill_overlap(candidate_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """
    Compare candidate skills against required skills.
    Returns (match_percentage, matched_skills, missing_skills).
    Uses fuzzy substring matching to catch variations.
    """
    if not required_skills:
        return 100.0, [], []

    normalized_candidate = [normalize(s) for s in candidate_skills]
    matched = []
    missing = []

    for req_skill in required_skills:
        req_norm = normalize(req_skill)
        found = False
        for cand_skill in normalized_candidate:
            # Check substring match in both directions
            if req_norm in cand_skill or cand_skill in req_norm:
                found = True
                break
            # Handle common aliases
            aliases = {
                "js": ["javascript", "js"],
                "javascript": ["javascript", "js"],
                "ts": ["typescript", "ts"],
                "typescript": ["typescript", "ts"],
                "ml": ["machine learning", "ml"],
                "ai": ["artificial intelligence", "ai"],
                "dl": ["deep learning", "dl"],
                "nlp": ["natural language processing", "nlp"],
                "node": ["node.js", "nodejs", "node"],
                "react": ["react", "react.js", "reactjs"],
                "py": ["python", "py"],
            }
            for alias_group in aliases.values():
                if req_norm in alias_group and any(a in cand_skill for a in alias_group):
                    found = True
                    break
            if found:
                break
        
        if found:
            matched.append(req_skill)
        else:
            missing.append(req_skill)

    match_pct = (len(matched) / len(required_skills)) * 100
    return match_pct, matched, missing


def extract_years_from_text(text: str) -> float:
    """
    Parse years of experience from text like '3 years', '3-4 years', '2+ years'.
    Returns numeric value.
    """
    if not text:
        return 0.0
    
    text = str(text).lower()
    
    # Match patterns like "3-4 years", "3 to 4 years"
    range_match = re.search(r'(\d+)\s*[-to]+\s*(\d+)', text)
    if range_match:
        return (float(range_match.group(1)) + float(range_match.group(2))) / 2

    # Match "3+ years" or "3 years"
    single_match = re.search(r'(\d+(?:\.\d+)?)\+?\s*years?', text)
    if single_match:
        return float(single_match.group(1))

    # Match just a number
    num_match = re.search(r'(\d+(?:\.\d+)?)', text)
    if num_match:
        return float(num_match.group(1))
    
    return 0.0


def experience_score(candidate_exp: str, min_exp: str) -> float:
    """
    Score experience match (0-10).
    Returns 10 if requirement not specified.
    """
    if not min_exp:
        return 8.0  # Neutral score if no requirement

    required_years = extract_years_from_text(min_exp)
    candidate_years = extract_years_from_text(candidate_exp)

    if required_years == 0:
        return 8.0

    if candidate_years == 0:
        return 4.0  # Can't verify experience

    ratio = candidate_years / required_years
    if ratio >= 1.5:
        return 10.0
    elif ratio >= 1.0:
        return 9.0
    elif ratio >= 0.8:
        return 7.0
    elif ratio >= 0.6:
        return 5.0
    elif ratio >= 0.4:
        return 3.0
    else:
        return 1.0


def education_score(candidate_education: List[Dict], preferred_edu: str) -> float:
    """
    Score education match (0-10).
    Returns neutral score if no preference specified.
    """
    if not preferred_edu:
        return 7.0  # Neutral if no requirement

    preferred_lower = normalize(preferred_edu)
    
    # Education level hierarchy
    edu_keywords = {
        "phd": 5, "doctorate": 5,
        "master": 4, "ms": 4, "msc": 4, "mba": 4, "m.tech": 4,
        "bachelor": 3, "bs": 3, "bsc": 3, "b.tech": 3, "be": 3, "undergraduate": 3,
        "associate": 2, "diploma": 2,
        "high school": 1, "secondary": 1
    }

    # Get required level
    required_level = 0
    for keyword, level in edu_keywords.items():
        if keyword in preferred_lower:
            required_level = level
            break

    # Get candidate level
    candidate_level = 0
    for edu in candidate_education:
        edu_text = normalize(str(edu.get("degree", "")))
        for keyword, level in edu_keywords.items():
            if keyword in edu_text:
                if level > candidate_level:
                    candidate_level = level
                break

    if candidate_level == 0:
        return 5.0  # Unknown education

    if candidate_level >= required_level:
        return 10.0
    elif candidate_level == required_level - 1:
        return 6.0
    else:
        return 3.0


def compute_rule_based_score(
    structured_data: Dict[str, Any],
    required_skills: List[str],
    min_experience: str = "",
    preferred_education: str = "",
) -> Dict[str, Any]:
    """
    Run all rule-based checks and return a combined score + details.
    """
    candidate_skills = structured_data.get("skills", [])
    candidate_exp = structured_data.get("years_of_experience", "")
    candidate_edu = structured_data.get("education", [])

    # 1. Skill matching
    skill_pct, matched_skills, missing_skills = skill_overlap(candidate_skills, required_skills)
    skill_score = (skill_pct / 100) * 10  # Normalize to 0-10

    # 2. Experience matching
    exp_score = experience_score(str(candidate_exp), min_experience)

    # 3. Education matching
    edu_score = education_score(candidate_edu if isinstance(candidate_edu, list) else [], preferred_education)

    # Weighted composite score: skills 60%, exp 25%, edu 15%
    if required_skills:
        composite = (skill_score * 0.60) + (exp_score * 0.25) + (edu_score * 0.15)
    else:
        composite = (exp_score * 0.50) + (edu_score * 0.50)

    return {
        "rule_based_score": round(composite, 1),
        "skill_match_percentage": round(skill_pct, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "experience_score": round(exp_score, 1),
        "education_score": round(edu_score, 1),
    }
