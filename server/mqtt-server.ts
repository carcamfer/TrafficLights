import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import mqtt from 'mqtt';
import { log } from './vite';

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server, path: '/mqtt-ws' });

// Configuración MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'traffic_control_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Nueva conexión WebSocket');

  // Suscribirse a tópicos MQTT al conectar
  mqttClient.subscribe('smartSemaphore/lora_Device/00000001/info/#');

  // Manejar mensajes desde el cliente web
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'set_time') {
        const topic = `smartSemaphore/lora_Device/00000001/set/time/light/${data.color}`;
        mqttClient.publish(topic, data.value.toString());
        console.log(`Publicado en ${topic}: ${data.value}`);
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  });

  // Enviar estado de conexión inicial
  ws.send(JSON.stringify({
    type: 'status',
    connected: mqttClient.connected
  }));
});

// Manejar mensajes MQTT
mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  console.log(`MQTT mensaje recibido: ${topic} ${payload}`);

  // Enviar a todos los clientes WebSocket conectados
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'mqtt',
        topic,
        payload
      }));
    }
  });
});

mqttClient.on('connect', () => {
  console.log('Conectado a MQTT broker');
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'status',
        connected: true
      }));
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('Error MQTT:', error);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'status',
        connected: false
      }));
    }
  });
});

// Iniciar servidor
const PORT = 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor MQTT-WebSocket ejecutándose en puerto ${PORT}`);
});

export default server;
