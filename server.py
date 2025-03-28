from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import paho.mqtt.client as mqtt
import logging

app = Flask(__name__)
CORS(app)

# Definir archivo de logs
LOG_FILE = "mqtt_logs.txt"

# Configurar MQTT (cambia localhost por el broker en Replit si es necesario)
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")  # Usar broker público
MQTT_PORT = 1883
device_id = "00000001"

mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return "Smart Semaphore API Server Running"

@app.route('/send', methods=['POST'])
def send_times():
    try:
        data = request.json
        base_topic = f"smartSemaphore/lora_Device/{device_id}/set/time/light"

        # Publicar tiempos en MQTT
        if 'redColorTime' in data:
            mqtt_client.publish(f"{base_topic}/red", data['redColorTime'])
            logger.info(f"Red time published: {data['redColorTime']}")

        if 'greenColorTime' in data:
            mqtt_client.publish(f"{base_topic}/green", data['greenColorTime'])
            logger.info(f"Green time published: {data['greenColorTime']}")

        # Tiempo amarillo fijo
        mqtt_client.publish(f"{base_topic}/yellow", 2)

        return jsonify({"status": "success", "message": "Values published successfully"})
    except Exception as e:
        logger.error(f"Error in /send: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)