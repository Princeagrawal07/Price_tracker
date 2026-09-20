const { chromium } = require('playwright');
require('dotenv').config();

async function safeWait(page, ms) {
  if (!page || page.isClosed()) return;
  await page.waitForTimeout(ms).catch(() => {});
}

async function dismissCookieOverlay(page) {
  if (!page || page.isClosed()) return;

  for (let i = 0; i < 3; i++) {
    const acceptButton = page
      .locator('.cookie-overlay button:has-text("Accept"), button[aria-label="Accept cookies"]')
      .first();

    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click({ force: true }).catch(() => {});
      await safeWait(page, 250);
      continue;
    }

    break;
  }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

async function moveCursorOverPriceBlock(page) {
  const priceBlock = page.locator('.price-block').first();
  const box = await priceBlock.boundingBox();

  if (!box) {
    throw new Error('PRICE_BLOCK_NOT_VISIBLE: Could not calculate price-block bounds');
  }

  const pointCount = Math.floor(randomBetween(11, 17));
  const points = Array.from({ length: pointCount }, (_, index) => {
    const progress = index / Math.max(pointCount - 1, 1);
    const wave = Math.sin(progress * Math.PI * randomBetween(1.5, 3.2));
    return [
      0.08 + progress * 0.84 + randomBetween(-0.025, 0.025),
      0.50 + wave * randomBetween(0.12, 0.28) + randomBetween(-0.08, 0.08)
    ];
  });

  await page.mouse.move(box.x - randomBetween(35, 130), box.y + randomBetween(-45, 35));
  await safeWait(page, randomBetween(90, 180));

  for (const [px, py] of points) {
    const x = box.x + box.width * Math.max(0.05, Math.min(0.95, px));
    const y = box.y + box.height * Math.max(0.18, Math.min(0.82, py));
    await page.mouse.move(x, y);
    await safeWait(page, randomBetween(75, 155));
  }

  await safeWait(page, randomBetween(800, 1300));
}

