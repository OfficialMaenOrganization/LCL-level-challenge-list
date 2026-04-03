#!/usr/bin/env python3
"""
Simple Python server for LCL - Syncs data across browsers
No npm or Node.js required!
"""

import json
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time

DATA_FILE = 'lcl_data.json'
PORT = int(os.environ.get('PORT', 3000))

def load_data():
    """Load data from file or create default"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARN] Could not load {DATA_FILE}: {e} — using defaults", flush=True)

    return {
        "users": [
            {
                "id": "admin1",
                "email": "maencopra@gmail.com",
                "displayName": "Admin",
                "password": "maenissocool12345gGs",
                "isAdmin": True
            }
        ],
        "levels": [
            {
                "id": 1,
                "name": "Stereo Madness",
                "levelId": 1,
                "url": "https://example.com/level1",
                "youtubeUrl": "https://youtube.com/watch?v=example1",
                "thumbnail": "https://via.placeholder.com/300x200?text=Stereo+Madness",
                "difficulty": "Easy",
                "submittedBy": "Admin",
                "submittedDate": time.strftime('%Y-%m-%dT%H:%M:%S'),
                "status": "approved"
            }
        ],
        "pendingLevels": [],
        "settings": {
            "theme": "dark",
            "language": "en",
            "darkBackground": True
        }
    }

def save_data(data):
    """Save data to file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Load initial data
current_data = load_data()
save_data(current_data)

class LCLHandler(SimpleHTTPRequestHandler):
    """HTTP Request Handler with API support"""

    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            global current_data
            self.wfile.write(json.dumps(current_data).encode())
            print(f"[{time.strftime('%H:%M:%S')}] GET /api/data -> 200", flush=True)
        elif path == '/' or path == '':
            # Explicitly serve index.html for the root path
            self._serve_file('index.html', 'text/html')
        else:
            # Serve other static files via SimpleHTTPRequestHandler
            try:
                super().do_GET()
            except Exception as e:
                print(f"[{time.strftime('%H:%M:%S')}] ERROR serving {path}: {e}", flush=True)
                self._send_error(500, "Internal Server Error")

    def _serve_file(self, filename, content_type):
        """Serve a specific file by name from the working directory"""
        filepath = os.path.join(os.getcwd(), filename)
        if not os.path.exists(filepath):
            print(f"[{time.strftime('%H:%M:%S')}] 404 {filename} not found at {filepath}", flush=True)
            self._send_error(404, f"File not found: {filename}")
            return
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
            print(f"[{time.strftime('%H:%M:%S')}] GET {self.path} -> 200 ({filename}, {len(content)} bytes)", flush=True)
        except Exception as e:
            print(f"[{time.strftime('%H:%M:%S')}] ERROR reading {filename}: {e}", flush=True)
            self._send_error(500, "Internal Server Error")

    def _send_error(self, code, message):
        """Send a plain-text error response"""
        body = message.encode()
        self.send_response(code)
        self.send_header('Content-type', 'text/plain')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/data':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)

            try:
                global current_data
                current_data = json.loads(body.decode())
                save_data(current_data)

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                print(f"[{time.strftime('%H:%M:%S')}] POST /api/data -> 200 (data saved)", flush=True)
            except Exception as e:
                print(f"[{time.strftime('%H:%M:%S')}] ERROR in POST /api/data: {e}", flush=True)
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            body = json.dumps({"error": "Not Found"}).encode()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(body)

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Use stdout logging instead of stderr default"""
        print(f"[{time.strftime('%H:%M:%S')}] {format % args}", flush=True)

def run_server():
    """Start the server"""
    server_address = ('0.0.0.0', PORT)
    httpd = HTTPServer(server_address, LCLHandler)

    print("=" * 45, flush=True)
    print("  LCL - Level Challenge List Server", flush=True)
    print("=" * 45, flush=True)
    print(f"  Listening on  : 0.0.0.0:{PORT}", flush=True)
    print(f"  Working dir   : {os.getcwd()}", flush=True)
    print(f"  Data file     : {os.path.abspath(DATA_FILE)}", flush=True)
    print(f"  index.html    : {'FOUND' if os.path.exists('index.html') else 'MISSING'}", flush=True)
    print("=" * 45, flush=True)
    sys.stdout.flush()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped", flush=True)

if __name__ == '__main__':
    run_server()
