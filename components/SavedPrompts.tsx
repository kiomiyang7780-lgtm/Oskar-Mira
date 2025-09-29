import React from 'react';
import { SavedPrompt, GeneratorType } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { LoadIcon } from './icons/LoadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';

interface SavedPromptsProps {
  prompts: SavedPrompt[];
  onLoad: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
}

const SavedPrompts: React.FC<SavedPromptsProps> = ({ prompts, onLoad, onDelete }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Prompts Guardados</h2>
      {prompts.length === 0 ? (
        <div className="text-center text-slate-500 py-10">
          <p>Todavía no has guardado ningún prompt.</p>
          <p className="text-sm mt-1">Usa el botón de guardar para conservar tus creaciones favoritas.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {prompts.slice().reverse().map((savedPrompt) => ( // Show newest first
            <div key={savedPrompt.id} className="bg-slate-900 p-4 rounded-lg flex items-center justify-between gap-4 border border-slate-700 hover:border-cyan-500 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {savedPrompt.type === GeneratorType.IMAGE ? (
                  <div className="p-2 bg-sky-900/50 rounded-lg">
                    <CameraIcon className="w-6 h-6 text-sky-400 flex-shrink-0" />
                  </div>
                ) : (
                  <div className="p-2 bg-fuchsia-900/50 rounded-lg">
                    <VideoCameraIcon className="w-6 h-6 text-fuchsia-400 flex-shrink-0" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-semibold truncate">
                    {savedPrompt.prompt.subject || 'Prompt sin título'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Guardado: {new Date(savedPrompt.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onLoad(savedPrompt)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-cyan-600 transition-colors"
                  aria-label="Cargar prompt"
                  title="Cargar prompt"
                >
                  <LoadIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(savedPrompt.id)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-red-600 transition-colors"
                  aria-label="Eliminar prompt"
                  title="Eliminar prompt"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPrompts;
