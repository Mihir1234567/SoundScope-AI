document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. NAVIGATION & TAB SWITCHING
    // -------------------------------------------------------------
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(n => n.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));

            item.classList.add("active");
            const targetId = item.getAttribute("data-tab");
            document.getElementById(targetId).classList.add("active");

            if (targetId === "tab-insights") {
                renderImportanceChart();
            }
        });
    });

    // -------------------------------------------------------------
    // 2. BACKEND HEALTH CHECK & GENRE INITIALIZATION
    // -------------------------------------------------------------
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.getElementById("backend-status");
    const genreSelect = document.getElementById("pred-genre");
    const discGenreSelect = document.getElementById("disc-genre");

    async function initBackend() {
        try {
            const res = await fetch("/api/health");
            const data = await res.json();
            if (data.status === "healthy") {
                statusDot.classList.add("online");
                statusText.innerText = "FastAPI Online";
            }
        } catch (e) {
            statusText.innerText = "API Offline";
            console.error("Health check error:", e);
        }

        try {
            const res = await fetch("/api/genres");
            const data = await res.json();
            if (data.genres && data.genres.length > 0) {
                genreSelect.innerHTML = "";
                data.genres.forEach(g => {
                    const opt1 = document.createElement("option");
                    opt1.value = g;
                    opt1.innerText = g.charAt(0).toUpperCase() + g.slice(1);
                    if (g === "pop") opt1.selected = true;
                    genreSelect.appendChild(opt1);

                    const opt2 = document.createElement("option");
                    opt2.value = g;
                    opt2.innerText = g.charAt(0).toUpperCase() + g.slice(1);
                    discGenreSelect.appendChild(opt2);
                });
            }
        } catch (e) {
            console.error("Genre fetch error:", e);
        }
    }

    initBackend();

    // -------------------------------------------------------------
    // 3. SLIDER VALUE BADGE SYNC
    // -------------------------------------------------------------
    const sliders = [
        { id: "pred-danceability", badge: "val-danceability" },
        { id: "pred-energy", badge: "val-energy" },
        { id: "pred-valence", badge: "val-valence" },
        { id: "pred-loudness", badge: "val-loudness" },
        { id: "pred-acousticness", badge: "val-acousticness" },
        { id: "pred-speechiness", badge: "val-speechiness" },
        { id: "pred-tempo", badge: "val-tempo" },
        { id: "whatif-slider", badge: "val-whatif" },
        { id: "disc-dance", badge: "val-disc-dance" },
        { id: "disc-energy", badge: "val-disc-energy" }
    ];

    sliders.forEach(s => {
        const el = document.getElementById(s.id);
        const b = document.getElementById(s.badge);
        if (el && b) {
            el.addEventListener("input", (e) => {
                b.innerText = e.target.value;
                if (s.id === "whatif-slider") {
                    runWhatIf();
                }
            });
        }
    });

    // -------------------------------------------------------------
    // 4. POPULARITY PREDICTION & WHAT-IF LOGIC
    // -------------------------------------------------------------
    const btnPredict = document.getElementById("btn-predict");
    const resScore = document.getElementById("res-score");
    const resMood = document.getElementById("res-mood");
    const resRating = document.getElementById("res-rating");
    const resConfidence = document.getElementById("res-confidence");
    const resProgress = document.getElementById("res-progress");

    function getFormFeatures() {
        return {
            danceability: parseFloat(document.getElementById("pred-danceability").value),
            energy: parseFloat(document.getElementById("pred-energy").value),
            loudness: parseFloat(document.getElementById("pred-loudness").value),
            speechiness: parseFloat(document.getElementById("pred-speechiness").value),
            acousticness: parseFloat(document.getElementById("pred-acousticness").value),
            instrumentalness: 0.0,
            liveness: 0.12,
            valence: parseFloat(document.getElementById("pred-valence").value),
            tempo: parseFloat(document.getElementById("pred-tempo").value),
            duration_min: parseFloat(document.getElementById("pred-duration").value),
            artist_track_count: parseInt(document.getElementById("pred-artist-count").value),
            explicit: false,
            key: 0,
            mode: 1,
            time_signature: 4,
            track_genre: document.getElementById("pred-genre").value || "pop"
        };
    }

    let currentPrediction = 74.2;

    async function runPrediction() {
        btnPredict.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Predicting...';
        const payload = getFormFeatures();

        try {
            const res = await fetch("/api/predict-popularity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            currentPrediction = data.predicted_popularity;
            resScore.innerText = currentPrediction.toFixed(1);
            resMood.innerText = data.mood_label;
            resRating.innerText = data.commercial_rating;
            resConfidence.innerHTML = `Confidence Tier: <strong>${data.confidence_tier}</strong>`;
            resProgress.style.width = `${currentPrediction}%`;

            runWhatIf();
        } catch (e) {
            console.error("Prediction error:", e);
        } finally {
            btnPredict.innerHTML = '<i class="fa-solid fa-bolt"></i> Run Popularity Inference';
        }
    }

    btnPredict.addEventListener("click", runPrediction);

    // What-If Simulator
    const whatifSelect = document.getElementById("whatif-feature");
    const whatifSlider = document.getElementById("whatif-slider");
    const whatifNewScore = document.getElementById("whatif-new-score");
    const whatifDeltaBadge = document.getElementById("whatif-delta-badge");

    whatifSelect.addEventListener("change", () => {
        const feat = whatifSelect.value;
        if (feat === "loudness") {
            whatifSlider.min = "-30";
            whatifSlider.max = "0";
            whatifSlider.step = "0.5";
            whatifSlider.value = "-5";
        } else if (feat === "tempo") {
            whatifSlider.min = "60";
            whatifSlider.max = "200";
            whatifSlider.step = "1";
            whatifSlider.value = "128";
        } else {
            whatifSlider.min = "0";
            whatifSlider.max = "1";
            whatifSlider.step = "0.01";
            whatifSlider.value = "0.90";
        }
        document.getElementById("val-whatif").innerText = whatifSlider.value;
        runWhatIf();
    });

    async function runWhatIf() {
        const payload = {
            baseline_features: getFormFeatures(),
            modify_feature: whatifSelect.value,
            new_value: parseFloat(whatifSlider.value)
        };

        try {
            const res = await fetch("/api/simulate-what-if", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            whatifNewScore.innerText = `${data.simulated_prediction.toFixed(1)} / 100`;
            const delta = data.popularity_delta;
            whatifDeltaBadge.innerText = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts`;
            whatifDeltaBadge.className = `badge-delta ${delta >= 0 ? "positive" : "negative"}`;
        } catch (e) {
            console.error("What-If error:", e);
        }
    }

    // -------------------------------------------------------------
    // 5. RECOMMENDER ENGINE
    // -------------------------------------------------------------
    const recInput = document.getElementById("rec-query");
    const btnRec = document.getElementById("btn-run-rec");
    const recContainer = document.getElementById("rec-cards-list");
    const suggestionsBox = document.getElementById("search-suggestions");

    recInput.addEventListener("input", async () => {
        const q = recInput.value.trim();
        if (q.length < 2) {
            suggestionsBox.style.display = "none";
            return;
        }
        try {
            const res = await fetch(`/api/tracks/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                suggestionsBox.innerHTML = "";
                data.results.forEach(item => {
                    const div = document.createElement("div");
                    div.className = "suggestion-item";
                    div.innerText = `${item.track_name} - ${item.artists}`;
                    div.addEventListener("click", () => {
                        recInput.value = item.track_name;
                        suggestionsBox.style.display = "none";
                        fetchRecommendations(item.track_name);
                    });
                    suggestionsBox.appendChild(div);
                });
                suggestionsBox.style.display = "block";
            } else {
                suggestionsBox.style.display = "none";
            }
        } catch (e) {
            console.error(e);
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-card")) {
            suggestionsBox.style.display = "none";
        }
    });

    btnRec.addEventListener("click", () => {
        const query = recInput.value.trim();
        if (query) fetchRecommendations(query);
    });

    async function fetchRecommendations(trackName) {
        btnRec.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';
        recContainer.innerHTML = '<p class="text-muted">Computing 9-dimensional acoustic cosine similarities...</p>';

        try {
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ track_name: trackName, top_n: 6 })
            });
            const data = await res.json();

            if (data.recommendations && data.recommendations.length > 0) {
                recContainer.innerHTML = "";
                data.recommendations.forEach(t => {
                    const card = document.createElement("div");
                    card.className = "track-card";
                    card.innerHTML = `
                        <h4><i class="fa-solid fa-music text-muted"></i> ${t.track}</h4>
                        <p>${t.artist}</p>
                        <div class="track-pills">
                            <span class="pill similarity"><i class="fa-solid fa-fire"></i> ${t.similarity}% match</span>
                            <span class="pill">${t.genre}</span>
                            <span class="pill">${t.mood}</span>
                            <span class="pill">Pop: ${t.popularity}/100</span>
                        </div>
                    `;
                    recContainer.appendChild(card);
                });
            } else {
                recContainer.innerHTML = `<p class="text-muted">No acoustic matches found for '${trackName}'.</p>`;
            }
        } catch (e) {
            recContainer.innerHTML = `<p class="text-muted" style="color: #e74c3c;">Track not found or API error.</p>`;
        } finally {
            btnRec.innerHTML = '<i class="fa-solid fa-sparkles"></i> Find Similar';
        }
    }

    // Default recommendation run
    fetchRecommendations("Comedy");

    // -------------------------------------------------------------
    // 6. DISCOVERY ADVISOR
    // -------------------------------------------------------------
    const btnDisc = document.getElementById("btn-run-disc");
    const discTableArea = document.getElementById("disc-table-area");

    btnDisc.addEventListener("click", async () => {
        btnDisc.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Filtering...';
        const payload = {
            preferred_genre: document.getElementById("disc-genre").value,
            preferred_mood: document.getElementById("disc-mood").value,
            min_danceability: parseFloat(document.getElementById("disc-dance").value),
            min_energy: parseFloat(document.getElementById("disc-energy").value),
            target_tempo: parseFloat(document.getElementById("disc-tempo").value),
            max_results: 10
        };

        try {
            const res = await fetch("/api/discover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.discoveries && data.discoveries.length > 0) {
                let html = `
                    <table class="discovery-table">
                        <thead>
                            <tr>
                                <th>Track</th>
                                <th>Artist</th>
                                <th>Genre</th>
                                <th>Mood</th>
                                <th>Popularity</th>
                                <th>Tempo</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                data.discoveries.forEach(t => {
                    html += `
                        <tr>
                            <td><strong>${t.track_name}</strong></td>
                            <td>${t.artists}</td>
                            <td><span class="pill">${t.track_genre}</span></td>
                            <td><span class="pill">${t.mood_label || "Acoustic"}</span></td>
                            <td><strong>${t.popularity}</strong></td>
                            <td>${Math.round(t.tempo)} BPM</td>
                        </tr>
                    `;
                });
                html += "</tbody></table>";
                discTableArea.innerHTML = html;
            } else {
                discTableArea.innerHTML = '<p class="text-muted">No tracks match your specified filter parameters. Try relaxing your constraints!</p>';
            }
        } catch (e) {
            console.error("Discovery error:", e);
        } finally {
            btnDisc.innerHTML = '<i class="fa-solid fa-compass"></i> Discover Tracks';
        }
    });

    // -------------------------------------------------------------
    // 7. CHART.JS INSIGHTS
    // -------------------------------------------------------------
    let chartInstance = null;
    async function renderImportanceChart() {
        if (chartInstance) return;
        const ctx = document.getElementById("importanceChart");
        if (!ctx) return;

        try {
            const res = await fetch("/api/metrics");
            const data = await res.json();
            const labels = data.top_features.map(f => f.feature);
            const values = data.top_features.map(f => f.importance);

            chartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Permutation Importance (R² Drop)",
                        data: values,
                        backgroundColor: "#1DB954",
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: "#b3b3b3" },
                            grid: { color: "#282828" }
                        },
                        y: {
                            ticks: { color: "#b3b3b3" },
                            grid: { color: "#282828" }
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Chart error:", e);
        }
    }
});
