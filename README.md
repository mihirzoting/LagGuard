# LagGuard

LagGuard is a real-time network monitoring and lag prediction application. Designed primarily as an unobtrusive overlay, it continuously monitors network conditions, calculates network feature dynamics (like ping/jitter slopes), and leverages a hybrid rule-based and Machine Learning (XGBoost) engine to predict lag spikes before they impact user experience.

## Project Overview
LagGuard solves the problem of unexpected network degradation (lag spikes) during critical real-time activities like online gaming or streaming.

**Main Workflows:**
1. **Data Collection:** Continuously pings a target server to gather latency and jitter metrics.
2. **Feature Extraction:** Aggregates recent metrics into feature vectors, capturing the rate of change (slope) and variance.
3. **Hybrid Prediction:** Evaluates the feature vector using built-in heuristics (trend, spike, instability scores) and queries a Python-based ML service (XGBoost) to calculate a final hybrid risk score.
4. **Real-time Overlay:** Broadcasts predictions via WebSockets to a transparent, click-through Electron overlay.

**Core Architecture:**
- **Node.js Backend:** Handles data collection, feature generation, WebSocket streaming, and hybrid prediction logic with a circuit breaker for resilience.
- **Python ML Service:** Provides a fast REST API for the XGBoost lag prediction model.
- **React + Electron Frontend:** Consumes WebSocket events and renders a frameless, transparent overlay on the user's screen.

## Features
- **Real-time Network Monitoring:** Tracks ping, jitter, and system metrics at 2Hz. *(Note: CPU/GPU/FPS metrics are currently emulated in the collector for demonstration purposes)*.
- **Advanced Feature Engineering:** Calculates variance and rolling trends to identify network instability.
- **Hybrid Lag Prediction Engine:** Combines heuristic rules with an XGBoost ML model for accurate lag spike forecasting.
- **Resilient Microservices:** Implements a Circuit Breaker pattern to gracefully handle ML service downtime by falling back to rule-based heuristics.
- **Transparent UI Overlay:** Built with Electron, the frontend supports click-through functionality (toggled via hotkey) to stay visible without interfering with mouse clicks.

## Tech Stack
- **Frontend Framework:** React (bootstrapped with Create React App)
- **Desktop Wrapper:** Electron (with `electron-builder`)
- **Backend Framework:** Node.js, Express, WebSocket (`ws`)
- **ML Service:** Python, FastAPI, Uvicorn, XGBoost, scikit-learn, pandas, numpy
- **Database / ORM:** N/A (Stateless architecture)
- **Authentication:** N/A (Local service)
- **Styling:** Vanilla CSS
- **APIs:** REST (ML Service) & WebSockets (Backend)

## Folder Structure
```text
LagGuard/
├── backend/            # Node.js event server, feature engine, and prediction logic
│   ├── networkCollector.js # Gathers ping data and emulates hardware stats
│   ├── featureEngine.js    # Computes rolling variance and slopes
│   ├── predictionEngine.js # Hybrid prediction logic combining rules and ML
│   ├── mlServiceClient.js  # HTTP client to talk to Python service (with circuit breaker)
│   └── server.js           # Express/WebSocket server
├── frontend/           # React and Electron overlay app
│   ├── public/electron.js  # Electron main process (window setup, click-through logic)
│   └── src/                # React components and UI logic
└── ml-service/         # Python FastAPI service for XGBoost predictions
    ├── main.py             # FastAPI REST endpoints
    ├── train.py            # Model training script
    └── xgboost_model.json  # Pre-trained XGBoost model
```

## Installation & Local Setup

**1. Clone the repository**
```bash
git clone <repository-url>
cd LagGuard
```

**2. Setup ML Service (Python)**
```bash
cd ml-service
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
# source venv/bin/activate
pip install -r requirements.txt
# Start the ML service (runs on port 8000)
python main.py
```
*(Alternatively, use `uvicorn main:app --host 0.0.0.0 --port 8000`)*

**3. Setup Backend (Node.js)**
Open a new terminal window:
```bash
cd backend
npm install
# Start the backend server (runs on port 5000)
node index.js
```

**4. Setup Frontend (React + Electron)**
Open a third terminal window:
```bash
cd frontend
npm install
# Start React development server and Electron wrapper concurrently
npm run electron:serve
```

## Environment Variables
Currently, configuration is mostly handled within the code, but standard ports apply:

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `PORT` | Defines the port for the Node.js backend | `5000` | No |

*Note: The target ping host is currently hardcoded to `8.8.8.8` in `backend/networkCollector.js`.*

## Available Scripts

