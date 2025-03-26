#!/bin/bash

# Matar cualquier proceso anterior de IOT_thing.py
pkill -f "python3 IOT_thing.py"

# Esperar un momento para asegurar que los procesos anteriores se cerraron
sleep 2

# Iniciar 10 instancias del simulador
for i in {1..10}
do
    python3 IOT_thing.py $i &
    echo "Iniciando simulador para semáforo $i"
    sleep 1
done

echo "Todos los simuladores iniciados"
