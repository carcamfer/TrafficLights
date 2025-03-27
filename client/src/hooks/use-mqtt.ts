import { useEffect, useCallback, useState } from 'react';

// Define tipos para los mensajes MQTT
type MQTTStatus = {
  type: 'status';
  connected: boolean;
};

type MQTTMessage = {
  type: 'mqtt';
  topic: string;
  payload: string;
};

type WSMessage = MQTTStatus | MQTTMessage;

type TrafficLightStatus = {
  iotConnected: boolean;
  currentState: 'red' | 'green' | 'yellow';
  greenTime: number;
  redTime: number;
};

export function useMQTT(deviceId: string = '00000001') {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [trafficLightStatus, setTrafficLightStatus] = useState<TrafficLightStatus>({
    iotConnected: false,
    currentState: 'red',
    greenTime: 0,
    redTime: 0
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Función para enviar mensajes al servidor
  const sendMessage = useCallback((type: string, data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...data }));
      return true;
    }
    return false;
  }, [ws]);

  // Función para establecer tiempos de semáforo
  const setTrafficLightTime = useCallback((color: 'green' | 'red', value: number) => {
    return sendMessage('set_time', { color, value });
  }, [sendMessage]);

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
      setTrafficLightStatus(prev => ({ ...prev, iotConnected: false }));
      
      // Reconexión exponencial con backoff
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
        // Si es un string simple (formato antiguo), agregarlo a los logs
        if (typeof event.data === 'string' && !event.data.startsWith('{')) {
          setLogs(prev => [event.data, ...prev.slice(0, 19)]);
          return;
        }

        // Intentar parsear como JSON
        const data = JSON.parse(event.data) as WSMessage;
        
        // Manejar mensajes según su tipo
        if (data.type === 'status') {
          setTrafficLightStatus(prev => ({ ...prev, iotConnected: data.connected }));
        } 
        else if (data.type === 'mqtt') {
          // Agregar mensaje a los logs
          setLogs(prev => [`${data.topic} ${data.payload}`, ...prev.slice(0, 19)]);
          
          // Procesar mensajes MQTT específicos
          if (data.topic.includes(`smartSemaphore/lora_Device/${deviceId}/info`)) {
            // Actualizar estado basado en topic y payload
            if (data.topic.includes('/light/green')) {
              setTrafficLightStatus(prev => ({ ...prev, greenTime: parseInt(data.payload) || 0 }));
            } 
            else if (data.topic.includes('/light/red')) {
              setTrafficLightStatus(prev => ({ ...prev, redTime: parseInt(data.payload) || 0 }));
            }
            else if (data.topic.includes('/state')) {
              const state = data.payload.toLowerCase();
              if (state === 'red' || state === 'green' || state === 'yellow') {
                setTrafficLightStatus(prev => ({ ...prev, currentState: state as 'red' | 'green' | 'yellow' }));
              }
            }
          }
        }
      } catch (error) {
        console.error('[WebSocket] Error al procesar mensaje:', error);
      }
    };

    setWs(wsClient);

    return () => {
      wsClient.close();
    };
  }, [reconnectAttempt, deviceId]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return {
    isConnected,
    iotConnected: trafficLightStatus.iotConnected,
    currentState: trafficLightStatus.currentState,
    feedbackGreen: trafficLightStatus.greenTime,
    feedbackRed: trafficLightStatus.redTime,
    logs,
    setTrafficLightTime
  };
}