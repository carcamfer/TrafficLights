import * as mqtt from 'mqtt';
import { log } from "./vite";
import { updateSystemLogs } from './index';

const MQTT_HOST = process.env.MQTT_HOST || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || '1883';
const MQTT_URL = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;

const mqttOptions = {
  keepalive: 60,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  rejectUnauthorized: false
};

const client = mqtt.connect(MQTT_URL, mqttOptions);

client.on('connect', () => {
  log('[MQTT] Conectado al broker');
  client.subscribe('smartSemaphore/#', (err) => {
    if (err) {
      log(`[MQTT] Error de suscripción: ${err.message}`);
    } else {
      log('[MQTT] Suscrito a smartSemaphore/#');
    }
  });
});

client.on('message', (topic, message) => {
  const logMessage = `${topic} ${message.toString()}`;
  log(`[MQTT] Mensaje recibido: ${logMessage}`);
  updateSystemLogs(logMessage);
});

client.on('error', (error) => {
  log(`[MQTT] Error: ${error.message}`);
});

client.on('offline', () => {
  log('[MQTT] Cliente desconectado');
});

client.on('reconnect', () => {
  log('[MQTT] Intentando reconexión...');
});

export default client;