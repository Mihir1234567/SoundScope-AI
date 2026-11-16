import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.schemas import (
    TrackPredictionRequest, PredictionResponse,
    WhatIfRequest, WhatIfResponse,
    RecommendationRequest, RecommendedTrack,
    DiscoveryRequest
)
from backend.services import ml_service

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

app = FastAPI(
    title="SoundScope AI API",
    description="Backend Machine Learning REST API for Spotify Music Analytics, Popularity Prediction & Discovery",
    version="1.0.0"
)

# Enable CORS for external frontend or local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SoundScope AI Backend",
        "models_loaded": ml_service.pipeline is not None,
        "catalog_size": len(ml_service.catalog_df) if ml_service.catalog_df is not None else 0
    }

@app.get("/api/genres")
def get_genres():
    return {"genres": ml_service.get_genres()}

@app.get("/api/tracks/search")
def search_tracks(q: str = Query(..., min_length=1)):
    return {"results": ml_service.search_tracks(q)}

@app.post("/api/predict-popularity", response_model=PredictionResponse)
def predict_popularity(req: TrackPredictionRequest):
    try:
        result = ml_service.predict_popularity(req.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate-what-if", response_model=WhatIfResponse)
def simulate_what_if(req: WhatIfRequest):
    try:
        baseline = req.baseline_features.model_dump() if req.baseline_features else None
        result = ml_service.simulate_what_if(
            track_name=req.track_name,
            baseline=baseline,
            modify_feature=req.modify_feature,
            new_value=req.new_value
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend")
def recommend_tracks(req: RecommendationRequest):
    try:
        recs = ml_service.recommend(track_name=req.track_name, top_n=req.top_n)
        return {"track_name": req.track_name, "recommendations": recs}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/discover")
def discover_music(req: DiscoveryRequest):
    try:
        results = ml_service.discover(
            genre=req.preferred_genre,
            mood=req.preferred_mood,
            min_danceability=req.min_danceability,
            min_energy=req.min_energy,
            target_tempo=req.target_tempo,
            max_results=req.max_results
        )
        return {"count": len(results), "discoveries": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics")
def get_metrics():
    return {
        "benchmarks": [
            {"model": "Baseline (Dummy Mean)", "mae": 17.12, "rmse": 20.45, "r2": -0.0001},
            {"model": "Ridge Regression (L2)", "mae": 12.02, "rmse": 16.84, "r2": 0.3220},
            {"model": "Decision Tree Regressor", "mae": 12.85, "rmse": 17.65, "r2": 0.2580},
            {"model": "HistGradientBoosting (Tuned)", "mae": 11.36, "rmse": 15.74, "r2": 0.4082}
        ],
        "top_features": [
            {"feature": "track_genre", "importance": 0.185},
            {"feature": "artist_track_count", "importance": 0.082},
            {"feature": "loudness", "importance": 0.045},
            {"feature": "acousticness", "importance": 0.038},
            {"feature": "energy", "importance": 0.031},
            {"feature": "duration_min", "importance": 0.024},
            {"feature": "danceability", "importance": 0.019},
            {"feature": "valence", "importance": 0.014}
        ]
    }

# Mount Frontend static files
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def serve_frontend():
        index_file = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend index.html not found"}
