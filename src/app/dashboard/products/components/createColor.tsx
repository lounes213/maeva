'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

// Predefined color options
const colorOptions = [
  { name: 'Blanc', value: '#FFFFFF', border: true },
  { name: 'Noir', value: '#000000' },
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#0000FF' },
  { name: 'Vert', value: '#008000' },
  { name: 'Jaune', value: '#FFFF00' },
  { name: 'Rose', value: '#FFC0CB' },
  { name: 'Violet', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Gris', value: '#808080' },
  { name: 'Marron', value: '#A52A2A' },
  { name: 'Beige', value: '#F5F5DC', border: true },
];

const ColorSelector = ({ selectedColors, onChange }: ColorSelectorProps) => {
  const [customColor, setCustomColor] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Toggle a color selection
  const toggleColor = (colorName: string) => {
    const newColors = selectedColors.includes(colorName)
      ? selectedColors.filter(c => c !== colorName)
      : [...selectedColors, colorName];
    onChange(newColors);
  };

  // Add a custom color
  const handleAddCustomColor = () => {
    if (customColorName.trim() && customColor) {
      // Add the custom color to the selection
      const newColors = [...selectedColors, customColorName.trim()];
      onChange(newColors);
      
      // Reset custom color inputs
      setCustomColor('');
      setCustomColorName('');
      setShowAddCustom(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            type="button"
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              selectedColors.includes(color.name)
                ? 'ring-2 ring-indigo-500 ring-offset-2'
                : ''
            }`}
            onClick={() => toggleColor(color.name)}
          >
            <span
              className={`inline-block w-4 h-4 rounded-full mr-2 ${
                color.border ? 'border border-gray-300' : ''
              }`}
              style={{ backgroundColor: color.value }}
            />
            {color.name}
          </button>
        ))}
      </div>

      {selectedColors.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Couleurs sélectionnées:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100"
              >
                {color}
                <button
                  type="button"
                  onClick={() => toggleColor(color)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {!showAddCustom ? (
        <button
          type="button"
          onClick={() => setShowAddCustom(true)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          + Ajouter une couleur personnalisée
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div>
              <label htmlFor="customColorName" className="block text-xs font-medium text-gray-700">
                Nom de la couleur
              </label>
              <input
                type="text"
                id="customColorName"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="ex: Bleu ciel"
              />
            </div>
            <div>
              <label htmlFor="customColor" className="block text-xs font-medium text-gray-700">
                Code couleur
              </label>
              <input
                type="color"
                id="customColor"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="mt-1 block w-10 h-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddCustomColor}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={!customColorName.trim() || !customColor}
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddCustom(false);
                setCustomColor('');
                setCustomColorName('');
              }}
              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;