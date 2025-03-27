import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TrafficLightControlProps {
  id: number;
  state: 'red' | 'yellow' | 'green';
  iotStatus: 'connected' | 'disconnected' | 'error';
  inputGreen: number;
  feedbackGreen: number;
  inputRed: number;
  feedbackRed: number;
  onTimeChange: (id: number, type: 'inputGreen' | 'inputRed', value: number) => void;
  onSendTime?: (id: number, color: 'green' | 'red', value: number) => void;
}

const TrafficLightControl: React.FC<TrafficLightControlProps> = ({
  id,
  state,
  iotStatus,
  inputGreen,
  feedbackGreen,
  inputRed,
  feedbackRed,
  onTimeChange,
  onSendTime
}) => {
  const [sending, setSending] = useState<'green' | 'red' | null>(null);

  const handleSendTime = (color: 'green' | 'red') => {
    setSending(color);
    const value = color === 'green' ? inputGreen : inputRed;
    
    if (onSendTime) {
      onSendTime(id, color, value);
      setTimeout(() => setSending(null), 1000);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Semáforo #{id}</h3>
      </div>
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
        <div className="grid grid-cols-5 gap-2 items-center">
          <label className="text-sm font-medium col-span-2">Input Verde (s):</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-2 py-1 w-full text-right col-span-2"
            value={inputGreen}
            onChange={(e) => onTimeChange(id, 'inputGreen', parseInt(e.target.value) || 0)}
          />
          <Button 
            size="sm" 
            variant="outline"
            className="px-2 h-8 bg-green-50 hover:bg-green-100 border-green-200"
            onClick={() => handleSendTime('green')}
            disabled={sending !== null}
          >
            {sending === 'green' ? '✓' : 'Enviar'}
          </Button>
        </div>

        {/* Feedback Verde */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Verde (s):</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {feedbackGreen}
          </span>
        </div>

        {/* Input Rojo */}
        <div className="grid grid-cols-5 gap-2 items-center">
          <label className="text-sm font-medium col-span-2">Input Rojo (s):</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-2 py-1 w-full text-right col-span-2"
            value={inputRed}
            onChange={(e) => onTimeChange(id, 'inputRed', parseInt(e.target.value) || 0)}
          />
          <Button 
            size="sm" 
            variant="outline"
            className="px-2 h-8 bg-red-50 hover:bg-red-100 border-red-200"
            onClick={() => handleSendTime('red')}
            disabled={sending !== null}
          >
            {sending === 'red' ? '✓' : 'Enviar'}
          </Button>
        </div>

        {/* Feedback Rojo */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Rojo (s):</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {feedbackRed}
          </span>
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