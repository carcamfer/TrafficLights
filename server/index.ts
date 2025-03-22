import express from "express";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";
import { readFileSync, watchFile } from "fs";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const wsServer = new WebSocketServer({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];
const MAX_LOGS = 10;

// Función para leer los últimos logs de Mosquitto
function getLatestMosquittoLogs(): string[] {
  try {
    const logContent = readFileSync('mosquitto.log', 'utf-8');
    return logContent.split('\n')
      .filter(line => line.trim())
      .slice(-MAX_LOGS)
      .reverse();
  } catch (error) {
    log(`[Error] No se pudo leer mosquitto.log: ${error}`);
    return [];
  }
}

// Actualizar y enviar logs cada segundo
setInterval(() => {
  const logs = getLatestMosquittoLogs();
  if (logs.length > 0) {
    systemLogs = logs;
    broadcastLogs(logs);
  }
}, 1000);

// Función para transmitir logs a todos los clientes WebSocket
function broadcastLogs(logs: string[]) {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'log',
        data: logs.join('\n')
      }));
    }
  });
}

// Observar cambios en el archivo de logs
watchFile('mosquitto.log', { interval: 1000 }, () => {
  const latestLogs = getLatestMosquittoLogs();
  if (latestLogs.length > 0) {
    systemLogs = latestLogs;
    broadcastLogs(latestLogs);
  }
});

// API endpoint para obtener logs
app.get("/api/logs", (_req, res) => {
  const logs = getLatestMosquittoLogs();
  res.json(logs);
});

// Basic API endpoint for testing
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
});

(async () => {
  const server = app;

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 3000;
  const serverInstance = server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`[Server] Servidor ejecutándose en el puerto ${port}`);
  });

  // Configurar WebSocket
  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
      log(`[WebSocket] Nueva conexión WebSocket establecida`);

      // Enviar logs actuales al cliente
      const currentLogs = getLatestMosquittoLogs();
      if (currentLogs.length > 0) {
        socket.send(JSON.stringify({
          type: 'log',
          data: currentLogs.join('\n')
        }));
      }

      socket.on('error', (error) => {
        log(`[WebSocket] Error en la conexión: ${error.message}`);
      });

      socket.on('close', () => {
        log('[WebSocket] Conexión cerrada');
      });
    });
  });
})();

// Middleware for logging API requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`[API] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  log(`[Error] ${message}`);
  res.status(status).json({ message });
});