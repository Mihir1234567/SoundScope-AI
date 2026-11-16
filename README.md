# 🎵 SoundScope AI: Spotify Music Analytics, Popularity Prediction & Discovery Studio

**Author**: Kashish  
**Course**: AI & Machine Learning Final Project  
**Date**: November 2026  
**Architecture**: Full-Stack AIML (FastAPI Backend + Modern Dark-Mode Web Frontend + Streamlit Dashboard + Jupyter Research Notebook)

---

## 📌 1. Project Overview & Business Problem

In modern streaming platforms like **Spotify** (over 100+ million active songs), understanding what acoustic elements drive commercial popularity and building sub-second content discovery are essential industry challenges.

**SoundScope AI** is a complete, production-grade Machine Learning solution featuring:

1. **Core ML Research Notebook** (`Kashish_AIML_Project.ipynb`): End-to-end data science lifecycle (data cleaning, deduplication, feature engineering, EDA, unsupervised clustering, 4-model regression benchmarking, hyperparameter tuning, explainability diagnostics, and model export).
2. **FastAPI Backend REST API** (`backend/`): Industrial REST API with Pydantic validation schemas, CORS, and endpoints for prediction, what-if simulations, recommendations, and music discovery.
3. **Modern Spotify Dark-Mode Frontend** (`frontend/`): Responsive, glassmorphic UI featuring live acoustic sliders, real-time popularity gauge, interactive "What-If" simulator, track autocomplete search, and Chart.js metrics.
4. **Interactive Streamlit App** (`app.py`): Alternate single-file dashboard for rapid prototyping.

---

## 🏗️ 2. Full-Stack System Architecture

```
                                  [ User Browser ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [ Modern Web UI (Port 8000) ]              [ Streamlit App (Port 8501) ]
         HTML5 / CSS3 / Vanilla JS                    app.py Dashboard
                   │                                           │
                   ▼ (REST JSON API)                           │
      [ FastAPI Backend (Port 8000) ]                          │
       ├── /api/predict-popularity                             │
       ├── /api/simulate-what-if                               │
       ├── /api/recommend                                      │
       ├── /api/discover                                       │
       └── /api/metrics                                        │
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                             [ Serialized ML Pipeline ]
                             ├── HistGradientBoosting (Tuned)
                             ├── K-Means Mood Clustering (k=4)
                             ├── NearestNeighbors (Cosine Index)
                             └── StandardScalers & Preprocessors
```

---

## 📊 3. Machine Learning Benchmark Results

| Model Architecture               | Cross-Validation MAE | Cross-Validation RMSE | Cross-Validation $R^2$ | Test Set $R^2$ | Test Set MAE |
| :------------------------------- | :------------------: | :-------------------: | :--------------------: | :------------: | :----------: |
| **Baseline (Dummy Mean)**        |        17.12         |         20.45         |        -0.0001         |     0.0000     |    17.12     |
| **Ridge Regression (L2)**        |        12.02         |         16.84         |         0.3220         |     0.3218     |    12.01     |
| **Decision Tree Regressor**      |        12.85         |         17.65         |         0.2580         |     0.2612     |    12.78     |
| **HistGradientBoosting (Tuned)** |      **11.36**       |       **15.74**       |       **0.4082**       |   **0.4082**   |  **11.36**   |

### 💡 Domain Insight & Error Analysis:

In commercial music analytics, acoustic properties naturally explain ~41% of popularity variance. Commercial hit-making is heavily mediated by exogenous social variables: marketing spend, TikTok viral trends, radio play, and artist stardom. Achieving an $R^2 \approx 0.41$ solely from acoustic and genre data is a realistic, honest ceiling.

---

## 🧠 4. Core Modules & Endpoints

### 🎯 1. Popularity Predictor & "What-If" Studio

- **API**: `POST /api/predict-popularity`
- **API**: `POST /api/simulate-what-if`
- Predicts track popularity $[0, 100]$ and automatically detects the song's **Mood Cluster** (_Energetic & Euphoric_, _Chill & Acoustic_, _Intense & Heavy_, _Mellow & Reflective_).
- Allows adjusting a single parameter (e.g. increasing energy or tempo) to see the exact popularity score delta.

### 🎧 2. Scalable Content-Based Recommender

- **API**: `POST /api/recommend`
- Uses an indexed **`NearestNeighbors`** model with **Cosine Similarity** over 9-dimensional acoustic space.
- Delivers sub-second queries with similarity match percentages.

### 🧭 3. Intelligent Discovery Advisor

- **API**: `POST /api/discover`
- Parametric search filtering by genre, mood, minimum danceability, and target workout/study BPM.

### 📖 4. Interactive Swagger API Docs

- **URL**: `http://127.0.0.1:8000/docs`
- Interactive OpenAPI documentation for every endpoint with request/response schemas.

---

## 🚀 5. Quickstart: How to Run

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Launch the Full-Stack Application (Backend + Frontend)

Run the server runner script:

```bash
python run_server.py
```

_(On Windows, you can also double-click `run.bat`)_

This will automatically launch the **FastAPI Backend** and open the **Modern Web UI** in your browser at:

- **Frontend Web App**: `http://127.0.0.1:8000`
- **Swagger API Documentation**: `http://127.0.0.1:8000/docs`

### (Optional) Step 3: Launch Streamlit Dashboard

If you want to view the alternate Streamlit UI:

```bash
streamlit run app.py
```

### (Optional) Step 4: Open the Research Notebook

```bash
jupyter notebook Kashish_AIML_Project.ipynb
```

---

## 📁 6. Repository Structure

```
d:\CLG\Kashish\
├── backend/
│   ├── main.py                          # FastAPI REST API application & static file server
│   ├── schemas.py                       # Pydantic request/response data models
│   └── services.py                      # Model loading, inference, recommender & what-if engine
├── frontend/
│   ├── index.html                       # Modern Spotify-themed responsive Web UI
│   ├── style.css                        # Glassmorphic dark theme styles & animations
│   └── app.js                           # Reactive client-side logic & API integration
├── Kashish_AIML_Project.ipynb           # Complete research notebook (31 fully-executed cells)
├── app.py                               # Alternate Streamlit Web Dashboard
├── run_server.py                        # One-click launcher for backend + frontend
├── run.bat                              # Windows batch script launcher
├── requirements.txt                     # Project dependencies
├── README.md                            # Comprehensive project documentation
├── dataset.csv                          # Full Spotify Tracks Dataset (114,000 tracks)
├── soundscope_clean_catalog.parquet     # Deduplicated high-speed catalog (89,740 tracks)
├── soundscope_sample_tracks.csv         # Sample track catalog
├── soundscope_popularity_pipeline.joblib# Serialized popularity prediction model
├── soundscope_nn_recommender.joblib     # Serialized NearestNeighbors recommender
├── soundscope_rec_scaler.joblib         # Scaler for recommender
├── soundscope_mood_kmeans.joblib        # K-Means mood clustering model
└── soundscope_mood_scaler.joblib        # Scaler for mood clustering
```
# SoundScope-AI
