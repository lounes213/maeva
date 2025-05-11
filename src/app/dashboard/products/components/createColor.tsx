'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface CouleursPickerProps {
  onChange: (colors: string[]) => void;
}

const CouleursPicker: React.FC<CouleursPickerProps> = ({ onChange }) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('#000000');

  const handleColorAdd = () => {
    if (!selectedColors.includes(currentColor)) {
      const newColors = [...selectedColors, currentColor];
      setSelectedColors(newColors);
      onChange(newColors);
    }
  };

  const handleColorRemove = (colorToRemove: string) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    onChange(newColors);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-32 h-32">
          <HexColorPicker color={currentColor} onChange={setCurrentColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-full border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
            <input
              type="text"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleColorAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {selectedColors.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Colors:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <button
                  type="button"
                  onClick={() => handleColorRemove(color)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CouleursPicker;
