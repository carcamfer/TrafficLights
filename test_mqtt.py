import paho.mqtt.client as mqtt
import time

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("test/#")
    print("Subscribed to test/#")

def on_message(client, userdata, msg):
    print(f"Received message on {msg.topic}: {msg.payload.decode()}")

print("Starting MQTT test client...")
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

try:
    print("Connecting to broker...")
    client.connect("localhost", 1883, 60)
    client.loop_start()
    
    # Publish test messages
    for i in range(3):
        topic = "test/message"
        message = f"Test message {i}"
        print(f"Publishing: {message}")
        client.publish(topic, message)
        time.sleep(1)
    
    print("Test complete. Press Ctrl+C to exit.")
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Exiting...")
    client.loop_stop()
    client.disconnect()
except Exception as e:
    print(f"Error: {e}")
