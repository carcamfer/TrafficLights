import React, { useEffect } from 'react';

interface TrafficLightProps {
  state: 'red' | 'yellow' | 'green';
  className?: string;
}

const TrafficLight: React.FC<TrafficLightProps> = ({
  state,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800 p-4 rounded-lg w-24 ${className}`}>
      <div className="space-y-4">
        <div 
          className={`w-16 h-16 rounded-full transition-all duration-300 ease-in-out ${
            state === 'red' 
              ? 'bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]' 
              : 'bg-red-900/30'
          }`}
        />
        <div 
          className={`w-16 h-16 rounded-full transition-all duration-300 ease-in-out ${
            state === 'yellow' 
              ? 'bg-yellow-400 animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.7)]' 
              : 'bg-yellow-900/30'
          }`}
        />
        <div 
          className={`w-16 h-16 rounded-full transition-all duration-300 ease-in-out ${
            state === 'green' 
              ? 'bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.7)]' 
              : 'bg-green-900/30'
          }`}
        />
      </div>
    </div>
  );
};

export default TrafficLight;