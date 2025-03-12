import React from 'react';

interface TrafficLightControlProps {
  id: number;
  state: 'red' | 'yellow' | 'green';
  iotStatus: 'connected' | 'disconnected' | 'error';
  inputGreen: boolean;
  feedbackGreen: number;
  inputRed: boolean;
  feedbackRed: number;
  onTimeChange: (id: number, type: 'feedbackGreen' | 'feedbackRed', value: number) => void;
}

const TrafficLightControl: React.FC<TrafficLightControlProps> = ({
  id,
  state,
  iotStatus,
  inputGreen,
  feedbackGreen,
  inputRed,
  feedbackRed,
  onTimeChange
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 className="font-semibold mb-3">Semáforo #{id}</h3>
      <div className="space-y-3">
        {/* Estado IoT */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado IoT:</span>
          <span className={`capitalize px-2 py-1 rounded-md text-white text-sm ${
            iotStatus === 'connected' ? 'bg-green-500' :
            iotStatus === 'disconnected' ? 'bg-gray-500' : 'bg-red-500'
          }`}>
            {iotStatus}
          </span>
        </div>

        {/* Input Verde */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Input Verde:</span>
          <span className={`px-2 py-1 rounded-md ${
            inputGreen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {inputGreen ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Feedback Verde */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Feedback Verde (s)</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-3 py-1.5 w-24 text-right"
            value={feedbackGreen}
            onChange={(e) => onTimeChange(id, 'feedbackGreen', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Input Rojo */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Input Rojo:</span>
          <span className={`px-2 py-1 rounded-md ${
            inputRed ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {inputRed ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Feedback Rojo */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Feedback Rojo (s)</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-3 py-1.5 w-24 text-right"
            value={feedbackRed}
            onChange={(e) => onTimeChange(id, 'feedbackRed', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Estado Actual */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado actual:</span>
          <span className={`capitalize px-2 py-1 rounded-md ${
            state === 'green' ? 'bg-green-100 text-green-800' :
            state === 'red' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {state}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightControl;