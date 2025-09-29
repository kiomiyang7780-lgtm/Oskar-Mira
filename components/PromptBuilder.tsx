import React, { useState, useEffect, useCallback } from 'react';
import { GeneratorType, PromptState, ApiStatus } from '../types';
import { generateImage, generateVideo, enhancePrompt } from '../services/geminiService';
import InputFieldWithSuggestions from './InputFieldWithSuggestions';
import GeneratedOutput from './GeneratedOutput';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { StarsIcon } from './icons/StarsIcon';

interface PromptBuilderProps {
  type: GeneratorType;
  promptParts: PromptState;
  onPromptChange: (field: keyof PromptState, value: string) => void;
  onSetPrompt: (prompt: PromptState) => void;
  onSave: () => void;
}

const imageSuggestions = {
  style: ['Fotorrealista', 'Anime', 'Cyberpunk', 'Van Gogh', 'Render 3D', 'Acuarela', 'Surrealista', 'Minimalista', 'Art Nouveau', 'Cómic', 'Pintura al óleo', 'Cinematográfico', 'Hiperrealista', 'Pixel art'],
  composition: ['Primer plano', 'Gran angular', 'Vista cenital', 'Contrapicado', 'Retrato', 'Plano detalle', 'Plano general', 'Plano medio'],
  lighting: ['Iluminación cinematográfica', 'Hora dorada', 'Brillo de neón', 'Luz de estudio', 'Iluminación dramática', 'Iluminación suave', 'Retroiluminación (backlight)', 'Luz volumétrica', 'Claro oscuro', 'Rim lighting'],
  details: ['4K', 'Muy detallado', 'Intrincado', 'Obra maestra', 'Colores vivos', 'Enfoque nítido'],
  weather: ['Soleado', 'Nublado', 'Lluvioso', 'Tormentoso', 'Nebuloso', 'Amanecer', 'Atardecer'],
  camera: ['Gran angular', 'Teleobjetivo', 'Lente de 50mm', 'Ojo de pez', 'Vista de dron'],
  depthOfField: ['Bokeh suave', 'Profundidad de campo reducida', 'Todo enfocado', 'Enfoque selectivo'],
};

const videoSuggestions = {
  ...imageSuggestions,
  motion: ['Paneo en cámara lenta', 'Travelling rápido', 'Plano estático', 'Toma de dron', 'Time-lapse'],
};

