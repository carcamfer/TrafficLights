import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Crear logs de simulación para prueba
const simulateMqttMessage = (topic: string, payload: string) => {
  const logEntry = `${topic} ${payload}`;
  
  // Guardar en historial de logs
  if (systemLogs.length >= 20) {
    systemLogs.pop();
  }
  systemLogs.unshift(logEntry);
  
  // Enviar a clientes WebSocket
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'mqtt',
        topic,
        payload
      }));
    }
  });
};

// Configuración MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'traffic_control_server_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60,
  resubscribe: true
});

const wsServer = new WebSocket.Server({ noServer: true, path: '/ws' });
let systemLogs: string[] = [];

// Suscribirse al topic principal de MQTT cuando se conecta
mqttClient.on('connect', () => {
  console.log('Conectado al broker MQTT');
  
  // Suscribirse a todos los mensajes inicialmente para depuración
  mqttClient.subscribe('#');
  
  // Suscribirse a topics específicos de smartSemaphore
  mqttClient.subscribe('smartSemaphore/lora_Device/+/info/#');
  
  // Notificar a los clientes WebSocket sobre la conexión
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'status',
        connected: true
      }));
    }
  });
});

mqttClient.on('error', (error) => {
  console.error(`Error MQTT: ${error.message}`);
  
  // Notificar a los clientes WebSocket sobre el error
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'status',
        connected: false
      }));
    }
  });
});

// Manejar mensajes del broker MQTT
mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  const logEntry = `${topic} ${payload}`;
  
  // Guardar en historial de logs
  if (systemLogs.length >= 20) {
    systemLogs.pop();
  }
  systemLogs.unshift(logEntry);
  
  console.log(`MQTT: ${logEntry}`);
  
  // Enviar a todos los clientes WebSocket conectados
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // Enviar en formato estructurado para mejor procesamiento en el cliente
      client.send(JSON.stringify({
        type: 'mqtt',
        topic,
        payload
      }));
    }
  });
});

// Manejar conexiones WebSocket
wsServer.on('connection', (ws) => {
  console.log('Nueva conexión WebSocket');
  
  // Enviar estado inicial
  ws.send(JSON.stringify({
    type: 'status',
    connected: mqttClient.connected
  }));
  
  // Enviar historial de logs
  systemLogs.forEach(log => {
    const [topic, payload] = log.split(' ');
    ws.send(JSON.stringify({
      type: 'mqtt',
      topic,
      payload: payload || ''
    }));
  });
  
  // Manejar mensajes del cliente
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Manejar los diferentes tipos de mensajes
      if (data.type === 'set_time') {
        const { color, value } = data;
        const deviceId = "00000001";
        const topic = `smartSemaphore/lora_Device/${deviceId}/set/time/light/${color}`;
        
        console.log(`Publicando en ${topic}: ${value}`);
        
        // Intentar publicar en MQTT si está conectado
        if (mqttClient.connected) {
          mqttClient.publish(topic, value.toString());
        } else {
          // Simular una respuesta del servidor MQTT si no hay conexión
          console.log("MQTT no conectado, simulando respuesta");
          
          // Simular un cambio en el tiempo del semáforo
          setTimeout(() => {
            const feedbackTopic = `smartSemaphore/lora_Device/${deviceId}/info/time/light/${color}`;
            simulateMqttMessage(feedbackTopic, value.toString());
            
            // Simular un mensaje de estado
            const stateTopic = `smartSemaphore/lora_Device/${deviceId}/info/state`;
            simulateMqttMessage(stateTopic, color === 'red' ? 'red' : 'green');
            
            // Simular detección de autos
            const carsTopic = `smartSemaphore/lora_Device/${deviceId}/info/cars/detect`;
            const carCount = Math.floor(Math.random() * 50 + 10);
            simulateMqttMessage(carsTopic, carCount.toString());
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error procesando mensaje WebSocket:', error);
    }
  });
  
  // Manejar desconexión
  ws.on('close', () => {
    console.log('Conexión WebSocket cerrada');
  });
  
  ws.on('error', (error) => {
    console.error('Error en conexión WebSocket:', error);
  });
});

// API REST para consultar logs
app.get("/api/logs", (_req, res) => {
  res.json({ logs: systemLogs });
});

app.get("/api/status", (_req, res) => {
  res.json({ 
    status: mqttClient.connected ? "connected" : "disconnected", 
    message: "Servidor de semáforos funcionando"
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json({ message });
});

// Función para generar datos iniciales simulados
const generateInitialData = () => {
  const deviceId = "00000001";
  
  // Simular tiempos de semáforo
  simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/time/light/red`, "45");
  simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/time/light/green`, "30");
  simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/time/light/yellow`, "3");
  
  // Simular estado
  simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/state`, "red");
  
  // Simular detección de autos
  simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/cars/detect`, "22");
  
  console.log("Datos iniciales simulados generados");
};

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
    
    // Generar datos iniciales después de un segundo
    setTimeout(generateInitialData, 1000);
    
    // Continuar generando datos simulados cada 5 segundos si no hay conexión MQTT
    setInterval(() => {
      if (!mqttClient.connected) {
        const deviceId = "00000001";
        const carCount = Math.floor(Math.random() * 50 + 10);
        simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/cars/detect`, carCount.toString());
        
        // Alternar estado de vez en cuando
        if (Math.random() > 0.7) {
          const newState = Math.random() > 0.5 ? "red" : "green";
          simulateMqttMessage(`smartSemaphore/lora_Device/${deviceId}/info/state`, newState);
        }
      }
    }, 5000);
  });

  // Configurar WebSocket Server con path específico
  serverInstance.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
      });
    } else {
      // Para solicitudes a otras rutas de WebSocket, cerrar la conexión
      socket.destroy();
    }
  });
})();