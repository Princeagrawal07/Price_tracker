# Scraping Reliability & Architecture Design Notes

## 1. Scraping Strategy & Reliability Engineering

The mock storefront (`https://demo.inelabteamdev.com/`) is deliberately engineered with several anti-scraping and asynchronous loading obstacles:
1. **Asynchronous JS Rendering**: Initial raw HTML returns only an empty `<div id="root"></div>` shell with bundled React assets. Standard static HTTP GET requests (like Cheerio) cannot inspect prices or stock without executing JavaScript.
2. **Cursor Interaction Verification (`Ar` module)**: The store's React frontend evaluates mouse movement vectors. It requires at least **8 cursor movement trajectory points** and a **minimum dwell time of 600ms** inside the price container box before unlocking price state.
3. **Cookie Consent Overlay**: A `<div class="cookie-overlay">` intercepts mouse clicks until explicitly dismissed or removed from the DOM.
4. **Simulated Server Errors & Delays**: The store intentionally returns 429 rate-limits, 500 server errors, and random network delays, retrying up to 6 times per session.

### How Our Scraper Solves These Challenges:
- **Playwright Automation**: We use Playwright with Chromium to execute JavaScript, render full page state, and interact naturally with the DOM.
- **Mouse Movement Trajectory Simulation**: Before clicking "Reveal price", the scraper moves the virtual mouse in a smooth 15-point trajectory across the `.price-block` container and pauses for >700ms dwell time.
- **Overlay Elimination**: The scraper checks for and strips cookie overlays automatically prior to pointer events.
- **Resilient Retry Policy**: If the store returns a retry state (`Retrying attempt X/6...`) or displays a price error banner, the scraper executes exponential backoff and clicks "Try again" up to `maxRetries` (default: 3).
- **Fail-Safe Extraction**: Extracted prices are validated against float regex. If price extraction produces `NaN` or `null`, the scraper rejects the payload and logs an honest failure instead of persisting corrupted data.

---

## 2. Trade-Offs & Architectural Decisions

| Decision Area | Chosen Approach | Rationale & Trade-Offs |
|---|---|---|
| **Scraper Engine** | Playwright Chromium | **Pros**: 100% reliable DOM interaction, handles JS rendering, cursor simulation, and supports observable headed mode. **Cons**: Higher memory footprint than lightweight `axios` + `cheerio`. |
| **Scheduling Mechanism** | External Cron Endpoint (`/api/scrape/scheduled`) | **Pros**: Free-tier server backends (Render) go to sleep after inactivity. Triggering via external cron (cron-job.org / Vercel Cron) keeps the backend sleeping safely without keeping an un-scalable `setInterval` event loop running indefinitely. |
| **Database Adapter** | Dual Supabase + Local Resilience Fallback | **Pros**: Persists seamlessly to Supabase PostgreSQL when credentials are set, but falls back gracefully to local storage so reviewers can evaluate the app out-of-the-box without manual database setup. |

---

## 3. What AI Tools Got Wrong on First Attempt & How We Corrected It

1. **First Attempt Issue (Static HTTP Fetching)**:
   - *Initial AI Assumption*: AI models typically attempt to scrape using simple HTTP GET requests (`axios`/`cheerio`).
   - *Failure*: The mock store's price is not present in static HTML; it returns `Price hidden`.
   - *Correction*: We inspected the minified bundle (`index-B9UiQq4X.js`), discovered the React `Ur` component and `Ar` cursor listener, and upgraded the core scraper to Playwright DOM automation.

2. **Second Attempt Issue (Cookie Overlay Click Interception)**:
   - *Initial AI Assumption*: Playwright `.click('button:has-text("Reveal price")')` would succeed directly after mouse hover.
   - *Failure*: Playwright threw `TimeoutError: <div class="cookie-overlay">...</div> intercepts pointer events`.
   - *Correction*: We updated the scraper pipeline to evaluate DOM overlays and strip `.cookie-overlay` elements prior to initiating click actions.

3. **Third Attempt Issue (Silent Errors on Rate Limiting)**:
   - *Initial AI Assumption*: Returning empty values or `0` on error.
   - *Failure*: Storing `0` breaks price history analytics and violates the requirement that "failures must be recorded honestly, not hidden."
   - *Correction*: We implemented explicit attempt logging (`status: 'failed'`) with response times, attempt counts, and raw error messages saved to Supabase `scrape_logs`.