const PromptBuilder: React.FC<PromptBuilderProps> = ({ type, promptParts, onPromptChange, onSetPrompt, onSave }) => {
  const [finalPrompt, setFinalPrompt] = useState('');
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const parts = [
      promptParts.subject,
      promptParts.action,
      promptParts.style,
      promptParts.composition,
      promptParts.lighting,
      promptParts.weather,
      promptParts.camera,
      promptParts.depthOfField,
      promptParts.details,
    ];
    if (type === GeneratorType.VIDEO && promptParts.motion) {
      parts.push(promptParts.motion);
    }
    setFinalPrompt(parts.filter(p => p && p.trim() !== '').join(', '));
  }, [promptParts, type]);

  const handleInputChange = (field: keyof PromptState, value: string) => {
    onPromptChange(field, value);
  };
  
  const handleEnhancePrompt = async () => {
    if (!finalPrompt) {
      setError("No hay prompt para mejorar.");
      return;
    }
    setIsEnhancing(true);
    setError(null);
    try {
      const enhancedPromptObject = await enhancePrompt(finalPrompt, type);
      onSetPrompt(enhancedPromptObject);
      setEnhanced(true);
      setTimeout(() => setEnhanced(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido al mejorar.");
    } finally {
      setIsEnhancing(false);
    }
  };


  const handleGenerate = useCallback(async () => {
    if (!finalPrompt) {
      setError("El prompt no puede estar vacío.");
      return;
    }
    setStatus(ApiStatus.LOADING);
    setError(null);
    setResult(null);
    setProgressMessage('');

    try {
      if (type === GeneratorType.IMAGE) {
        setProgressMessage('Generando tu imagen, esto puede tardar un momento...');
        const imageUrl = await generateImage(finalPrompt);
        setResult(imageUrl);
      } else {
        const videoUrl = await generateVideo(finalPrompt, setProgressMessage);
        setResult(videoUrl);
      }
      setStatus(ApiStatus.SUCCESS);
    } catch (err) {
      setStatus(ApiStatus.ERROR);
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido.");
    }
  }, [finalPrompt, type]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const suggestions = type === GeneratorType.IMAGE ? imageSuggestions : videoSuggestions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Input Fields */}
      <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">1. Crea tu Prompt</h2>
        <div className="space-y-5">
          <InputFieldWithSuggestions label="Sujeto" placeholder="Ej: Un león majestuoso, una ciudad futurista" value={promptParts.subject} onChange={(v) => handleInputChange('subject', v)} />
          <InputFieldWithSuggestions label="Acción / Escena" placeholder="Ej: rugiendo en un acantilado, al atardecer con coches voladores" value={promptParts.action} onChange={(v) => handleInputChange('action', v)} />
          <InputFieldWithSuggestions label="Estilo" placeholder="Ej: Fotorrealista, Anime, Van Gogh" value={promptParts.style} onChange={(v) => handleInputChange('style', v)} suggestions={suggestions.style} />
          <InputFieldWithSuggestions label="Composición / Encuadre" placeholder="Ej: Primer plano, Gran angular" value={promptParts.composition} onChange={(v) => handleInputChange('composition', v)} suggestions={suggestions.composition} />
          <InputFieldWithSuggestions label="Iluminación" placeholder="Ej: Iluminación cinematográfica, Hora dorada" value={promptParts.lighting} onChange={(v) => handleInputChange('lighting', v)} suggestions={suggestions.lighting} />
          <InputFieldWithSuggestions label="Clima / Atmósfera" placeholder="Ej: Soleado, Lluvioso, Atardecer" value={promptParts.weather} onChange={(v) => handleInputChange('weather', v)} suggestions={suggestions.weather} />
          <InputFieldWithSuggestions label="Tipo de Cámara / Lente" placeholder="Ej: Gran angular, Lente de 50mm" value={promptParts.camera} onChange={(v) => handleInputChange('camera', v)} suggestions={suggestions.camera} />
          <InputFieldWithSuggestions label="Profundidad de Campo" placeholder="Ej: Bokeh suave, Todo enfocado" value={promptParts.depthOfField} onChange={(v) => handleInputChange('depthOfField', v)} suggestions={suggestions.depthOfField} />
          {type === GeneratorType.VIDEO && (
            <InputFieldWithSuggestions label="Movimiento" placeholder="Ej: Paneo en cámara lenta, Time-lapse" value={promptParts.motion || ''} onChange={(v) => handleInputChange('motion', v)} suggestions={(suggestions as typeof videoSuggestions).motion} />
          )}
          <InputFieldWithSuggestions label="Calidad / Detalles" placeholder="Ej: 4K, Muy detallado, Obra maestra" value={promptParts.details} onChange={(v) => handleInputChange('details', v)} suggestions={suggestions.details} />
        </div>
      </div>

      {/* Right Column: Output & Actions */}
      <div className="flex flex-col gap-8">
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 flex-grow flex flex-col">
           <h2 className="text-2xl font-bold mb-4 text-cyan-400">2. Prompt Final</h2>
          <div className="relative bg-slate-900 rounded-lg p-4 min-h-[120px] text-slate-300 border border-slate-700 flex-grow">
            <p>{finalPrompt || 'Tu prompt generado aparecerá aquí...'}</p>
            {finalPrompt && (
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <button onClick={handleCopyToClipboard} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors" title="Copiar al portapapeles">
                  <ClipboardIcon className="w-5 h-5" />
                </button>
                <button onClick={handleSaveClick} className="p-2 rounded-lg bg-slate-700 hover:bg-cyan-600 transition-colors" title="Guardar prompt">
                  <BookmarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
           <div className="text-sm mt-2 text-center h-5">
            {copied && <span className="text-green-400">¡Copiado al portapapeles!</span>}
            {saved && <span className="text-cyan-400">¡Prompt guardado!</span>}
            {enhanced && <span className="text-purple-400">¡Prompt mejorado con IA!</span>}
           </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
             <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || status === ApiStatus.LOADING || !finalPrompt}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3"
            >
                <StarsIcon className="w-6 h-6"/>
                {isEnhancing ? 'Mejorando...' : 'Mejorar con IA'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={status === ApiStatus.LOADING || isEnhancing || !finalPrompt}
              className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3"
            >
              <MagicWandIcon className="w-6 h-6"/>
              {status === ApiStatus.LOADING ? 'Generando...' : `Generar ${type === GeneratorType.IMAGE ? 'Imagen' : 'Video'}`}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 min-h-[300px] flex-grow flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">3. Resultado Generado</h2>
          <GeneratedOutput
            type={type}
            status={status}
            error={error}
            result={result}
            progressMessage={progressMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default PromptBuilder;