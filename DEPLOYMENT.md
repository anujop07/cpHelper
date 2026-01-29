# CP Helper Deployment Guide

## 🚀 Quick Deploy Commands

### Backend (Render / Railway)
1. **Push to GitHub**
   ```bash
   git add . && git commit -m "Deploy RAG" && git push
   ```
2. **Add Environment Variables** (Critical!)
   Go to your dashboard (Railway/Render) and add these:
   
   | Variable | Value | Note |
   |----------|-------|------|
   | `MONGO_URI` | `mongodb+srv://...` | Connection String |
   | `JWT_SECRET` | `supersecretkey123` | Must match local! |
   | `JWT_EXPIRE` | `7d` | Token expiry |
   | `GROQ_API_KEY` | `gsk_...` | For AI Search |

   > **Railway Note:** If using Railway's MongoDB plugin, it might provide `MONGO_URL`. You MUST create a variable named `MONGO_URI` with that value.

### Frontend (Vercel)
```bash
# vercel.json already exists
# Just connect GitHub repo on vercel.com
# Set: VITE_BACKEND_URL=https://your-backend.onrender.com
```

---

## ⚠️ Important: Index Files

The RAG index files are NOT in git (too large). Options:

### Option 1: Include in Deploy (Simple)
Add to `.gitignore` exception:
```
!preprocessing/output/index-*.json
!preprocessing/output/index-*.bin
```

### Option 2: Cloud Storage (Better)
Upload to S3/GCS and download on server start.

---

## 📋 Checklist

- [ ] MongoDB Atlas setup
- [ ] Backend deployed (Render)
- [ ] Frontend deployed (Vercel)
- [ ] Environment variables set
- [ ] Index files accessible
- [ ] Test login + RAG search
