# CP Helper Deployment Guide

## 🚀 Quick Deploy Commands

### Backend (Render.com)
```bash
# 1. Push to GitHub
git add . && git commit -m "RAG system" && git push

# 2. On render.com:
#    - Create Web Service
#    - Connect GitHub repo
#    - Build: npm install
#    - Start: node src/server.js

# 3. Add Environment Variables:
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
```

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
