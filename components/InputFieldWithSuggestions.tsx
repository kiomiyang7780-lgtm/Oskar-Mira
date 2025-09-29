
import React from 'react';

interface InputFieldWithSuggestionsProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

const InputFieldWithSuggestions: React.FC<InputFieldWithSuggestionsProps> = ({
  label,
  placeholder,
  value,
  onChange,
  suggestions = [],
}) => {
  const handleSuggestionClick = (suggestion: string) => {
    const newValue = value ? `${value}, ${suggestion}` : suggestion;
    onChange(newValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full hover:bg-cyan-500 hover:text-white transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InputFieldWithSuggestions;
