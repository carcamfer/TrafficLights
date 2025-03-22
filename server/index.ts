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
const mqttClient = mqtt.connect('mqtt://localhost:3000', {
  clientId: 'traffic_control_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60,
  resubscribe: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  rejectUnauthorized: false
});

const wsServer = new WebSocket.Server({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];

mqttClient.on('connect', () => {
  const logEntry = 'Conectado al broker MQTT';
  log(logEntry);
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
  mqttClient.subscribe('#'); // Suscribirse a todos los tópicos
});

mqttClient.on('error', (error) => {
  const logEntry = `Error MQTT: ${error.message}`;
  log(logEntry);
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
});

// Función para transmitir logs a todos los clientes
function broadcastLog(logEntry: string) {
  log(`[Broadcast] Intentando enviar log: ${logEntry}`);
  const activeClients = Array.from(wsServer.clients).filter(
    client => client.readyState === WebSocket.OPEN
  ).length;
  log(`[Broadcast] Clientes WebSocket activos: ${activeClients}`);

  // Mantener solo los últimos 10 logs
  if (systemLogs.length >= 10) {
    systemLogs.pop(); // Eliminar el log más antiguo
  }
  systemLogs.unshift(logEntry);

  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'log',
        data: `${new Date().toLocaleTimeString()} - ${logEntry}`
      });
      client.send(message);
      log(`[Broadcast] Log enviado exitosamente`);
    }
  });
}

mqttClient.on('message', (topic, message) => {
  const logEntry = `${topic}: ${message.toString()}`;
  log(`[MQTT] Mensaje recibido - ${logEntry}`);
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
});

// API endpoint para obtener logs
app.get("/api/logs", (_req, res) => {
  log('[API] Solicitud de logs recibida');
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
        log(errorMsg);
        res.status(500).json({ status: "error", message: errorMsg });
      } else {
        const successMsg = `Mensaje publicado exitosamente en ${topic}`;
        log(successMsg);
        res.json({ status: "ok", message: successMsg });
      }
    });
  } catch (error) {
    const errorMsg = `Error al procesar la solicitud: ${error.message}`;
    log(errorMsg);
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
      log(logEntry);
      systemLogs.unshift(logEntry);
      broadcastLog(logEntry);
    }
  });
  next();
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  const logEntry = `Error: ${message}`;
  log(logEntry);
  systemLogs.unshift(logEntry);
  broadcastLog(logEntry);
  res.status(status).json({ message });
});

(async () => {
  const server = app;

  // Configuración de Vite después de las rutas API
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
    const logEntry = `Servidor ejecutándose en el puerto ${port}`;
    log(logEntry);
    systemLogs.unshift(logEntry);
    broadcastLog(logEntry);
  });

  // Configurar WebSocket Server
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