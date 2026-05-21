import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
import json
import os

# Deterministic seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(num_samples=10000):
    """
    Generates a structured, pattern-based synthetic dataset for LagGuard.
    Normal: Flatline trends, low logic.
    Spike: Rising slopes, jump in variance, bursty jitter.
    """
    half = num_samples // 2
    
    # --- NORMAL NETWORK BEHAVIOR (Target = 0) ---
    # Stable ping range (30-60ms)
    normal_mean_ping = np.random.uniform(30, 60, half)
    normal_variance_ping = np.random.uniform(0, 50, half) # Low variance
    normal_mean_jitter = np.random.uniform(0, 10, half)   # Low jitter
    normal_variance_jitter = np.random.uniform(0, 15, half)
    normal_ping_slope = np.random.uniform(-0.5, 0.5, half) # Near-zero slope
    normal_jitter_slope = np.random.uniform(-0.2, 0.2, half)
    normal_targets = np.zeros(half, dtype=int)
    
    # --- SPIKE BEHAVIOR (Target = 1) ---
    # Captures PRE-SPIKE (early detection) signatures
    # Increasing ping slope, rising variance, bursty jitter.
    spike_mean_ping = np.random.uniform(50, 150, half)
    spike_variance_ping = np.random.uniform(300, 2000, half) # High variance
    spike_mean_jitter = np.random.uniform(15, 60, half)      # High jitter
    spike_variance_jitter = np.random.uniform(50, 400, half) # Bursty jitter
    spike_ping_slope = np.random.uniform(3.0, 20.0, half)    # Positive, increasing slope
    spike_jitter_slope = np.random.uniform(1.5, 10.0, half)
    spike_targets = np.ones(half, dtype=int)
    
    # Concatenate to build full arrays
    mean_ping = np.concatenate([normal_mean_ping, spike_mean_ping])
    variance_ping = np.concatenate([normal_variance_ping, spike_variance_ping])
    mean_jitter = np.concatenate([normal_mean_jitter, spike_mean_jitter])
    variance_jitter = np.concatenate([normal_variance_jitter, spike_variance_jitter])
    ping_slope = np.concatenate([normal_ping_slope, spike_ping_slope])
    jitter_slope = np.concatenate([normal_jitter_slope, spike_jitter_slope])
    targets = np.concatenate([normal_targets, spike_targets])
    
    df = pd.DataFrame({
        "mean_ping": mean_ping,
        "variance_ping": variance_ping,
        "mean_jitter": mean_jitter,
        "variance_jitter": variance_jitter,
        "ping_slope": ping_slope,
        "jitter_slope": jitter_slope,
        "target": targets
    })
    
    # Shuffle dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df

def train_model():
    print("Generating structured synthetic dataset...")
    df = generate_synthetic_data(10000)
    
    X = df.drop(columns=["target"])
    y = df["target"]
    
    # Split training/testing. 
    # Stratify to maintain balanced representation of Normal and Spike.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training XGBoost Classifier...")
    # Scale_pos_weight can be utilized to optimize for early spike detection (recall),
    # but here we use base parameters since the dataset is perfectly balanced (50/50).
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    
    print("\n--- Model Evaluation (Optimized for Early Detection) ---")
    print(f"Accuracy:  {accuracy_score(y_test, preds):.4f}")
    print(f"Precision: {precision_score(y_test, preds):.4f}")
    print(f"Recall:    {recall_score(y_test, preds):.4f}")
    print(f"F1 Score:  {f1_score(y_test, preds):.4f}")
    
    # Save the model to a JSON file
    model_path = os.path.join(os.path.dirname(__file__), "xgboost_model.json")
    model.save_model(model_path)
    print(f"\nModel saved to {model_path}")

if __name__ == "__main__":
    train_model()
