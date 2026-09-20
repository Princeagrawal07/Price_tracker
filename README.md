# INE Product Price Tracker (Web Scraping & History Tracking)

A production-grade full-stack web application designed for INE's Software Engineer Intern assignment. It tracks product prices and stock availability over time from INE's hosted mock store (`https://demo.inelabteamdev.com/`) using resilient Playwright automation and honest audit logging.

---

## 🌟 Key Features

1. **Product Search & Tracking**:
   - Search INE's hosted mock store by partial or full product name.
   - Track products with 1-click catalog integration.

2. **Resilient Scheduled Scraping**:
   - Automated price and stock extraction on a fixed schedule (every 2 hours / configurable per product).
   - Solves store difficulty: handles cursor trajectory simulation (min 8 moves, 600ms dwell), cookie overlays, async delays, and 429/500 retries.

3. **Honest Per-Product Audit Logs & Price History**:
   - Interactive Recharts area chart visualizing price changes and stock trends over time.
   - Complete audit trail table listing every scrape attempt (`success`, `retried`, `failed`) with attempt duration and error details.

4. **Observable (Headed) Run Visualizer**:
   - Launch Playwright in visible headed Chrome mode (`npm run scrape:headed` or via UI launcher) to watch live cursor movement and retry handling.

5. **In-App Notifications**:
   - Price drop and back-in-stock alerts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Glassmorphic CSS System (Deployed on Vercel)
- **Backend**: Node.js, Express REST API (Deployed on Render)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`) + Local Resilience Adapter
- **Scraper Engine**: Playwright Chromium (DOM Automation & Mouse Simulation)
- **Schedule Trigger**: External Cron (`cron-job.org` or Vercel Cron)

---

## 🚀 Quick Setup Instructions

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/ine-product-price-tracker.git
cd ine-product-price-tracker

# Install backend dependencies & Playwright browsers
npm install
npx playwright install chromium

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Variables Configuration

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=development
CRON_SECRET=ine_cron_secret_key_2026
MOCK_STORE_URL=https://demo.inelabteamdev.com

# Supabase Credentials (Required for Cloud Database)
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Locally

Start backend server and frontend client concurrently:

```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Client (Port 3000)
npm run dev:client
```

Open browser at `http://localhost:3000`.

---

## 🎬 Observable (Headed) Run & Video Recording Guide

To fulfill the requirement of submitting a short 2–4 minute screen recording of the scraper running in headed mode against the mock store:

1. Run the headed CLI command:
   ```bash
   npm run scrape:headed
   ```
   *OR* click the **"Headed Run"** button in the top navigation bar of the web application.

2. A visible Chrome browser window will open automatically, showing Playwright moving the cursor across the price block, bypassing the cookie overlay, clicking reveal price, handling store retries, and recording the extracted data.

---

## ⏰ Scraping Schedule & Cron Job Setup

Free-tier backends sleep after inactivity. Scheduled scraping is triggered via external cron service to avoid sleeping background loops.

1. Register a free account at [cron-job.org](https://cron-job.org/).
2. Create a new cron job pointing to your deployed Render API endpoint:
   - **URL**: `https://your-render-app.onrender.com/api/scrape/scheduled`
   - **Execution Schedule**: Every 2 hours (`0 */2 * * *`)
   - **HTTP Header**: `x-cron-secret: ine_cron_secret_key_2026`

---

## 🚢 Deployment Guide

### Database (Supabase)
1. Create a free PostgreSQL database on [Supabase](https://supabase.com).
2. Execute the queries in [`schema.sql`](./schema.sql) in the Supabase SQL Editor.
3. Copy your project URL and Anon API key into your Render environment variables.

### Backend (Render.com)
1. Create a new Web Service on Render from your GitHub repo.
2. Build Command: `npm install && npx playwright install chromium`
3. Start Command: `node server/server.js`
4. Add environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CRON_SECRET`).

### Frontend (Vercel)
1. Import your GitHub repo on [Vercel](https://vercel.com).
2. Set Framework Preset: **Vite**.
3. Root Directory: `client`.
4. Deploy!
