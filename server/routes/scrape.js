const express = require('express');
const router = express.Router();
const db = require('../db');
const { scrapeProduct } = require('../../scraper');

// Endpoint for external cron jobs (e.g. cron-job.org or Vercel Cron)
// Triggers scrapes for all tracked products matching their scrape schedule
router.post('/scheduled', async (req, res) => {
  const secretHeader = req.headers['x-cron-secret'] || req.query.secret;
  const expectedSecret = process.env.CRON_SECRET || 'ine_cron_secret_key_2026';

  if (secretHeader !== expectedSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid cron secret' });
  }

  try {
    const products = await db.getTrackedProducts();
    console.log(`[SCHEDULED CRON] Triggering scrape for ${products.length} tracked products...`);

    const scrapePromises = products.map(async (prod) => {
      const pid = prod.product_id;
      try {
        const result = await scrapeProduct(pid, { maxRetries: 3 });
        await db.updateProductScrapeResult(pid, result);
        await db.addScrapeLog({
          product_id: pid,
          product_name: prod.name,
          status: result.success ? 'success' : 'failed',
          attempts_count: result.attempts,
          response_time_ms: result.durationMs,
          price_found: result.price,
          stock_found: result.stock,
          error_message: result.error,
          strategy_used: 'playwright_scheduled_cron'
        });
        return { product_id: pid, name: prod.name, ...result };
      } catch (err) {
        await db.addScrapeLog({
          product_id: pid,
          product_name: prod.name,
          status: 'failed',
          attempts_count: 3,
          response_time_ms: 0,
          price_found: null,
          stock_found: null,
          error_message: err.message,
          strategy_used: 'playwright_scheduled_cron'
        });
        return { product_id: pid, name: prod.name, success: false, error: err.message };
      }
    });

    const results = await Promise.all(scrapePromises);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      scrapedCount: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger manual scrape for a single product
router.post('/product/:id', async (req, res) => {
  const pid = parseInt(req.params.id, 10);
  const product = await db.getTrackedProductById(pid);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  try {
    console.log(`[MANUAL SCRAPE] Scraping product ${pid}...`);
    const result = await scrapeProduct(pid, { maxRetries: 3 });
    await db.updateProductScrapeResult(pid, result);
    await db.addScrapeLog({
      product_id: pid,
      product_name: product.name,
      status: result.success ? 'success' : 'failed',
      attempts_count: result.attempts,
      response_time_ms: result.durationMs,
      price_found: result.price,
      stock_found: result.stock,
      error_message: result.error,
      strategy_used: 'playwright_manual_trigger'
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger observable headed run
router.post('/headed', async (req, res) => {
  const { productId = 1, slowMo = 500 } = req.body;
  const pid = parseInt(productId, 10);
  const product = await db.getTrackedProductById(pid);

  try {
    console.log(`[HEADED SCRAPE RUN] Initiating headed run for product ${pid}...`);
    const result = await scrapeProduct(pid, { headed: true, slowMo, maxRetries: 3 });
    if (product) {
      await db.updateProductScrapeResult(pid, result);
      await db.addScrapeLog({
        product_id: pid,
        product_name: product.name,
        status: result.success ? 'success' : 'failed',
        attempts_count: result.attempts,
        response_time_ms: result.durationMs,
        price_found: result.price,
        stock_found: result.stock,
        error_message: result.error,
        strategy_used: 'playwright_headed_observable'
      });
    }

    res.json({ success: true, mode: 'headed_observable', result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get global scrape audit logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await db.getAllScrapeLogs();
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
