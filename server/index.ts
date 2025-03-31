import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

import fs from 'fs';
import path from 'path';

const wsServer = new WebSocket.Server({ noServer: true, path: '/ws' });
let systemLogs: string[] = [];

// Función para leer los últimos logs
function readLastLogs() {
  try {
    const logs = fs.readFileSync(path.join(__dirname, '../mqtt_logs.txt'), 'utf8')
      .split('\n')
      .filter(line => line.trim() !== '')
      .slice(-10);
    return logs;
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

// Actualizar logs periódicamente
setInterval(() => {
  const newLogs = readLastLogs();
  if (JSON.stringify(newLogs) !== JSON.stringify(systemLogs)) {
    systemLogs = newLogs;
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ logs: newLogs }));
      }
    });
  }
}, 1000);

app.get("/api/logs", (_req, res) => {
  res.json(systemLogs);
});

app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Servidor de semáforos funcionando" });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
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
    console.log(`Servidor ejecutándose en el puerto ${port}`);
  });

  // Configurar WebSocket Server con path específico
  serverInstance.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
        socket.on('error', (error) => {
          console.error(`[WebSocket] Error en la conexión: ${error.message}`);
        });
        socket.on('close', () => {
          console.log('[WebSocket] Conexión cerrada');
        });
      });
    }
  });
})();