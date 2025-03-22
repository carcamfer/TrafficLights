import 'dotenv/config';
import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';
import * as mqtt from 'mqtt';
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Configuración básica del servidor
app.use(express.json());
app.use(cors());

// API Endpoints
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando" });
});

// Configuración del servidor
const port = process.env.PORT || 5000;
const server = app.listen(Number(port), '0.0.0.0', () => {
  log(`Servidor ejecutándose en http://0.0.0.0:${port}`);
});

// WebSocket Server
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

log('WebSocket Server iniciado en /ws');

// Broadcast a todos los clientes
const broadcast = (message: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  log('Nueva conexión WebSocket establecida');

  ws.on('error', (error) => {
    console.error('Error WebSocket:', error);
  });
});

// Estado de los dispositivos
const deviceStates = new Map();

// Servidor MQTT
log('===== Iniciando conexión MQTT =====');
const mqttClient = mqtt.connect('mqtt://0.0.0.0:1883', {
  clientId: 'traffic_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 4000,
  protocolVersion: 4
});

mqttClient.on('connect', () => {
  log('===== Conexión MQTT establecida =====');
  mqttClient.subscribe('smartSemaphore/#', (err) => {
    if (err) {
      console.error('Error al suscribirse:', err);
    } else {
      log('Suscrito exitosamente a smartSemaphore/#');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    log(`Mensaje MQTT recibido - Tópico: ${topic}, Mensaje: ${message.toString()}`);

    // Enviar mensaje MQTT crudo a los clientes WebSocket
    broadcast({
      type: 'mqtt_message',
      data: {
        topic,
        message: message.toString()
      }
    });

    // Procesar el mensaje para actualizar el estado de los dispositivos
    const parts = topic.split('/');
    if (parts.length >= 4) {
      const deviceId = parts[2];
      const messageType = parts[4];
      const value = parseInt(message.toString());

      // Inicializar o actualizar estado del dispositivo
      let device = deviceStates.get(deviceId) || {
        deviceId,
        timestamp: new Date().toISOString(),
        data: {},
        status: 'active'
      };

      // Actualizar datos según el tipo de mensaje
      if (messageType === 'time') {
        const lightType = parts[6]; // red, yellow, green
        device.data[`time_${lightType}`] = value;
      } else if (messageType === 'cars' && parts[5] === 'detect') {
        device.data.cars_detected = value;
      }

      device.timestamp = new Date().toISOString();
      deviceStates.set(deviceId, device);

      // Enviar actualización del dispositivo
      broadcast({
        type: 'deviceUpdate',
        data: device
      });
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('Error en conexión MQTT:', error);
});

if (app.get("env") === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error en la aplicación:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json({ message });
  next(err);
});