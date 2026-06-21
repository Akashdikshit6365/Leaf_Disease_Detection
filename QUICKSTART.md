# 🚀 Quick Start Guide

**Get LeafAI running in 5 minutes.**

---

## Step 1: Database

```bash
mysql -u root -p < database/schema.sql
```

---

## Step 2: Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=leafai
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.1-8b-instant
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
CLOUDINARY_IMAGE_FOLDER=LeafAI/images
CLOUDINARY_HEATMAP_FOLDER=LeafAI/heatmaps
ENVIRONMENT=development
```

Start:
```bash
uvicorn main:app --reload
```

**API:** http://localhost:8000/docs

---

## Step 3: Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_MOBILE_API_BASE_URL=http://YOUR_LAPTOP_LAN_IP:8000/api
VITE_APP_NAME=LeafAI
```

Start:
```bash
npm run dev
```

**Open:** http://localhost:5173

---

## ✅ You're Done!

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Database: MySQL on localhost:3306

Test by uploading a leaf image on the home page.

---

## 📱 Build Mobile APK

```bash
cd frontend
npm run build
cd android
./gradlew assembleDebug
```

**APK:** `app/build/outputs/apk/debug/app-debug.apk`

---

**For detailed setup** → See `PROJECT_SETUP.md`
