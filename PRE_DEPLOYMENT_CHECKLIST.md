# 🚀 Pre-Deployment Checklist for Focusify

## Backend Checklist

### Security
- [ ] JWT_SECRET updated (not default)
- [ ] Helmet middleware installed (`npm install helmet`)
- [ ] Rate limiting installed (`npm install express-rate-limit`)
- [ ] Rate limiter applied to /login and /register
- [ ] Error messages don't expose sensitive info
- [ ] NODE_ENV set to "production"
- [ ] Password hashing with bcryptjs verified

### Database
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Connection string obtained
- [ ] Username/password credentials saved securely
- [ ] IP whitelist configured (add Vercel IPs)
- [ ] MONGO_URI updated in .env

### Configuration
- [ ] FRONTEND_URL matches production domain
- [ ] PORT set appropriately
- [ ] All required env vars defined
- [ ] .env file NOT committed to Git (.gitignore ✓)
- [ ] nodemon removed from production deps (or prod only)

### Testing
- [ ] `npm install` runs without errors
- [ ] `node src/server.js` starts without crashing
- [ ] `/api/health` endpoint responds
- [ ] Can register new user locally
- [ ] Can login with registered user
- [ ] JWT tokens generated correctly
- [ ] Token refresh works

### Code Quality
- [ ] No console.log() left in production code
- [ ] No hardcoded credentials
- [ ] Error handling middleware attached
- [ ] All routes return proper JSON
- [ ] No unhandled promise rejections

---

## Frontend Checklist

### Environment
- [ ] .env.production created
- [ ] VITE_API_URL points to backend deployment URL
- [ ] No hardcoded localhost URLs
- [ ] No sensitive data in env files
- [ ] .env files in .gitignore

### Security
- [ ] No API keys in frontend code
- [ ] JWT tokens handled securely
- [ ] Auto-logout on token expiry
- [ ] Protected routes redirect to login
- [ ] CORS headers accepted from backend

### Build & Performance
- [ ] `npm install` completes
- [ ] `npm run build` succeeds
- [ ] Build output in `/dist` directory
- [ ] No TypeScript errors
- [ ] No console errors in build

### Testing (Local)
- [ ] Can access http://localhost:5174
- [ ] Auth page loads correctly
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Dashboard displays after login
- [ ] Can create focus session
- [ ] Session saved to localStorage
- [ ] Can logout
- [ ] Cannot access protected routes when logged out

---

## Deployment Checklist

### Backend (Vercel)
- [ ] Vercel account created
- [ ] Backend code pushed to GitHub
- [ ] Vercel connected to GitHub repo
- [ ] Environment variables added to Vercel:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL
  - [ ] PORT=5000
- [ ] Backend deployed successfully
- [ ] Backend URL obtained (e.g., https://focusify-backend.vercel.app)
- [ ] Backend responds: curl https://focusify-backend.vercel.app/api/health

### Frontend (Vercel)
- [ ] Frontend code pushed to GitHub
- [ ] Vercel connected to GitHub repo
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added to Vercel:
  - [ ] VITE_API_URL=<backend_url>
  - [ ] VITE_ENVIRONMENT=production
- [ ] Frontend deployed successfully
- [ ] Frontend URL obtained (e.g., https://focusify.vercel.app)

---

## Post-Deployment Verification

### Backend Tests
```bash
# Test health check
curl https://focusify-backend.vercel.app/api/health

# Test registration (replace email/username/password)
curl -X POST https://focusify-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123"
  }'

# Test login
curl -X POST https://focusify-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Frontend Tests
- [ ] Can access https://focusify.vercel.app
- [ ] Auth page loads
- [ ] Can register new account
- [ ] Can login with account
- [ ] Dashboard shows after login
- [ ] Can create focus session
- [ ] Can logout
- [ ] Can login on different device with same account
- [ ] Sessions sync across devices

### Cross-Device Test
1. [ ] Register account on Desktop
2. [ ] Login on Mobile with same account
3. [ ] Create session on Desktop
4. [ ] Verify session appears on Mobile
5. [ ] Logout on Desktop
6. [ ] Verify still logged in on Mobile
7. [ ] Logout on Mobile

---

## Monitoring & Logs

### Things to Monitor
- [ ] Error logs in Vercel dashboard
- [ ] Response times
- [ ] Database connection status
- [ ] Rate limiting statistics
- [ ] Failed login attempts

### Setup Monitoring (Optional)
- [ ] Sentry integration for error tracking
- [ ] LogRocket for session replay
- [ ] Vercel Analytics enabled
- [ ] MongoDB Atlas alerts configured

---

## Rollback Plan (If Issues)

If production fails:
1. [ ] Check Vercel logs for errors
2. [ ] Verify environment variables are set
3. [ ] Verify MongoDB connection
4. [ ] Restart deployment
5. [ ] Check error handler output
6. [ ] Consider reverting to last working commit

---

## After Going Live

- [ ] Announce on social media
- [ ] Update website with product link
- [ ] Monitor error rates for first 24 hours
- [ ] Collect user feedback
- [ ] Plan improvements based on usage data

---

## Important Reminders ⚠️

- [ ] NEVER commit .env files with real credentials
- [ ] ALWAYS use HTTPS (Vercel auto-enables)
- [ ] ALWAYS keep JWT_SECRET private
- [ ] ALWAYS validate input on backend
- [ ] ALWAYS test before deploying
- [ ] ALWAYS have a rollback plan
- [ ] ALWAYS monitor production errors
- [ ] ALWAYS rotate secrets periodically

---

**Ready to deploy?** Check off all boxes above before proceeding! ✅
