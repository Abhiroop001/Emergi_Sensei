import os
import sys
import uvicorn

# Ensure the backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Also ensure repo root is in sys.path
repo_root = os.path.dirname(backend_dir)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False, app_dir=backend_dir)
