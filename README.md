# 🌿 LeafAI

**Production-grade AI system for leaf disease detection** — with explainable heatmaps (Grad-CAM) and an LLM-powered chat assistant (Groq · llama3-8b-8192).

> 📘 Full technical reference → **[DOCUMENTATION.md](DOCUMENTATION.md)**

---

## ✨ Features

- 🔎 **Instant diagnosis** — upload or live-capture a leaf image
- 🧠 **Explainable AI** — Grad-CAM heatmap overlay shows *why* the model predicted what it did
- 💬 **Expert assistant** — Groq LLM explains cause · impact · treatment · urgency
- 📂 **Scan history** — every prediction persisted in MySQL with its image + heatmap
- 🎨 **Premium dark UI** — glassmorphism, neon-green accents, AI-style loading cues

---

## 🧱 Stack

| Layer | Tech |
|---|---|
| Frontend | React · Vite · Tailwind CSS · Axios · React Router |
| Backend  | FastAPI · Uvicorn · Pydantic v2 · SQLAlchemy 2 |
| AI       | PyTorch · Torchvision (EfficientNet-B0) · OpenCV · custom Grad-CAM |
| LLM      | Groq API (`llama3-8b-8192`) |
| Database | MySQL 8 |
| Storage  | Firebase Cloud Storage (images + heatmaps) |

---

## 🏗 Architecture

```
React (Vite, Tailwind) ──► FastAPI ──► PyTorch CNN + Grad-CAM
                              │
                              ├──► Firebase Storage   (images + heatmaps)
                              ├──► MySQL              (prediction history)
                              └──► Groq API           (explanations + chat)
```

---

## 📁 Project Layout

```
Akash_App/
├── backend/               FastAPI service
│   ├── main.py
│   ├── app/
│   │   ├── core/          config · database · firebase
│   │   ├── routers/       /predict · /ask-ai · /chat · /history
│   │   ├── services/      model · heatmap · firebase · db · groq
│   │   ├── schemas/       Pydantic shapes
│   │   └── models/        ORM table
│   └── ml_model/          CNN builder + class labels
├── frontend/              React + Vite + Tailwind
│   └── src/
│       ├── pages/         Home · Scan · Result · Chat · History
│       ├── components/    Navbar · ImageUpload · CameraCapture ·
│       │                  HeatmapViewer · ResultCard · ChatBox · Loader
│       └── api/           Axios client
├── database/schema.sql    MySQL schema
├── requirements.txt       Python deps
├── .env.example           Env template
├── DOCUMENTATION.md       Full technical reference
└── README.md              (this file)
```

---

## 🚀 Quick Start

### 1 — Prerequisites

- Python 3.10+ · Node 18+ · MySQL 8
- A Groq API key → <https://console.groq.com>
- A Firebase project with Cloud Storage + a service-account JSON

### 2 — Database

```bash
mysql -u root -p < database/schema.sql
```

### 3 — Backend

```bash
cp .env.example backend/.env        # fill in secrets
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn main:app --reload           # http://localhost:8000  ·  /docs for Swagger
```

### 4 — Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                         # http://localhost:5173
```

### 5 — (Optional) Drop in your trained model

Place a PyTorch state-dict at `backend/ml_model/weights.pth`. Until then the app
runs on the ImageNet backbone — structurally valid but not agronomically meaningful.

---

## 🔐 Configuration

All secrets live in `backend/.env`. See [.env.example](.env.example) — required keys:

```env
GROQ_API_KEY=...
GROQ_MODEL=llama3-8b-8192
FIREBASE_CREDENTIALS_JSON=./firebase-credentials.json
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
MYSQL_HOST=...
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=leafai
```

No credentials are ever hardcoded.

---

## 🩺 API

| Method | Path                  | Purpose                                   |
|--------|-----------------------|-------------------------------------------|
| `POST` | `/api/predict`        | Image → disease + confidence + heatmap    |
| `POST` | `/api/ask-ai`         | Disease name → structured LLM explanation |
| `POST` | `/api/chat`           | Multi-turn conversation with context      |
| `GET`  | `/api/history`        | Recent predictions (paginated)            |
| `GET`  | `/api/history/{id}`   | Single record                             |
| `GET`  | `/health`             | Liveness probe                            |

Full schemas and error codes are in [DOCUMENTATION.md](DOCUMENTATION.md#8-backend-reference).

---

## 🎨 UI Preview

| Page | Purpose |
|---|---|
| [Home](frontend/src/pages/Home.jsx)       | Landing + feature overview |
| [Scan](frontend/src/pages/Scan.jsx)       | Upload / live camera capture |
| [Result](frontend/src/pages/Result.jsx)   | Diagnosis + heatmap toggle + AI explanation |
| [Chat](frontend/src/pages/Chat.jsx)       | Free-form LLM assistant with disease context |
| [History](frontend/src/pages/History.jsx) | Grid of past scans |

Theme: black / dark gray + neon-green accent · glassmorphism cards · animated AI-style loaders:

> *“Analyzing leaf patterns…”* → *“Detecting disease…”* → *“Generating insights…”*

---

## 🧠 Model & Explainability

- **Backbone** — EfficientNet-B0 (ImageNet-pretrained)
- **Head** — `nn.Linear` sized to [classes.py](backend/ml_model/classes.py)
- **Explainability** — custom Grad-CAM via forward / backward hooks on the last
  conv block ([heatmap_service.py](backend/app/services/heatmap_service.py))
- **Placeholder-safe** — if `weights.pth` is missing the app logs a warning and
  falls back to the pretrained backbone so the full pipeline still runs end-to-end

---

## ☁️ Firebase Integration

The Admin SDK initialises lazily on first upload. Each scan writes two objects:

- `images/<uuid>.png`    — normalised original
- `heatmaps/<uuid>.png`  — Grad-CAM overlay

Blobs are returned as public URLs. Swap to signed URLs in
[firebase_service.py](backend/app/services/firebase_service.py) if privacy is required.

---

## 🤖 Groq Integration

System prompt enforces a four-section reply — **Cause**, **Impact**, **Treatment**,
**Urgency** — which the frontend parses into a clean card grid.

---

## 🧪 Engineering Standards

- Modular, layered architecture (core · services · routers · schemas · models)
- Pydantic v2 for strict request / response validation
- SQLAlchemy parameterised queries — no SQL injection surface
- Axios response interceptor normalises errors for UI display
- All env-driven config; no hardcoded URLs, keys, or paths
- Clean Tailwind component classes — no inline style spaghetti

---

## 📄 License

Proprietary — adapt for your farm, your lab, your product. Not yet OSS-licensed.

---

Built with FastAPI · PyTorch · React · Tailwind · Firebase · MySQL · Groq.
