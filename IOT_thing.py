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
        self.currentState = "red"

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

device_id = sys.argv[1].zfill(8)  # Asegura que el ID tenga 8 dígitos
print(f"Hello, I am the device {device_id}")

# Inicializar el semáforo con tiempos por defecto
traffic_light = TrafficLight(40, 40, 1)

# Configuración de tópicos MQTT
base_topic = f"smartSemaphore/lora_Device/{device_id}"
topic_car_detection = f"{base_topic}/info/cars/detect"
topic_red = f"{base_topic}/info/time/light/red"
topic_green = f"{base_topic}/info/time/light/green"
topic_set_duration = f"{base_topic}/set/time/light/#"
topic_state = f"{base_topic}/info/state"
topic_iot_status = f"{base_topic}/info/iot_status"

# Cola para almacenar logs
log_queue = deque(maxlen=10)

def save_logs():
    with open("mqtt_logs.txt", "w") as file:
        file.writelines(log_queue)

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(topic_set_duration)
    client.publish(topic_iot_status, "connected")

def on_message(client, userdata, msg):
    message = f"{msg.topic} {msg.payload.decode()}"
    print(message)
    log_queue.append(message + "\n")
    save_logs()

    topic_received = msg.topic
    if "light/red" in topic_received:
        userdata.redColorTime = int(msg.payload.decode())
        userdata.updatePub = 1
    elif "light/green" in topic_received:
        userdata.greenColorTime = int(msg.payload.decode())
        userdata.updatePub = 1

    client.user_data_set(userdata)

# Configurar cliente MQTT
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, userdata=traffic_light)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

# Conectar al broker MQTT
mqttc.connect("localhost", 1883, 60)
mqttc.loop_start()

counterEv = 0

while True:
    dataUsr = mqttc.user_data_get()
    
    # Alternar estado entre rojo y verde
    if dataUsr.currentState == "red":
        dataUsr.currentState = "green"
    else:
        dataUsr.currentState = "red"

    # Publicar tiempos y estado actual
    mqttc.publish(topic_red, dataUsr.redColorTime)
    mqttc.publish(topic_green, dataUsr.greenColorTime)
    mqttc.publish(topic_state, dataUsr.currentState)

    # Guardar logs de los tiempos y estado
    log_queue.append(f"{topic_red} {dataUsr.redColorTime}\n")
    log_queue.append(f"{topic_green} {dataUsr.greenColorTime}\n")
    log_queue.append(f"{topic_state} {dataUsr.currentState}\n")
    save_logs()

    dataUsr.updatePub = 0
    mqttc.user_data_set(dataUsr)

    time.sleep(1)  # Esperar 1 segundo

    # Simular detección de carros cada 5 iteraciones
    if counterEv % 5 == 0:
        carDetection = random.randint(60, 100) if dataUsr.redColorTime < 40 else random.randint(10, 43)
        mqttc.publish(topic_car_detection, carDetection)
        log_queue.append(f"{topic_car_detection} {carDetection}\n")
        save_logs()

    counterEv += 1
    if counterEv == 10000:
        counterEv = 0
