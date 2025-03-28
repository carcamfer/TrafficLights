
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

# Configuración MQTT
MQTT_BROKER = "0.0.0.0"
MQTT_PORT = 1883
mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Conexión MQTT exitosa.")
    else:
        logger.error(f"Conexión MQTT fallida con código {rc}")

mqtt_client.on_connect = on_connect

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_start()
except Exception as e:
    logger.error(f"Error al conectar con el broker MQTT: {str(e)}")

LOG_FILE = "mqtt_logs.txt"

if not os.path.exists(LOG_FILE):
    open(LOG_FILE, 'a').close()

@app.route('/send', methods=['POST'])
def send_times():
    try:
        data = request.json
        device_id = "00000001"
        base_topic = f"smartSemaphore/lora_Device/{device_id}/set/time/light"
        
        for color, key in [('red', 'redColorTime'), ('green', 'greenColorTime'), ('yellow', 'yellowColorTime')]:
            if key in data:
                value = int(data[key])
                topic = f"{base_topic}/{color}"
                mqtt_client.publish(topic, value)
                log_message = f"{topic} {value}"
                logger.info(f"Publicado tiempo {color}: {value}")
                with open(LOG_FILE, "a") as f:
                    f.write(log_message + "\n")

        return jsonify({"status": "success", "message": "Valores publicados exitosamente"})

    except ValueError as e:
        logger.error(f"Valor no válido en la solicitud: {str(e)}")
        return jsonify({"status": "error", "message": "Valor no válido"}), 400

    except Exception as e:
        logger.error(f"Error en /send: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    try:
        with open(LOG_FILE, "r") as file:
            logs = [line.strip() for line in file.readlines() if line.strip()]
            return jsonify({"logs": logs[-10:][::-1]})
    except Exception as e:
        logger.error(f"Error leyendo los logs: {str(e)}")
        return jsonify({"logs": [], "error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Iniciando servidor Flask...")
    app.run(host='0.0.0.0', port=5000, debug=True)
