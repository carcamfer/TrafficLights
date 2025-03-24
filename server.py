from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/logs')
def get_logs():
    try:
        with open('mqtt_logs.txt', 'r') as f:
            logs = f.readlines()
            # Devolver los últimos 10 logs, limpios y en orden inverso
            return jsonify([log.strip() for log in logs[-10:]][::-1])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)