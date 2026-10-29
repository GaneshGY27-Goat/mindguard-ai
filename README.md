# MindGuard AI – Early Mental Wellness Warning & Support System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-teal?style=for-the-badge&logo=github)](https://ganeshgy27-goat.github.io/mindguard-ai/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/GaneshGY27-Goat/mindguard-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> 🌐 **Universal Live Web App Link:**  
> **[https://ganeshgy27-goat.github.io/mindguard-ai/](https://ganeshgy27-goat.github.io/mindguard-ai/)**  
> Access the complete responsive MindGuard AI application directly from any modern mobile, tablet, or desktop browser with zero installation or server dependencies.

> **Prototype / Demonstration System Notice**  
> MindGuard AI is an experimental healthcare innovation prototype designed to estimate stress and mental wellness risk based on available proxy signals and provide non-medical supportive recommendations.  
> **It is NOT a medical diagnostic device.** It does **NOT** diagnose depression, anxiety disorders, or panic attacks with certainty, and does **NOT** prescribe medical treatment. Always consult certified healthcare professionals for clinical evaluation.

---


## 1. Project Overview

**MindGuard AI** is a modern, responsive, end-to-end mental wellness warning and support system. In high-stress modern environments, physiological strain and emotional exhaustion often escalate silently before an individual consciously realizes burnout. 

MindGuard AI demonstrates how an intelligent system can continuously synthesize multi-channel physiological vitals, subjective self-reports, and acoustic markers into an explainable **Stress Risk Score (0–100)** with immediate, non-medical supportive interventions (such as guided 4-4-6 breathing and trusted-contact safety nets).

---

## 2. Problem Statement

* **Silent Escalation:** Autonomic nervous system strain (elevated heart rate, sleep fragmentation, sedentary posture) accumulates over days without noticeable conscious distress until panic or severe exhaustion sets in.
* **Siloed Health Trackers:** Traditional fitness wearables display raw, disconnected numbers (BPM, step counts, sleep stages) without contextual mental wellness interpretation or actionable, real-time stress relief.
* **Delayed Interventions:** Individuals often seek support only after acute crises occur, rather than receiving proactive, gentle micro-interventions throughout their daily routine.

---

## 3. Key Features & Enhancements

1. **Interactive Mood Journal (Offline & LocalStorage):**
   * Multi-mood selector with expressive emojis and semantic wellness labels.
   * Granular stress-level selector (1 to 10) with contextual stage descriptions.
   * Optional short journal reflection notes (with real-time character limit validation).
   * 100% private in-browser `localStorage` persistence with previous entry timeline and dates.
   * Full data sovereignty: individual entry deletion and one-click data clear with confirmation banners.
2. **Interactive Breathing Exercise (60-Second Vagal Nerve Pacing):**
   * Complete pacing control suite: **Start**, **Pause**, **Resume**, and **Reset** buttons.
   * Smoothly expanding and contracting animated breathing circle with guided 4-4-6 pacing (Inhale 4s, Hold 4s, Exhale 6s).
   * Dedicated 60-second session countdown and animated progress bar.
   * Rewarding completion celebration screen detailing autonomic recovery benefits.
   * Full accessibility compliance: `aria-live` screen-reader announcements, touch targets >= 44px, and `prefers-reduced-motion` support.
3. **Wellness History Dashboard ("My Trends"):**
   * Weekly mood and stress trend chart dynamically generated from **genuine saved check-in records**.
   * Total completed check-in counter and dynamic statistical weekly summary.
   * Encouraging, helpful empty state when no entries exist (**zero fabricated or synthetic data**).
4. **Explainable Wellness Score & Formula Breakdown:**
   * Transparent linear composite formula detailing the exact weights of all 6 multi-signal inputs:
     `Score = (0.25 × Heart Rate) + (0.20 × Sleep) + (0.20 × Mood/Stress) + (0.20 × Voice) + (0.10 × Activity) + (0.05 × SpO₂)`
   * Factor-level attribution highlighting the primary signals elevating or calming today's score.
   * Prominent non-medical, experimental prototype disclaimers with zero false clinical diagnostic claims.
5. **Privacy & Accessibility Architecture:**
   * Complete transparency: data remains strictly in the current browser's local storage and does not sync across devices.
   * Dedicated Privacy Modal with live local storage metrics, JSON data export, and complete data erasure controls.
   * Zero mandatory tracking cookies, analytics pixels, or external API keys.


1. **Holistic Multi-Modal Fusion:** Rather than relying solely on heart rate or purely subjective mood journals, MindGuard AI bridges the gap between *objective somatic vitals* and *subjective psychological states*.
2. **Transparent Explainability:** Black-box AI causes anxiety. MindGuard AI details the exact percentage influence and status of every biomarker driving the user's score.
3. **Closed-Loop Relaxation Feedback:** When a user completes a guided 4-4-6 breathing session, the system simulates real parasympathetic vagal recovery, dynamically lowering heart rate and reducing the stress score in real time.
4. **Human-in-the-Loop Safety Net:** Includes consent-driven trusted contact messaging and emergency crisis helpline numbers without ever falsely pretending to be a medical practitioner.

---

## 5. Technology Stack

* **Frontend:**
  * **Framework:** React 18 with TypeScript
  * **Bundler & Dev Server:** Vite
  * **Styling:** Tailwind CSS (calming clinical palette with dark glassmorphism)
  * **Icons:** Lucide React
  * **Audio Processing:** HTML5 Web Audio API (`AudioContext`, `AnalyserNode` for real-time waveform visualization and energy estimation)
  * **Visualizations:** Custom animated SVG gauges and multi-timeframe line charts
* **Backend:**
  * **Runtime:** Node.js (v20+) & Express
  * **Language:** TypeScript with strict type checking
  * **CORS & Middleware:** Full REST API with structured JSON logging
* **AI & Risk Engine:**
  * **Prototype Scoring Engine:** Modular, configurable weighted heuristic model (`riskEngine.ts`)
  * **Future ML Bridge:** Pluggable `predictStress(features)` interface with Python sub-process bridge (`predict.py`) for Random Forest / XGBoost ensemble models
* **Data Storage:**
  * **Repository Pattern:** In-memory store with seeded 30-day historical records, designed for drop-in MongoDB or Firebase Firestore replacement
* **Firmware Blueprint:**
  * C++ / Arduino sketch for ESP32 with MAX30102 (PPG) and MPU6050 (6-axis accelerometer)

---

## 6. Project Architecture

```
mindguard-ai/
├── backend/                         # Node.js + Express Backend API
│   ├── src/
│   │   ├── ml_service/              # Python ML reference model
│   │   │   └── predict.py           # Random Forest inference simulation
│   │   ├── routes/
│   │   │   └── api.ts               # Express REST API endpoints
│   │   ├── services/
│   │   │   ├── mlBridge.ts          # Python subprocess & fallback ML bridge
│   │   │   └── riskEngine.ts        # Modular, transparent weighted scoring engine
│   │   ├── store/
│   │   │   └── database.ts          # Structured data store with 30-day seeded history
│   │   ├── tests/
│   │   │   └── riskEngine.test.ts   # Automated unit tests for risk calculation
│   │   ├── types/
│   │   │   └── index.ts             # Core TypeScript schema contracts
│   │   └── server.ts                # Express server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/                        # React + TypeScript + Vite Frontend UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiInsightCard.tsx    # Natural language explainability card
│   │   │   ├── AssistantChat.tsx    # MindGuard Assistant conversational widget
│   │   │   ├── AuthModal.tsx        # Sign in / registration / demo login modal
│   │   │   ├── BreathingExerciseModal.tsx # 4-4-6 animated breathing visualizer
│   │   │   ├── DemoModeTour.tsx     # 12-step guided interactive 2-min walkthrough
│   │   │   ├── Header.tsx           # Global navbar with live status & SOS button
│   │   │   ├── LandingPage.tsx      # Public showcase: problem, pipeline, ethics
│   │   │   ├── MoodCheckInModal.tsx # 5-emoji & 1-10 slider mood logger
│   │   │   ├── SosModal.tsx         # Urgent support modal with 24/7 hotlines
│   │   │   ├── StressGauge.tsx      # Animated circular SVG stress gauge (0-100)
│   │   │   ├── TrendsView.tsx       # Today / 7D / 30D multi-metric history charts
│   │   │   ├── TrustedContactModal.tsx # Contact settings & simulated SMS modal
│   │   │   ├── VitalsGrid.tsx       # 6 live vitals cards (HR, SpO2, Steps, Sleep, Mood, Voice)
│   │   │   └── WearableControls.tsx # Simulation toolbar (Stream, High-Stress, Reset)
│   │   ├── services/
│   │   │   └── api.ts               # Resilient client API layer with offline fallback
│   │   ├── App.tsx                  # Main application orchestrator
│   │   ├── index.css                # Tailwind base & glassmorphic styling
│   │   ├── main.tsx                 # React DOM mount point
│   │   └── types.ts                 # Frontend data types
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── wearable_firmware/               # Physical hardware integration
│   ├── esp32_firmware_guide.md      # Wiring schematics, BOM, and calibration
│   └── mindguard_esp32.ino          # Arduino C++ sketch for ESP32 + MAX30102 + MPU6050
└── README.md                        # Complete project manual & documentation
```

---

## 7. How the AI Risk Score Works

The prototype risk scoring model uses a transparent, configurable weighted multi-signal formulation:

$$\text{Risk Score} = \sum_{i} w_i \cdot S_i$$

Where $\sum w_i = 1.0$, with default baseline weights:
* **Heart-Rate Deviation ($w = 0.25$):** Normalized by departure from resting baseline ($\le 72$ BPM is optimal; $>100$ BPM signals acute arousal).
* **Sleep Duration ($w = 0.20$):** Penalizes sleep deficits ($\ge 7.5$ hours is restorative; $<5.0$ hours indicates severe fatigue).
* **Subjective Mood ($w = 0.20$):** Inverts self-reported 1–10 scale ($10 = \text{calm/thriving}$, $1 = \text{severe distress}$).
* **Voice Stress ($w = 0.20$):** Acoustic energy density and pitch jitter ($\text{Low} = 10$, $\text{Medium} = 55$, $\text{High} = 95$).
* **Physical Activity ($w = 0.10$):** Sedentary duration vs. healthy movement ($\ge 7,500$ steps buffers stress).
* **Blood Oxygenation ($w = 0.05$):** $\ge 97\%$ is optimal; drops below $95\%$ contribute to physiological strain.

### Risk Level Classification:
| Score Range | Classification | Supportive Action |
|---|---|---|
| **0 – 30** | `NORMAL` | Maintain regular routine, hydration, and sleep schedule. |
| **31 – 60** | `MODERATE` | Take a 5-minute screen break, stretch, or try a 2-minute breathing cycle. |
| **61 – 80** | `HIGH` | Start 4-4-6 guided breathing; step into a quiet environment. |
| **81 – 100** | `VERY HIGH` | Pause demanding tasks; engage safety net or contact trusted person. |

---

## 8. Installation & Quick Start

### Prerequisites
* **Node.js:** v18.0.0 or later (v20+ recommended)
* **npm:** v9.0.0 or later
* **Python:** 3.9+ (optional, for ML bridge testing)

### 1. Run the Backend API
```bash
cd backend
npm install
npm run dev
```
The backend starts on `http://localhost:5000`.  
Run unit tests at any time via:
```bash
npm test
```

### 2. Run the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 9. Demo Mode Walkthrough (2–3 Minutes)

Click the **`DEMO MODE`** button in the top navigation bar to launch an interactive 12-step guided tour:

1. **Open Dashboard:** Displays clean medical-grade UI with dark theme and glassmorphism.
2. **Inspect Normal Vitals:** Heart rate at 72 BPM, SpO₂ at 98%, steps at 6,420, sleep at 7h 20m, mood at 6/10, voice stress LOW.
3. **Observe Stress Risk = NORMAL:** Circular gauge displays ~23/100 in emerald green.
4. **Click "Trigger High-Stress Scenario":** Simulates acute stress (HR jumps to 105 BPM, sleep drops to 4.5h, mood drops to 3/10, voice stress HIGH).
5. **Real-Time Telemetry Update:** Dashboard vitals cards instantly reflect acute shifts.
6. **AI Risk Score Escalates:** Gauge smoothly animates to ~88/100 (`VERY HIGH`) with rose glow.
7. **Inspect AI Explainability:** Natural language summary and breakdown show heart rate and sleep deficit as top drivers.
8. **Review Personalized Recommendations:** Non-medical guidance recommends 4-4-6 breathing and quiet surroundings.
9. **Launch Guided Breathing:** Interactive 4-4-6 pacing circle (Inhale 4s, Hold 4s, Exhale 6s) activates.
10. **Simulated Recovery Effect:** Completing cycles stimulates vagal recovery, dropping HR towards 74 BPM and lowering the stress score.
11. **Explore My Trends:** View 7-day and 30-day longitudinal charts showing sleep/stress correlations.
12. **Review Trusted Contact & SOS:** Inspect safety circle notification preview and 24/7 confidential crisis hotlines.

---

## 10. REST API Reference

| Method | Endpoint | Description | Sample Payload / Response |
|---|---|---|---|
| `GET` | `/api/sensor-data/latest` | Get latest vitals & real-time risk assessment | Returns `{ reading, risk }` |
| `POST` | `/api/sensor-data` | Ingest wearable or simulated telemetry | `{"heartRate":88, "spo2":98, "steps":4000, "sleepHours":6.5, "moodScore":5, "voiceStress":"MEDIUM"}` |
| `POST` | `/api/risk-analysis` | Calculate risk with custom weights or ML | `{"features": {...}, "useMlPredictor": true}` |
| `GET` | `/api/stress/trends` | Historical records & AI insights | Query: `?timeframe=today\|7days\|30days` |
| `POST` | `/api/mood` | Record subjective daily mood entry | `{"score": 8, "label": "Very Good", "notes": "Productive day"}` |
| `GET` | `/api/mood` | Fetch recent mood check-ins | Returns array of mood entries |
| `GET` | `/api/recommendations` | Get personalized supportive actions | Returns current recommendations array |
| `POST` | `/api/chat` | MindGuard AI Assistant conversation | `{"message": "I feel stressed with work deadlines"}` |
| `GET` | `/api/contacts` | Retrieve trusted safety contacts | Returns configured trusted contacts |
| `POST` | `/api/contacts` | Update trusted contact details | `{"name": "Mother", "phone": "+91...", "relationship": "Family"}` |
| `POST` | `/api/contacts/notify-demo` | Simulate urgent trusted contact alert | Returns simulated SMS/push delivery confirmation |
| `POST` | `/api/simulation/high-stress`| Preset trigger for high-stress testing | Updates vitals to HR 105, sleep 4.5h, mood 3 |
| `POST` | `/api/simulation/reset-normal`| Preset reset to normal baseline vitals | Restores HR 72, sleep 7.33h, mood 6 |

---

## 11. Connecting a Real Physical Wearable (ESP32)

To transition from software simulation to physical hardware:
1. **Hardware Components:**
   * ESP32 Development Board (e.g. NodeMCU ESP-WROOM-32)
   * MAX30102 Optical Pulse Oximeter & Heart-Rate Sensor
   * MPU6050 6-Axis Accelerometer & Gyroscope
2. **Wiring (I2C Bus):**
   * ESP32 `GPIO 21` $\rightarrow$ MAX30102 `SDA` & MPU6050 `SDA`
   * ESP32 `GPIO 22` $\rightarrow$ MAX30102 `SCL` & MPU6050 `SCL`
   * ESP32 `3V3` $\rightarrow$ Sensor `VCC`
   * ESP32 `GND` $\rightarrow$ Sensor `GND`
3. **Flashing Firmware:**
   * Open `wearable_firmware/mindguard_esp32.ino` in Arduino IDE.
   * Enter your WiFi credentials and your computer's local IP address (`http://192.168.x.x:5000/api/sensor-data`).
   * Flash to your ESP32. Telemetry will automatically appear live on your dashboard!

See the complete hardware wiring and calibration guide in [`wearable_firmware/esp32_firmware_guide.md`](./wearable_firmware/esp32_firmware_guide.md).

---

## 12. Privacy & Data Ethics

* **Sensitive Data Classification:** Health-related indicators are treated as sensitive personal data.
* **Client-Side Ephemeral Audio:** Audio processed for the voice wellness check is analyzed locally in browser RAM using the Web Audio API and is never recorded, stored on disk, or transmitted to external servers.
* **Consent-Driven Sharing:** Trusted contact notifications require explicit user confirmation prior to any simulated or external dispatch.
* **Strict Non-Diagnostic Guardrails:** The AI Assistant and risk engine will not attempt to diagnose psychiatric conditions or advise changes to prescribed medications.

---

## 13. System Limitations

1. **Proxy Indicators Only:** Wearable photoplethysmography (PPG) and accelerometer motion detect physiological correlates of arousal, not mental thoughts or clinical psychiatric disorders.
2. **Ambient Interference:** Optical sensors can experience motion artifacts during heavy exercise.
3. **Acoustic Limitations:** Voice stress analysis can be influenced by microphone hardware quality, room acoustics, or background noise.
4. **Prototype Dataset:** Historical correlations are demonstrative and should be verified on clinical datasets (e.g. WESAD) before field deployment.

---

## 14. Future Improvements

* **Trained ML Models:** Transition from the weighted heuristic engine to ensemble Random Forest or XGBoost models trained on empirical physiological stress datasets (WESAD / SWELL-KW).
* **HRV Spectral Analysis:** Ingest millisecond RR-intervals to calculate rMSSD and LF/HF frequency-domain autonomic balance ratios.
* **On-Device Edge ML:** Implement TinyML (TensorFlow Lite for Microcontrollers) directly on the ESP32 to compute real-time stress probabilities on-wrist.
* **Wearable OS Companion:** Build native companion apps for Wear OS and Apple Watch.

---

## 15. Demo Credentials

For testing the authentication flow:
* **One-Click Prototype Login:** Click the *"1-Click Fast Prototype Login"* button on the sign-in modal.
* **Manual Credentials:**
  * **Email:** `alex.mercer@example.com`
  * **Password:** `MindGuard2026!`

---

## 16. GitHub Pages Deployment & Local Testing

The frontend is fully static, client-side, and designed to run out-of-the-box on GitHub Pages with zero required backend dependencies.

### Live Production Deployment
* **Live Site:** [https://ganeshgy27-goat.github.io/mindguard-ai/](https://ganeshgy27-goat.github.io/mindguard-ai/)
* **Automated CI/CD:** Any push to `main` triggers `.github/workflows/deploy.yml` which builds `frontend` and publishes `frontend/dist` to GitHub Pages.

### Local Development Steps
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.
4. Verify Production Build:
   ```bash
   npm run build
   ```
   Ensures TypeScript compilation passes cleanly and generates the optimized production bundle in `dist/`.

