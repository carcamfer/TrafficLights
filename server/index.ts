import express from "express";
import cors from "cors";
import { WebSocket, WebSocketServer } from "ws";
import { log } from "./vite";
import { setupVite, serveStatic } from "./vite";
import './mqtt-simulator';

log('[Server] Iniciando servidor Express...');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const wsServer = new WebSocketServer({ 
  noServer: true,
  clientTracking: true,
  perMessageDeflate: false
});

// Almacenar los últimos logs
let systemLogs: string[] = [];
const MAX_LOGS = 10;
let wsClients = new Set<WebSocket>();

// Función para transmitir logs a todos los clientes
function broadcastLogs() {
  const message = JSON.stringify({ type: 'log', data: systemLogs });
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Actualizar logs del sistema
export function updateSystemLogs(log: string) {
  systemLogs = [log, ...systemLogs].slice(0, MAX_LOGS);
  broadcastLogs();
}

wsServer.on('connection', (ws) => {
  wsClients.add(ws);
  ws.send(JSON.stringify({ type: 'log', data: systemLogs }));

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

if (import.meta.env.PROD) {
  await setupVite(app);
} else {
  serveStatic(app);
}

const port = 5000;
const serverInstance = server.listen({
  port,
  host: "0.0.0.0",
}, () => {
  log(`[Server] Servidor HTTP iniciado en puerto ${port}`);
});

serverInstance.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit('connection', ws, request);
  });
});et
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
  try {
    log('[Server] Configurando servidor...');
    const server = app;

    if (app.get("env") === "development") {
      log('[Server] Configurando Vite para desarrollo...');
      await setupVite(app, server);
    } else {
      log('[Server] Configurando servidor para producción...');
      serveStatic(app);
    }

    const port = 5000;
    const serverInstance = server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`[Server] Servidor ejecutándose en http://0.0.0.0:${port}`);
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
  } catch (error) {
    log(`[Server] Error al iniciar el servidor: ${error}`);
    process.exit(1);
  }
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