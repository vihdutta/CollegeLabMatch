import React, { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import ProgressBar from './components/ProgressBar';
import ResultList from './components/ResultList';
import SEOHead from './components/SEOHead';
import { matchText, matchFile, getProgress, Lab, ProgressResponse } from './api';

export default function App() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [progress, setProgress] = useState<ProgressResponse>({ status: 'idle', progress: 0 });
  const [isMatching, setIsMatching] = useState(false);
  const [userQuery, setUserQuery] = useState<string>('');

  // poll progress during matching
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMatching) {
      interval = setInterval(async () => {
        try {
          const progressData = await getProgress();
          setProgress(progressData);
          
          if (progressData.status === 'complete' || progressData.status === 'error') {
            setIsMatching(false);
          }
        } catch (error) {
          console.error('failed to get progress:', error);
        }
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMatching]);

  const handleMatch = async (data: { text?: string; file?: File; university: string }) => {
    setIsMatching(true);
    setLabs([]);
    setProgress({ status: 'processing', progress: 0 });
    
    // capture user query for SEO
    if (data.text) {
      setUserQuery(data.text.slice(0, 100)); // first 100 chars for SEO
    } else if (data.file) {
      setUserQuery(`${data.file.name} research interests`);
    }

    try {
      let result;
      if (data.text) {
        result = await matchText(data.text, data.university);
      } else if (data.file) {
        result = await matchFile(data.file, data.university);
      } else {
        throw new Error('no input provided');
      }

      setLabs(result.labs);
      setProcessingTime(result.processing_time);
      setProgress({ status: 'complete', progress: 100 });
    } catch (error) {
      console.error('matching failed:', error);
      setProgress({ status: 'error', progress: 0 });
      alert(`matching failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setIsMatching(false);
    }
  };

  // dynamic SEO based on state
  const getDynamicSEO = () => {
    if (labs.length > 0) {
      const labNames = labs.slice(0, 3).map(lab => lab.name).join(', ');
      return {
        title: `Research Lab Matches - ${labNames} | College Research Match`,
        description: `Found ${labs.length} research lab matches for your interests. Explore opportunities in ${labNames} and more.`,
        keywords: ['research results', 'lab matches', userQuery, ...labs.slice(0, 5).map(lab => lab.name)]
      };
    }
    
    if (isMatching) {
      return {
        title: 'Finding Your Perfect Research Labs... | College Research Match',
        description: 'AI is analyzing your research interests to find the best matching labs at your university.',
        keywords: ['matching in progress', 'AI search', userQuery]
      };
    }
    
    return {}; // default from SEOHead component
  };

  return (
    <>
      <SEOHead {...getDynamicSEO()} />
      
      <div className="min-h-screen bg-cream text-dark-green">
        {/* Skip Link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-red text-cream px-4 py-2 rounded-md font-medium z-50"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header className="bg-gradient-to-br from-dark-green via-dark-green-light to-dark-green border-b border-sage/30 shadow-elegant">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-6 tracking-tight">
                College Research Match
              </h1>
              <p className="text-lg md:text-xl text-sage-light max-w-3xl mx-auto leading-relaxed">
                Find research labs at your university that match your interests and skills using 
                <span className="text-primary-red font-semibold"> AI-powered semantic search</span>.
              </p>
              <div className="mt-6 h-1 w-24 bg-primary-red mx-auto rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="container mx-auto px-4 py-12 max-w-6xl">
                                {/* Hero Section */}            <section aria-labelledby="upload-heading" className="mb-16">              <div className="text-center mb-12">                <h2 id="upload-heading" className="text-2xl md:text-3xl font-serif font-bold text-primary-red mb-6">                  Discover Your Research Opportunities                </h2>                <p className="text-lg text-dark-green/80 max-w-2xl mx-auto mb-8">                  Upload your resume or enter your research interests to find labs that align with your academic goals.                </p>              </div>
            
            <div className="max-w-3xl mx-auto">
              <UploadForm onMatch={handleMatch} disabled={isMatching} />
            </div>
          </section>

          {/* Progress Section */}
          {(isMatching || progress.status !== 'idle') && (
            <section aria-labelledby="progress-heading" className="mb-16">
              <h2 id="progress-heading" className="sr-only">Matching Progress</h2>
              <ProgressBar progress={progress.progress} status={progress.status} />
            </section>
          )}

          {/* Results Section */}
          {labs.length > 0 && (
            <section aria-labelledby="results-heading" className="mb-16">
                            <div className="text-center mb-12">                <h2 id="results-heading" className="text-2xl md:text-3xl font-serif font-bold text-primary-red mb-4">                  Your Research Lab Matches                </h2>                <p className="text-lg text-dark-green/80">                  Found <span className="text-primary-red font-semibold">{labs.length}</span> research opportunities                   {processingTime > 0 && (                    <span className="text-sm text-dark-green/60 ml-2">                      (processed in {processingTime.toFixed(2)}s)                    </span>                  )}                </p>              </div>
              
              <ResultList labs={labs} processingTime={processingTime} />
            </section>
          )}

                    {/* Info Section */}          <section aria-labelledby="info-heading" className="text-center py-16 border-t border-sage/30 bg-sage-light/30 rounded-xl mx-4">            <h2 id="info-heading" className="text-2xl font-serif font-bold text-primary-red mb-8">              How It Works            </h2>            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">              <div className="space-y-4">                <div className="w-16 h-16 bg-primary-red/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary-red/30">                  <span className="text-primary-red font-bold text-xl">1</span>                </div>                <h3 className="font-semibold text-dark-green text-lg">Upload or Type</h3>                <p className="text-sm text-dark-green/70 leading-relaxed">                  Share your resume or research interests to get started                </p>              </div>              <div className="space-y-4">                <div className="w-16 h-16 bg-primary-red/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary-red/30">                  <span className="text-primary-red font-bold text-xl">2</span>                </div>                <h3 className="font-semibold text-dark-green text-lg">AI Analysis</h3>                <p className="text-sm text-dark-green/70 leading-relaxed">                  Advanced semantic search finds the most relevant matches                </p>              </div>              <div className="space-y-4">                <div className="w-16 h-16 bg-primary-red/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary-red/30">                  <span className="text-primary-red font-bold text-xl">3</span>                </div>                <h3 className="font-semibold text-dark-green text-lg">Connect</h3>                <p className="text-sm text-dark-green/70 leading-relaxed">                  Reach out to labs that align with your research goals                </p>              </div>            </div>          </section>
        </main>

                {/* Footer */}        <footer className="bg-dark-green border-t border-sage/30 py-12">          <div className="container mx-auto px-4 text-center">            <p className="text-sage-light text-sm">              Powered by semantic search and machine learning •               <a                 href="https://github.com/your-repo"                 className="text-primary-red hover:text-primary-red-light ml-1 focus:outline-none focus:ring-2 focus:ring-primary-red rounded transition-colors duration-200"                target="_blank"                rel="noopener noreferrer"              >                Open Source              </a>            </p>          </div>        </footer>
      </div>
    </>
  );
} 