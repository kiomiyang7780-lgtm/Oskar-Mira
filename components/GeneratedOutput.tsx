import React from 'react';
import { ApiStatus, GeneratorType } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface GeneratedOutputProps {
  type: GeneratorType;
  status: ApiStatus;
  error: string | null;
  result: string | null;
  progressMessage: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

const GeneratedOutput: React.FC<GeneratedOutputProps> = ({ type, status, error, result, progressMessage }) => {
  const renderContent = () => {
    switch (status) {
      case ApiStatus.IDLE:
        return (
          <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full">
            <SparklesIcon className="w-12 h-12 mb-4 text-slate-600"/>
            <p>Tu creación aparecerá aquí una vez generada.</p>
          </div>
        );
      case ApiStatus.LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LoadingSpinner />
            <p className="mt-4 text-slate-400 animate-pulse">{progressMessage}</p>
          </div>
        );
      case ApiStatus.ERROR:
        return (
          <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-500/50 h-full flex flex-col justify-center">
            <p className="font-bold">Falló la Generación</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        );
      case ApiStatus.SUCCESS:
        if (!result) return null;
        if (type === GeneratorType.IMAGE) {
          return <img src={result} alt="Generated" className="w-full h-full object-contain rounded-lg" />;
        }
        if (type === GeneratorType.VIDEO) {
          return <video src={result} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg w-full aspect-video flex items-center justify-center p-2 flex-grow border border-slate-700">
      {renderContent()}
    </div>
  );
};

export default GeneratedOutput;