function parsePriceText(text) {
  const normalized = text
    .replace(/[\u200B\u00A0]/g, '')
    .replace(/[０-９]/g, digit => String(digit.charCodeAt(0) - 65296));
  const match = normalized.match(/(?:₹|Rs\.?)\s*([0-9][0-9,\s.]*)/i);
  if (!match) return null;

  const value = parseFloat(match[1].replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function extractCurrentPrice(page) {
  const livePriceText = await page
    .locator('.price-main [class*="pv-"]')
    .first()
    .innerText()
    .catch(() => '');

  return parsePriceText(livePriceText)
    || parsePriceText(await page.locator('.price-main').innerText().catch(() => ''));
}

/**
 * Scrapes price and stock data from INE's hosted mock store with full retry,
 * cursor simulation, cookie overlay handling, and honest logging.
 *
 * @param {string|number} productId - The product ID or URL
 * @param {Object} options - Scraper options
 * @param {boolean} [options.headed=false] - Whether to run browser in visible headed mode
 * @param {number} [options.slowMo=0] - Slow motion delay in ms for observable runs
 * @param {number} [options.maxRetries=6] - Maximum retry attempts on error (matches store's 6 retries)
 * @returns {Promise<Object>} Scrape result details
 */
async function scrapeProduct(productId, options = {}) {
  const { headed = false, slowMo = 0, maxRetries = 6 } = options;
  const baseUrl = process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com';
  const targetUrl = typeof productId === 'string' && productId.startsWith('http') 
    ? productId 
    : `${baseUrl}/product/${productId}`;

  const startTime = Date.now();
  let attemptsCount = 0;
  let browser = null;
  const attemptLogs = [];

  try {
    browser = await chromium.launch({
      headless: !headed,
      slowMo: headed ? Math.min(slowMo, 200) : 0,
      args: headed
        ? ['--start-maximized', '--window-position=0,0', '--disable-blink-features=AutomationControlled']
        : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      viewport: headed ? null : { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
    });

    const page = await context.newPage();
    if (headed) {
      await page.bringToFront().catch(() => {});
    }

    let success = false;
    let priceFound = null;
    let stockFound = null;
    let stockStatus = 'unknown';
    let sellerFound = null;
    let ratingFound = null;
    let lastErrorMsg = null;

    console.log(`[SCRAPER] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 25000 });

    // 1. Structure Change Detection
    const priceBlockExists = await page.locator('.price-block').count() > 0;
    if (!priceBlockExists) {
      throw new Error('PAGE_STRUCTURE_CHANGED: Could not locate .price-block container on page');
    }

    // 2. Dismiss cookie overlay through the app so React does not re-render it.
    await safeWait(page, 1000);
    await dismissCookieOverlay(page);

    // 3. Retry loop across intentional store challenge failures (up to maxRetries = 6)
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      attemptsCount = attempt;
      const attemptStart = Date.now();
      attemptLogs.push({ attempt, timestamp: new Date().toISOString(), status: 'started' });

      console.log(`[SCRAPER] Attempt ${attempt}/${maxRetries} to solve price challenge...`);

      try {
        if (attempt > 1 && await page.locator('.price-error').count() > 0) {
          await page.reload({ waitUntil: 'networkidle', timeout: 25000 });
          await safeWait(page, 1000);
        }

        await dismissCookieOverlay(page);
        await moveCursorOverPriceBlock(page);
        await dismissCookieOverlay(page);

        // Click Reveal price / Try again button
        const btn = page.locator('.price-block button:has-text("Reveal price"), .price-block button:has-text("Try again")');
        if (await btn.count() > 0 && await btn.first().isVisible()) {
          console.log(`[SCRAPER] Clicking button: "${await btn.first().innerText()}"...`);
          await btn.first().click({ timeout: 5000 }).catch(async () => {
            await dismissCookieOverlay(page);
            await btn.first().click({ force: true }).catch(() => {});
          });
        }

        // Poll for price resolution or error banner
        let resolved = false;
        for (let poll = 0; poll < 10; poll++) {
          await safeWait(page, 600);
          if (page.isClosed()) throw new Error('BROWSER_CLOSED_DURING_SCRAPE');

          if (await page.locator('.price-success').count() > 0) {
            priceFound = await extractCurrentPrice(page);

            if (priceFound !== null) {
              const stockText = await page.locator('.stock-badge').innerText().catch(() => '');
              if (stockText.toLowerCase().includes('out of stock')) {
                stockFound = 0;
                stockStatus = 'out_of_stock';
              } else {
                const stockMatch = stockText.match(/(\d+)/);
                stockFound = stockMatch ? parseInt(stockMatch[1], 10) : 10;
                stockStatus = stockFound <= 5 ? 'low_stock' : 'in_stock';
              }

              const sellerText = await page.locator('.price-substatus, [class*="seller"]').innerText().catch(() => null);
              if (sellerText) sellerFound = sellerText.replace('Sold by', '').trim();

              const ratingEl = page.locator('[aria-label*="Rated"]');
              if (await ratingEl.count() > 0) {
                const label = await ratingEl.getAttribute('aria-label');
                const ratingMatch = label.match(/Rated ([\d.]+) out of 5/);
                if (ratingMatch) ratingFound = parseFloat(ratingMatch[1]);
              }

              success = true;
              resolved = true;
              attemptLogs.push({
                attempt,
                timestamp: new Date().toISOString(),
                status: 'success',
                durationMs: Date.now() - attemptStart,
                price: priceFound,
                stock: stockFound
              });
              console.log(`[SCRAPER] ✅ SUCCESS on attempt ${attempt}: Price ₹${priceFound}, Stock ${stockFound}`);
              break;
            }
          }

          // Check if error banner appeared
          if (await page.locator('.price-error').count() > 0) {
            const errText = await page.locator('.price-error').innerText().catch(() => 'Store returned price error');
            lastErrorMsg = errText.replace(/\n/g, ' ');
            console.warn(`[SCRAPER] ⚠️ Store error on attempt ${attempt}: ${lastErrorMsg}`);
            attemptLogs.push({
              attempt,
              timestamp: new Date().toISOString(),
              status: 'retried',
              durationMs: Date.now() - attemptStart,
              error: lastErrorMsg
            });
            break; // Break poll loop to trigger next attempt click
          }
        }

        if (resolved) break; // Exit main attempt loop on success!
        await safeWait(page, 1200); // 1.2s delay before retrying

      } catch (err) {
        lastErrorMsg = err.message;
        console.warn(`[SCRAPER] ⚠️ Attempt ${attempt} exception: ${err.message}`);
        attemptLogs.push({
          attempt,
          timestamp: new Date().toISOString(),
          status: 'retried',
          durationMs: Date.now() - attemptStart,
          error: err.message
        });
        await safeWait(page, 1200);
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      success,
      productId: parseInt(productId, 10) || productId,
      price: priceFound,
      stock: stockFound,
      stockStatus,
      seller: sellerFound,
      rating: ratingFound,
      attempts: attemptsCount,
      durationMs,
      error: success ? null : (lastErrorMsg || 'Failed after maximum retry attempts'),
      logs: attemptLogs
    };

  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

module.exports = { scrapeProduct };
