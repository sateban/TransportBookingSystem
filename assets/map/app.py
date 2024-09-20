from flask import Flask, send_from_directory
from flask_cors import CORS  # Import Flask-CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define the directory where your PBF files are located
TILE_DIR = './philippines-latest.osm.pbf'

@app.route('/tiles/<path:filename>')
def serve_pbf(filename):
    # Serve PBF files from the TILE_DIR
    return send_from_directory(TILE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
