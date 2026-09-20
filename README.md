# INE Price Tracker

A full-stack price tracking application that searches products from the INE mock store, tracks selected products, stores price history, detects price changes, and generates alerts.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- Playwright

### Database
- Supabase / PostgreSQL

### Deployment
- Frontend: Vercel
- Backend: Render
- Scheduled scraping: cron-job.org

## Project Structure

```text
Price_tracker/
├── client/
│   ├── src/
│   │   └── services/
│   │       └── api.js
│   └── ...
├── server/
│   ├── routes/
│   ├── ...
│   └── server.js
├── scraper/
├── schema.sql
├── DESIGN_NOTES.md
├── README.md
├── .env.example
├── .gitignore
└── ...
```

## Overview

This project is a small full-stack web app built for the INE mock storefront at https://demo.inelabteamdev.com/.

Users can:
- search for products by partial or full name,
- track a product for price monitoring,
- scrape the page on a schedule,
- view price and stock history over time,
- review each scrape attempt and its outcome,
- receive alerts when price drops or inventory returns.

The app follows the assignment requirements and aims to be reliable under the dynamic and intentionally awkward storefront behavior.

## Features

- Product search and catalog browsing from the INE mock store
- Product tracking persistence in Supabase/PostgreSQL
- Scheduled scraper runs every 2 hours via cron trigger
- Price and stock extraction with retry handling
- Honest scrape logging for success, retry, and failure cases
- Price history chart and product audit log
- Price drop and back-in-stock alert support
- Headed Playwright mode for observable runs

## Tech Stack Details

### Frontend
- React
- Vite
- JavaScript
- CSS
- Recharts for history visualization
- Lucide icons

### Backend
- Node.js
- Express.js
- Playwright
- dotenv

### Database
- Supabase / PostgreSQL

### Deployment
- Frontend deployment: Vercel
- Backend deployment: Render
- Scheduled scraping: cron-job.org

## Repository Structure

```text
Price_tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── routes/
│   ├── db.js
│   └── server.js
├── scraper/
│   ├── headed.js
│   ├── index.js
│   └── test_scraper.js
├── schema.sql
├── DESIGN_NOTES.md
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Princeagrawal07/Price_tracker.git
cd Price_tracker
```

### 2. Install dependencies

Install the backend dependencies and Playwright browser bundle:

```bash
npm install
npx playwright install chromium
```

Install the frontend dependencies:

```bash
cd client
npm install
cd ..
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your own values:

```env
PORT=5000
NODE_ENV=development
CRON_SECRET=replace-with-a-strong-random-secret
MOCK_STORE_URL=https://demo.inelabteamdev.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ALLOW_LOCAL_FALLBACK=true
```

For the frontend, set the Vite environment variable in `client/.env` or in your Vercel project settings:

```env
VITE_API_URL=http://localhost:5000
```

For production deployment, set:

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

Do not include `/api` in `VITE_API_URL`; the frontend appends `/api` automatically.

## Running the App

### Backend

```bash
npm run dev:server
```

### Frontend

```bash
npm run dev:client
```

Then open:

```text
http://localhost:3000
```

## Scheduled Scraping

Because free-tier backends can sleep, the scraper is not meant to run as a forever-live loop. Instead, a cron service calls the scheduled endpoint every 2 hours.

Cron schedule:

```cron
0 */2 * * *
```

Example request:

```bash
curl -X POST "https://your-render-service.onrender.com/api/scrape/scheduled" \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

This endpoint is protected with the `CRON_SECRET` environment variable.

## Headed Run / Observable Demo

For a visible local run, use:

```bash
npm run scrape:headed
```

This opens a browser window so the scraper behavior can be observed while it:
- handles cookie overlays,
- moves the cursor,
- clicks the price reveal challenge,
- retries on delayed or failing responses,
- logs attempt outcomes.

## Deployment

### Frontend (Vercel)

- Import the repository into Vercel.
- Set the root directory to `client`.
- Use the Vite preset.
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable:
  ```env
  VITE_API_URL=https://your-render-backend.onrender.com
  ```

### Backend (Render)

- Create a web service using the repository root.
- Build command:
  ```bash
  npm install && npx playwright install chromium
  ```
- Start command:
  ```bash
  node server/server.js
  ```
- Add the environment variables listed in the setup section.

### Database (Supabase)

1. Create a Supabase project.
2. Run the SQL from `schema.sql` in the SQL editor.
3. Add the resulting `SUPABASE_URL` and `SUPABASE_ANON_KEY` values to your backend environment.

## Design Notes

The scraping logic is documented in [`DESIGN_NOTES.md`](./DESIGN_NOTES.md). It covers:
- why Playwright was chosen instead of basic HTML scraping,
- the retry strategy for slow and failing pages,
- the anti-scraping challenges in the mock store,
- trade-offs such as cron-based scheduling and external dependencies,
- the mistakes made in earlier attempts and how they were corrected.

## Notes

- The frontend is configured to use `import.meta.env.VITE_API_URL` when present.
- If `VITE_API_URL` is not set, it falls back to relative `/api` requests for local development.
- The backend and scraper logic are intentionally left separate from the frontend API connection layer.

## License

MIT
