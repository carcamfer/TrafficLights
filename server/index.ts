import express from "express";
import cors from "cors";
import WebSocket from "ws";
import { spawn, exec } from "child_process";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const wsServer = new WebSocket.Server({ noServer: true });

// Almacenar los últimos logs
let systemLogs: string[] = [];

// Matar cualquier proceso existente de mosquitto antes de iniciar uno nuevo
exec('pkill mosquitto', (error) => {
  if (error) {
    log('[Mosquitto] No se encontraron procesos previos de Mosquitto');
  } else {
    log('[Mosquitto] Procesos previos de Mosquitto terminados');
  }

  // Iniciar Mosquitto con verbose logging
  const mosquitto = spawn('mosquitto', ['-c', 'mosquitto.conf', '-v'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  mosquitto.stdout.on('data', (data) => {
    const logEntry = data.toString().trim();
    log(`[Mosquitto] ${logEntry}`);

    // Mantener solo los últimos 10 logs
    if (systemLogs.length >= 10) {
      systemLogs.pop();
    }
    systemLogs.unshift(logEntry);

    // Transmitir el log a todos los clientes WebSocket
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'log',
          data: logEntry
        }));
      }
    });
  });

  mosquitto.stderr.on('data', (data) => {
    const logEntry = data.toString().trim();
    log(`[Mosquitto Error] ${logEntry}`);
  });

  mosquitto.on('close', (code) => {
    log(`[Mosquitto] El proceso terminó con código ${code}`);
  });

  // Desacoplar el proceso hijo para que no bloquee el servidor
  mosquitto.unref();
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

  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
      log(`[WebSocket] Nueva conexión WebSocket establecida`);
      socket.on('error', (error) => {
        log(`[WebSocket] Error en la conexión: ${error.message}`);
      });
      socket.on('close', () => {
        log('[WebSocket] Conexión cerrada');
      });
    });
  });
})();