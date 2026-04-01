/**
 * ResultsPanel Component
 * Displays the full analysis results including score, skills, strengths/weaknesses
 */

import React, { useState } from 'react';
import {
  User, Briefcase, GraduationCap, Code2, FolderGit2,
  TrendingUp, TrendingDown, Award, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertCircle, Star, Zap
} from 'lucide-react';
import ScoreRing from './ScoreRing';
import ClarificationQuestions from './ClarificationQuestions';

function RecommendationBadge({ recommendation }) {
  const config = {
    Hire: {
      icon: CheckCircle2,
      bg: 'bg-acid/10',
      border: 'border-acid/30',
      text: 'text-acid',
      glow: '0 0 30px rgba(200,241,53,0.2)',
      label: '✓ RECOMMEND HIRE'
    },
    Reject: {
      icon: XCircle,
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      glow: '0 0 30px rgba(239,68,68,0.15)',
      label: '✗ DO NOT HIRE'
    },
    Maybe: {
      icon: AlertCircle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-400/30',
      text: 'text-amber-400',
      glow: '0 0 30px rgba(245,158,11,0.15)',
      label: '? NEEDS REVIEW'
    },
  };

  const c = config[recommendation] || config.Maybe;
  const Icon = c.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border ${c.bg} ${c.border}`}
      style={{ boxShadow: c.glow }}
    >
      <Icon size={16} className={c.text} />
      <span className={`font-display font-bold text-sm tracking-widest ${c.text}`}>
        {c.label}
      </span>
    </div>
  );
}

function ProgressBar({ value, color = '#c8f135', label, sublabel }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-white/80">{label}</span>
        <span className="font-mono text-xs" style={{ color }}>{sublabel || `${value}%`}</span>
      </div>
      <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ink-700 flex items-center justify-center">
            <Icon size={15} className="text-acid" />
          </div>
          <span className="font-display font-semibold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-text" /> : <ChevronDown size={16} className="text-slate-text" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>}
    </div>
  );
}

export default function ResultsPanel({ results }) {
  const { candidate, analysis, job } = results;

  return (
    <div className="space-y-4 animate-in">
      {/* ── Hero Score Card ── */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Score Ring */}
          <div className="flex-shrink-0">
            <ScoreRing score={analysis.final_score} size={148} />
          </div>

          {/* Main info */}
          <div className="flex-1 text-center sm:text-left">
            <p className="section-label mb-2">Candidate</p>
            <h2 className="font-display font-bold text-2xl text-white leading-tight">
              {candidate.name || 'Candidate'}
            </h2>
            {candidate.email && (
              <p className="text-sm text-slate-text mt-1">{candidate.email}</p>
            )}
            {candidate.summary && (
              <p className="text-sm text-white/60 mt-3 leading-relaxed line-clamp-2">
                {candidate.summary}
              </p>
            )}

            <div className="mt-4">
              <RecommendationBadge recommendation={analysis.recommendation} />
            </div>

            {analysis.reasoning && (
              <p className="mt-3 text-sm text-slate-text italic leading-relaxed border-l-2 border-acid/30 pl-3">
                "{analysis.reasoning}"
              </p>
            )}
          </div>
        </div>

        {/* Score breakdown bar */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-4">
          {[
            { label: 'Overall Match', value: analysis.match_percentage, color: '#c8f135' },
            { label: 'Skill Match', value: analysis.skill_match_percentage, color: '#60a5fa' },
            { label: 'Rule Score', value: analysis.rule_based_score * 10, sublabel: `${analysis.rule_based_score}/10`, color: '#f59e0b' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-text">{item.label}</span>
                <span className="text-xs font-mono" style={{ color: item.color }}>
                  {item.sublabel || `${Math.round(item.value)}%`}
                </span>
              </div>
              <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(item.value, 100)}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Skill Analysis ── */}
      <Section icon={Code2} title="Skill Analysis">
        <div className="space-y-4">
          {analysis.matched_skills?.length > 0 && (
            <div>
              <p className="section-label mb-2">Matched Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.matched_skills.map(s => (
                  <span key={s} className="tag tag-matched">✓ {s}</span>
                ))}
              </div>
            </div>
          )}
          {analysis.missing_skills?.length > 0 && (
            <div>
              <p className="section-label mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_skills.map(s => (
                  <span key={s} className="tag tag-missing">✗ {s}</span>
                ))}
              </div>
            </div>
          )}
          {candidate.skills?.length > 0 && (
            <div>
              <p className="section-label mb-2">All Candidate Skills</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(s => (
                  <span key={s} className="tag tag-skill">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-acid" />
            <h3 className="font-display font-bold text-sm text-white">Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {(analysis.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                <Zap size={13} className="text-acid flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-red-400" />
            <h3 className="font-display font-bold text-sm text-white">Weaknesses</h3>
          </div>
          <ul className="space-y-2.5">
            {(analysis.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Experience ── */}
      {candidate.experience?.length > 0 && (
        <Section icon={Briefcase} title={`Work Experience (${candidate.years_of_experience || ''})`} defaultOpen={false}>
          <div className="space-y-4">
            {candidate.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-acid/20 pl-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-semibold text-white text-sm">{exp.title}</p>
                    <p className="text-xs text-acid mt-0.5">{exp.company}</p>
                  </div>
                  {exp.duration && (
                    <span className="text-xs font-mono text-slate-text">{exp.duration}</span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs text-white/55 mt-2 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Projects ── */}
      {candidate.projects?.length > 0 && (
        <Section icon={FolderGit2} title="Projects" defaultOpen={false}>
          <div className="space-y-4">
            {candidate.projects.map((proj, i) => (
              <div key={i} className="rounded-xl bg-ink-900 p-4 border border-white/5">
                <p className="font-display font-semibold text-sm text-white">{proj.name}</p>
                {proj.description && (
                  <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{proj.description}</p>
                )}
                {proj.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.technologies.map(t => (
                      <span key={t} className="tag tag-skill" style={{ fontSize: '10px' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Education ── */}
      {candidate.education?.length > 0 && (
        <Section icon={GraduationCap} title="Education" defaultOpen={false}>
          <div className="space-y-3">
            {candidate.education.map((edu, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ink-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={14} className="text-slate-text" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{edu.degree}</p>
                  <p className="text-xs text-slate-text">{edu.institution} {edu.year ? `· ${edu.year}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Certifications ── */}
      {candidate.certifications?.length > 0 && (
        <Section icon={Award} title="Certifications" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {candidate.certifications.map((cert, i) => (
              <span key={i} className="tag" style={{
                background: 'rgba(96,165,250,0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(96,165,250,0.2)'
              }}>
                <Award size={10} /> {cert}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Clarification Questions ── */}
      <ClarificationQuestions questions={analysis.clarification_questions} />
    </div>
  );
}
