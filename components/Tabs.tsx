import React from 'react';
import { GeneratorType } from '../types';

interface TabsProps {
  activeTab: GeneratorType;
  setActiveTab: (tab: GeneratorType) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabStyles = "px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500";
  const activeStyles = "bg-cyan-500 text-white shadow-lg";
  const inactiveStyles = "bg-slate-800 text-slate-300 hover:bg-slate-700";

  return (
    <div className="flex justify-center p-2 bg-slate-800/50 rounded-xl max-w-md mx-auto">
      <button
        onClick={() => setActiveTab(GeneratorType.IMAGE)}
        className={`${tabStyles} ${activeTab === GeneratorType.IMAGE ? activeStyles : inactiveStyles}`}
      >
        Generador de Imágenes
      </button>
      <button
        onClick={() => setActiveTab(GeneratorType.VIDEO)}
        className={`${tabStyles} ${activeTab === GeneratorType.VIDEO ? activeStyles : inactiveStyles}`}
      >
        Generador de Videos
      </button>
    </div>
  );
};

export default Tabs;