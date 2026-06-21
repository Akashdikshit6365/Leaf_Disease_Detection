# Deploy Backend To Render

This repo is now ready for a Render Blueprint deployment using `render.yaml`.

Render must use Python 3.12 for this backend. The repo includes `.python-version`
files for this because Render's current default Python version is too new for the
pinned PyTorch dependencies.

## Before Deploying

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Make sure you have production services for:
   - MongoDB Atlas
   - Cloudinary
   - Gemini API
   - Groq API, if you use chat/explanation routes

## Render Steps

1. Open Render Dashboard.
2. Click **New** > **Blueprint**.
3. Connect this repository.
4. Select the branch you want to deploy.
5. Render will read `render.yaml` from the repo root.
6. Fill the prompted environment variables:

```text
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

Render config used by the Blueprint:

```text
Python Version: 3.12.4
Root Directory: backend
Build Command: pip install --upgrade pip && pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

## After Deploying

Your API base URL will look like:

```text
https://leafai-backend.onrender.com/api
```

Use that value in the frontend environment variable:

```text
VITE_API_BASE_URL=https://leafai-backend.onrender.com/api
```

Then redeploy the frontend.

## Notes

- `SKIP_MODEL_WARMUP=true` keeps Render startup light.
- `backend/ml_model/weights.pth` is gitignored. The current Gemini diagnosis path does not need it for startup, but any route that loads local PyTorch metadata or predictions will need the weights file available on Render.
- Render free instances sleep after inactivity, so the first request after sleeping can be slow.
