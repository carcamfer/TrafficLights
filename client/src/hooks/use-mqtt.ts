import { useEffect, useCallback, useState } from 'react';

type MQTTMessage = {
  topic: string;
  message: string;
};

type PublishOptions = {
  deviceId: number;
  color: 'red' | 'green' | 'yellow';
  value: number;
}

export function useMQTT() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MQTTMessage | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsClient = new WebSocket(`${protocol}//${window.location.host}/ws`);

    wsClient.onopen = () => {
      console.log('[WebSocket] Conexión establecida');
      setIsConnected(true);
      setReconnectAttempt(0);
    };

    wsClient.onclose = () => {
      console.log('[WebSocket] Conexión cerrada');
      setIsConnected(false);
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
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
        // Intentar parsear como JSON primero
        try {
          const data = JSON.parse(event.data);
          if (data.logs) {
            setLogs(data.logs);
          } else if (data.type === 'log') {
            setLastMessage(data);
            // Agregar el log al estado 
            setLogs(prevLogs => {
              const newLogs = [...prevLogs];
              if (newLogs.length >= 10) newLogs.pop(); // Mantener solo 10 logs
              newLogs.unshift(data.message); // Agregar el nuevo al principio
              return newLogs;
            });
          }
        } catch (jsonError) {
          // Si no es JSON, tratar como mensaje simple de texto
          const message = event.data.toString();
          setLastMessage({
            topic: 'unknown',
            message: message
          });
          // Agregar el log al estado
          setLogs(prevLogs => {
            const newLogs = [...prevLogs];
            if (newLogs.length >= 10) newLogs.pop();
            newLogs.unshift(message);
            return newLogs;
          });
        }
      } catch (error) {
        console.error('[WebSocket] Error al procesar mensaje:', error);
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

  // Función para publicar mensajes MQTT
  const publish = useCallback((options: PublishOptions) => {
    const { deviceId, color, value } = options;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('[MQTT] No hay conexión WebSocket disponible para publicar');
      return false;
    }

    try {
      // Formato para el topic: smartSemaphore/lora_Device/<device_id>/set/time/light/<color>
      const deviceIdPadded = deviceId.toString().padStart(8, '0');
      const topic = `smartSemaphore/lora_Device/${deviceIdPadded}/set/time/light/${color}`;
      
      // Crear mensaje para enviar al servidor
      const message = JSON.stringify({
        type: 'publish',
        topic,
        message: value.toString()
      });

      ws.send(message);
      console.log(`[MQTT] Publicado: ${topic} = ${value}`);
      return true;
    } catch (error) {
      console.error('[MQTT] Error al publicar:', error);
      return false;
    }
  }, [ws]);

  return {
    isConnected,
    lastMessage,
    logs,
    publish
  };
}