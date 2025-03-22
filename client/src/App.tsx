import React, { useState, useEffect, useRef } from 'react';
import { useMQTT } from './hooks/use-mqtt';
import ErrorBoundary from './components/ErrorBoundary';

function MQTTPanel() {
  const { isConnected, error } = useMQTT();
  const [messages, setMessages] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleMQTTMessage = (event: CustomEvent) => {
      const { topic, message } = event.detail;
      setMessages(prev => [...prev.slice(-100), `${topic} ${message}`]);
    };

    window.addEventListener('mqtt-message', handleMQTTMessage as EventListener);
    return () => {
      window.removeEventListener('mqtt-message', handleMQTTMessage as EventListener);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Estado del Sistema</h2>
        <span className={`px-2 py-1 rounded text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <div className="font-mono text-xs bg-gray-50 p-2 rounded-lg h-60 overflow-auto">
          {messages.map((msg, i) => (
            <div key={i} className="whitespace-pre">{msg}</div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ErrorBoundary>
        <MQTTPanel />
      </ErrorBoundary>
    </div>
  );
}

export default App;