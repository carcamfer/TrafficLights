import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());

const mqttClient = mqtt.connect('mqtt://0.0.0.0:1883', {
  clientId: 'traffic_control_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

const wsServer = new WebSocket.Server({ noServer: true, path: '/' });

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('smartSemaphore/lora_Device/00000001/info/#');
});

wsServer.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'lightTime') {
        const topic = `smartSemaphore/lora_Device/00000001/set/time/light/${data.color}`;
        mqttClient.publish(topic, data.value.toString());
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ topic, payload }));
    }
  });
});

const server = app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit('connection', ws, request);
  });
});

if (app.get("env") === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

// Error handling middleware (retained from original)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json({ message });
});