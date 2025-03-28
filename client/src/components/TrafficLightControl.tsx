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
  const [inputGreenState, setInputGreen] = useState(inputGreen.toString());
  const [inputRedState, setInputRed] = useState(inputRed.toString());

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
              onChange={(e) => {
                setInputGreen(e.target.value);
                onTimeChange(id, 'inputGreen', parseInt(e.target.value) || 0);
              }}
            />
            <button 
              className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600"
              onClick={async () => {
                try {
                  const value = parseInt(inputGreenState);
                  if (isNaN(value)) {
                    alert('Por favor ingrese un número válido');
                    return;
                  }
                  const response = await fetch('http://localhost:5000/send', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ greenColorTime: value })
                  });
                  if (!response.ok) throw new Error('Failed to send');
                  const data = await response.json();
                  console.log('Success:', data);
                  alert('Tiempo verde actualizado');
                } catch (error) {
                  console.error('Error sending green time:', error);
                  alert('Error al actualizar tiempo verde');
                }
              }}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Feedback Verde */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Verde (s)</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {feedbackGreen}
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
              onChange={(e) => {
                setInputRed(e.target.value);
                onTimeChange(id, 'inputRed', parseInt(e.target.value) || 0);
              }}
            />
            <button 
              className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600"
              onClick={async () => {
                try {
                  const value = parseInt(inputRedState);
                  if (isNaN(value)) {
                    alert('Por favor ingrese un número válido');
                    return;
                  }
                  const response = await fetch('http://localhost:5000/send', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ redColorTime: value })
                  });
                  if (!response.ok) throw new Error('Failed to send');
                  const data = await response.json();
                  console.log('Success:', data);
                  alert('Tiempo rojo actualizado');
                } catch (error) {
                  console.error('Error sending red time:', error);
                  alert('Error al actualizar tiempo rojo');
                }
              }}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Feedback Rojo */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Rojo (s)</span>
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