import os

import uvicorn
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "xgboost_model.json")
model = None

class FeatureVector(BaseModel):
    mean_ping: float
    variance_ping: float
    mean_jitter: float
    variance_jitter: float
    ping_slope: float
    jitter_slope: float

class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    modelVersion: str


def load_model():
    global model
    try:
        model = xgb.Booster()
        model.load_model(MODEL_PATH)
        print(f"Loaded model from {MODEL_PATH}")
    except Exception as exc:
        print(f"Model load failure: {exc}")
        model = None

load_model()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(features: FeatureVector):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        feature_list = [
            features.mean_ping,
            features.variance_ping,
            features.mean_jitter,
            features.variance_jitter,
            features.ping_slope,
            features.jitter_slope,
        ]
        feature_names = [
            "mean_ping",
            "variance_ping",
            "mean_jitter",
            "variance_jitter",
            "ping_slope",
            "jitter_slope",
        ]
        dmatrix = xgb.DMatrix([feature_list], feature_names=feature_names)
        probability = float(model.predict(dmatrix)[0])
        prediction = 1 if probability > 0.5 else 0
        return PredictionResponse(
            prediction=prediction,
            probability=probability,
            modelVersion="xgboost-1.0",
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {exc}")

@app.get("/")
def root():
    return {
        "message": "LagGuard ML service running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
        },
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
