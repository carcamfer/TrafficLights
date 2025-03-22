import { useEffect, useCallback, useState } from 'react';

type MQTTMessage = {
  topic: string;
  message: string;
};

export function useMQTT() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MQTTMessage | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    console.log('[WebSocket] Intentando conectar...');
    const wsClient = new WebSocket(`${protocol}//${window.location.host}`);

    wsClient.onopen = () => {
      console.log('[WebSocket] Conexión establecida');
      setIsConnected(true);
      setReconnectAttempt(0);
    };

    wsClient.onclose = () => {
      console.log('[WebSocket] Conexión cerrada');
      setIsConnected(false);
      // Intentar reconectar después de un retraso exponencial
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
      console.log(`[WebSocket] Intentando reconectar en ${delay}ms`);
      setTimeout(() => {
        setReconnectAttempt(prev => prev + 1);
        connect();
      }, delay);
    };

    wsClient.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      setIsConnected(false);
    };

    wsClient.onmessage = (event) => {
      try {
        console.log('[WebSocket] Mensaje recibido:', event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setLastMessage(data);
        }
      } catch (error) {
        console.error('[WebSocket] Error al procesar mensaje:', error);
      }
    };

    setWs(wsClient);

    return () => {
      console.log('[WebSocket] Limpiando conexión');
      wsClient.close();
    };
  }, [reconnectAttempt]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const sendCommand = useCallback((deviceId: number, command: any) => {
    console.log(`[MQTT] Enviando comando al dispositivo ${deviceId}:`, command);
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