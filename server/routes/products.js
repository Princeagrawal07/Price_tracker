const express = require('express');
const router = express.Router();
const http = require('https');
const db = require('../db');
const { scrapeProduct } = require('../../scraper');

function fetchCatalogJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (apiRes) => {
      let rawData = '';
      apiRes.on('data', chunk => rawData += chunk);
      apiRes.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          resolve({ items: [] });
        }
      });
    }).on('error', reject);
  });
}

// Search INE's hosted mock store with accurate keyword filtering
router.get('/search', async (req, res) => {
  const query = req.query.q || req.query.search || '';
  const baseUrl = process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com';

  try {
    // Fetch multi-page catalog to ensure wide search coverage
    const [p1, p2, p3] = await Promise.all([
      fetchCatalogJson(`${baseUrl}/api/catalog?page=1&pageSize=100`),
      fetchCatalogJson(`${baseUrl}/api/catalog?page=2&pageSize=100`),
      fetchCatalogJson(`${baseUrl}/api/catalog?page=3&pageSize=100`)
    ]);

    const allItems = [...(p1.items || []), ...(p2.items || []), ...(p3.items || [])];

    // Filter by query
    const q = query.toLowerCase().trim();
    const filtered = q
      ? allItems.filter(item =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.brand && item.brand.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.sku && item.sku.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q))
        )
      : allItems;

    // Attach accurate visual images to each search item
    const itemsWithImages = filtered.map(item => ({
      ...item,
      image_url: db.getUniqueProductImage(item.category, item.name, item.id)
    }));

    res.json({ success: true, count: itemsWithImages.length, items: itemsWithImages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Network error searching catalog: ' + err.message });
  }
});

// List all tracked products
router.get('/', async (req, res) => {
  try {
    const products = await db.getTrackedProducts();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single product details, price history, and logs
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = await db.getTrackedProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Tracked product not found' });
    }

    const history = await db.getPriceHistory(productId);
    const logs = await db.getScrapeLogs(productId);

    res.json({
      success: true,
      product,
      priceHistory: history,
      scrapeLogs: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Track a new product
router.post('/track', async (req, res) => {
  try {
    const { product_id, id, name, slug, brand, category, sku, target_price, scrape_interval_hours } = req.body;
    const pid = parseInt(product_id || id, 10);

    if (!pid) {
      return res.status(400).json({ success: false, error: 'Valid product ID required' });
    }

    // Save initial product info with accurate photo
    const trackedProduct = await db.addTrackedProduct({
      id: pid,
      product_id: pid,
      name: name || `Product ${pid}`,
      slug: slug || `product-${pid}`,
      brand: brand || 'INE Store',
      category: category || 'General',
      sku: sku || `SKU-${pid}`,
      target_price: target_price ? parseFloat(target_price) : null,
      scrape_interval_hours: scrape_interval_hours ? parseInt(scrape_interval_hours, 10) : 2,
      url: `${process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com'}/product/${pid}`
    });

    // Trigger initial scrape asynchronously
    scrapeProduct(pid, { maxRetries: 3 })
      .then(async (result) => {
        await db.updateProductScrapeResult(pid, result);
        await db.addScrapeLog({
          product_id: pid,
          product_name: trackedProduct.name,
          status: result.success ? 'success' : 'failed',
          attempts_count: result.attempts,
          response_time_ms: result.durationMs,
          price_found: result.price,
          stock_found: result.stock,
          error_message: result.error,
          strategy_used: 'playwright_headless'
        });
      })
      .catch((err) => {
        console.error(`[TRACKING INIT SCRAPE ERR] Product ${pid}:`, err);
      });

    res.status(201).json({
      success: true,
      message: 'Product tracked successfully! Initial scrape initiated.',
      product: trackedProduct
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Untrack product
router.delete('/:id', async (req, res) => {
  try {
    const pid = parseInt(req.params.id, 10);
    await db.deleteTrackedProduct(pid);
    res.json({ success: true, message: `Product ${pid} untracked successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
