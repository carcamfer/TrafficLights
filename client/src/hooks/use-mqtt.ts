import { useState, useEffect } from 'react';

interface MQTTMessage {
  type: 'mqtt_message';
  data: {
    topic: string;
    message: string;
  };
}

export function useMQTT() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setError('Conexión perdida, reconectando...');
        setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        setError('Error de conexión');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as MQTTMessage;
          if (message.type === 'mqtt_message') {
            window.dispatchEvent(new CustomEvent('mqtt-message', { 
              detail: message.data
            }));
          }
        } catch (error) {
          setError('Error procesando datos');
        }
      };
    }

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return {
    isConnected,
    error
  };
}