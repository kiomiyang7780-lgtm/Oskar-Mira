import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <SparklesIcon className="w-10 h-10 text-cyan-400" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          Creador de Prompts IA
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
        Construye prompts profesionales y altamente detallados para imágenes y videos impresionantes generados por IA.
      </p>
    </header>
  );
};

export default Header;