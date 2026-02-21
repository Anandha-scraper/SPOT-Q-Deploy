# Production Setup Guide

## Current Production URLs
- **Frontend (Vercel):** https://spot-q-deploy.vercel.app
- **Backend (Render):** https://sakthi-auto-backend.onrender.com

## Backend Configuration (Render)

### Environment Variables to Set:
Go to Render Dashboard → Your Service → Environment

```env
MONGODB_URI=your-mongodb-atlas-connection-string
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://spot-q-deploy.vercel.app
JWT_SECRET=your-secure-secret-key
JWT_EXPIRE=7d
```

### Important:
- **FRONTEND_URL** must match your exact Vercel deployment URL
- After setting/changing env vars, redeploy the service
- Check logs for "SPOT-Q Database Connected" and "Server running on port 5000"

## Frontend Configuration (Vercel)

### Environment Variables to Set:
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

```env
VITE_API_URL=https://sakthi-auto-backend.onrender.com
```

### Important:
- **VITE_API_URL** must match your exact Render backend URL
- Apply to "Production" environment
- After setting, redeploy or push new code
- The variable is read at build time, not runtime

### Deploy:
```bash
git add .
git commit -m "Fix CORS and production URLs"
git push origin main
```

Vercel will auto-deploy from your Git repository.

## Testing Production

1. Visit: https://spot-q-deploy.vercel.app
2. Check browser console for errors
3. Verify backend URL in Network tab
4. Test login functionality

## Troubleshooting

### CORS Errors:
- ✅ Backend now allows `https://spot-q-deploy.vercel.app`
- ✅ Verify `FRONTEND_URL` is set correctly in Render
- Redeploy backend after changing env vars

### 404 Errors:
- Check backend is running: https://sakthi-auto-backend.onrender.com/api/health
- Verify routes are correct
- Check Render logs for errors

### Login Not Working:
- Clear browser cookies for the domain
- Check Network tab to see actual request URL
- Verify JWT_SECRET is set in backend env vars

### Database Issues:
- Use MongoDB Atlas for production
- Whitelist Render's IP addresses in MongoDB Atlas
- Verify MONGODB_URI is correct

## Quick Checklist

Backend (Render):
- [ ] FRONTEND_URL set to Vercel domain
- [ ] MongoDB Atlas connection string set
- [ ] JWT_SECRET configured
- [ ] Deployment successful
- [ ] Logs show "Database Connected"

Frontend (Vercel):
- [ ] Latest code pushed to Git
- [ ] Auto-deploy triggered
- [ ] Build successful
- [ ] Can access the site

## Need to Redeploy?

**Backend:**
- Render Dashboard → Manual Deploy → Deploy latest commit

**Frontend:**
- Vercel Dashboard → Deployments → Redeploy
- Or push to Git (auto-deploys)

## Cookie/Session Issues

Since you're using httpOnly cookies for authentication across different domains:

1. Cookies might not work in production due to SameSite restrictions
2. Consider switching to JWT in localStorage for production
3. Or serve frontend and backend from same domain using a reverse proxy
