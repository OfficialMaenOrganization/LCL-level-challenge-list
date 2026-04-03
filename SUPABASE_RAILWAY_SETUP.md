# 🚀 Supabase + Railway Deployment Guide for LCL

## ✅ Status: SUPABASE CONFIGURED

Your project is now ready to use Supabase for the database!

---

## 🔧 Step 1: Set Up Supabase Tables (Required)

### Option A: Using SQL Editor (Recommended)

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/projects
   ```

2. **Select your project:** `bbvfpwcppnvdmoqzdapk`

3. **Go to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

4. **Copy and paste the entire content from:** `SUPABASE_SETUP.sql`

5. **Run the query** (green play button)

6. **Verify tables created:**
   - Go to "Table Editor" in left sidebar
   - You should see: `users`, `levels`, `settings`

### Option B: Using Table Editor manually

1. Create 3 tables:
   - **users**: id (TEXT), email, display_name, password, is_admin
   - **levels**: id (INT), name, level_id, url, youtube_url, thumbnail, difficulty, submitted_by, submitted_date, status
   - **settings**: id (INT), theme, language, dark_background

---

## 📦 Step 2: Install Dependencies

```powershell
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variables
- `express` - Web server

---

## 🏃 Step 3: Run Locally (Test)

```powershell
npm start
```

You should see:
```
✅ Supabase client initialized
✅ Database tables ready
🚀 Server running on: http://localhost:3000
☁️  Database: Supabase Cloud (Production Ready)
```

Test in your browser:
- Edge: `http://localhost:3000`
- Brave: `http://localhost:3000`

---

## 🛒 Step 4: Deploy to Railway

### Prerequisites:
- Railway account: https://railway.app
- This GitHub repo (or upload zip)

### Deployment Steps:

1. **Push to GitHub** (if using repo):
   ```powershell
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

2. **On Railway Dashboard:**
   - Click "+ New Project"
   - Select "Deploy from GitHub"
   - Choose your repo
   - Grant permissions

3. **Set Environment Variables in Railway:**
   - Go to your Railway project → "Variables"
   - Add:
     ```
     SUPABASE_URL=https://bbvfpwcppnvdmoqzdapk.supabase.co
     SUPABASE_ANON_KEY=sb_publishable_u6fT7-ezI3EfalZyzW-n4w_SD6xlEBx
     PORT=3000
     NODE_ENV=production
     ```

4. **Configure package.json** (already done):
   - `npm install` and `npm start` scripts exist

5. **Deploy:**
   - Railway auto-deploys on git push
   - Go to "Deployments" tab
   - Wait for green checkmark

6. **Get Your Live URL:**
   - Click "Domain" tab
   - Copy the Railway domain
   - Example: `https://my-app.up.railway.app`

---

## 🌐 Step 5: Access Your Live App

- Go to: `https://YOUR_RAILWAY_DOMAIN`
- The data now persists in Supabase! ☁️
- Data survives container restarts ✅
- Multi-user access works ✅

---

## 📊 What Changed

### Before (File-based):
```
Frontend → Local Server → lcl_data.json (deleted on restart ❌)
```

### After (Supabase):
```
Frontend → Express Server → Supabase Cloud Database ☁️ (persistent ✅)
                                      ↓
                         Railway Container (stateless)
```

---

## 🔒 Security Notes

1. **Keys in `.env`** - Never commit to GitHub!
   - Add `.env` to `.gitignore`
   
2. **Use Service Role Key for sensitive operations** (future upgrade)
   - Current setup uses anon key (good for public data)

3. **Enable Row Level Security** (already enabled in SQL)
   - Restrict data access by user

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Check `.env` file exists
- Verify URL and key are correct
- Check internet connection

### "Tables don't exist"
- Run `SUPABASE_SETUP.sql` in SQL Editor
- Refresh and try again

### "Railway showing errors"
- Check Railway logs: "Deployments" → click build → "Logs"
- Ensure environment variables are set

### "Data not saving"
- Check browser console for errors (F12)
- Verify Supabase table status in dashboard

---

## 📚 Useful Links

- **Supabase Dashboard:** https://app.supabase.com/projects
- **Railway Dashboard:** https://app.railway.app
- **Your Project URL:** https://bbvfpwcppnvdmoqzdapk.supabase.co
- **Supabase Docs:** https://supabase.com/docs

---

## ✨ Next Steps

1. ✅ Create Supabase tables (Step 1)
2. ✅ Run `npm install` (Step 2)
3. ✅ Test locally with `npm start` (Step 3)
4. 🔄 Deploy to Railway (Step 4)
5. 🎉 Access your live app (Step 5)

**Everything is configured! Just follow the steps above.** 🚀
