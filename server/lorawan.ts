import axios from 'axios';

// LoRaWAN Server Configuration
const loraServer = {
  host: process.env.LORA_SERVER_HOST || 'localhost',
  port: parseInt(process.env.LORA_SERVER_PORT || '8080'),
  apiKey: process.env.LORA_API_KEY || '',
};

// Waze API Configuration
const wazeConfig = {
  baseURL: 'https://api.waze.com/traffic-data',
  apiKey: process.env.WAZE_API_KEY || '',
};

// Function to send data to Waze API
async function sendToWaze(deviceData: { location: { lat: number, lng: number }, data: any }) {
  try {
    const response = await axios.post(`${wazeConfig.baseURL}/update`, {
      location: deviceData.location,
      data: deviceData.data,
    }, {
      headers: {
        'Authorization': `Bearer ${wazeConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending data to Waze:', error);
    throw error;
  }
}

// Handle incoming LoRaWAN messages
async function handleLoRaMessage(message: any) {
  try {
    // Process the LoRaWAN message
    const deviceData = {
      deviceEUI: message.deviceEUI,
      data: message.data,
      location: message.location,
    };

    // Send processed data to Waze
    await sendToWaze(deviceData);

    return deviceData;
  } catch (error) {
    console.error('Error processing LoRaWAN message:', error);
    throw error;
  }
}

// Initialize WebSocket connection to LoRaWAN server
async function initializeLoRaWAN() {
  try {
    console.log('Connecting to LoRaWAN server...');
    // Here you would typically establish a WebSocket connection
    // or set up a message queue consumer

    console.log('Successfully connected to LoRaWAN server');
  } catch (error) {
    console.error('Failed to connect to LoRaWAN server:', error);
    throw error;
  }
}

export { initializeLoRaWAN, handleLoRaMessage, sendToWaze };