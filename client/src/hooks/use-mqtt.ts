import { useEffect, useCallback, useState } from 'react';

type MQTTMessage = {
  topic: string;
  message: string;
};

export function useMQTT() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MQTTMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsClient = new WebSocket(`${protocol}//${window.location.host}`);

    wsClient.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setError(null);
    };

    wsClient.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
      setError('Conexión WebSocket cerrada');
    };

    wsClient.onerror = (event) => {
      console.error('Error WebSocket:', event);
      setError('Error en la conexión WebSocket');
      setIsConnected(false);
    };

    wsClient.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MQTTMessage;
        setLastMessage(data);
        setError(null);
      } catch (error) {
        console.error('Error al procesar mensaje:', error);
        setError('Error al procesar mensaje del servidor');
      }
    };

    setWs(wsClient);

    return () => {
      wsClient.close();
    };
  }, []);

  const sendCommand = useCallback((deviceId: number, command: any) => {
    if (!isConnected) {
      console.error('No hay conexión WebSocket');
      return;
    }

    fetch(`/api/traffic/${deviceId}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    }).catch(error => {
      console.error('Error al enviar comando:', error);
      setError('Error al enviar comando al servidor');
    });
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    error,
    sendCommand,
  };
}