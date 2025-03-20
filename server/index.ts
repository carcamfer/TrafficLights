import 'dotenv/config';
import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';
import * as mqtt from 'mqtt';
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Estado de los dispositivos
let deviceStates = new Map();
let lastMQTTMessage = null;

// Configuración básica del servidor
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Configuración del servidor WebSocket
const wss = new WebSocketServer({ noServer: true });

// Middleware for logging API requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

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
    lastMessage: lastMQTTMessage,
    connectedClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// Endpoint específico para datos de semáforos
app.get("/api/traffic/:deviceId", (req, res) => {
  const deviceId = req.params.deviceId;
  const device = deviceStates.get(deviceId);
  if (!device) {
    return res.status(404).json({ error: "Dispositivo no encontrado" });
  }
  res.json(device);
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

  try {
    // Conectar al broker MQTT
    log('Intentando conectar al broker MQTT...');
    const mqttClient = mqtt.connect('mqtt://0.0.0.0:1883', {
      reconnectPeriod: 1000,
      connectTimeout: 30000,
      keepalive: 60,
      clean: true,
      clientId: 'traffic_server_' + Math.random().toString(16).substr(2, 8)
    });

    mqttClient.on('connect', () => {
      log('===== Conexión MQTT establecida =====');
      console.log('Broker conectado en:', 'mqtt://0.0.0.0:1883');

      // Suscribirse a todos los tópicos de smartSemaphore
      const topic = 'smartSemaphore/#';
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error(`Error al suscribirse al tópico ${topic}:`, err);
        } else {
          log(`Suscrito al tópico: ${topic}`);
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      try {
        log('\n===== Nuevo Mensaje MQTT =====');
        log('Tópico:', topic);
        log('Mensaje:', message.toString());

        // Extraer deviceId del tópico
        const parts = topic.split('/');
        const deviceId = parts[2] || 'unknown';
        const messageType = parts[parts.length - 1];
        const value = parseInt(message.toString());

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
      }
    });

    mqttClient.on('error', (error) => {
      console.error('Error en conexión MQTT:', error);
      log('Intentando reconectar en 1 segundo...');
    });

    mqttClient.on('close', () => {
      log('Conexión MQTT cerrada, intentando reconectar...');
    });

    mqttClient.on('reconnect', () => {
      log('Intentando reconexión MQTT...');
    });

  } catch (error) {
    console.error('Error al configurar MQTT:', error);
  }

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