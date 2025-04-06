Te explico el flujo completo del sistema:
Frontend (client/src/components/TrafficLightControl.tsx):

Cuando presionas un botón submit, se hace una petición POST a http://0.0.0.0:5000/send
Los datos incluyen el device_id (ej: "00000002") y el tiempo (inputGreen o inputRed)

Servidor Python (server.py):

Recibe la petición POST en la ruta /send
Construye el topic MQTT: "smartSemaphore/lora_Device/{device_id}/set/time/light/{color}"
Publica el mensaje al broker MQTT (HiveMQ)
Guarda el log en mqtt_logs.txt

Dispositivos físicos (simulados por simulator.py):

Están suscritos a sus topics específicos (ej: "smartSemaphore/lora_Device/00000002/#")
Reciben los mensajes y actualizan sus tiempos
Publican feedback y detección de carros cada 5 segundos

Servidor Node (server/index.ts):

Se conecta al broker MQTT (HiveMQ)
Está suscrito a todos los topics (#)
Mantiene los últimos 10 logs en memoria
Envía los logs por WebSocket a los clientes

Frontend (otra vez):

Se conecta al WebSocket para recibir logs en tiempo real
Hace polling cada 2 segundos al endpoint /logs para mantener los logs actualizados
Muestra los logs en la interfaz
Todo está conectado a través del broker MQTT público HiveMQ, que actúa como intermediario central. Los dispositivos físicos se simulan con simulator.py, que genera datos aleatorios de detección de carros.

EN ESTE CODIGO NO ESTOY USANDO MOSQUITTO!
En server.py se esta usando HiveMQ como broker MQTT:
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")

En server/index.ts también se esta usando HiveMQ:
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883'...)

Aunque tengo un container de Mosquitto y su configuración en el proyecto, no se está utilizando actualmente ya que tanto el servidor como el cliente están configurados para usar HiveMQ como broker MQTT público.
