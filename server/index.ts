import 'dotenv/config';
import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';
import * as mqtt from 'mqtt';
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Estado de los dispositivos
let deviceStates = new Map();

// Configuración básica del servidor
app.use(express.json());
app.use(cors());

// API Endpoints
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando" });
});

app.get("/api/devices", (_req, res) => {
  res.json(Array.from(deviceStates.values()));
});

// Configuración del servidor
const port = process.env.PORT || 5000;
const server = app.listen(Number(port), '0.0.0.0', () => {
  log(`Servidor ejecutándose en puerto ${port}`);
});

// WebSocket Server
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Broadcast to all clients
const broadcast = (message: any) => {
  const messageStr = JSON.stringify(message);
  log('Broadcasting message:', messageStr);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
};

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  log('Nueva conexión WebSocket establecida');

  // Enviar estado actual al cliente
  const currentDevices = Array.from(deviceStates.values());
  log('Estado actual de dispositivos:', JSON.stringify(currentDevices));

  ws.send(JSON.stringify({
    type: 'deviceStates',
    data: currentDevices
  }));

  ws.on('error', (error) => {
    console.error('Error WebSocket:', error);
  });
});

// Servidor MQTT
log('===== Iniciando conexión MQTT =====');
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'traffic_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 4000,
  protocolVersion: 4,
  keepalive: 60
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

    const parts = topic.split('/');
    if (parts.length < 6) {
      log('Formato de tópico inválido:', topic);
      return;
    }

    const deviceId = parts[2];
    const messageType = parts[4];
    const subType = parts[5];
    const value = parseInt(message.toString());

    log('Procesando mensaje:', { deviceId, messageType, subType, value });

    // Inicializar o actualizar estado del dispositivo
    let device = deviceStates.get(deviceId);
    if (!device) {
      device = {
        deviceId,
        timestamp: new Date().toISOString(),
        data: {},
        status: 'connected'
      };
      deviceStates.set(deviceId, device);
    }

    // Actualizar datos según el tipo de mensaje
    if (messageType === 'cars' && subType === 'detect') {
      device.data.cars_detected = value;
      device.timestamp = new Date().toISOString();

      log('Dispositivo actualizado:', device);

      // Enviar actualización a todos los clientes
      broadcast({
        type: 'deviceUpdate',
        data: device
      });
    }

  } catch (error) {
    console.error('Error procesando mensaje:', error);
    log('Error al procesar mensaje MQTT:', error instanceof Error ? error.message : String(error));
  }
});

mqttClient.on('error', (error) => {
  console.error('Error en conexión MQTT:', error);
  log('Error MQTT:', error instanceof Error ? error.message : String(error));
});

mqttClient.on('close', () => {
  log('Conexión MQTT cerrada, intentando reconectar...');
});

mqttClient.on('reconnect', () => {
  log('Intentando reconexión MQTT...');
});

if (app.get("env") === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json({ message });
  console.error(err);
  next(err);
});