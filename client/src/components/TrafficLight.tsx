import React from 'react';

interface TrafficLightProps {
  redColor?: string;
  yellowColor?: string;
  greenColor?: string;
  onColorChange?: (type: 'red' | 'yellow' | 'green', color: string) => void;
}

const TrafficLight: React.FC<TrafficLightProps> = ({
  redColor = '#ff0000',
  yellowColor = '#ffff00',
  greenColor = '#00ff00',
  onColorChange
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg w-24">
      <div className="space-y-4">
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 rounded-full mb-2"
            style={{ backgroundColor: redColor }}
            onClick={() => onColorChange?.('red', redColor)}
          />
          <input
            type="color"
            value={redColor}
            onChange={(e) => onColorChange?.('red', e.target.value)}
            className="w-16"
          />
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 rounded-full mb-2"
            style={{ backgroundColor: yellowColor }}
            onClick={() => onColorChange?.('yellow', yellowColor)}
          />
          <input
            type="color"
            value={yellowColor}
            onChange={(e) => onColorChange?.('yellow', e.target.value)}
            className="w-16"
          />
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 rounded-full mb-2"
            style={{ backgroundColor: greenColor }}
            onClick={() => onColorChange?.('green', greenColor)}
          />
          <input
            type="color"
            value={greenColor}
            onChange={(e) => onColorChange?.('green', e.target.value)}
            className="w-16"
          />
        </div>
      </div>
    </div>
  );
};

export default TrafficLight;
