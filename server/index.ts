import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import WebSocket from "ws";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const mqttClient = mqtt.connect('mqtt://localhost:1883');
const wsServer = new WebSocket.Server({ noServer: true });

mqttClient.on('connect', () => {
  console.log('MQTT Connected');
  mqttClient.subscribe('#');
});

mqttClient.on('message', (topic, message) => {
  const msgStr = `${topic} ${message.toString()}`;
  console.log('MQTT Message:', msgStr);
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msgStr);
    }
  });
});

app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", message: "Server Running" });
});


(async () => {
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  const serverInstance = app.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log(`Server running on port ${port}`);
  });

  serverInstance.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
      console.log('New WebSocket client connected');

      socket.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });
  });
})();