# 📘 LeafAI — Technical Documentation

> AI-powered leaf disease detection system with explainable AI (Grad-CAM) and an LLM chat assistant (Groq · llama3-8b-8192).

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Setup & Installation](#5-setup--installation)
6. [Environment Variables](#6-environment-variables)
7. [Database Schema](#7-database-schema)
8. [Backend Reference](#8-backend-reference)
9. [Frontend Reference](#9-frontend-reference)
10. [Model & Explainability](#10-model--explainability)
11. [Firebase Storage](#11-firebase-storage)
12. [Groq AI Assistant](#12-groq-ai-assistant)
13. [End-to-End Flow](#13-end-to-end-flow)
14. [Security Notes](#14-security-notes)
15. [Troubleshooting](#15-troubleshooting)
16. [Deployment](#16-deployment)

---

## 1. Overview

LeafAI is a full-stack web application that allows farmers and agronomists to:

- **Capture or upload** a leaf image
- Get an **AI-based disease classification** using a fine-tuned CNN
- See **Grad-CAM heatmaps** that explain which regions drove the prediction
- Receive a **structured, farmer-friendly explanation** (cause, impact, treatment, urgency) from a Groq-hosted LLM
- **Chat** with the assistant for deeper questions
- Browse a persistent **history** of past scans

This is not a prototype — every layer is production-grade with modular code, proper error handling, and clean separation of concerns.

---

## 2. System Architecture

```
┌────────────────┐      HTTPS / JSON      ┌─────────────────────┐
│   React SPA    │  ────────────────────▶ │    FastAPI API      │
│  (Vite + TW)   │  ◀──────────────────── │ (Uvicorn, Python)   │
└────────────────┘                        └──────────┬──────────┘
                                                     │
                   ┌─────────────────────────────────┼───────────────────────────────┐
                   ▼                                 ▼                               ▼
          ┌────────────────┐              ┌────────────────────┐          ┌────────────────────┐
          │  PyTorch CNN   │              │ Firebase Storage   │          │    MySQL 8         │
          │ EfficientNet-B0│              │ images + heatmaps  │          │ predictions table  │
          │   + Grad-CAM   │              └────────────────────┘          └────────────────────┘
          └────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │   Groq API     │
          │ llama3-8b-8192 │
          └────────────────┘
```

**Request lifecycle** — `/api/predict`:

1. React uploads the `multipart/form-data` image
2. FastAPI validates MIME and size (≤10 MB)
3. `ModelService` preprocesses and runs inference
4. `GradCAM` generates a heatmap for the top-1 class
5. Both images upload to Firebase Storage → public URLs
6. Row inserted into MySQL
7. Groq returns a structured explanation
8. JSON response streamed to the UI

---

## 3. Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Frontend     | React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Axios |
| Backend      | FastAPI · Uvicorn · Pydantic v2 · SQLAlchemy 2        |
| AI / Vision  | PyTorch 2 · Torchvision · OpenCV · NumPy · Pillow     |
| Explain AI   | Custom Grad-CAM (forward / backward hooks)            |
| LLM          | Groq Python SDK · llama3-8b-8192                      |
| Database     | MySQL 8 (utf8mb4)                                     |
| Storage      | Firebase Admin SDK (Cloud Storage)                    |

---

## 4. Project Structure

```
Akash_App/
├── backend/
│   ├── main.py                     # FastAPI entrypoint + lifespan
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # pydantic-settings
│   │   │   ├── database.py         # SQLAlchemy engine + session
│   │   │   └── firebase.py         # Admin SDK bootstrap
│   │   ├── models/prediction.py    # ORM model
│   │   ├── schemas/
│   │   │   ├── prediction.py       # Pydantic response shapes
│   │   │   └── chat.py             # LLM request/response shapes
│   │   ├── services/
│   │   │   ├── model_service.py    # CNN inference
│   │   │   ├── heatmap_service.py  # Grad-CAM
│   │   │   ├── firebase_service.py # Upload helpers
│   │   │   ├── db_service.py       # Repository layer
│   │   │   └── groq_service.py     # LLM wrapper
│   │   └── routers/
│   │       ├── predict.py          # POST /api/predict
│   │       ├── chat.py             # POST /api/ask-ai, /api/chat
│   │       └── history.py          # GET  /api/history
│   └── ml_model/
│       ├── model.py                # EfficientNet-B0 builder
│       ├── classes.py              # Label ordering
│       └── weights.pth             # (optional) trained checkpoint
├── frontend/
│   ├── src/
│   │   ├── main.jsx · App.jsx · index.css
│   │   ├── api/client.js           # Axios layer
│   │   ├── components/             # Navbar, Loader, ImageUpload,
│   │   │                           # CameraCapture, HeatmapViewer,
│   │   │                           # ResultCard, ChatBox
│   │   └── pages/                  # Home, Scan, Result, Chat, History
│   ├── index.html · vite.config.js
│   ├── tailwind.config.js · postcss.config.js
│   └── package.json
├── database/
│   └── schema.sql                  # MySQL schema
├── .env.example
├── .gitignore
├── requirements.txt
├── README.md
└── DOCUMENTATION.md                # (this file)
```

---

## 5. Setup & Installation

### Prerequisites

- Python **3.10+**
- Node.js **18+**
- MySQL **8.x**
- A Firebase project with Cloud Storage enabled
- A Groq API key (<https://console.groq.com>)

### Step 1 — Clone & configure

```bash
cp .env.example backend/.env
# edit backend/.env — fill in Groq, Firebase, MySQL credentials
```

Drop the Firebase service-account JSON next to the backend (the path must match
`FIREBASE_CREDENTIALS_JSON` in `.env`).

### Step 2 — Database

```bash
mysql -u root -p < database/schema.sql
```

### Step 3 — Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r ../requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open <http://localhost:8000/docs> for the interactive Swagger UI.

### Step 4 — Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL if backend runs elsewhere
npm install
npm run dev            # http://localhost:5173
```

### Step 5 — (Optional) Plug in your trained model

Place a PyTorch state-dict at `backend/ml_model/weights.pth`. It must match the
architecture in [backend/ml_model/model.py](backend/ml_model/model.py) (EfficientNet-B0
head sized to `classes.CLASS_NAMES`). If absent, the app runs with the ImageNet
backbone — predictions will be structurally valid but not agronomically meaningful
until you provide trained weights.

---

## 6. Environment Variables

All secrets live in `backend/.env`. See [.env.example](.env.example).

| Variable | Required | Purpose |
|---|:-:|---|
| `APP_ENV` | – | `development` / `production` |
| `API_HOST` / `API_PORT` | – | Bind address |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |
| `GROQ_API_KEY` | ✅ | From Groq Console |
| `GROQ_MODEL` | – | Defaults to `llama3-8b-8192` |
| `FIREBASE_CREDENTIALS_JSON` | ✅ | Path to service-account JSON |
| `FIREBASE_STORAGE_BUCKET` | ✅ | e.g. `myproj.appspot.com` |
| `MYSQL_HOST` / `PORT` / `USER` / `PASSWORD` / `DATABASE` | ✅ | Connection |
| `MODEL_WEIGHTS_PATH` | – | Defaults to `./ml_model/weights.pth` |

Frontend has exactly one env var:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Defaults to `http://localhost:8000/api` |

---

## 7. Database Schema

```sql
CREATE TABLE predictions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  image_url    VARCHAR(1024)   NOT NULL,
  heatmap_url  VARCHAR(1024)   NOT NULL,
  disease      VARCHAR(128)    NOT NULL,
  confidence   DECIMAL(5,4)    NOT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_created_at (created_at),
  INDEX idx_disease    (disease)
);
```

Confidence is stored as a 4-decimal fixed-point number (0.0000 – 1.0000) to avoid
float drift. `created_at` is indexed for fast descending scans of the history view.

---

## 8. Backend Reference

### `POST /api/predict`

Upload a leaf image and receive a diagnosis.

| Field | Type | Constraints |
|---|---|---|
| `file` | multipart file | `image/jpeg·png·webp·bmp`, ≤10 MB |

**Response `201`**

```json
{
  "id": 42,
  "disease": "Early Leaf Spot",
  "confidence": 0.9341,
  "image_url":   "https://storage.googleapis.com/.../images/<uuid>.png",
  "heatmap_url": "https://storage.googleapis.com/.../heatmaps/<uuid>.png",
  "explanation": "**Cause** ... **Impact** ... **Treatment** ... **Urgency** ...",
  "created_at":  "2026-04-17T12:03:51"
}
```

Errors: `400` invalid image · `413` too large · `415` unsupported type · `502` Firebase/LLM failure.

---

### `POST /api/ask-ai`

```json
{ "disease": "Rust", "question": "Is it safe to harvest early?" }
```

Returns a four-section structured explanation.

### `POST /api/chat`

```json
{
  "disease": "Rust",
  "messages": [
    { "role": "user", "content": "What fungicide should I use?" }
  ]
}
```

Multi-turn conversational endpoint — pass the full message history each call.

### `GET /api/history?limit=50&offset=0`

Returns a list of past predictions, newest first.

### `GET /api/history/{id}`

Returns a single record or `404`.

### `GET /health`

Liveness probe.

---

## 9. Frontend Reference

### Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | Home | Landing page + feature overview |
| `/scan` | Scan | Upload OR camera capture |
| `/result` | Result | Diagnosis + heatmap toggle + AI explanation |
| `/chat` | Chat | Free-form conversational assistant |
| `/history` | History | Grid of past scans |

### Key components

| Component | Responsibility |
|---|---|
| `Navbar` | Glass-morphic nav with active-state highlight |
| `ImageUpload` | Drag-and-drop + file-picker with validation |
| `CameraCapture` | `getUserMedia()` preview + `<canvas>` snapshot |
| `Loader` | Rotating AI-style messages + shimmer bar |
| `HeatmapViewer` | Original ↔ overlay toggle + opacity slider |
| `ResultCard` | Disease label + confidence gauge + severity tone |
| `ChatBox` | Scrolling message list + input + error banner |

### API layer

All HTTP lives in [frontend/src/api/client.js](frontend/src/api/client.js):

```js
import { predictImage, askAI, sendChat, fetchHistory } from '@/api/client'
```

A response interceptor normalises error messages so pages can show them directly.

### State & routing

`react-router-dom` is used with `useLocation().state` to hand predictions from
`/scan → /result → /chat` without any global store — the app is small enough not
to need Redux/Zustand.

---

## 10. Model & Explainability

### Architecture

- **Backbone:** EfficientNet-B0, ImageNet-pretrained
- **Head:** `nn.Linear(in_features, num_classes)` where `num_classes` is derived from
  [classes.py](backend/ml_model/classes.py)
- **Default labels:** Healthy, Early Leaf Spot, Late Leaf Spot, Rust, Rosette, Alternaria Leaf Spot

Edit `CLASS_NAMES` to match your trained label ordering. The classifier head is rebuilt
automatically based on list length.

### Preprocessing

```
Resize(224×224) → ToTensor → Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
```

### Grad-CAM

[heatmap_service.py](backend/app/services/heatmap_service.py) implements Grad-CAM from scratch:

1. Register a forward hook on the last conv block → capture activations `A`
2. Register a full-backward hook → capture gradients `∂y_c/∂A`
3. Spatial mean of gradients = neuron importance weights `α`
4. `CAM = ReLU(Σ α_k · A_k)`, bilinearly upsampled to 224×224 and min-max normalised
5. OpenCV `COLORMAP_JET` overlay + alpha blend with original → PNG

### Plugging in trained weights

```python
# train.py (your own script)
torch.save(model.state_dict(), "backend/ml_model/weights.pth")
```

Supports both raw state-dicts and `{"state_dict": ...}` checkpoints.

---

## 11. Firebase Storage

The Admin SDK is initialised lazily on first upload via
[backend/app/core/firebase.py](backend/app/core/firebase.py) — no cost if `/predict`
is never called.

Uploads go to two folders:

- `images/<uuid>.png` — original leaf image (re-encoded to PNG for consistency)
- `heatmaps/<uuid>.png` — Grad-CAM overlay

Blobs are made public (`blob.make_public()`) so the browser can render them directly
from the returned URL. If your project requires signed URLs instead, swap that call
for `blob.generate_signed_url(expiration=...)` in
[firebase_service.py](backend/app/services/firebase_service.py).

---

## 12. Groq AI Assistant

### System prompt

> "You are an expert agricultural assistant specialising in leaf diseases.
> Explain detected plant diseases in simple, practical terms for a farmer.
> Your answer MUST cover four sections in this exact order, each as a short paragraph
> prefixed with a bolded heading: **Cause**, **Impact**, **Treatment**, **Urgency**."

### Parameters

| | `/ask-ai` | `/chat` |
|---|---|---|
| Temperature | `0.2` | `0.3` |
| Max tokens | `512` | `768` |
| Model | `llama3-8b-8192` | `llama3-8b-8192` |

Front-end [Result.jsx](frontend/src/pages/Result.jsx) parses the `**Heading**` markers
into a 2×2 card grid; raw text is shown as a fallback if parsing yields nothing.

---

## 13. End-to-End Flow

```
 User            Frontend                  Backend              External
  │                │                         │                     │
  │ upload image   │                         │                     │
  ├───────────────▶│                         │                     │
  │                │ POST /api/predict       │                     │
  │                ├────────────────────────▶│                     │
  │                │                         │ preprocess + CNN    │
  │                │                         ├────── Grad-CAM      │
  │                │                         ├────── upload (FB) ─▶│ Firebase
  │                │                         ├────── insert (DB) ─▶│ MySQL
  │                │                         ├────── explain ─────▶│ Groq
  │                │ 201 PredictionResponse  │                     │
  │                │◀────────────────────────┤                     │
  │ result screen  │                         │                     │
  │◀───────────────┤                         │                     │
```

---

## 14. Security Notes

- **No secrets in code.** All creds via env vars; `.env` is in `.gitignore`.
- **MIME + size validation** on `/predict` to block arbitrary uploads.
- **CORS allowlist** via `CORS_ORIGINS`.
- **SQL safety** — all queries use SQLAlchemy parameterised statements.
- **No user auth** is included — add OAuth / JWT if deploying to the public
  internet. Easy plug point: a FastAPI `Depends(auth)` on each router.
- **Public Firebase URLs** — replace with signed URLs if images contain anything
  sensitive (locations, crop counts, etc.).

---

## 15. Troubleshooting

| Symptom | Fix |
|---|---|
| `MySQL init skipped: …` warning at boot | Start MySQL, confirm creds, re-run. Tables create lazily. |
| `Firebase credentials not found` | Set `FIREBASE_CREDENTIALS_JSON` to a valid path. |
| `GROQ_API_KEY is not configured` | Add your key to `backend/.env`. |
| Predictions all same class | You're running with ImageNet backbone — drop in a trained `weights.pth`. |
| CORS error in browser | Add your frontend origin to `CORS_ORIGINS`. |
| Camera permission denied | Browser requires HTTPS for `getUserMedia` on non-localhost hosts. |
| `413 Request Entity Too Large` | Image >10 MB — resize before upload (or raise `MAX_BYTES` in `predict.py`). |

---

## 16. Deployment

### Backend (Docker-ready pattern)

```Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Mount your Firebase JSON and `weights.pth` as secrets / volumes. Add a reverse proxy
(Nginx / Traefik) for TLS termination.

### Frontend

```bash
cd frontend
npm run build           # emits /dist
```

Serve `dist/` behind any CDN or static host (Netlify, Vercel, S3+CloudFront, Firebase
Hosting). Set `VITE_API_BASE_URL` at build time to the production API URL.

### Production checklist

- [ ] MySQL backups configured
- [ ] Firebase Storage lifecycle rules (cleanup old scans)
- [ ] Rate-limit `/predict` and `/chat` (FastAPI middleware or gateway)
- [ ] Observability: structured logs, `/health` probe wired to orchestrator
- [ ] GPU worker if scan volume is high (swap `device` to `cuda`)
- [ ] Add auth before exposing publicly

---

Built with FastAPI · PyTorch · React · Tailwind · Firebase · MySQL · Groq.
