# LeafAI — Setup Guide

---

## Install Required Software

- **Node.js 18+** → https://nodejs.org/
- **Python 3.10+** → https://www.python.org/
- **MySQL 8.0+** → https://dev.mysql.com/downloads/mysql/

---

## 1️⃣ Database

```bash
mysql -u root -p < database/schema.sql
```

This creates the `leafai` database with all tables.

---

## 2️⃣ Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate              # Windows
# OR
source .venv/bin/activate           # macOS/Linux

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
DEBUG=True
```

Start:
```bash
uvicorn main:app --reload
```

**Backend ready:** http://localhost:8000/docs

---

## 3️⃣ Frontend

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

**Frontend ready:** http://localhost:5173

---

## 📱 Build APK

```bash
cd frontend
npm run build
cd android
./gradlew assembleDebug
```

**APK:** `app/build/outputs/apk/debug/app-debug.apk`

---

## ❓ Issues?

- **Backend won't start:** Check MySQL is running & `.env` is correct
- **Frontend won't start:** Run `npm install` again
- **APK won't build:** Set `JAVA_HOME` environment variable

---

**See ENV_REFERENCE.md for detailed env variables.**
