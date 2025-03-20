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
    // Conectar al broker MQTT local
    log('Intentando conectar al broker MQTT...');
    const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      keepalive: 60
    });

    mqttClient.on('connect', () => {
      log('Conexión MQTT establecida');

      // Suscribirse a todos los tópicos de dispositivos IoT
      mqttClient.subscribe('smartSemaphore/lora_Device/#', (err) => {
        if (err) {
          console.error('Error al suscribirse a tópicos MQTT:', err);
        } else {
          log('Suscrito a tópicos IoT');
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      try {
        console.log('\n=== Nuevo Mensaje MQTT ===');
        console.log('Tópico:', topic);
        console.log('Mensaje raw:', message.toString());

        // Para mensajes que no son JSON, intentamos convertirlos
        let data;
        try {
          data = JSON.parse(message.toString());
        } catch {
          data = { value: message.toString() };
        }

        const deviceId = topic.split('/')[2]; // Obtener el ID del dispositivo del tópico

        log(`Mensaje MQTT recibido en tópico ${topic}:`);
        console.log(JSON.stringify(data, null, 2));

        const deviceData = {
          deviceId,
          timestamp: new Date().toISOString(),
          data,
          status: 'active'
        };

        lastMQTTMessage = {
          topic,
          message: data,
          receivedAt: new Date().toISOString()
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
        console.error('Mensaje recibido:', message.toString());
      }
    });

    mqttClient.on('error', (error) => {
      console.error('Error en conexión MQTT:', error);
    });

    mqttClient.on('close', () => {
      log('Conexión MQTT cerrada, intentando reconectar...');
    });

    mqttClient.on('reconnect', () => {
      log('Intentando reconexión MQTT...');
    });

  } catch (error) {
    console.error('Error al configurar MQTT:', error);
    log('Error en la integración MQTT, pero el servidor continuará funcionando');
  }

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Error interno del servidor";
    res.json({ message });
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