import mqtt from 'mqtt';
import { setTimeout } from 'timers/promises';

const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'traffic_simulator_' + Math.random().toString(16).substr(2, 8)
});

const NUM_DEVICES = 10;
const states = ['red', 'yellow', 'green'];

async function publishDeviceData(deviceId: string) {
  const paddedId = deviceId.padStart(8, '0');
  const baseTopic = `smartSemaphore/lora_Device/${paddedId}/info`;
  
  // Generar tiempos aleatorios para verde y rojo
  const greenTime = Math.floor(Math.random() * 30) + 20; // 20-50 segundos
  const redTime = Math.floor(Math.random() * 30) + 30; // 30-60 segundos
  
  // Publicar tiempos
  client.publish(`${baseTopic}/time/light/green`, greenTime.toString());
  client.publish(`${baseTopic}/time/light/red`, redTime.toString());
  
  // Publicar estado aleatorio
  const state = states[Math.floor(Math.random() * states.length)];
  client.publish(`${baseTopic}/state`, state);
  
  // Publicar detección de vehículos
  const carsDetected = Math.floor(Math.random() * 50);
  client.publish(`${baseTopic}/cars/detect`, carsDetected.toString());
}

client.on('connect', async () => {
  console.log('Simulador MQTT conectado');
  
  while (true) {
    for (let i = 1; i <= NUM_DEVICES; i++) {
      await publishDeviceData(i.toString());
      // Pequeña pausa entre publicaciones
      await setTimeout(500);
    }
    // Esperar 2 segundos antes de la siguiente ronda
    await setTimeout(2000);
  }
});

client.on('error', (error) => {
  console.error('Error en simulador MQTT:', error);
});
