from pydantic import BaseModel, Field
from typing import List, Optional

class TrackPredictionRequest(BaseModel):
    danceability: float = Field(0.75, ge=0.0, le=1.0)
    energy: float = Field(0.80, ge=0.0, le=1.0)
    loudness: float = Field(-5.5, ge=-60.0, le=5.0)
    speechiness: float = Field(0.06, ge=0.0, le=1.0)
    acousticness: float = Field(0.15, ge=0.0, le=1.0)
    instrumentalness: float = Field(0.00, ge=0.0, le=1.0)
    liveness: float = Field(0.12, ge=0.0, le=1.0)
    valence: float = Field(0.65, ge=0.0, le=1.0)
    tempo: float = Field(120.0, ge=40.0, le=250.0)
    duration_min: float = Field(3.2, ge=0.1, le=30.0)
    artist_track_count: int = Field(8, ge=1, le=100)
    explicit: bool = False
    key: int = Field(0, ge=0, le=11)
    mode: int = Field(1, ge=0, le=1)
    time_signature: int = Field(4, ge=3, le=7)
    track_genre: str = Field("pop")

class PredictionResponse(BaseModel):
    predicted_popularity: float
    mood_label: str
    commercial_rating: str
    confidence_tier: str

class WhatIfRequest(BaseModel):
    track_name: Optional[str] = None
    baseline_features: Optional[TrackPredictionRequest] = None
    modify_feature: str
    new_value: float

class WhatIfResponse(BaseModel):
    track_name: str
    feature_modified: str
    original_value: float
    simulated_value: float
    original_prediction: float
    simulated_prediction: float
    popularity_delta: float

class RecommendationRequest(BaseModel):
    track_name: str
    top_n: int = Field(5, ge=1, le=20)

class RecommendedTrack(BaseModel):
    track: str
    artist: str
    genre: str
    mood: str
    popularity: int
    similarity: float

class DiscoveryRequest(BaseModel):
    preferred_genre: Optional[str] = None
    preferred_mood: Optional[str] = None
    min_danceability: float = 0.0
    min_energy: float = 0.0
    target_tempo: Optional[float] = None
    max_results: int = 10
