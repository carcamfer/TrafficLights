import { useEffect, useState } from 'react';

export function useMQTT() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      setLastMessage(event.data);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    isConnected,
    lastMessage
  };
}