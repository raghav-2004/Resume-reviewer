/**
 * ScoreRing Component
 * Animated circular progress ring for displaying candidate score
 */

import React, { useEffect, useState } from 'react';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(score) {
  if (score >= 7.5) return '#c8f135'; // acid green
  if (score >= 5.5) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function getScoreLabel(score) {
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Strong';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Average';
  if (score >= 3) return 'Weak';
  return 'Poor';
}

export default function ScoreRing({ score, size = 160 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // Animate score counter
  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(parseFloat((eased * score).toFixed(1)));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [score]);

  const offset = CIRCUMFERENCE - (animatedScore / 10) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 128 128"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="#1a1a26"
            strokeWidth="10"
          />
          {/* Glow effect */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            opacity="0.15"
            filter="blur(4px)"
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.2, 0.64, 1)' }}
          />
          {/* Main progress arc */}
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.2, 0.64, 1)' }}
          />
        </svg>

        {/* Center content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}
        >
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: size * 0.22, color }}
          >
            {animatedScore.toFixed(1)}
          </span>
          <span className="text-slate-text font-mono" style={{ fontSize: size * 0.085 }}>
            / 10
          </span>
        </div>
      </div>

      <div className="text-center">
        <span
          className="font-display font-semibold text-sm px-3 py-1 rounded-full"
          style={{
            color,
            background: `${color}18`,
            border: `1px solid ${color}30`
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
