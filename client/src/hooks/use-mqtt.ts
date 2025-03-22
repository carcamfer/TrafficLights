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

// Función auxiliar para emitir logs
const emitLog = (message: string) => {
  window.dispatchEvent(new CustomEvent('mqtt-log', { detail: message }));
};

export function useMQTT() {
  const [devices, setDevices] = useState<Map<string, MQTTDevice>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDevices = useCallback((device: MQTTDevice) => {
    emitLog(`Actualizando dispositivo: ${device.deviceId} con datos: ${JSON.stringify(device.data)}`);
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
      emitLog(`Conectando a WebSocket: ${wsUrl}`);

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        emitLog('WebSocket conectado exitosamente');
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        emitLog('WebSocket desconectado, intentando reconectar...');
        setIsConnected(false);
        setError('Conexión perdida, reconectando...');
        setTimeout(connect, 2000);
      };

      ws.onerror = (error) => {
        emitLog(`Error en WebSocket: ${error}`);
        setError('Error de conexión');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          emitLog(`Mensaje WebSocket recibido: ${event.data}`);
          const message = JSON.parse(event.data) as MQTTMessage;
          emitLog(`Mensaje procesado: ${JSON.stringify(message)}`);

          if (message.type === 'deviceStates') {
            const deviceArray = Array.isArray(message.data) ? message.data : [message.data];
            emitLog(`Actualizando lista de dispositivos: ${JSON.stringify(deviceArray)}`);
            const newDevices = new Map();
            deviceArray.forEach(device => {
              newDevices.set(device.deviceId, device);
            });
            setDevices(newDevices);
          } else if (message.type === 'deviceUpdate') {
            const device = message.data as MQTTDevice;
            emitLog(`Actualizando dispositivo individual: ${JSON.stringify(device)}`);
            updateDevices(device);
          }

          setError(null);
        } catch (error) {
          emitLog(`Error procesando mensaje: ${error}`);
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