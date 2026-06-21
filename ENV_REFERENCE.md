# Environment Variables

---

## Backend `.env`

```env
# Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=leafai

# Groq API (for explanations & chat)
GROQ_API_KEY=your_key_from_console.groq.com
GROQ_MODEL=llama-3.1-8b-instant
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct

# Cloudinary (for image storage)
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
CLOUDINARY_IMAGE_FOLDER=LeafAI/images
CLOUDINARY_HEATMAP_FOLDER=LeafAI/heatmaps

# Server
ENVIRONMENT=development
DEBUG=True
```

---

## Frontend `.env`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_MOBILE_API_BASE_URL=http://YOUR_LAPTOP_LAN_IP:8000/api
VITE_APP_NAME=LeafAI
```

---

## Getting API Keys

### Groq Key
1. Go to https://console.groq.com
2. Sign in → API Keys
3. Create key → Copy to `GROQ_API_KEY`

### Cloudinary
1. Go to https://cloudinary.com
2. Sign in → Dashboard
3. Copy URL format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

### MySQL
- Default: `root` with password you set during installation

---

## Production

Change these for production:
```env
# Backend
ENVIRONMENT=production
DEBUG=False
MYSQL_HOST=your_prod_db_url

# Frontend
VITE_API_BASE_URL=https://your_api_domain.com/api
```

---

**.env files go in `backend/` and `frontend/` directories.**
