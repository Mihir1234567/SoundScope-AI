import uvicorn
import webbrowser
import time
import threading

def open_browser():
    time.sleep(1.5)
    print("Opening SoundScope AI Web Application in your browser: http://127.0.0.1:8000")
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    print("=" * 60)
    print("🎵 Starting SoundScope AI - Backend API & Frontend Dashboard")
    print("=" * 60)
    print(" - Backend API Docs : http://127.0.0.1:8000/docs")
    print(" - Frontend Web App : http://127.0.0.1:8000")
    print("=" * 60)

    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
