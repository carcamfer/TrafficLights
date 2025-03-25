from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LOG_FILE = "mqtt_logs.txt"

@app.route('/logs', methods=['GET'])
def get_logs():
    try:
        # Obtener ruta absoluta del archivo
        abs_path = os.path.abspath(LOG_FILE)
        logger.info(f"Intentando leer logs desde: {abs_path}")

        with open(LOG_FILE, "r") as file:
            raw_logs = file.readlines()
            # Limpiar y formatear logs
            logs = [line.strip() for line in raw_logs if line.strip()]
            # Tomar los últimos 10 logs y revertir el orden
            logs = logs[-10:][::-1]
            logger.info(f"Returning {len(logs)} log entries")
            logger.debug(f"Log content: {logs}")
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