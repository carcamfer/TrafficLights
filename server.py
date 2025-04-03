
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import paho.mqtt.client as mqtt
import logging

app = Flask(__name__, static_folder='client/dist')
CORS(app)

# Definir archivo de logs
LOG_FILE = "mqtt_logs.txt"

# Configurar MQTT (cambia localhost por el broker en Replit si es necesario)
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")  # Usar broker público
MQTT_PORT = 1883

mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def serve_static():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/send', methods=['POST'])
def send_times():
    try:
        data = request.json
        device_id = data['device_id']  # device_id siempre viene del frontend
        base_topic = f"smartSemaphore/lora_Device/{device_id}/set/time/light"

        # Publicar tiempos en MQTT
        if 'redColorTime' in data:
            mqtt_client.publish(f"{base_topic}/red", data['redColorTime'])
            logger.info(f"Red time published for {device_id}: {data['redColorTime']}")

        if 'greenColorTime' in data:
            mqtt_client.publish(f"{base_topic}/green", data['greenColorTime'])
            logger.info(f"Green time published for {device_id}: {data['greenColorTime']}")

        # Tiempo amarillo fijo
        mqtt_client.publish(f"{base_topic}/yellow", 2)

        return jsonify({"status": "success", "message": "Values published successfully"})
    except Exception as e:
        logger.error(f"Error in /send: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    try:
        device_id = request.args.get('device_id')  # Obtener el device_id de la URL

        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r") as file:
                logs = file.readlines()

            # Filtrar logs por device_id si se proporciona uno
            if device_id:
                logs = [log.strip() for log in logs if f"Device {device_id}" in log]
            else:
                logs = [log.strip() for log in logs]

            logs = logs[-10:]  # Últimos 10 logs
            return jsonify({"logs": logs})
        else:
            return jsonify({"logs": [], "error": "Log file not found"}), 404
    except Exception as e:
        return jsonify({"logs": [], "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
