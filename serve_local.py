# Local preview: python3 serve_local.py  ->  http://127.0.0.1:8765
import os, sys, http.server, socketserver
os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), H) as s:
    print(f"serving on http://127.0.0.1:{PORT}", flush=True); s.serve_forever()
