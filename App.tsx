import React, { useState, useEffect } from 'react';
import { GeneratorType, PromptState, SavedPrompt } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import PromptBuilder from './components/PromptBuilder';
import SavedPrompts from './components/SavedPrompts';

const PROMPTS_STORAGE_KEY = 'ai_prompt_builder_saved_prompts';

export const initialState: PromptState = {
  subject: '',
  action: '',
  style: '',
  composition: '',
  lighting: '',
  details: '',
  weather: '',
  camera: '',
  depthOfField: '',
  motion: '',
};


const App: React.FC = () => {
  const [generatorType, setGeneratorType] = useState<GeneratorType>(GeneratorType.IMAGE);
  const [promptParts, setPromptParts] = useState<PromptState>(initialState);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  // Load saved prompts from localStorage on initial render
  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem(PROMPTS_STORAGE_KEY);
      if (storedPrompts) {
        setSavedPrompts(JSON.parse(storedPrompts));
      }
    } catch (error) {
      console.error("Failed to load prompts from local storage:", error);
      setSavedPrompts([]);
    }
  }, []);

  // Persist saved prompts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(savedPrompts));
    } catch (error) {
      console.error("Failed to save prompts to local storage:", error);
    }
  }, [savedPrompts]);
  
  const handlePromptChange = (field: keyof PromptState, value: string) => {
    setPromptParts(prev => ({...prev, [field]: value}));
  };

  const handleSetPrompt = (newPrompt: PromptState) => {
    setPromptParts(newPrompt);
  };

  const handleTabChange = (tab: GeneratorType) => {
    if (generatorType !== tab) {
      setPromptParts(initialState);
    }
    setGeneratorType(tab);
  };
  
  const handleSavePrompt = () => {
    const newSavedPrompt: SavedPrompt = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      prompt: promptParts,
      type: generatorType,
    };
    setSavedPrompts(prev => [...prev, newSavedPrompt]);
  };

  const handleDeletePrompt = (id: string) => {
    setSavedPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handleLoadPrompt = (promptToLoad: SavedPrompt) => {
    setGeneratorType(promptToLoad.type);
    setPromptParts(promptToLoad.prompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-6">
          <Tabs activeTab={generatorType} setActiveTab={handleTabChange} />
          <div className="mt-6">
            <PromptBuilder
              type={generatorType}
              promptParts={promptParts}
              onPromptChange={handlePromptChange}
              onSetPrompt={handleSetPrompt}
              onSave={handleSavePrompt}
            />
          </div>
          <div className="mt-8">
            <SavedPrompts
              prompts={savedPrompts}
              onLoad={handleLoadPrompt}
              onDelete={handleDeletePrompt}
            />
          </div>
        </main>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Impulsado por Google Gemini. Creado para creadores.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;