/**
 * LoadingState Component
 * Animated loading display with step-by-step progress
 */

import React, { useEffect, useState } from 'react';
import { FileSearch, Brain, BarChart3, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: FileSearch, label: 'Parsing resume...', duration: 3000 },
  { icon: Brain, label: 'Extracting structured data...', duration: 5000 },
  { icon: BarChart3, label: 'Running skill matching...', duration: 2000 },
  { icon: Sparkles, label: 'AI evaluation in progress...', duration: 8000 },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    let stepIndex = 0;

    const advance = () => {
      if (stepIndex < STEPS.length - 1) {
        setCompletedSteps(prev => [...prev, stepIndex]);
        stepIndex++;
        setCurrentStep(stepIndex);
        setTimeout(advance, STEPS[stepIndex].duration);
      }
    };

    setTimeout(advance, STEPS[0].duration);

    return () => {};
  }, []);

  return (
    <div className="glass-card p-8 flex flex-col items-center">
      {/* Central spinner */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-acid/10" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-acid animate-spin"
          style={{ animationDuration: '1s' }}
        />
        <div
          className="absolute inset-2 rounded-full border border-acid/20 border-t-acid/60 animate-spin"
          style={{ animationDuration: '1.6s', animationDirection: 'reverse' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={22} className="text-acid animate-pulse" />
        </div>
      </div>

      <h3 className="font-display font-bold text-lg text-white mb-1">Analyzing Resume</h3>
      <p className="text-sm text-slate-text mb-8">This may take up to 30 seconds...</p>

      {/* Step list */}
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = completedSteps.includes(idx);
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isPending ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${isDone ? 'bg-acid/20' : isActive ? 'bg-acid/10' : 'bg-ink-700'}
              `}>
                {isDone ? (
                  <CheckCircle2 size={14} className="text-acid" />
                ) : isActive ? (
                  <Loader2 size={14} className="text-acid animate-spin" />
                ) : (
                  <Icon size={14} className="text-slate-text" />
                )}
              </div>
              <span className={`text-sm ${isDone ? 'text-acid' : isActive ? 'text-white' : 'text-slate-text'}`}>
                {step.label}
              </span>
              {isDone && (
                <span className="ml-auto text-xs font-mono text-acid/60">done</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mt-6">
        <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-acid rounded-full transition-all duration-1000"
            style={{ width: `${((completedSteps.length + 0.5) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
