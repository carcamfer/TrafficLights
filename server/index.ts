import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Ruta al archivo de logs
const LOG_FILE = "mqtt_logs.txt";

// Configuración MQTT
// Usar un broker público para pruebas
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org:1883', {
  clientId: 'traffic_control_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60,
  resubscribe: true
});

const wsServer = new WebSocket.Server({ noServer: true, path: '/ws' });
let systemLogs: string[] = [];

// Función para leer logs desde el archivo
const readLogsFromFile = (): string[] => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      return lines.slice(-10).reverse(); // Retornar los últimos 10 logs en orden inverso
    }
  } catch (error) {
    console.error(`Error leyendo archivo de logs: ${error}`);
  }
  return [];
};

// Inicializar los logs desde el archivo al arrancar
try {
  systemLogs = readLogsFromFile();
  console.log(`Cargados ${systemLogs.length} logs iniciales`);
} catch (error) {
  console.error(`Error al cargar logs iniciales: ${error}`);
}

mqttClient.on('connect', () => {
  console.log('Conectado al broker MQTT');
  mqttClient.subscribe('#');
});

mqttClient.on('error', (error) => {
  console.error(`Error MQTT: ${error.message}`);
});

mqttClient.on('message', (topic, message) => {
  const logEntry = `${topic} ${message.toString()}`;
  console.log(`[MQTT Recibido] ${logEntry}`);
  
  // Agregar a la lista local de logs
  if (systemLogs.length >= 10) {
    systemLogs.pop();
  }
  systemLogs.unshift(logEntry);

  // Enviar a todos los clientes WebSocket conectados
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'log',
        message: logEntry
      }));
    }
  });
});

// Endpoint para obtener los logs
app.get("/api/logs", (_req, res) => {
  // Leer los logs desde el archivo para asegurarnos de tener los más recientes
  try {
    const fileContent = readLogsFromFile();
    if (fileContent.length > 0) {
      systemLogs = fileContent;
    }
  } catch (error) {
    console.error(`Error al leer logs para API: ${error}`);
  }
  
  res.json({ logs: systemLogs });
});

app.get("/api/status", (_req, res) => {
  res.json({ 
    status: "ok", 
    message: "Servidor de semáforos funcionando",
    mqtt: mqttClient.connected ? "connected" : "disconnected"
  });
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
        
        // Enviar los logs actuales cuando un cliente se conecta
        socket.send(JSON.stringify({
          logs: systemLogs
        }));
        
        // Configurar manejadores de eventos para el socket
        socket.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            // Si es un mensaje para publicar en MQTT
            if (message.type === 'publish' && message.topic && message.message) {
              console.log(`[WebSocket] Publicando en MQTT: ${message.topic} = ${message.message}`);
              mqttClient.publish(message.topic, message.message);
              
              // Enviar confirmación al cliente
              socket.send(JSON.stringify({
                type: 'publish_response',
                success: true,
                topic: message.topic
              }));
            }
          } catch (error) {
            console.error(`[WebSocket] Error procesando mensaje: ${error}`);
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Error procesando mensaje'
            }));
          }
        });
        
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