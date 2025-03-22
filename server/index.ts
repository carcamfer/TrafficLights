import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Configuración MQTT con opciones específicas
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'traffic_control_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60,
  resubscribe: true
});

const wsServer = new WebSocket.Server({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];

mqttClient.on('connect', () => {
  // Subscribe to the specific vehicle detection topic
  mqttClient.subscribe('smartSemaphore/lora_Device/00000001/info/cars/detect'); 
});

mqttClient.on('error', (error) => {
  log(`Error MQTT: ${error.message}`);
});

// Función para transmitir logs a todos los clientes
function broadcastLog(logEntry: string) {
  // Mantener solo los últimos 10 logs
  if (systemLogs.length >= 10) {
    systemLogs.pop(); // Eliminar el log más antiguo
  }
  systemLogs.unshift(logEntry);

  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'log',
        data: logEntry
      });
      client.send(message);
    }
  });
}

mqttClient.on('message', (topic, message) => {
  const logEntry = `${topic} ${message.toString()}`; 
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
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
      const logEntry = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
      log(logEntry);
    }
  });
  next();
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  log(`Error: ${message}`);
  res.status(status).json({ message });
});

(async () => {
  const server = app;

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

  // Configurar WebSocket Server
  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
      socket.on('error', (error) => {
        log(`[WebSocket] Error en la conexión: ${error.message}`);
      });
      socket.on('close', () => {
        log('[WebSocket] Conexión cerrada');
      });
    });
  });
})();