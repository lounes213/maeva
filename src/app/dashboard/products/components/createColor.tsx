'use client';

import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

export default function CouleursPicker({ onChange }: { onChange: (colors: string[]) => void }) {
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);



  const addColor = () => {
    if (!selectedColors.includes(currentColor)) {
      const newColors = [...selectedColors, currentColor];
      setSelectedColors(newColors);
      onChange(newColors); // Send back to parent/form
    }
  };

  const removeColor = (colorToRemove: string) => {
    const filtered = selectedColors.filter(c => c !== colorToRemove);
    setSelectedColors(filtered);
    onChange(filtered);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Choisir des couleurs</label>
      
      <HexColorPicker color={currentColor} onChange={setCurrentColor} />

      <div className="flex items-center space-x-4">
        <div
          className="w-8 h-8 rounded border"
          style={{ backgroundColor: currentColor }}
          title={currentColor}
        />
        <button
          type="button"
          onClick={addColor}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          Ajouter cette couleur
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedColors.map((color) => (
          <div
            key={color}
            className="relative w-8 h-8 rounded-full border cursor-pointer"
            style={{ backgroundColor: color }}
            title={color}
            onClick={() => removeColor(color)}
          >
            <span className="absolute -top-1 -right-1 text-xs text-red-500 font-bold">×</span>
          </div>
        ))}
      </div>
    </div>
  );
}
