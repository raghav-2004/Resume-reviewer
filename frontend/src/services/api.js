/**
 * API Service
 * Handles all communication with the FastAPI backend
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for LLM calls
});

/**
 * Analyze a resume against job requirements
 * @param {File} resumeFile - PDF or DOCX file
 * @param {Object} jobData - Job role, skills, experience, education
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeResume(resumeFile, jobData) {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_role', jobData.jobRole);
  formData.append('required_skills', jobData.requiredSkills);
  formData.append('min_experience', jobData.minExperience || '');
  formData.append('preferred_education', jobData.preferredEducation || '');

  const response = await api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

/**
 * Finalize analysis with recruiter answers
 * @param {Object} finalizeData - Candidate, job, and recruiter answers
 * @returns {Promise<Object>} Final analysis results
 */
export async function finalizeEvaluation(finalizeData) {
  const response = await api.post('/api/finalize', finalizeData);
  return response.data;
}

export default api;
