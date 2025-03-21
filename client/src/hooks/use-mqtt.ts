import { useEffect, useState, useCallback } from 'react';

interface MQTTDevice {
  deviceId: string;
  timestamp: string;
  data: {
    cars_detected?: number;
    time_red?: number;
    time_yellow?: number;
    time_green?: number;
  };
  status: 'active' | 'inactive' | 'error';
}

interface MQTTMessage {
  type: 'deviceUpdate' | 'deviceStates';
  data: MQTTDevice | MQTTDevice[];
}

export function useMQTT() {
  const [devices, setDevices] = useState<Map<string, MQTTDevice>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDevices = useCallback((device: MQTTDevice) => {
    console.log('Actualizando dispositivo:', device);
    setDevices(prev => {
      const updated = new Map(prev);
      updated.set(device.deviceId, {
        ...device,
        timestamp: new Date().toISOString()
      });
      return updated;
    });
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('Conectando a WebSocket:', wsUrl);

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket conectado exitosamente');
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado, intentando reconectar...');
        setIsConnected(false);
        setError('Conexión perdida, reconectando...');
        setTimeout(connect, 2000);
      };

      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        setError('Error de conexión');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          console.log('Mensaje WebSocket recibido:', event.data);
          const message = JSON.parse(event.data) as MQTTMessage;
          console.log('Mensaje procesado:', message);

          if (message.type === 'deviceStates') {
            const deviceArray = Array.isArray(message.data) ? message.data : [message.data];
            console.log('Actualizando lista de dispositivos:', deviceArray);
            const newDevices = new Map();
            deviceArray.forEach(device => {
              newDevices.set(device.deviceId, device);
            });
            setDevices(newDevices);
          } else if (message.type === 'deviceUpdate') {
            const device = message.data as MQTTDevice;
            console.log('Actualizando dispositivo individual:', device);
            updateDevices(device);
          }

          setError(null);
        } catch (error) {
          console.error('Error procesando mensaje:', error);
          setError('Error procesando datos');
        }
      };
    }

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [updateDevices]);

  return {
    devices,
    isConnected,
    error
  };
}