# 🚀 Production Deployment - Your Configuration

**Generated on:** May 12, 2026
**Status:** Ready for Deployment

---

## 🔑 Generated Secrets (KEEP SAFE!)

```
JWT_SECRET = 53b5f6019919c590dffe0fe6519a7230e20e299ae9587ec9e62ebfa30ea1792a
```

⚠️ **NEVER** share this publicly or commit to GitHub!

---

## 🗄️ MongoDB Atlas Configuration

After setup, your connection string will look like:

```
MONGO_URI = mongodb+srv://focusify_user:<PASSWORD>@cluster0.xxxxx.mongodb.net/focusify?retryWrites=true&w=majority
```

Replace `<PASSWORD>` with your database user password.

---

## 🔗 Production URLs (After Deployment)

After you deploy, you'll get these URLs:

```
Backend URL: https://focusify-backend-XXXXX.vercel.app
Frontend URL: https://focusify-XXXXX.vercel.app
```

Update these in environment variables!

---

## 📋 Backend Environment Variables for Vercel

Set these in Vercel Dashboard → focusify-backend → Settings → Environment Variables:

```
JWT_SECRET = 53b5f6019919c590dffe0fe6519a7230e20e299ae9587ec9e62ebfa30ea1792a
MONGO_URI = mongodb+srv://focusify_user:PASSWORD@cluster0.xxxxx.mongodb.net/focusify?retryWrites=true&w=majority
NODE_ENV = production
FRONTEND_URL = https://focusify-XXXXX.vercel.app
PORT = 5000
```

---

## 📋 Frontend Environment Variables for Vercel

File: `.env.production`

```
VITE_API_URL = https://focusify-backend-XXXXX.vercel.app
VITE_ENVIRONMENT = production
```

---

## ✅ Deployment Checklist

### MongoDB Atlas
- [ ] Account created
- [ ] Cluster created in Singapore/Asia region
- [ ] Database user created (focusify_user)
- [ ] Connection string obtained
- [ ] IP whitelist configured (Allow access from anywhere)

### Backend Deployment
- [ ] Vercel account connected to GitHub
- [ ] Backend project deployed
- [ ] All environment variables added
- [ ] Redeploy executed with new env vars
- [ ] Health check responds (/api/health)
- [ ] Backend URL copied

### Frontend Deployment
- [ ] .env.production updated with backend URL
- [ ] Frontend code committed to GitHub
- [ ] Frontend project deployed
- [ ] Application loads
- [ ] Frontend URL copied

### Backend Update
- [ ] FRONTEND_URL updated in backend env vars
- [ ] Backend redeployed

### Production Testing
- [ ] Backend health check works
- [ ] Can register user
- [ ] Can login user
- [ ] Can create session
- [ ] Sessions sync across devices

---

## 🔐 Security Reminders

✅ Do:
- Set strong JWT_SECRET (use generated one)
- Use strong database password
- Enable HTTPS (Vercel auto-enables)
- Add IP whitelist to MongoDB
- Keep credentials in Vercel secrets, not code

❌ Don't:
- Commit .env files with real secrets
- Use default/weak passwords
- Disable CORS
- Expose JWT_SECRET publicly
- Share database credentials

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
→ Check IP whitelist in MongoDB Atlas Network Access
→ Verify MONGO_URI connection string
→ Ensure password doesn't have special characters that need URL encoding

### "Invalid token errors"
→ Verify JWT_SECRET matches in Vercel env vars
→ Check NODE_ENV = production
→ Restart deployment

### "CORS errors"
→ Verify FRONTEND_URL in backend env vars
→ Check frontend VITE_API_URL points to correct backend
→ Ensure no typos in URLs

### "Rate limited immediately"
→ Rate limiting is working correctly (feature, not bug)
→ Wait 15 minutes or adjust max attempts in code

---

Generated with: Focusify Security Team
Version: 1.0 - Production Ready
