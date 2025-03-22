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
  resubscribe: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  rejectUnauthorized: false
});

const wsServer = new WebSocket.Server({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];

mqttClient.on('connect', () => {
  const logEntry = 'Conectado al broker MQTT';
  log(`[MQTT] ${logEntry}`);
  mqttClient.subscribe('smartSemaphore/#'); // Suscribirse solo a los tópicos de semáforos
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
});

mqttClient.on('error', (error) => {
  const logEntry = `Error MQTT: ${error.message}`;
  log(`[MQTT] ${logEntry}`);
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
});

// Función para transmitir logs a todos los clientes
function broadcastLog(logEntry: string) {
  const activeClients = Array.from(wsServer.clients).filter(
    client => client.readyState === WebSocket.OPEN
  ).length;

  // Mantener solo los últimos 10 logs
  if (systemLogs.length >= 10) {
    systemLogs.pop(); // Eliminar el log más antiguo
  }
  systemLogs.unshift(logEntry);

  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'log',
        data: logEntry // Ya no agregamos el timestamp aquí
      });
      client.send(message);
    }
  });
}

mqttClient.on('message', (topic, message) => {
  // Solo procesar mensajes que vengan de dispositivos LoRa
  if (topic.startsWith('smartSemaphore/lora_Device/')) {
    const logEntry = `${topic} ${message.toString()}`;
    log(`[MQTT] ${logEntry}`);
    systemLogs.unshift(logEntry);
    broadcastLog(logEntry);
  }
});

// API endpoint para obtener logs
app.get("/api/logs", (_req, res) => {
  res.json(systemLogs);
});

// Basic API endpoint for testing
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
});

// API endpoint para publicar mensajes MQTT (para pruebas)
app.post("/api/mqtt/publish", (req, res) => {
  try {
    const { topic, message } = req.body;
    log(`[MQTT] Intentando publicar en ${topic}: ${message}`);

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        const errorMsg = `Error al publicar mensaje MQTT: ${err.message}`;
        log(`[MQTT] ${errorMsg}`);
        res.status(500).json({ status: "error", message: errorMsg });
      } else {
        const successMsg = `Mensaje publicado exitosamente en ${topic}`;
        log(`[MQTT] ${successMsg}`);
        res.json({ status: "ok", message: successMsg });
      }
    });
  } catch (error: any) {
    const errorMsg = `Error al procesar la solicitud: ${error.message}`;
    log(`[MQTT] ${errorMsg}`);
    res.status(500).json({ status: "error", message: errorMsg });
  }
});

// Middleware for logging API requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const logEntry = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      log(`[API] ${logEntry}`);
    }
  });
  next();
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  const logEntry = `Error: ${message}`;
  log(`[Error] ${logEntry}`);
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
    const logEntry = `Servidor ejecutándose en el puerto ${port}`;
    log(`[Server] ${logEntry}`);
  });

  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
      const logEntry = 'Nueva conexión WebSocket establecida';
      log(`[WebSocket] ${logEntry}`);
      socket.on('error', (error) => {
        log(`[WebSocket] Error en la conexión: ${error.message}`);
      });
      socket.on('close', () => {
        log('[WebSocket] Conexión cerrada');
      });
      systemLogs.unshift(logEntry);
      broadcastLog(logEntry);
    });
  });
})();