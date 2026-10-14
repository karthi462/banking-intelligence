import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from app.api.endpoints import router

app = FastAPI(
    title="APEX BANK Transaction Intelligence API",
    description="Advanced Time-Series Financial Analytics, Anomaly Detection, and Forecasting API",
    version="1.0.0"
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes under /api
app.include_router(router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "APEX BANK Intelligence Engine"
    }

# Check for compiled frontend dist folder
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist) and os.path.isdir(os.path.join(frontend_dist, "assets")):
    # Serve Vite compiled assets
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Serve public static assets (favicon, images, etc.) if they exist in dist
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")

        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html for React Router SPA
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
else:
    @app.get("/")
    def read_root():
        return HTMLResponse("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>APEX BANK - Backend API Online</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #070d1f;
              color: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 1rem;
            }
            .card {
              background: #0f172a;
              border: 1px solid #1e293b;
              border-radius: 1.5rem;
              padding: 2.5rem;
              max-width: 520px;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;
              background: #022c22;
              color: #34d399;
              border: 1px solid #065f46;
              padding: 0.35rem 0.85rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 1.25rem;
            }
            h1 {
              font-size: 1.75rem;
              font-weight: 800;
              color: #ffffff;
              margin: 0 0 0.5rem 0;
            }
            .highlight {
              color: #2dd4bf;
            }
            p {
              color: #94a3b8;
              font-size: 0.9rem;
              line-height: 1.6;
              margin: 0 0 1.5rem 0;
            }
            .btn {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              background: #2563eb;
              color: #ffffff;
              font-weight: 700;
              font-size: 0.875rem;
              padding: 0.75rem 1.5rem;
              border-radius: 0.75rem;
              text-decoration: none;
              transition: background 0.2s;
            }
            .btn:hover {
              background: #1d4ed8;
            }
            .links {
              margin-top: 1.5rem;
              display: flex;
              gap: 1rem;
              justify-content: center;
              font-size: 0.8rem;
            }
            .links a {
              color: #38bdf8;
              text-decoration: none;
            }
            .links a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">&#10003; FastAPI Engine Active</div>
            <h1>APEX<span class="highlight">BANK</span> Intelligence API</h1>
            <p>The backend analytics server is running. All REST endpoints, time-series forecasting, and anomaly detection services are live.</p>
            <a href="/docs" class="btn">Open Interactive API Docs &rarr;</a>
            <div class="links">
              <a href="/api/health" target="_blank">&#9881; Health Check</a>
              <span style="color:#475569">•</span>
              <a href="/api/datasets/summary" target="_blank">&#128202; Dataset Summary</a>
            </div>
          </div>
        </body>
        </html>
        """)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
