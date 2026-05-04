from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
MODEL_PATH = "priority_model.joblib"

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

class PredictionInput(BaseModel):
    need: float
    hunger: float
    distance: float
    routeTime: float
    trafficFactor: float
    matchProb: float
    spoilageRisk: float

class BatchPredictionInput(BaseModel):
    items: List[PredictionInput]

def get_priority_label(score: float) -> str:
    if score > 0.75:
        return "HIGH"
    elif score >= 0.4:
        return "MEDIUM"
    else:
        return "LOW"

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
def predict(input_data: PredictionInput):
    if model is None:
        return {"error": "Model not loaded", "score": 0.5, "priority": "MEDIUM"}
    
    # Use .dict() for compatibility or .model_dump() for pydantic v2
    data_dict = input_data.dict() if hasattr(input_data, 'dict') else input_data.model_dump()
    df = pd.DataFrame([data_dict])
    score = float(model.predict(df)[0])
    score = max(0.0, min(1.0, score))
    
    return {
        "score": score,
        "priority": get_priority_label(score)
    }

@app.post("/predict/batch")
def predict_batch(input_data: BatchPredictionInput):
    if model is None:
        return {"results": [{"score": 0.5, "priority": "MEDIUM"} for _ in input_data.items]}
    
    items = [item.dict() if hasattr(item, 'dict') else item.model_dump() for item in input_data.items]
    df = pd.DataFrame(items)
    scores = model.predict(df)
    
    results = []
    for score in scores:
        score = max(0.0, min(1.0, float(score)))
        results.append({
            "score": score,
            "priority": get_priority_label(score)
        })
    return {"results": results}
