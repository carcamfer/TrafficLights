import { useEffect, useCallback, useState } from 'react';

type MQTTDevice = {
  deviceId: string;
  timestamp: string;
  data: Record<string, any>;
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
          // Si recibimos un array de dispositivos, actualizamos todo el mapa
          const deviceArray = Array.isArray(message.data) ? message.data : [message.data];
          const newDevices = new Map();
          deviceArray.forEach(device => {
            newDevices.set(device.deviceId, device);
          });
          setDevices(newDevices);
        } else if (message.type === 'deviceUpdate') {
          // Si recibimos una actualización de un dispositivo, actualizamos solo ese dispositivo
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

  const sendCommand = useCallback((deviceId: string, command: any) => {
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
    devices,
    error,
    sendCommand,
  };
}