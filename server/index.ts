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
app.use(express.urlencoded({ extended: false }));

// Configuración del servidor WebSocket
const wss = new WebSocketServer({ noServer: true });

// API Endpoints
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
});

app.get("/api/devices", (_req, res) => {
  res.json(Array.from(deviceStates.values()));
});

app.get("/api/iot/debug", (_req, res) => {
  res.json({
    devices: Array.from(deviceStates.values()),
    connectedClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  log('Nueva conexión WebSocket establecida');

  // Enviar estado actual al cliente
  ws.send(JSON.stringify({
    type: 'deviceStates',
    data: Array.from(deviceStates.values())
  }));

  ws.on('error', console.error);
});

(async () => {
  const server = app;

  // Conectar al broker MQTT
  log('===== Iniciando conexión MQTT =====');
  const mqttClient = mqtt.connect('mqtt://0.0.0.0:1883', {
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    keepalive: 60,
    clean: true,
    clientId: 'traffic_server_' + Math.random().toString(16).substr(2, 8),
    protocolVersion: 4,  // MQTT v3.1.1
    rejectUnauthorized: false
  });

  mqttClient.on('connect', () => {
    log('===== Conexión MQTT establecida =====');

    // Suscribirse al tópico base
    const topic = 'smartSemaphore/#';
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Error al suscribirse al tópico ${topic}:`, err);
      } else {
        log(`Suscrito exitosamente al tópico: ${topic}`);
      }
    });
  });

  mqttClient.on('message', (topic, message) => {
    try {
      log('\n===== Nuevo Mensaje MQTT =====');
      log('Tópico:', topic);
      log('Mensaje:', message.toString());
      log('Timestamp:', new Date().toISOString());

      // Extraer deviceId y tipo de mensaje del tópico
      const parts = topic.split('/');
      const deviceId = parts[2] || 'unknown';
      const messageType = parts[parts.length - 1];
      const value = parseInt(message.toString());

      log('Detalles del mensaje:');
      log('- Device ID:', deviceId);
      log('- Tipo de mensaje:', messageType);
      log('- Valor:', value);

      // Actualizar o crear el estado del dispositivo
      const device = deviceStates.get(deviceId) || {
        deviceId,
        timestamp: new Date().toISOString(),
        data: {},
        status: 'active'
      };

      // Actualizar los datos según el tipo de mensaje
      if (messageType === 'red' || messageType === 'yellow' || messageType === 'green') {
        device.data[`time_${messageType}`] = value;
        log(`Actualizado tiempo ${messageType}: ${value}`);
      } else if (messageType === 'detect') {
        device.data.cars_detected = value;
        log(`Actualizado cars_detected: ${value}`);
      }

      device.timestamp = new Date().toISOString();
      deviceStates.set(deviceId, device);

      // Notificar a todos los clientes WebSocket
      const wsMessage = JSON.stringify({
        type: 'deviceUpdate',
        data: device
      });

      log('Enviando actualización a clientes WebSocket:', wsMessage);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(wsMessage);
        }
      });

    } catch (error) {
      console.error('Error procesando mensaje MQTT:', error);
      log('Error al procesar mensaje:', error instanceof Error ? error.message : String(error));
    }
  });

  mqttClient.on('error', (error) => {
    console.error('Error en conexión MQTT:', error);
    log('Error MQTT:', error instanceof Error ? error.message : String(error));

    // Intentar reconectar después de un error
    setTimeout(() => {
      log('Intentando reconexión después de error...');
      mqttClient.end(true, () => {
        mqttClient.reconnect();
      });
    }, 5000);
  });

  mqttClient.on('close', () => {
    log('Conexión MQTT cerrada, intentando reconectar...');
  });

  mqttClient.on('reconnect', () => {
    log('Intentando reconexión MQTT...');
  });

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Error interno del servidor";
    res.status(status).json({ message });
    console.error(err);
    next(err);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  const serverInstance = server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Servidor ejecutándose en el puerto ${port}`);
  });

  serverInstance.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
  });
})();