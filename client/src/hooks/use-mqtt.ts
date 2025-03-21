import { useEffect, useState } from 'react';

type MQTTDevice = {
  deviceId: string;
  timestamp: string;
  data: {
    cars_detected?: number;
    time_red?: number;
    time_yellow?: number;
    time_green?: number;
  };
  status: 'active' | 'inactive' | 'error';
};

type MQTTMessage = {
  type: 'deviceUpdate' | 'deviceStates';
  data: MQTTDevice | MQTTDevice[];
};

export function useMQTT() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<Map<string, MQTTDevice>>(new Map());
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

      // Intentar reconectar después de 5 segundos
      setTimeout(() => {
        console.log('Intentando reconectar WebSocket...');
        setWs(new WebSocket(`${protocol}//${window.location.host}`));
      }, 5000);
    };

    wsClient.onerror = (event) => {
      console.error('Error WebSocket:', event);
      setError('Error en la conexión WebSocket');
      setIsConnected(false);
    };

    wsClient.onmessage = (event) => {
      try {
        console.log('Mensaje WebSocket recibido:', event.data);
        const message = JSON.parse(event.data) as MQTTMessage;

        if (message.type === 'deviceStates') {
          const deviceArray = Array.isArray(message.data) ? message.data : [message.data];
          const newDevices = new Map();
          deviceArray.forEach(device => {
            newDevices.set(device.deviceId, device);
          });
          setDevices(newDevices);
        } else if (message.type === 'deviceUpdate') {
          const device = message.data as MQTTDevice;
          setDevices(prev => {
            const updated = new Map(prev);
            updated.set(device.deviceId, device);
            return updated;
          });
        }
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

  return {
    isConnected,
    devices,
    error,
  };
}