**Frontend (`frontend/package.json`):**
- `npm start` - Starts standard React dev server (no Electron)
- `npm run build` - Builds React app for production
- `npm run electron:serve` - **[Recommended]** Starts React and launches the Electron overlay
- `npm run electron:build` - Packages the app into a standalone desktop executable using `electron-builder`

## API Documentation

### REST API (ML Service - Port 8000)
- **`GET /health`**
  - **Purpose:** Check if ML service is running and model is loaded.
  - **Auth Required:** No
- **`GET /`**
  - **Purpose:** Root endpoint returning service info.
  - **Auth Required:** No
- **`POST /predict`**
  - **Purpose:** Predict lag based on network features.
  - **Auth Required:** No
  - **Payload:**
    ```json
    {
      "mean_ping": 50.5, "variance_ping": 10.2, "mean_jitter": 5.1,
      "variance_jitter": 2.1, "ping_slope": 0.5, "jitter_slope": -0.1
    }
    ```

### REST & WebSocket API (Backend - Port 5000)
- **`GET /`**, **`GET /health`** - Basic health checks.
- **`WS /events`** - WebSocket endpoint streaming the following events:
  - `CONNECTED`: Initial connection confirmation.
  - `NETWORK_SAMPLE`: Raw ping and emulated hardware metrics.
  - `FEATURE_VECTOR`: Aggregated rolling window stats.
  - `LAG_PREDICTION_FINAL`: Final hybrid lag prediction score and ETA warning.

## Database Design
*Not applicable.* LagGuard is currently a real-time, stateless application relying entirely on in-memory buffers (rolling windows) and trained machine learning models.

## Authentication & Authorization
*Not applicable.* The services are designed to run locally on the user's machine for personal monitoring and do not currently implement authentication.

## Application Flow
1. **Collection:** `networkCollector.js` pings `8.8.8.8` every 500ms and emits a `NETWORK_SAMPLE`.
2. **Feature Generation:** `featureEngine.js` catches 10 samples, calculates mathematical variance and slope trends, and emits a `FEATURE_VECTOR`.
3. **Prediction:** `predictionEngine.js` calculates heuristic risk scores (spikes, jitter instability) and simultaneously requests a prediction from the Python ML service via `mlServiceClient.js`.
4. **Hybrid Scoring:** The engine weights both scores (ML: 60%, Rule: 40%) to create a final status (STABLE, HIGH, CRITICAL) and emits `LAG_PREDICTION_FINAL`.
5. **Display:** The Electron/React frontend listens to WebSocket events and updates the visual overlay.

## Deployment
For distribution, the frontend can be packaged into an executable:
```bash
cd frontend
npm run electron:build
```
The backend and ML services must either be bundled alongside the application or hosted centrally if migrating to a client-server model.

## Testing
- Both backend and frontend have scaffolded test scripts (`npm test`), but no test suites are actively configured in the current codebase.

## Performance & Optimization
- **Circuit Breaker:** The backend implements a circuit breaker when communicating with the ML service. If the ML service fails 3 times, the breaker opens, skipping ML calls for 30 seconds and falling back to rule-based heuristics to maintain frontend performance.
- **Rolling Windows:** Efficient array manipulations for calculating windowed variance and slope without memory leaks.
- **Overlay Rendering:** Uses `requestAnimationFrame` compatible UI updates in React and Electron's `setIgnoreMouseEvents` to ensure the overlay doesn't block OS-level clicks.

## Security Considerations
- **Local Binding:** Services bind to localhost (`0.0.0.0` in ML service) and assume a secure local environment.
- No input validation currently exists on the ML service beyond Pydantic type checking.
- Future network deployments must add CORS policies, rate limiting, and Auth.

## Known Limitations
- The destination ping address (`8.8.8.8`) is hardcoded.
- Hardware metrics (CPU, GPU, FPS) are simulated using `Math.random()` and do not reflect actual system performance.
- Requires three separate terminal processes to run the full stack locally.

## Future Improvements
- **Real System Metrics:** Replace mocked hardware data in `networkCollector.js` with actual OS hooks.
- **Config UI:** Add a settings panel in the frontend to change the target Ping IP and warning thresholds.
- **Containerization:** Add Docker and `docker-compose.yml` to simplify backend and ML service spin-up.
- **Persistent Logging:** Store historical lag data into SQLite for long-term review.

## Troubleshooting
- **Overlay blocks my mouse!** Press `CommandOrControl + Shift + X` to toggle the click-through mode. Check terminal logs to verify click-through status.
- **ML Circuit Breaker is OPEN:** Ensure the Python ML service is running on port 8000 and that you have installed the correct `xgboost` dependencies.
- **No data appearing in overlay:** Ensure the backend is running on port 5000 and your network connection is active.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 

## License
[ISC](https://choosealicense.com/licenses/isc/) (Backend) / Private (Frontend)
