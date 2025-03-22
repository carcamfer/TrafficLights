import { useEffect, useCallback, useState } from 'react';

type MQTTMessage = {
  topic: string;
  message: string;
};

export function useMQTT() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsClient = new WebSocket(`${protocol}//${window.location.host}/ws`);

    wsClient.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      setReconnectAttempt(0);
    };

    wsClient.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
      setTimeout(() => {
        setReconnectAttempt(prev => prev + 1);
        connect();
      }, delay);
    };

    wsClient.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    wsClient.onmessage = (event) => {
      try {
        const { data, type } = JSON.parse(event.data);
        if (type === 'log') {
          setLastMessage(data);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    setWs(wsClient);

    return () => {
      wsClient.close();
    };
  }, [reconnectAttempt]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return {
    isConnected,
    lastMessage
  };
}