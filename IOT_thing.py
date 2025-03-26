import paho.mqtt.client as mqtt
import random
import sys
import time
from collections import deque

class TrafficLight:
    def __init__(self, redColorTime, greenColorTime, updatePub):
        self.redColorTime = redColorTime
        self.greenColorTime = greenColorTime
        self.updatePub = updatePub
        self.current_state = "Red"  # Estado inicial

    def update(self, redColorTime=None, greenColorTime=None, updatePub=None):
        if redColorTime is not None:
            self.redColorTime = redColorTime
        if greenColorTime is not None:
            self.greenColorTime = greenColorTime
        if updatePub is not None:
            self.updatePub = updatePub

if len(sys.argv) != 2:
    print("Usage: python3 IOT_thing.py <device_id>")
    sys.exit(1)

device_id = sys.argv[1].zfill(8)
print(f"Hello, I am the device {device_id}")

# Inicializar semáforo
traffic_light = TrafficLight(40, 40, 1)

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
    with open("mqtt_logs.txt", "w") as file:
        file.writelines(log_queue)

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(topic_set_duration)
    client.subscribe(topic_control)
    client.publish(topic_iot_status, "Connected")

def on_message(client, userdata, msg):
    message = f"{msg.topic} {msg.payload.decode()}"
    print(message)

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

            print(f"🔄 {key} actualizado a {value} segundos")
        except Exception as e:
            print(f"❌ Error procesando mensaje: {e}")

# Configurar cliente MQTT
mqttc = mqtt.Client()
mqttc.on_connect = on_connect
mqttc.on_message = on_message

mqttc.connect("localhost", 1883, 60)
mqttc.loop_start()

counterEv = 0

while True:
    # Publicar los tiempos de los semáforos
    mqttc.publish(topic_red, traffic_light.redColorTime)
    mqttc.publish(topic_green, traffic_light.greenColorTime)
    mqttc.publish(topic_current_state, traffic_light.current_state)
    mqttc.publish(topic_iot_status, "Connected")

    # Guardar logs
    log_queue.append(f"{topic_red} {traffic_light.redColorTime}\n")
    log_queue.append(f"{topic_green} {traffic_light.greenColorTime}\n")
    save_logs()

    # Alternar estado
    traffic_light.current_state = "Green" if traffic_light.current_state == "Red" else "Red"

    time.sleep(1)

    # Cada 5 segundos, publicar la detección de autos
    if counterEv % 5 == 0:
        carDetection = random.randint(60, 100) if traffic_light.redColorTime < 40 else random.randint(10, 43)
        mqttc.publish(topic_car_detection, carDetection)
        log_queue.append(f"{topic_car_detection} {carDetection}\n")
        save_logs()

    counterEv += 1
    if counterEv == 10000:
        counterEv = 0