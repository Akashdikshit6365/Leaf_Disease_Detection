# LeafAI Run Guide

## Prerequisites

- Python 3.12
- Node.js 18 or newer
- Java JDK 17 or newer for Android builds
- Android Studio for Capacitor Android builds

## 1. Backend Start Command

Create `backend/.env` from `.env.example` and fill your keys first.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

## 2. Frontend Start Command

Create `frontend/.env` from `frontend/.env.example`.

For local backend:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 3. Mobile App Build Command Using Capacitor

From the frontend folder:

```bash
cd frontend
npm install
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

The debug APK will be generated under:

```text
frontend/android/app/build/outputs/apk/debug/
```

To open the Android project in Android Studio:

```bash
cd frontend
npx cap open android
```
