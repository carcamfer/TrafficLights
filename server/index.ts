import express from "express";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";
import { log } from "./vite";
import { setupVite, serveStatic } from "./vite";
import './mqtt-simulator';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const wsServer = new WebSocketServer({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];
const MAX_LOGS = 10;

// Función para transmitir logs a todos los clientes WebSocket
function broadcastLogs(logs: string[]) {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'log',
        data: logs
      }));
    }
  });
}

// API endpoint para obtener logs
app.get("/api/logs", (_req, res) => {
  res.json(systemLogs);
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
    log(`[Server] Servidor ejecutándose en el puerto ${port}`);
  });

  // Configurar WebSocket
  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
      log(`[WebSocket] Nueva conexión WebSocket establecida`);

      // Enviar logs actuales al cliente
      if (systemLogs.length > 0) {
        socket.send(JSON.stringify({
          type: 'log',
          data: systemLogs
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

// Middleware para logging
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Para actualizar los logs desde el cliente MQTT
export function updateSystemLogs(message: string) {
  systemLogs = [message, ...systemLogs.slice(0, MAX_LOGS - 1)];
  broadcastLogs(systemLogs);
}

// Basic API endpoint for testing
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  log(`[Error] ${message}`);
  res.status(status).json({ message });
});