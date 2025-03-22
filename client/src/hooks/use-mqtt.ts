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
  type: 'deviceUpdate' | 'deviceStates' | 'mqtt_message';
  data: MQTTDevice | MQTTDevice[] | { topic: string; message: string };
}

// Función auxiliar para emitir logs
const emitLog = (message: string) => {
  window.dispatchEvent(new CustomEvent('mqtt-log', { detail: message }));
};

// Función auxiliar para emitir mensajes MQTT
const emitMQTTMessage = (message: { topic: string; message: string }) => {
  window.dispatchEvent(new CustomEvent('mqtt-message', { detail: message }));
};

export function useMQTT() {
  const [devices, setDevices] = useState<Map<string, MQTTDevice>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setError('Conexión perdida, reconectando...');
        setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        setError('Error de conexión');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as MQTTMessage;

          if (message.type === 'mqtt_message') {
            // Emitir mensaje MQTT crudo
            emitMQTTMessage(message.data);
          } else if (message.type === 'deviceUpdate') {
            // Actualizar estado del dispositivo
            const device = message.data as MQTTDevice;
            setDevices(prev => {
              const updated = new Map(prev);
              updated.set(device.deviceId, {
                ...device,
                timestamp: new Date().toISOString()
              });
              return updated;
            });
          } else if (message.type === 'deviceStates') {
            const deviceArray = Array.isArray(message.data) ? message.data : [message.data];
            const newDevices = new Map();
            deviceArray.forEach(device => {
              newDevices.set(device.deviceId, device);
            });
            setDevices(newDevices);
          }

          setError(null);
        } catch (error) {
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