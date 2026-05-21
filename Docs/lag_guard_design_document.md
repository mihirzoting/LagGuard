# 🎮🤖 LagGuard — Design Document (Aligned with PRD)
## UI/UX + System Design (Industrial Command Center Edition)

---

## 1. 🎯 Design Philosophy
LagGuard adopts a “Tactical Industrial Command Center” aesthetic prioritizing:
- Clarity under pressure
- Functional depth
- ML transparency + explainability

---

## 2. 🎨 Visual System

### Theme: Industrial Tactical UI
- Matte surfaces
- Inset panels
- Hardware-inspired layout

### Color Palette
- Carbon Gray (#1A1A1A)
- Deep Crimson (#990000)
- Amber Gold (#FFB300)

### Materials & Effects
- Opacity: 60–80%
- Frosted glass / carbon texture
- Thick borders, latched edges

---

## 3. 🧩 Layout Architecture
Three draggable zones:
- Left: Live Stream Panel
- Center: Threat Assessment Hub
- Right: Objectives Log

Each zone is modular and subscribes to system events.

---

## 4. 📡 Live Stream Panel (Left)

### Purpose
Real-time telemetry + ML feature visibility

### Components
- Ping & Jitter sparkline graph (100–200ms updates)
- Packet loss histogram (last 60s)

### Feature Metrics (ML-aligned)
- mean_10
- delta_ping
- variance
- slope (trend indicator)

👉 Direct mapping to ML feature engineering layer

---

## 5. 🧠 Threat Assessment Hub (Center)

### Purpose
Visualize prediction output

### Components

#### Risk Radar
- Semi-circular gauge
- Color based on risk score

#### Prediction ETA
INSTABILITY LIKELY IN: X.Xs

#### Confidence Meter
- Horizontal bar
- Used to modulate alert intensity

---

## 6. 📜 Objectives Log (Right)

### Components
- Event history:
  - High Risk → Spike occurred
  - High Risk → False alarm

- Mode Indicator:
  - ML Mode
  - Rule-Based Fallback

---

## 7. 🔄 ML → UI Mapping Layer (Critical)

| ML Output | UI Element |
|----------|----------|
| risk score | Radar fill + color |
| eta | Countdown display |
| confidence | Progress bar + alert strength |

### Behavior Rules
- High confidence → strong alert (pulse + color)
- Low confidence → soft warning (color only)

---

## 8. 🔔 Alert System Behavior

- Triggered only on high risk + sufficient confidence
- Visual: border pulse + glow
- Cooldown: 5 seconds (shutter effect)

### Alert Messaging Style (One-liners)
Alerts should be short, actionable, and non-intrusive:

Examples:
- "⚠️ High network lag likely"
- "⚠️ Instability detected"
- "⚠️ Packet loss spike incoming"
- "⚠️ Network fluctuation expected"

### Context-Aware Messaging
- High confidence → stronger wording:
  - "⚠️ High network lag likely"
- Medium confidence → softer wording:
  - "⚠️ Possible instability"

👉 Keep messages **1-line, fast to read during gameplay**

---

## 9. 🔄 Event System Integration
 🔄 Event System Integration

### UI subscribes to events:
- NETWORK_SAMPLE
- FEATURE_VECTOR
- LAG_PREDICTION
- ALERT

### Flow
```
Event Bus → UI Components → Render Update
```

---

## 10. 🧪 Debug Mode (Technical Overlay)

### Purpose
Expose ML internals for validation and resume value

### Components

#### Feature Contribution Graph
- Shows influence of:
  - slope
  - variance
  - jitter
  - rolling mean

#### Model Performance Panel
- Inference latency (<100ms)
- Model type (RF / XGBoost / etc.)

#### Evaluation Metrics (Session-Based)
- Prediction accuracy
- Early detection rate
- False alert count

---

## 11. ⚙️ Interaction Design

- Drag & drop zones
- Opacity slider (30–100%)
- Toggle debug mode
- Toggle ML vs rule-based system

---

## 12. ⚡ Performance Constraints

- UI: 60 FPS
- CPU usage: <5%
- ML inference: <100ms

### Optimization
- Canvas/WebGL rendering
- Batched updates
- ML runs in worker thread

---

## 13. 🧠 UX Principles

- Non-intrusive UI
- Clear information hierarchy
- Trust via transparency

Priority:
Risk > ETA > Confidence > Graphs > Logs

---

## 14. 🔗 System Integration

```
ML Model → Prediction Output → Event Bus → UI Mapping → Visual Feedback
```

---

## 15. 🚀 Future Enhancements

- Network instability heatmap
- Game-specific UI presets
- Voice alerts
- Multi-monitor support

---

## 16. 🏁 Final Summary

This system combines:

### Gaming Value
- Real-time overlay
- Actionable early warnings

### ML Value
- Feature visibility
- Explainable predictions
- Real-time inference metrics

---

## 17. ✅ Alignment with PRD

- Event-driven architecture ✔
- ML feature exposure ✔
- Prediction + fallback system ✔
- Real-time inference ✔
- Evaluation metrics ✔

---

> LagGuard is both a high-performance gaming tool and a fully demonstrable ML system.

