import axios from 'axios';
import { WebSocket } from 'ws';
import type { IotData } from '@shared/schema';
import { storage } from '../storage';

// Configuration from environment variables
const LORA_CONFIG = {
  serverHost: process.env.LORA_SERVER_HOST,
  serverPort: process.env.LORA_SERVER_PORT,
  apiKey: process.env.LORA_API_KEY,
  enabled: process.env.ENABLE_LORAWAN === 'true'
};

const WAZE_CONFIG = {
  apiKey: process.env.WAZE_API_KEY,
  baseUrl: 'https://api.waze.com/traffic-data',
};

interface WazeAlert {
  location: {
    x: number;  // longitude
    y: number;  // latitude
  };
  type: string;
  subtype: string;
  speed?: number;
  congestion?: number;
}

async function sendToWaze(data: IotData, location: { lat: number; lng: number }): Promise<void> {
  try {
    const device = await storage.getIotDevice(data.deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    // Convert IoT data to Waze format
    const alert: WazeAlert = {
      location: {
        x: location.lng,
        y: location.lat,
      },
      type: 'TRAFFIC',
      subtype: data.roadCondition || 'UNKNOWN',
    };

    if (data.averageSpeed !== null) {
      alert.speed = data.averageSpeed;
    }

    if (data.trafficLevel !== null) {
      alert.congestion = data.trafficLevel;
    }

    // Send to Waze API
    await axios.post(`${WAZE_CONFIG.baseUrl}/alerts`, alert, {
      headers: {
        'Authorization': `Bearer ${WAZE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Successfully sent traffic data to Waze for device ${device.deviceEUI}`);
  } catch (error) {
    console.error('Error sending data to Waze:', error);
  }
}

// Initialize WebSocket connection to LoRaWAN server
let wsClient: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

async function initializeLoRaWAN(): Promise<void> {
  // Skip initialization if LoRaWAN is disabled
  if (!LORA_CONFIG.enabled) {
    console.log('LoRaWAN integration is disabled');
    return;
  }

  if (!LORA_CONFIG.serverHost || !LORA_CONFIG.serverPort || !LORA_CONFIG.apiKey) {
    console.error('Missing LoRaWAN configuration:', {
      hasHost: !!LORA_CONFIG.serverHost,
      hasPort: !!LORA_CONFIG.serverPort,
      hasApiKey: !!LORA_CONFIG.apiKey
    });
    return; // Don't throw error, just return
  }

  try {
    const wsUrl = `ws://${LORA_CONFIG.serverHost}:${LORA_CONFIG.serverPort}/ws`;
    console.log(`Attempting to connect to LoRaWAN server at ${LORA_CONFIG.serverHost}:${LORA_CONFIG.serverPort}`);

    wsClient = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${LORA_CONFIG.apiKey}`,
      },
    });

    wsClient.on('open', () => {
      console.log('Connected to LoRaWAN server');
      reconnectAttempts = 0;
    });

    wsClient.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await processLoRaMessage(message);
      } catch (error) {
        console.error('Error processing LoRaWAN message:', error);
      }
    });

    wsClient.on('error', (error) => {
      console.error('LoRaWAN WebSocket error:', error);
    });

    wsClient.on('close', () => {
      console.log('LoRaWAN connection closed');

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_INTERVAL/1000}s...`);
        setTimeout(() => {
          initializeLoRaWAN().catch(error => {
            console.error('Error during reconnection:', error);
          });
        }, RECONNECT_INTERVAL);
      } else {
        console.error(`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
      }
    });
  } catch (error) {
    console.error('Error initializing LoRaWAN connection:', error);
  }
}

async function processLoRaMessage(message: any): Promise<void> {
  try {
    const deviceEUI = message.deviceEUI;
    const device = await storage.getIotDeviceByEUI(deviceEUI);

    if (!device) {
      console.warn(`Received data for unknown device: ${deviceEUI}`);
      return;
    }

    // Parse raw data into IoT data format
    const iotData = {
      deviceId: device.id,
      trafficLevel: message.data.trafficLevel,
      vehicleCount: message.data.vehicleCount,
      averageSpeed: message.data.averageSpeed,
      roadCondition: message.data.roadCondition,
      temperature: message.data.temperature,
      humidity: message.data.humidity,
      batteryLevel: message.data.batteryLevel,
      rssi: message.rssi,
      rawData: message.data,
    };

    // Store data
    const storedData = await storage.createIotData(iotData);

    // Send to Waze if traffic data is present
    if (device.location && (iotData.trafficLevel !== null || iotData.averageSpeed !== null)) {
      await sendToWaze(storedData, device.location);
    }

  } catch (error) {
    console.error('Error processing LoRaWAN data:', error);
  }
}

export {
  initializeLoRaWAN,
  processLoRaMessage,
  sendToWaze,
};