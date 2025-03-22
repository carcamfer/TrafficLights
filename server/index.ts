import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Configuración MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883');
const wsServer = new WebSocket.Server({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];

mqttClient.on('connect', () => {
  log('Conectado al broker MQTT');
  mqttClient.subscribe('#'); // Suscribirse a todos los tópicos
});

mqttClient.on('message', (topic, message) => {
  const logEntry = `${new Date().toLocaleTimeString()} - ${topic}: ${message.toString()}`;
  systemLogs.unshift(logEntry);
  // Mantener solo los últimos 100 logs
  if (systemLogs.length > 100) {
    systemLogs.pop();
  }

  // Enviar logs a todos los clientes WebSocket conectados
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'log',
        data: logEntry
      }));
    }
  });
});

// API endpoint para obtener logs
app.get("/api/logs", (_req, res) => {
  res.json(systemLogs);
});

// Basic API endpoint for testing
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
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

(async () => {
  const server = app;

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

  // Configurar WebSocket Server
  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });
})();