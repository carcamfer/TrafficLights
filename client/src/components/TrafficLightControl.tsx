import React, { useState } from 'react';

interface TrafficLightControlProps {
  id: number;
  state: 'red' | 'yellow' | 'green';
  iotStatus: 'connected' | 'disconnected' | 'error';
  inputGreen: number;
  feedbackGreen: number;
  inputRed: number;
  feedbackRed: number;
  onTimeChange: (id: number, type: 'inputGreen' | 'inputRed', value: number) => void;
  systemLogs: string[]; 
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
  systemLogs
}) => {
  const [inputGreenState, setInputGreen] = useState(inputGreen);
  const [inputRedState, setInputRed] = useState(inputRed);

  const handleSubmit = async (type: 'inputGreen' | 'inputRed') => {
    const value = type === 'inputGreen' ? inputGreenState : inputRedState;
    try {
      const response = await fetch('http://0.0.0.0:5000/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [type === 'inputGreen' ? 'greenColorTime' : 'redColorTime']: value }),
      });
      if (!response.ok) {
        throw new Error(`Error al enviar datos: ${response.status} ${response.statusText}`);
      }
      console.log(`Tiempo ${type === 'inputGreen' ? 'verde' : 'rojo'} enviado:`, value);

      // Actualizar el estado local para reflejar el cambio
      if (type === 'inputGreen') {
        setInputGreen(value);
      } else {
        setInputRed(value);
      }
    } catch (error) {
      console.error('Error al enviar tiempo:', error);
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Input Verde (s)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="border rounded-md px-3 py-1.5 w-24 text-right"
              value={inputGreenState}
              onChange={(e) => setInputGreen(parseInt(e.target.value) || 0)}
            />
            <button 
              className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 active:bg-green-800 transform active:scale-90 transition-all duration-150"
              onClick={() => handleSubmit('inputGreen')}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Feedback Verde */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Verde (s)</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {systemLogs?.find(log => log.includes(`smartSemaphore/lora_Device/${id.toString().padStart(8, '0')}/info/time/light/green`))?.split(' ').pop() || feedbackGreen}
          </span>
        </div>

        {/* Input Rojo */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Input Rojo (s)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="border rounded-md px-3 py-1.5 w-24 text-right"
              value={inputRedState}
              onChange={(e) => setInputRed(parseInt(e.target.value) || 0)}
            />
            <button 
              className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 active:bg-red-800 transform active:scale-90 transition-all duration-150"
              onClick={() => handleSubmit('inputRed')}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Feedback Rojo */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Rojo (s)</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {systemLogs?.find(log => log.includes(`smartSemaphore/lora_Device/${id.toString().padStart(8, '0')}/info/time/light/red`))?.split(' ').pop() || feedbackRed}
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