"""
AeroAI Server Launcher
Runs FastAPI backend serving both REST API endpoints and static frontend on port 8000.
"""

import os
import sys

# Configure UTF-8 encoding for standard output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import uvicorn

if __name__ == "__main__":
    # Ensure current directory is in sys.path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if base_dir not in sys.path:
        sys.path.insert(0, base_dir)
        
    print("=" * 60)
    print("[*] Starting AeroAI ML Air Quality Prediction Server...")
    print("[*] Dashboard URL: http://localhost:8000")
    print("[*] API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
