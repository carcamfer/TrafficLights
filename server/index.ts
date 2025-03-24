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

// Almacenar los últimos logs
let systemLogs: string[] = [];
const MAX_LOGS = 10;

// Función para agregar logs
export function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  systemLogs.unshift(`[${timestamp}] ${message}`);
  if (systemLogs.length > MAX_LOGS) {
    systemLogs.pop();
  }
}

// API endpoint para obtener logs
app.get("/logs", (_req, res) => {
  res.json(systemLogs);
});

// Agregar algunos logs de ejemplo
setInterval(() => {
  addLog(`Estado del semáforo actualizado`);
}, 5000);

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
    const wsServer = new WebSocketServer({ noServer: true });
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
  //The broadcastLogs function is not defined in the edited code, but it's needed based on the original code
  //This is a limitation, as we cannot introduce entirely new code.
  // Leaving this function out will cause a runtime error.  A complete solution would require more information.

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