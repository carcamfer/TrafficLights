import { useState, useEffect } from 'react';

type LoRaWANDevice = {
  deviceId: string;
  timestamp: string;
  data: any;
  status: 'active' | 'inactive' | 'error';
};

type WSMessage = {
  type: 'deviceUpdate' | 'deviceStates';
  data: LoRaWANDevice | LoRaWANDevice[];
};

export function useLoRaWAN() {
  const [devices, setDevices] = useState<LoRaWANDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Conexión WebSocket LoRaWAN establecida');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        
        if (message.type === 'deviceUpdate') {
          const deviceData = message.data as LoRaWANDevice;
          setDevices(prevDevices => {
            const index = prevDevices.findIndex(d => d.deviceId === deviceData.deviceId);
            if (index === -1) return [...prevDevices, deviceData];
            const newDevices = [...prevDevices];
            newDevices[index] = deviceData;
            return newDevices;
          });
        } else if (message.type === 'deviceStates') {
          setDevices(message.data as LoRaWANDevice[]);
        }
      } catch (error) {
        console.error('Error al procesar mensaje LoRaWAN:', error);
        setError('Error al procesar datos del dispositivo');
      }
    };

    ws.onerror = (error) => {
      console.error('Error WebSocket:', error);
      setError('Error en la conexión WebSocket');
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Conexión WebSocket LoRaWAN cerrada');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    devices,
    isConnected,
    error
  };
}
