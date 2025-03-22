import { useEffect, useCallback, useState } from 'react';

type MQTTMessage = {
  topic: string;
  message: string;
};

export function useMQTT() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MQTTMessage | null>(null);

  useEffect(() => {
    const wsClient = new WebSocket(`ws://${window.location.host}`);

    wsClient.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
    };

    wsClient.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    };

    wsClient.onmessage = (event) => {
      const data = JSON.parse(event.data) as MQTTMessage;
      setLastMessage(data);
    };

    setWs(wsClient);

    return () => {
      wsClient.close();
    };
  }, []);

  const sendCommand = useCallback((deviceId: number, command: any) => {
    fetch(`/api/traffic/${deviceId}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });
  }, []);

  return {
    isConnected,
    lastMessage,
    sendCommand,
  };
}
