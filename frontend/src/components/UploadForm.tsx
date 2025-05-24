import React, { useState, useEffect } from 'react';
import { getUniversities } from '../api';

interface UploadFormProps {
  onMatch: (data: { text?: string; file?: File; university: string }) => void;
  disabled: boolean;
}

export default function UploadForm({ onMatch, disabled }: UploadFormProps) {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [university, setUniversity] = useState('University of Michigan');
  const [universities, setUniversities] = useState<string[]>([]);

  useEffect(() => {
    getUniversities().then((unis) => {
      setUniversities(unis);
      // If University of Michigan is available and no university is selected, default to it
      if (unis.includes('University of Michigan') && !university) {
        setUniversity('University of Michigan');
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!university) {
      alert('Please select a university');
      return;
    }

    if (inputType === 'text') {
      if (!text.trim()) {
        alert('Please enter some text or keywords');
        return;
      }
      onMatch({ text, university });
    } else {
      if (!file) {
        alert('Please select a file');
        return;
      }
      onMatch({ file, university });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx')) {
        alert('Please select a PDF, DOCX, or text file');
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-sage-light rounded-xl shadow-elegant-lg border-2 border-sage/40 p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-dark-green mb-3">
          Start Your Research Journey
        </h2>
        <p className="text-dark-green/70 text-sm leading-relaxed">
          Choose how you'd like to discover research opportunities
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* University Selection */}
        <div>
          <label 
            htmlFor="university-select"
            className="block text-sm font-semibold text-dark-green mb-3"
          >
            🏛️ Select Your University
          </label>
          <select
            id="university-select"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-sage/50 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 text-dark-green font-medium shadow-sm hover:border-sage-dark"
            disabled={disabled}
            aria-describedby="university-help"
          >
            <option value="">Choose your university...</option>
            {universities.map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))}
          </select>
          <p id="university-help" className="text-xs text-dark-green/60 mt-1">
            Select the university where you want to find research opportunities
          </p>
        </div>

        {/* Input Type Toggle */}
        <div className="bg-sage-light/20 rounded-lg p-5 border border-sage/30">
          <legend className="text-sm font-semibold text-dark-green mb-4">
            📋 How would you like to search?
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-4 border-2 border-sage/40 rounded-lg cursor-pointer hover:border-primary-red/50 hover:bg-sage-light/30 transition-all duration-200 group">
              <input
                type="radio"
                value="text"
                checked={inputType === 'text'}
                onChange={(e) => setInputType(e.target.value as 'text')}
                className="sr-only"
                disabled={disabled}
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                inputType === 'text' 
                  ? 'border-primary-red bg-primary-red shadow-sm' 
                  : 'border-sage-dark group-hover:border-primary-red/60'
              }`}>
                {inputType === 'text' && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-dark-green">Keywords & Interests</span>
                <p className="text-xs text-dark-green/60 mt-0.5">Type your research areas</p>
              </div>
            </label>
            
            <label className="flex items-center p-4 border-2 border-sage/40 rounded-lg cursor-pointer hover:border-primary-red/50 hover:bg-sage-light/30 transition-all duration-200 group">
              <input
                type="radio"
                value="file"
                checked={inputType === 'file'}
                onChange={(e) => setInputType(e.target.value as 'file')}
                className="sr-only"
                disabled={disabled}
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                inputType === 'file' 
                  ? 'border-primary-red bg-primary-red shadow-sm' 
                  : 'border-sage-dark group-hover:border-primary-red/60'
              }`}>
                {inputType === 'file' && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-dark-green">Resume Upload</span>
                <p className="text-xs text-dark-green/60 mt-0.5">PDF, DOCX, or TXT file</p>
              </div>
            </label>
          </div>
        </div>

        {/* Content Input */}
        {inputType === 'text' ? (
          <div>
            <label 
              htmlFor="research-text"
              className="block text-sm font-semibold text-dark-green mb-3"
            >
              🔬 Your Research Interests
            </label>
            <textarea
              id="research-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your research interests, skills, academic background, or specific areas you'd like to explore...

Examples:
• Machine learning and artificial intelligence
• Cancer biology and immunotherapy
• Sustainable energy and solar cells
• Environmental science and climate change"
              rows={8}
              className="w-full px-4 py-3 bg-white border-2 border-sage/50 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 resize-none text-dark-green placeholder-dark-green/40 shadow-sm hover:border-sage-dark"
              disabled={disabled}
              aria-describedby="text-help"
            />
            <p id="text-help" className="text-xs text-dark-green/60 mt-2">
              Be specific about your interests for better matches. Include skills, coursework, or research areas.
            </p>
          </div>
        ) : (
          <div>
            <label 
              htmlFor="resume-upload"
              className="block text-sm font-semibold text-dark-green mb-3"
            >
              📄 Upload Your Resume
            </label>
            <div className="relative">
              <input
                id="resume-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                className="w-full px-4 py-3 bg-white border-2 border-dashed border-sage/50 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                file:bg-primary-red file:text-white hover:file:bg-primary-red-light file:shadow-sm
                cursor-pointer hover:border-sage-dark text-dark-green"
                disabled={disabled}
                aria-describedby="file-help"
              />
              {!file && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-primary-red/60 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-dark-green/60">Click to upload or drag file here</p>
                  </div>
                </div>
              )}
            </div>
            {file && (
              <div className="mt-3 p-3 bg-primary-red/10 rounded-lg border border-primary-red/30">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary-red mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-dark-green">{file.name}</span>
                  <span className="text-xs text-dark-green/60 ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
            <p id="file-help" className="text-xs text-dark-green/60 mt-2">
              Supported formats: PDF, DOCX, DOC, TXT. Max size: 10MB
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || !university || (inputType === 'text' ? !text.trim() : !file)}
          className="w-full bg-gradient-to-r from-primary-red to-primary-red-light text-white font-bold py-4 px-6 rounded-lg 
          hover:from-primary-red-light hover:to-primary-red hover:shadow-glow
          disabled:from-sage/40 disabled:to-sage/30 disabled:text-dark-green/50 disabled:cursor-not-allowed 
          transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none
          focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:ring-offset-2 shadow-elegant"
          aria-describedby="submit-help"
        >
          {disabled ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Your Input...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find My Perfect Research Labs
            </div>
          )}
        </button>
        <p id="submit-help" className="text-xs text-center text-dark-green/60">
          AI will analyze your input to find the best matching research opportunities
        </p>
      </form>
    </div>
  );
} 