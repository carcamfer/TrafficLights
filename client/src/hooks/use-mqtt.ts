import { useState, useEffect } from 'react';

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
  type: 'deviceUpdate' | 'deviceStates' | 'mqtt_message';
  data: MQTTDevice | MQTTDevice[] | { topic: string; message: string };
}

export function useMQTT() {
  const [devices, setDevices] = useState<Map<string, MQTTDevice>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('Conectando a WebSocket:', wsUrl);

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado, reconectando...');
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
          const message = JSON.parse(event.data) as MQTTMessage;
          console.log('Mensaje recibido:', message);

          if (message.type === 'mqtt_message') {
            const mqttData = message.data as { topic: string; message: string };
            window.dispatchEvent(new CustomEvent('mqtt-message', { 
              detail: mqttData
            }));
          } else if (message.type === 'deviceUpdate') {
            const device = message.data as MQTTDevice;
            setDevices(prev => {
              const updated = new Map(prev);
              updated.set(device.deviceId, device);
              return updated;
            });
          } else if (message.type === 'deviceStates') {
            const deviceArray = Array.isArray(message.data) ? message.data : [message.data];
            const newDevices = new Map();
            deviceArray.forEach(device => {
              if ('deviceId' in device) {
                newDevices.set(device.deviceId, device);
              }
            });
            setDevices(newDevices);
          }
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
  }, []);

  return {
    devices,
    isConnected,
    error
  };
}