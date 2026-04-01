/**
 * SkillTagInput Component
 * Tag-based input for required skills with keyboard support
 */

import React, { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

export default function SkillTagInput({ skills, onChange, placeholder = "Add a skill..." }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addSkill = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Split by comma to allow pasting multiple skills at once
    const newSkills = trimmed
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !skills.includes(s));
    if (newSkills.length > 0) {
      onChange([...skills, ...newSkills]);
    }
    setInputValue('');
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  return (
    <div
      className="min-h-[48px] w-full bg-ink-900 border border-white/8 rounded-xl px-3 py-2
                 focus-within:border-acid/40 transition-colors cursor-text flex flex-wrap gap-2 items-center"
      onClick={() => inputRef.current?.focus()}
    >
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono
                     bg-acid/10 text-acid border border-acid/20 group"
        >
          {skill}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
            className="hover:text-acid-dark transition-colors"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addSkill(inputValue); }}
        placeholder={skills.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white
                   placeholder:text-ink-600 font-body"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      {inputValue && (
        <button
          type="button"
          onClick={() => addSkill(inputValue)}
          className="flex-shrink-0 w-6 h-6 rounded-md bg-acid/20 hover:bg-acid/30
                     flex items-center justify-center transition-colors"
        >
          <Plus size={12} className="text-acid" />
        </button>
      )}
    </div>
  );
}
