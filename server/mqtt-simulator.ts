import * as mqtt from 'mqtt';
import { log } from "./vite";

// Conectar al broker MQTT local
const client = mqtt.connect('mqtt://DESKTOP-HTD4CT9.local:1883');

client.on('connect', () => {
  log('[MQTT] Conectado al broker local');

  // Suscribirse al tópico de semáforos
  client.subscribe('smartSemaphore/#', (err) => {
    if (err) {
      log(`[MQTT] Error al suscribirse: ${err}`);
    } else {
      log('[MQTT] Suscrito a smartSemaphore/#');
    }
  });
});

client.on('message', (topic, message) => {
  // Log del mensaje en el formato deseado
  log(`${topic} ${message.toString()}`);
});

client.on('error', (error) => {
  log(`[MQTT] Error de conexión: ${error}`);
});

export default client;