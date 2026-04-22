# Local Storage Fallback and Firebase Re-enable Guide

This project now stores uploaded images and generated heatmaps on the local machine because the Firebase Cloud Storage billing account is still under verification.

## Files changed

1. `backend/app/routers/predict.py`
   - Switched the active upload flow from Firebase to local storage.
   - Kept the old Firebase upload lines commented in place for quick restore.
   - Added `Request` so the backend can build absolute image URLs like `http://localhost:8000/uploads/images/...`.

2. `backend/app/services/local_storage_service.py`
   - New service that saves image bytes into:
   - `backend/uploads/images/`
   - `backend/uploads/heatmaps/`
   - Returns public URLs that the frontend can render immediately.

3. `backend/app/core/config.py`
   - Added `local_uploads_dir`, defaulting to `backend/uploads`.

4. `backend/main.py`
   - Ensures the uploads directory exists on startup.
   - Mounts `/uploads` as a static route so saved files are accessible in the browser.

## Current behavior

- New predictions save original PNGs to `backend/uploads/images/`
- New heatmaps save PNGs to `backend/uploads/heatmaps/`
- Database rows still store URLs in the same `image_url` and `heatmap_url` columns
- Frontend code does not need to change because it still receives normal URLs

## How to switch back to Firebase later

When billing verification is complete, update these places:

1. `backend/.env`
   - Make sure these values are valid:
   - `FIREBASE_CREDENTIALS_JSON`
   - `FIREBASE_STORAGE_BUCKET`

2. `backend/app/routers/predict.py`
   - Remove or comment the local-storage lines:
   ```python
   image_url = local_storage_service.save_bytes(original_png, folder="images", base_url=base_url)
   heatmap_url = local_storage_service.save_bytes(heatmap_png, folder="heatmaps", base_url=base_url)
   ```
   - Uncomment the Firebase lines already present in the file:
   ```python
   image_url = firebase_service.upload_bytes(original_png, folder="images")
   heatmap_url = firebase_service.upload_bytes(heatmap_png, folder="heatmaps")
   ```

3. Optional cleanup
   - You can keep `local_storage_service.py`, `local_uploads_dir`, and the `/uploads` mount as a fallback path.
   - If you no longer want local storage support, you can remove:
   - `backend/app/services/local_storage_service.py`
   - `local_uploads_dir` in `backend/app/core/config.py`
   - `app.mount("/uploads", ...)` in `backend/main.py`

## Notes

- Existing history rows that already point to Firebase will continue to work if those Firebase URLs are still valid.
- New rows created after this change will point to local backend-hosted files.
- If the backend host or port changes, newly generated local URLs will automatically use the request base URL for that environment.
