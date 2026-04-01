/**
 * ClarificationQuestions Component
 * Checkbox-based YES/NO questions for recruiter follow-up
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function ClarificationQuestions({ questions, onFinalize }) {
  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState(true);

  if (!questions || questions.length === 0) return null;

  const toggleAnswer = (id, value) => {
    setAnswers(prev => {
      if (prev[id] === value) {
        // Deselect if clicking same option
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: value };
    });
  };

  const answeredCount = Object.keys(answers).length;
  const yesCount = Object.values(answers).filter(v => v === 'yes').length;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <HelpCircle size={18} className="text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-white text-base">Clarification Questions</h3>
            <p className="text-xs text-slate-text mt-0.5">
              {answeredCount}/{questions.length} answered
              {answeredCount > 0 && ` · ${yesCount} YES, ${answeredCount - yesCount} NO`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-slate-text" />
        ) : (
          <ChevronDown size={18} className="text-slate-text" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-4">
          <p className="text-xs text-slate-text mb-4">
            Answer these recruiter questions to refine the final decision.
          </p>

          {questions.map((q, idx) => {
            const id = q.id || idx;
            const current = answers[id];

            return (
              <div
                key={id}
                className="rounded-xl border border-white/6 p-4 hover:border-white/10 transition-colors"
                style={{ background: 'rgba(18,18,26,0.6)' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center
                                   text-xs font-mono text-slate-text mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm text-white font-medium leading-snug">{q.question}</p>
                    {q.context && (
                      <p className="text-xs text-slate-text mt-1 italic">{q.context}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-8">
                  <button
                    onClick={() => toggleAnswer(id, 'yes')}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200
                      ${current === 'yes'
                        ? 'bg-acid/20 text-acid border border-acid/40 shadow-sm'
                        : 'bg-ink-700 text-slate-text border border-white/6 hover:border-acid/20 hover:text-acid/70'
                      }
                    `}
                  >
                    ✓ YES
                  </button>
                  <button
                    onClick={() => toggleAnswer(id, 'no')}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200
                      ${current === 'no'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-ink-700 text-slate-text border border-white/6 hover:border-red-500/20 hover:text-red-400/70'
                      }
                    `}
                  >
                    ✗ NO
                  </button>
                </div>
              </div>
            );
          })}

          {/* Summary bar */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-text font-mono">POSITIVE RESPONSES</span>
              <span className="text-xs font-mono text-acid">
                {questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-acid rounded-full transition-all duration-500"
                style={{ width: `${questions.length > 0 ? (yesCount / questions.length) * 100 : 0}%` }}
              />
            </div>

            <button
              onClick={() => onFinalize(Object.entries(answers).map(([id, val]) => ({
                id,
                question: questions.find(q => q.id == id)?.question,
                answer: val
              })))}
              disabled={answeredCount < questions.length}
              className={`
                w-full mt-6 py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all
                ${answeredCount < questions.length
                  ? 'bg-ink-700 text-white/30 cursor-not-allowed border border-white/5'
                  : 'bg-acid text-ink-950 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(200,241,53,0.3)]'
                }
              `}
            >
              {answeredCount < questions.length
                ? `Answer all ${questions.length} questions to proceed...`
                : 'Submit & View Final Analysis'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
