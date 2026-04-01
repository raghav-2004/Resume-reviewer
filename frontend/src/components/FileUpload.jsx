/**
 * FileUpload Component
 * Drag-and-drop resume uploader with file validation
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload({ file, onFileChange }) {
  const [dragError, setDragError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragError('');
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        setDragError('File is too large. Maximum size is 10MB.');
      } else if (err.code === 'file-invalid-type') {
        setDragError('Invalid file type. Please upload a PDF or DOCX file.');
      } else {
        setDragError(err.message);
      }
      return;
    }
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const removeFile = (e) => {
    e.stopPropagation();
    onFileChange(null);
    setDragError('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (file) {
    return (
      <div className="glass-card p-5 border border-acid/20 acid-glow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-acid/10 flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-acid" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-white truncate text-sm">{file.name}</p>
            <p className="text-xs text-slate-text mt-0.5">{formatSize(file.size)} · Ready to analyze</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-acid" />
            <button
              onClick={removeFile}
              className="w-8 h-8 rounded-lg bg-ink-700 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
            >
              <X size={14} className="text-slate-text group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-300 group
          ${isDragActive
            ? 'border-acid bg-acid/5 scale-[1.01]'
            : 'border-ink-600 hover:border-acid/40 hover:bg-ink-800/50'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Background grid pattern */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(200,241,53,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragActive ? 'bg-acid/20 scale-110' : 'bg-ink-700 group-hover:bg-acid/10'}
          `}>
            <Upload
              size={26}
              className={`transition-colors ${isDragActive ? 'text-acid' : 'text-slate-text group-hover:text-acid'}`}
            />
          </div>

          <div>
            {isDragActive ? (
              <p className="font-display font-bold text-acid text-lg">Drop it here!</p>
            ) : (
              <>
                <p className="font-display font-bold text-white text-base">
                  Drop your resume here
                </p>
                <p className="text-slate-text text-sm mt-1">
                  or <span className="text-acid underline underline-offset-2">browse files</span>
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {['PDF', 'DOCX', 'DOC'].map(type => (
              <span key={type} className="tag tag-skill">{type}</span>
            ))}
            <span className="text-slate-text text-xs">· Max 10MB</span>
          </div>
        </div>
      </div>

      {dragError && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
          <X size={13} />
          {dragError}
        </p>
      )}
    </div>
  );
}
