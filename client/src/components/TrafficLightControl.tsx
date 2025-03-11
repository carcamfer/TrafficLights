import React from 'react';

interface TrafficLightControlProps {
  id: number;
  state: 'red' | 'yellow' | 'green';
  greenTime: number;
  redTime: number;
  onTimeChange: (id: number, type: 'greenTime' | 'redTime', value: number) => void;
}

const TrafficLightControl: React.FC<TrafficLightControlProps> = ({
  id,
  state,
  greenTime,
  redTime,
  onTimeChange
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 className="font-semibold mb-3">Semáforo #{id}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Tiempo en Verde (s)</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-3 py-1.5 w-24 text-right"
            value={greenTime}
            onChange={(e) => onTimeChange(id, 'greenTime', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Tiempo en Rojo (s)</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-3 py-1.5 w-24 text-right"
            value={redTime}
            onChange={(e) => onTimeChange(id, 'redTime', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado actual:</span>
          <span className="capitalize">{state}</span>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightControl;
