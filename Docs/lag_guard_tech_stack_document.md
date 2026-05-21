# 🎮🤖 LagGuard — Tech Stack Document
## Hybrid ML + Gaming Overlay Architecture

---

## 1. 🎯 Goal of Tech Stack
Build a system that is:
- High-performance (real-time overlay)
- ML-focused (strong resume value)
- Modular and scalable
- Easy to iterate (vibe coding friendly)

---

## 2. 🏗️ Overall Architecture

```
React + Electron (UI Overlay)
        ↓
Node.js (Event Bus + Data Collector)
        ↓
Python FastAPI (ML Prediction Service)
        ↓
Real-time Predictions → UI
```

---

## 3. 🖥️ Frontend (Overlay UI)

### Technologies
- React
- Electron

### Libraries
- Zustand (state management)
- Recharts / Chart.js (graphs)

### Responsibilities
- Render UI zones (Live, Threat, Log)
- Handle drag/drop and customization
- Display ML outputs (risk, ETA, confidence)

---

## 4. ⚙️ Backend (Core System)

### Technology
- Node.js

### Responsibilities
- Event bus implementation
- Network data collection
- Feature generation
- Communication with ML service

---

## 5. 🌐 Network Data Collection

### Approach
- Use system ping commands
- TCP/HTTP probing

### Future Upgrade
- Rust module for low-latency data collection

---

## 6. 🤖 ML Layer

### Language
- Python

### Frameworks & Libraries
- scikit-learn
- XGBoost
- TensorFlow / PyTorch (optional)

### Responsibilities
- Model training
- Real-time inference
- Risk prediction

---

## 7. 🔄 ML Integration

### Approach
- Python runs as microservice using FastAPI

### Communication
- REST API / WebSocket

### Data Flow
```
Node.js → Feature Vector → FastAPI → Prediction → Node.js → UI
```

---

## 8. 📊 Data Storage

- CSV / Parquet (training data)
- SQLite (optional lightweight storage)

---

## 9. 📡 Real-Time Communication

- WebSockets for UI updates
- Event-driven architecture

---

## 10. 🎨 UI Rendering Optimization

- Canvas API / WebGL for graphs
- Batched rendering updates

---

## 11. ⚡ Performance Targets

- UI: 60 FPS
- CPU usage: <5%
- ML inference latency: <100ms

---

## 12. 🧠 Why This Stack

### For ML Resume
- End-to-end ML system
- Real-time inference
- Model comparison capability

### For Product
- Fast development
- Scalable architecture
- Smooth UI experience

---

## 13. 🚀 Future Upgrades

- Replace Node modules with Rust
- Add DirectX-based overlay
- Deploy ML models on cloud

---

## 14. ⚠️ Constraints & Decisions

- Avoid heavy ML models initially
- Keep system lightweight
- Prioritize accuracy over complexity

---

## 15. ✅ Final Summary

This stack enables:
- A real-time gaming overlay
- A production-style ML pipeline
- Strong portfolio demonstration

---

> LagGuard uses a hybrid architecture combining modern web technologies with machine learning to deliver both performance and intelligence.

