#!/bin/bash

# Matar cualquier proceso anterior
pkill -f "python3 IOT_thing.py"
pkill -f mosquitto

# Esperar un momento para asegurar que los procesos anteriores se cerraron
sleep 2

# Iniciar el broker MQTT
echo "Iniciando broker MQTT..."
mosquitto -c mosquitto.conf &
sleep 2  # Esperar a que el broker inicie

# Iniciar 10 instancias del simulador
for i in {1..10}
do
    nohup python3 IOT_thing.py $i > /dev/null 2>&1 &
    echo "Iniciando simulador para semáforo $i"
    # Esperar un segundo entre cada inicio para evitar conflictos
    sleep 1
done

# Verificar que los procesos están corriendo
echo "Verificando procesos iniciados:"
ps aux | grep "python3 IOT_thing.py" | grep -v grep

echo "Todos los simuladores iniciados"

# Mostrar los archivos de log creados
echo "Archivos de log creados:"
ls -l mqtt_logs_*.txt

# Mantener el script ejecutándose para que los procesos en background no se cierren
tail -f mqtt_logs_*.txt