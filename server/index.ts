import 'dotenv/config';
import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';
import { setupVite, serveStatic, log } from "./vite";
import * as mqtt from 'mqtt';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Configuración del servidor WebSocket
const wss = new WebSocketServer({ noServer: true });

// Estado de los dispositivos
let deviceStates = new Map();

// Basic API endpoint for testing
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
});

// Endpoint para obtener el estado actual de los dispositivos
app.get("/api/devices", (_req, res) => {
  res.json(Array.from(deviceStates.values()));
});

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
    // Conectar al broker MQTT local
    log('Intentando conectar al broker MQTT...');
    const mqttClient = mqtt.connect('mqtt://localhost:1883');

    mqttClient.on('connect', () => {
      log('Conexión MQTT establecida');

      // Suscribirse a todos los tópicos de dispositivos IoT
      mqttClient.subscribe('iot/#', (err) => {
        if (err) {
          console.error('Error al suscribirse a tópicos MQTT:', err);
        } else {
          log('Suscrito a tópicos IoT');
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        const deviceId = topic.split('/')[1]; // Asumiendo tópicos como 'iot/device1'

        const deviceData = {
          deviceId,
          timestamp: new Date().toISOString(),
          data,
          status: 'active'
        };

        deviceStates.set(deviceId, deviceData);

        // Notificar a todos los clientes WebSocket
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'deviceUpdate',
              data: deviceData
            }));
          }
        });
      } catch (error) {
        console.error('Error procesando mensaje MQTT:', error);
      }
    });

    mqttClient.on('error', (error) => {
      console.error('Error en conexión MQTT:', error);
    });

  } catch (error) {
    console.error('Error al configurar MQTT:', error);
    log('Error en la integración MQTT, pero el servidor continuará funcionando');
  }

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Error interno del servidor";
    res.status(status).json({ message });
    console.error(err);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve on port 5000
  const port = 5000;
  const serverInstance = server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Servidor ejecutándose en el puerto ${port}`);
  });

  // Configurar el servidor WebSocket
  serverInstance.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
  });
})();