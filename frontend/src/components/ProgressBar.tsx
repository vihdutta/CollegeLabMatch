import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  if (status === 'idle') return null;

  const getStatusDetails = () => {
    switch (status) {
      case 'processing':
        if (progress < 30) return { text: 'Analyzing your input...', icon: '🔍' };
        if (progress < 60) return { text: 'Computing semantic embeddings...', icon: '🧠' };
        if (progress < 90) return { text: 'Matching with research labs...', icon: '⚡' };
        return { text: 'Finalizing results...', icon: '✨' };
      case 'complete':
        return { text: 'Matching complete!', icon: '✅' };
      case 'error':
        return { text: 'Something went wrong', icon: '❌' };
      default:
        return { text: '', icon: '' };
    }
  };

  const { text, icon } = getStatusDetails();

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Status Header */}
            <div         className="flex justify-between items-center mb-4"        role="status"        aria-live="polite"        aria-atomic="true"      >        <div className="flex items-center space-x-3">          <span className="text-2xl" role="img" aria-hidden="true">            {icon}          </span>          <span className="text-lg font-medium text-dark-green">            {text}          </span>        </div>        <span           className="text-lg font-bold text-primary-red bg-primary-red/10 px-3 py-1 rounded-full border border-primary-red/20"          aria-label={`Progress: ${progress} percent`}        >          {progress}%        </span>      </div>
      
            {/* Progress Bar */}      <div className="relative">        <div           className="w-full bg-sage/30 rounded-full h-3 overflow-hidden shadow-inner"          role="progressbar"          aria-valuenow={progress}          aria-valuemin={0}          aria-valuemax={100}          aria-label="Search progress"        >          <div            className={`h-full rounded-full transition-all duration-500 ease-out relative ${              status === 'error'                 ? 'bg-gradient-to-r from-primary-red to-primary-red-light'                 : status === 'complete'                ? 'bg-gradient-to-r from-dark-green to-dark-green-light'                : 'bg-gradient-to-r from-primary-red to-primary-red-light'            }`}            style={{ width: `${progress}%` }}          >            {/* Animated shimmer effect */}            {status === 'processing' && (              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow" />            )}          </div>        </div>                {/* Pulse indicator */}        {status === 'processing' && (          <div             className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary-red rounded-full shadow-glow animate-pulse"            style={{ left: `calc(${progress}% - 8px)` }}          />        )}      </div>

            {/* Additional Status Messages */}      {status === 'error' && (        <div className="mt-4 p-4 bg-primary-red/10 border border-primary-red/30 rounded-lg">          <p className="text-sm text-dark-green/90">            Please try again or contact support if the problem persists.          </p>        </div>      )}            {status === 'complete' && (        <div className="mt-4 text-center">          <p className="text-sm text-dark-green/80">            🎉 Found research opportunities that match your interests!          </p>        </div>      )}
    </div>
  );
} 