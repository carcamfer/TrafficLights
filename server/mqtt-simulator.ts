import * as mqtt from 'mqtt';
import { log } from "./vite";

const client = mqtt.connect('mqtt://localhost:1883');

function generateRandomCarCount() {
  return Math.floor(Math.random() * 50);
}

client.on('connect', () => {
  log('[MQTT] Simulador conectado al broker');
  
  // Generar mensajes cada 5 segundos
  setInterval(() => {
    const deviceId = '00000001';
    const carCount = generateRandomCarCount();
    const topic = `smartSemaphore/lora_Device/${deviceId}/info/cars/detect`;
    
    client.publish(topic, carCount.toString(), { qos: 0 }, (error) => {
      if (error) {
        log(`[MQTT] Error al publicar: ${error}`);
      } else {
        log(`[MQTT] Publicado: ${topic} ${carCount}`);
      }
    });
  }, 5000);
});

client.on('error', (error) => {
  log(`[MQTT] Error de conexión: ${error}`);
});

export default client;
