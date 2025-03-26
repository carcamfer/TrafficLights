import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { useToast } from "@/hooks/use-toast";

interface TrafficLightControlProps {
  id: number;
  state: 'red' | 'yellow' | 'green';
  iotStatus: 'connected' | 'disconnected' | 'error';
  inputGreen: number;
  feedbackGreen: number;
  inputRed: number;
  feedbackRed: number;
  onTimeChange: (id: number, type: 'inputGreen' | 'inputRed', value: number) => void;
}

const TrafficLightControl: React.FC<TrafficLightControlProps> = ({
  id,
  state,
  iotStatus,
  inputGreen,
  feedbackGreen,
  inputRed,
  feedbackRed,
  onTimeChange
}) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Conectar al broker MQTT
    const mqttClient = mqtt.connect('mqtt://localhost:1883', {
      clientId: `traffic_control_web_${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      keepalive: 60,
      reconnectPeriod: 2000
    });

    mqttClient.on('connect', () => {
      console.log('Conectado al broker MQTT');
      toast({
        title: "Conexión MQTT establecida",
        description: "Conectado al broker MQTT correctamente"
      });
    });

    mqttClient.on('error', (err) => {
      console.error('Error MQTT:', err);
      toast({
        title: "Error de conexión MQTT",
        description: "No se pudo conectar al broker MQTT",
        variant: "destructive"
      });
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [toast]);

  const handleTimeChange = (type: 'inputGreen' | 'inputRed', value: number) => {
    if (!client) {
      toast({
        title: "Error",
        description: "No hay conexión con el broker MQTT",
        variant: "destructive"
      });
      return;
    }

    const deviceId = id.toString().padStart(8, '0');
    const topic = `smartSemaphore/lora_Device/${deviceId}/control`;
    const command = `${type === 'inputGreen' ? 'green' : 'red'}=${value}`;

    console.log(`Enviando comando al tópico ${topic}:`, command);

    client.publish(topic, command, { qos: 1 }, (error) => {
      if (error) {
        console.error('Error al publicar:', error);
        toast({
          title: "Error",
          description: "No se pudo enviar el comando al semáforo",
          variant: "destructive"
        });
      } else {
        console.log('Comando enviado exitosamente');
        toast({
          title: "Comando enviado",
          description: `Tiempo ${type === 'inputGreen' ? 'verde' : 'rojo'} actualizado a ${value} segundos`
        });
      }
    });

    onTimeChange(id, type, value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Semáforo #{id}</h3>
      </div>
      <div className="space-y-3">
        {/* Estado IoT */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado IoT:</span>
          <span className={`capitalize px-2 py-1 rounded-md text-white text-sm ${
            iotStatus === 'connected' ? 'bg-green-500' :
            iotStatus === 'disconnected' ? 'bg-gray-500' : 'bg-red-500'
          }`}>
            {iotStatus}
          </span>
        </div>

        {/* Input Verde */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Input Verde (s)</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-3 py-1.5 w-24 text-right"
            value={inputGreen}
            onChange={(e) => handleTimeChange('inputGreen', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Feedback Verde */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Verde (s)</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {feedbackGreen}
          </span>
        </div>

        {/* Input Rojo */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Input Rojo (s)</label>
          <input
            type="number"
            min="1"
            className="border rounded-md px-3 py-1.5 w-24 text-right"
            value={inputRed}
            onChange={(e) => handleTimeChange('inputRed', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Feedback Rojo */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Feedback Rojo (s)</span>
          <span className="border rounded-md px-3 py-1.5 w-24 text-right bg-gray-50">
            {feedbackRed}
          </span>
        </div>

        {/* Estado Actual */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado actual:</span>
          <span className={`capitalize px-2 py-1 rounded-md ${
            state === 'green' ? 'bg-green-100 text-green-800' :
            state === 'red' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {state}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightControl;