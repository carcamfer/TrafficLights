from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import paho.mqtt.client as mqtt
import logging

app = Flask(__name__, static_folder='client/dist')
CORS(app)

LOG_FILE = "mqtt_logs.txt"
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883

mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/logs', methods=['GET'])
def get_logs():
    try:
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r") as file:
                logs = file.readlines()

            logs = logs[-10:]  # Enviar solo los últimos 10 logs
            return jsonify({"logs": [log.strip() for log in logs]})
        else:
            return jsonify({"logs": [], "error": "Log file not found"}), 404
    except Exception as e:
        return jsonify({"logs": [], "error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
