# 🚀 Vercel Backend Deployment - Step by Step

## **Persiapan:**

### Pastikan Anda sudah punya:
- ✅ GitHub repo pushed (DONE)
- ✅ MongoDB URI: `mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/?appName=focusify`
- ✅ JWT_SECRET: `5b4b9bd79f77d4453a8abbc4db321603ce03983389dfe1a2ef54ce9ea40a0ad9`
- Akun Vercel (https://vercel.com/dashboard)

---

## **STEP 1: Login ke Vercel dan Create New Project**

1. Buka https://vercel.com/dashboard
2. Klik **"Add New..."** → pilih **"Project"**
3. Pilih repository: **focusify-final-project-imk**
4. Klik **"Import"**

---

## **STEP 2: Setup Vercel Project Configuration**

Di halaman project setup:

### Framework Preset:
- **Framework**: Pilih **"Other"** (bukan Node.js)
- **Root Directory**: Ubah dari `./` ke `./focusify-backend`

### Environment Variables:
Klik **"Environment Variables"** dan add 3 variables:

| Variable | Value |
|----------|-------|
| **MONGODB_URI** | `mongodb+srv://rafzdfizet_db_user:L3ZAjNyZGCshsxt0@focusify.lh7ipm1.mongodb.net/?appName=focusify` |
| **JWT_SECRET** | `5b4b9bd79f77d4453a8abbc4db321603ce03983389dfe1a2ef54ce9ea40a0ad9` |
| **NODE_ENV** | `production` |
| **FRONTEND_URL** | Diisi kemudian setelah frontend di-deploy (contoh: `https://focusify-frontend.vercel.app`) |

> ⚠️ **PENTING**: Jangan paste di public area, cukup di environment variable section!

---

## **STEP 3: Deploy Backend**

1. Klik **"Deploy"** (ubah settings di atas jika ada warning)
2. Tunggu build selesai (±1-2 menit)
3. Jika sukses → Anda akan dapat URL seperti: `https://focusify-backend-xxxxx.vercel.app`

---

## **STEP 4: Test Backend Health Check**

Setelah deploy sukses:

```bash
curl https://[BACKEND_URL].vercel.app/api/health
```

Harusnya response:
```json
{ "status": "Backend is running! 🚀" }
```

---

## **STEP 5: Save Backend URL untuk Frontend**

Catat URL backend yang di-deploy: `https://[BACKEND_URL].vercel.app`

Anda akan butuh ini untuk setup frontend di Vercel nanti.

---

## **Troubleshooting:**

### ❌ Build Failed - "Module not found"
**Solusi:**
```bash
cd focusify-backend
npm install
npm run build  # jika ada build script
```

### ❌ Deployment Failed - "CORS error"
**Update** `focusify-backend/src/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://focusify-frontend.vercel.app'  // Add frontend URL nanti
  ],
  credentials: true
}))
```

### ❌ "Cannot find module dotenv"
**Pastikan** `package.json` punya:
```json
"dotenv": "^16.0.3"
```

Jika tidak ada, update di focusify-backend `package.json`.

---

## **Checklist:**

- [ ] GitHub pushed dengan vercel.json
- [ ] Vercel account sudah login
- [ ] Import repository dari GitHub
- [ ] Root directory set ke `./focusify-backend`
- [ ] 3 Environment variables ter-add (MONGODB_URI, JWT_SECRET, NODE_ENV)
- [ ] Deploy button diklik
- [ ] Build selesai (bukan failed)
- [ ] Health check tested
- [ ] Backend URL di-catat

---

**Apa yang terjadi setelah ini:**
1. ✅ Backend berjalan di Vercel
2. ⏭️ Deploy frontend ke Vercel (dengan backend URL)
3. ⏭️ Test cross-device functionality

**Sudah siap? Lanjut ke deploy frontend!**
