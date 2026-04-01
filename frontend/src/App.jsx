/**
 * AI Resume Reviewer - Main Application
 * RecruitIQ: Intelligent resume analysis dashboard for recruiters
 */

import React, { useState } from 'react';
import {
  Briefcase, Sparkles, RotateCcw, AlertCircle,
  ChevronRight, Cpu, Users, Target, Clock, HelpCircle
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import SkillTagInput from './components/SkillTagInput';
import ResultsPanel from './components/ResultsPanel';
import ClarificationQuestions from './components/ClarificationQuestions';
import LoadingState from './components/LoadingState';
import { analyzeResume, finalizeEvaluation } from './services/api';

// ── Stat Card for hero section ──────────────────────────────────────
function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-800 border border-white/5">
      <div className="w-8 h-8 rounded-lg bg-acid/10 flex items-center justify-center">
        <Icon size={15} className="text-acid" />
      </div>
      <div>
        <p className="font-display font-bold text-white text-sm">{value}</p>
        <p className="text-xs text-slate-text">{label}</p>
      </div>
    </div>
  );
}

// ── Input field wrapper ──────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="section-label">{label}</label>
        {hint && <span className="text-xs text-slate-text">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [preferredEducation, setPreferredEducation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState('input'); // 'input', 'questions', 'results'
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');

  const canSubmit = file && jobRole.trim() && skills.length > 0 && !isLoading;

  const handleInitialAnalyze = async () => {
    if (!canSubmit) return;
    setError('');
    setIsLoading(true);

    try {
      const data = await analyzeResume(file, {
        jobRole: jobRole.trim(),
        requiredSkills: skills.join(', '),
        minExperience,
        preferredEducation,
      });
      setInitialData(data);
      setStep('questions');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Analysis failed. Please check your backend and API key.';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async (answers) => {
    setError('');
    setIsLoading(true);

    try {
      const finalResults = await finalizeEvaluation({
        candidate: initialData.candidate,
        job: initialData.job,
        rule_results: initialData.preliminary_analysis,
        answers: answers
      });
      
      // Merge candidate info back for the results view
      setResults({
        ...finalResults,
        candidate: initialData.candidate.full_structured_data,
        job: initialData.job
      });
      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to finalize analysis. ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobRole('');
    setSkills([]);
    setMinExperience('');
    setPreferredEducation('');
    setResults(null);
    setInitialData(null);
    setStep('input');
    setError('');
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* ── Background decoration ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #c8f135, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-3"
          style={{ background: 'radial-gradient(circle, #c8f135, transparent 70%)' }}
        />
      </div>

      {/* ── Header ── */}
      <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-ink-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-acid flex items-center justify-center">
              <Cpu size={16} className="text-ink-950" />
            </div>
            <div>
              <span className="font-display font-bold text-white">RecruitIQ</span>
              <span className="ml-2 text-xs font-mono text-acid/60 hidden sm:inline">AI Resume Reviewer</span>
            </div>
          </div>

          {results && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-800 hover:bg-ink-700
                         border border-white/8 text-sm text-slate-text hover:text-white transition-all"
            >
              <RotateCcw size={13} />
              New Analysis
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {step === 'input' && (
          <>
            {/* ── Hero ── */}
            <div className="text-center mb-10 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              bg-acid/10 border border-acid/20 text-acid text-xs font-mono mb-5">
                <Sparkles size={11} />
                Powered by Groq + LLaMA 3
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight mb-3">
                Screen resumes<br />
                <span className="text-acid">10× faster</span> with AI
              </h1>
              <p className="text-slate-text text-base max-w-xl mx-auto leading-relaxed">
                Upload any resume, define your requirements, and get a deep AI analysis
                with score, skill gaps, and targeted recruiter validation questions.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <StatCard icon={Target} value="95%+" label="Match accuracy" />
                <StatCard icon={Clock} value="~20s" label="Analysis time" />
                <StatCard icon={Users} value="Any role" label="Works for all positions" />
              </div>
            </div>

            {/* ── Form ── */}
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-6 sm:p-8 space-y-6 animate-in stagger-2">
                {/* File upload */}
                <Field label="Resume File" hint="PDF or DOCX">
                  <FileUpload file={file} onFileChange={setFile} />
                </Field>

                {/* Job role */}
                <Field label="Job Role *">
                  <input
                    type="text"
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, Data Scientist..."
                    className="input-field"
                  />
                </Field>

                {/* Required skills */}
                <Field label="Required Skills *" hint="Press Enter or comma to add">
                  <SkillTagInput
                    skills={skills}
                    onChange={setSkills}
                    placeholder="Type a skill and press Enter..."
                  />
                  {skills.length === 0 && (
                    <p className="mt-1.5 text-xs text-slate-text">
                      e.g. React, TypeScript, Node.js, AWS
                    </p>
                  )}
                </Field>

                {/* Optional fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Min. Experience" hint="Optional">
                    <input
                      type="text"
                      value={minExperience}
                      onChange={e => setMinExperience(e.target.value)}
                      placeholder="e.g. 3 years, 5+ years"
                      className="input-field"
                    />
                  </Field>
                  <Field label="Preferred Education" hint="Optional">
                    <input
                      type="text"
                      value={preferredEducation}
                      onChange={e => setPreferredEducation(e.target.value)}
                      placeholder="e.g. Bachelor's in CS, Masters"
                      className="input-field"
                    />
                  </Field>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                    <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300 leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleInitialAnalyze}
                  disabled={!canSubmit}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Analyze Resume
                  <ChevronRight size={14} />
                </button>

                {!canSubmit && !isLoading && (
                  <p className="text-center text-xs text-slate-text -mt-2">
                    {!file ? 'Upload a resume' : !jobRole.trim() ? 'Enter a job role' : 'Add at least one required skill'} to continue
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {step === 'questions' && initialData && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in">
            <div className="glass-card p-6 border-l-4 border-amber-500/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <HelpCircle size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white">Recruiter Validation</h2>
                  <p className="text-sm text-slate-text mt-1 leading-relaxed">
                    We've scanned <span className="text-white font-semibold">{initialData.candidate.name}</span>'s resume.
                    To provide the most accurate match for <span className="text-white font-semibold">{initialData.job.role}</span>,
                    please answer the following 5 validation questions based on your requirements.
                  </p>
                </div>
              </div>
            </div>

            <ClarificationQuestions 
              questions={initialData.questions} 
              onFinalize={handleFinalize}
            />

            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-xs text-slate-text hover:text-white transition-colors mx-auto"
            >
              <RotateCcw size={12} />
              Cancel and start over
            </button>
          </div>
        )}

        {step === 'results' && results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
            {/* Left: Job context panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-card p-5">
                <p className="section-label mb-3">Job Requirements</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-text mb-1">Role</p>
                    <p className="font-display font-semibold text-white text-sm">{results.job.role}</p>
                  </div>
                  {results.job.min_experience && (
                    <div>
                      <p className="text-xs text-slate-text mb-1">Experience</p>
                      <p className="text-sm text-white">{results.job.min_experience}</p>
                    </div>
                  )}
                  {results.job.preferred_education && (
                    <div>
                      <p className="text-xs text-slate-text mb-1">Education</p>
                      <p className="text-sm text-white">{results.job.preferred_education}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-text mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {results.job.required_skills.map(s => (
                        <span key={s} className="tag tag-skill">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* New analysis button */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                           bg-ink-800 hover:bg-ink-700 border border-white/8
                           text-sm font-display font-semibold text-white transition-all shadow-sm"
              >
                <RotateCcw size={14} />
                Analyze Another Resume
              </button>
            </div>

            {/* Right: Full results */}
            <div className="lg:col-span-2">
              <ResultsPanel results={results} />
            </div>
          </div>
        )}
      </main>

      {/* ── Loading overlay ── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-ink-950/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <LoadingState />
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 mt-20 py-6 text-center">
        <p className="text-xs text-slate-text">
          RecruitIQ · AI Resume Reviewer · Built with Groq + LLaMA 3 + FastAPI + React
        </p>
      </footer>
    </div>
  );
}
