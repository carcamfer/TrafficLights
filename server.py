
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import os
import paho.mqtt.client as mqtt

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar conexión MQTT
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

LOG_FILE = "mqtt_logs.txt"

@app.route('/send', methods=['POST'])
def send_times():
    try:
        data = request.json
        device_id = "00000001"
        base_topic = f"smartSemaphore/lora_Device/{device_id}/set/time/light"
        
        if 'redColorTime' in data:
            value = int(data['redColorTime'])
            mqtt_client.publish(f"{base_topic}/red", value)
            logger.info(f"Published red time: {value}")
            
        if 'greenColorTime' in data:
            value = int(data['greenColorTime'])
            mqtt_client.publish(f"{base_topic}/green", value)
            logger.info(f"Published green time: {value}")
        
        if 'yellowColorTime' in data:
            value = int(data['yellowColorTime'])
            mqtt_client.publish(f"{base_topic}/yellow", value)
            logger.info(f"Published yellow time: {value}")
            
        return jsonify({"status": "success", "message": "Values published successfully"})
    
    except ValueError as e:
        logger.error(f"Invalid value in request: {str(e)}")
        return jsonify({"status": "error", "message": "Invalid value"}), 400
    
    except Exception as e:
        logger.error(f"Error in /send: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    try:
        abs_path = os.path.abspath(LOG_FILE)
        logger.info(f"Intentando leer logs desde: {abs_path}")

        with open(LOG_FILE, "r") as file:
            raw_logs = file.readlines()
            logs = [line.strip() for line in raw_logs if line.strip()]
            logs = logs[-10:][::-1]
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
