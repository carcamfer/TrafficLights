import React, { useState, useEffect } from 'react';

interface TrafficLightState {
  iotStatus: 'connected' | 'disconnected';
  feedbackGreen: number;
  feedbackRed: number;
  currentState: 'red' | 'green' | 'yellow';
}

export default function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [inputGreen, setInputGreen] = useState('40');
  const [inputRed, setInputRed] = useState('40');
  const [state, setState] = useState<TrafficLightState>({
    iotStatus: 'disconnected',
    feedbackGreen: 40,
    feedbackRed: 40,
    currentState: 'red'
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsClient = new WebSocket(`${protocol}//${window.location.host}`);

    wsClient.onopen = () => {
      setState(prev => ({ ...prev, iotStatus: 'connected' }));
    };

    wsClient.onclose = () => {
      setState(prev => ({ ...prev, iotStatus: 'disconnected' }));
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    wsClient.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const topic = data.topic;
      const payload = data.payload;

      if (topic.includes('/info/time/light/green')) {
        setState(prev => ({ ...prev, feedbackGreen: parseInt(payload) }));
      } else if (topic.includes('/info/time/light/red')) {
        setState(prev => ({ ...prev, feedbackRed: parseInt(payload) }));
      } else if (topic.includes('/info/time/light')) {
        setState(prev => ({ ...prev, currentState: payload }));
      }
    };

    setWs(wsClient);
    return () => wsClient.close();
  }, []);

  const sendValue = (color: 'green' | 'red', value: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'lightTime',
        color,
        value: parseInt(value)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Control de Semáforo</h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Estado IoT:</span>
            <span className={`px-3 py-1 rounded ${
              state.iotStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {state.iotStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={inputGreen}
              onChange={(e) => setInputGreen(e.target.value)}
              className="border rounded px-3 py-2 w-24"
              min="1"
            />
            <button
              onClick={() => sendValue('green', inputGreen)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Enviar Verde
            </button>
            <span>Feedback: {state.feedbackGreen}s</span>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={inputRed}
              onChange={(e) => setInputRed(e.target.value)}
              className="border rounded px-3 py-2 w-24"
              min="1"
            />
            <button
              onClick={() => sendValue('red', inputRed)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Enviar Rojo
            </button>
            <span>Feedback: {state.feedbackRed}s</span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold">Estado Actual:</h2>
            <div className={`mt-2 px-4 py-2 rounded text-white ${
              state.currentState === 'red' ? 'bg-red-500' :
              state.currentState === 'green' ? 'bg-green-500' :
              'bg-yellow-500'
            }`}>
              {state.currentState.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}