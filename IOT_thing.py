import paho.mqtt.client as mqtt
import random
import sys
import time
from collections import deque
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - Device %(device_id)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TrafficLight:
    def __init__(self, redColorTime, greenColorTime):
        self.redColorTime = redColorTime
        self.greenColorTime = greenColorTime
        self.current_state = "Red"  # Estado inicial

    def update(self, redColorTime=None, greenColorTime=None):
        if redColorTime is not None:
            self.redColorTime = redColorTime
        if greenColorTime is not None:
            self.greenColorTime = greenColorTime

if len(sys.argv) != 2:
    print("Usage: python3 IOT_thing.py <device_id>")
    sys.exit(1)

device_id = sys.argv[1].zfill(8)
logger.info("Iniciando dispositivo", extra={'device_id': device_id})

# Inicializar semáforo
traffic_light = TrafficLight(40, 40)

# Definir tópicos MQTT
base_topic = f"smartSemaphore/lora_Device/{device_id}"
topic_car_detection = f"{base_topic}/info/cars/detect"
topic_red = f"{base_topic}/info/time/light/red"
topic_green = f"{base_topic}/info/time/light/green"
topic_set_duration = f"{base_topic}/set/time/light/#"
topic_control = f"{base_topic}/control"
topic_iot_status = f"{base_topic}/status/iot"
topic_current_state = f"{base_topic}/status/current"

# Almacenar solo los últimos 10 logs
log_queue = deque(maxlen=10)

def save_logs():
    try:
        log_file = f"mqtt_logs_{device_id}.txt"
        logger.info(f"Guardando logs en: {log_file}", extra={'device_id': device_id})
        with open(log_file, "w") as file:
            file.writelines(log_queue)
    except Exception as e:
        logger.error(f"Error al guardar logs: {e}", extra={'device_id': device_id})

def on_connect(client, userdata, flags, rc):
    logger.info(f"Connected with result code {rc}", extra={'device_id': device_id})
    client.subscribe(topic_set_duration)
    client.subscribe(topic_control)
    client.publish(topic_iot_status, "Connected", qos=1)
    logger.info("Suscrito a tópicos y estado publicado", extra={'device_id': device_id})

def on_disconnect(client, userdata, rc):
    logger.warning(f"Disconnected with result code {rc}", extra={'device_id': device_id})
    if rc != 0:
        logger.error("Unexpected disconnection. Attempting to reconnect...", extra={'device_id': device_id})

def on_message(client, userdata, msg):
    try:
        message = f"{msg.topic} {msg.payload.decode()}"
        logger.info(f"Mensaje recibido: {message}", extra={'device_id': device_id})

        log_queue.append(message + "\n")
        save_logs()

        topic_received = msg.topic
        payload = msg.payload.decode()

        if topic_received == topic_control:
            try:
                key, value = payload.split("=")
                value = int(value)

                if key == "red":
                    traffic_light.redColorTime = value
                elif key == "green":
                    traffic_light.greenColorTime = value

                logger.info(f"🔄 {key} actualizado a {value} segundos", extra={'device_id': device_id})
            except Exception as e:
                logger.error(f"❌ Error procesando mensaje: {e}", extra={'device_id': device_id})
    except Exception as e:
        logger.error(f"Error en on_message: {e}", extra={'device_id': device_id})

# Configurar cliente MQTT
mqttc = mqtt.Client()
mqttc.on_connect = on_connect
mqttc.on_message = on_message
mqttc.on_disconnect = on_disconnect

try:
    logger.info("Intentando conectar al broker MQTT...", extra={'device_id': device_id})
    mqttc.connect("localhost", 1883, 60)
    mqttc.loop_start()
except Exception as e:
    logger.error(f"Error al conectar al broker MQTT: {e}", extra={'device_id': device_id})
    sys.exit(1)

counterEv = 0

while True:
    try:
        # Publicar los tiempos de los semáforos
        mqttc.publish(topic_red, traffic_light.redColorTime, qos=1)
        mqttc.publish(topic_green, traffic_light.greenColorTime, qos=1)
        mqttc.publish(topic_current_state, traffic_light.current_state, qos=1)
        mqttc.publish(topic_iot_status, "Connected", qos=1)

        # Guardar logs
        log_queue.append(f"{topic_red} {traffic_light.redColorTime}\n")
        log_queue.append(f"{topic_green} {traffic_light.greenColorTime}\n")
        log_queue.append(f"{topic_current_state} {traffic_light.current_state}\n")
        log_queue.append(f"{topic_iot_status} Connected\n")
        save_logs()

        # Alternar estado
        traffic_light.current_state = "Green" if traffic_light.current_state == "Red" else "Red"

        time.sleep(1)

        # Cada 5 segundos, publicar la detección de autos
        if counterEv % 5 == 0:
            carDetection = random.randint(60, 100) if traffic_light.redColorTime < 40 else random.randint(10, 43)
            mqttc.publish(topic_car_detection, carDetection, qos=1)
            log_queue.append(f"{topic_car_detection} {carDetection}\n")
            save_logs()

        counterEv += 1
        if counterEv == 10000:
            counterEv = 0
    except Exception as e:
        logger.error(f"Error en el ciclo principal: {e}", extra={'device_id': device_id})
        time.sleep(1)  # Esperar antes de intentar de nuevo