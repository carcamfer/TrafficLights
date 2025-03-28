from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import os
import paho.mqtt.client as mqtt

app = Flask(__name__)
CORS(app)

mqtt_client = mqtt.Client()
mqtt_client.connect("0.0.0.0", 1883, 60)
mqtt_client.loop_start()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LOG_FILE = "mqtt_logs.txt"

@app.route('/send', methods=['POST'])
def send_times():
    try:
        data = request.json
        device_id = "00000001"  # Default device ID
        base_topic = f"smartSemaphore/lora_Device/{device_id}/set/time/light"
        
        if 'redColorTime' in data:
            mqtt_client.publish(f"{base_topic}/red", str(data['redColorTime']))
            logger.info(f"Published red time: {data['redColorTime']}")
        if 'greenColorTime' in data:
            mqtt_client.publish(f"{base_topic}/green", str(data['greenColorTime']))
            logger.info(f"Published green time: {data['greenColorTime']}")
        
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Error in /send: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    try:
        # Obtener ruta absoluta del archivo
        abs_path = os.path.abspath(LOG_FILE)
        logger.info(f"Intentando leer logs desde: {abs_path}")

        with open(LOG_FILE, "r") as file:
            raw_logs = file.readlines()
            # Limpiar y formatear logs
            logs = [line.strip() for line in raw_logs if line.strip()]
            # Tomar los últimos 10 logs y revertir el orden
            logs = logs[-10:][::-1]
            logger.info(f"Returning {len(logs)} log entries")
            logger.debug(f"Log content: {logs}")
            return jsonify({"logs": logs})
    except FileNotFoundError:
        logger.error(f"Log file {LOG_FILE} not found")
        return jsonify({"logs": [], "error": "Log file not found"}), 404
    except Exception as e:
        logger.error(f"Error reading logs: {str(e)}")
        return jsonify({"logs": [], "error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)