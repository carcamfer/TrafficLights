import * as mqtt from 'mqtt';
import { log } from "./vite";
import { updateSystemLogs } from './index';

// Configuración del broker MQTT
const MQTT_HOST = process.env.MQTT_HOST || '0.0.0.0';
const MQTT_PORT = process.env.MQTT_PORT || '1883';

log(`[MQTT] Iniciando conexión a mqtt://${MQTT_HOST}:${MQTT_PORT}`);

let retryCount = 0;
const MAX_RETRIES = 10;

function connectMQTT() {
  if (retryCount >= MAX_RETRIES) {
    log('[MQTT] Número máximo de intentos alcanzado. Deteniendo reconexión.');
    return;
  }

  const client = mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, {
    keepalive: 60,
    reconnectPeriod: 1000,  // Intentar reconectar cada segundo
    connectTimeout: 30000,  // Timeout de conexión de 30 segundos
    clientId: `mqtt_client_${Math.random().toString(16).slice(3)}`,
    clean: true // Limpia la sesión al reconectar
  });

  client.on('connect', () => {
    log('[MQTT] Conectado al broker');
    retryCount = 0; // Resetear contador al conectar exitosamente

    // Suscribirse al tópico de semáforos
    client.subscribe('smartSemaphore/#', (err) => {
      if (err) {
        log(`[MQTT] Error al suscribirse: ${err.message}`);
      } else {
        log('[MQTT] Suscrito a smartSemaphore/#');
        
        // Publicar datos de prueba cada 5 segundos
        setInterval(() => {
          const testData = {
            id: 1,
            state: ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)],
            timestamp: new Date().toISOString()
          };
          client.publish('smartSemaphore/1/state', JSON.stringify(testData));
          log(`[MQTT] Datos de prueba enviados: ${JSON.stringify(testData)}`);
        }, 5000);
      }
    });
  });

  client.on('message', (topic, message) => {
    const logMessage = `${topic} ${message.toString()}`;
    log(`[MQTT] Mensaje recibido: ${logMessage}`);
    updateSystemLogs(logMessage);
  });

  client.on('error', (error) => {
    log(`[MQTT] Error de conexión: ${error.message}`);
  });

  client.on('reconnect', () => {
    retryCount++;
    log(`[MQTT] Intento de reconexión #${retryCount}...`);
  });

  client.on('close', () => {
    log('[MQTT] Conexión cerrada');
  });

  client.on('offline', () => {
    log('[MQTT] Cliente desconectado');
  });

  client.on('end', () => {
    log('[MQTT] Conexión terminada');
    // Intentar reconectar si no hemos alcanzado el máximo de intentos
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        log('[MQTT] Reintentando conexión después de 5 segundos...');
        connectMQTT();
      }, 5000);
    }
  });

  return client;
}

const mqttClient = connectMQTT();
export default mqttClient;