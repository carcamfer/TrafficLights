import paho.mqtt.client as mqtt
import random
import sys
import time

class TrafficLight:
    def __init__(self, redColorTime, yellowColorTime, greenColorTime, updatePub):
        self.redColorTime = redColorTime
        self.yellowColorTime = yellowColorTime
        self.greenColorTime = greenColorTime
        self.updatePub = updatePub

    def update(self, redColorTime=None, yellowColorTime=None, greenColorTime=None, updatePub=None):
        if redColorTime is not None:
            self.redColorTime = redColorTime
        if yellowColorTime is not None:
            self.yellowColorTime = yellowColorTime
        if greenColorTime is not None:
            self.greenColorTime = greenColorTime
        if updatePub is not None:
            self.updatePub = updatePub

    def display(self):
        print(f"Red Light Time: {self.redColorTime} seconds")
        print(f"Yellow Light Time: {self.yellowColorTime} seconds")
        print(f"Green Light Time: {self.greenColorTime} seconds")
        print(f"Update Publisher: {self.updatePub}")

if len(sys.argv) != 2:
    print("Usage: python simulator.py <device_id>")
    sys.exit(1)

# Get the argument passed from the command line
argument = sys.argv[1]
str_unitID = argument.zfill(8)

print("Hello, I'm device " + str_unitID)

# Report TOPICS
strTopicBase = "smartSemaphore" + "/lora_Device/" + str_unitID
car_detectectTBase = strTopicBase + "/info/" + "cars/detect"
Topic_Red = strTopicBase + "/info/time" + "/light/" + "red"
Topic_Yellow = strTopicBase + "/info/time" + "/light/" + "yellow"
Topic_Green = strTopicBase + "/info/time" + "/light/" + "green"

TopicSetLDuration = strTopicBase + "/set/time/light/#"

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TopicSetLDuration)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
    strReceived = msg.topic

    if "light/red" in strReceived:
        traffic_light.redColorTime = int(msg.payload)
        traffic_light.updatePub = 1
    if "light/green" in strReceived:
        traffic_light.greenColorTime = int(msg.payload)
        traffic_light.updatePub = 1
    if "light/yellow" in strReceived:
        traffic_light.yellowColorTime = int(msg.payload)
        traffic_light.updatePub = 1

traffic_light = TrafficLight(40, 2, 40, 1)
traffic_light.display()

mqttc = mqtt.Client()
mqttc.on_connect = on_connect
mqttc.on_message = on_message

print("Connecting to MQTT broker...")
mqttc.connect("0.0.0.0", 1883, 60)
mqttc.loop_start()

counterEv = 0

while True:
    if traffic_light.updatePub == 1:
        mqttc.publish(Topic_Red, int(traffic_light.redColorTime))
        mqttc.publish(Topic_Yellow, int(traffic_light.yellowColorTime))
        mqttc.publish(Topic_Green, int(traffic_light.greenColorTime))
        traffic_light.updatePub = 0

    time.sleep(1)
    if(counterEv % 5 == 0):
        if traffic_light.redColorTime < 40:
            carDetection = random.randrange(60, 100)
        else:
            carDetection = random.randrange(10, 43)
        mqttc.publish(car_detectectTBase, carDetection)
        print(f"Publishing to {car_detectectTBase}: {carDetection}")
    counterEv = counterEv + 1
    if(counterEv == 10000):
        counterEv = 0