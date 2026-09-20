const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Supabase client initialized.');
  } catch (err) {
    console.warn('[DB] Supabase init failed, using local store:', err.message);
  }
} else {
  console.log('[DB] No valid Supabase credentials found in env. Operating with local store fallback.');
}

// Smart keyword-to-photo dictionary for 100% unique visual items
function getUniqueProductImage(category = '', name = '', pid = 1) {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('plug') || n.includes('socket')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('turntable') || n.includes('record player')) {
    return 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('case') || n.includes('bag') || n.includes('hardshell')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('watch') || c.includes('wearable')) {
    return 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('headphone') || n.includes('earbud') || c.includes('audio')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('camera') || n.includes('doorbell') || c.includes('smart home')) {
    return 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('monitor') || n.includes('display')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('runner') || n.includes('shoe') || c.includes('footwear')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('charger') || n.includes('solar') || c.includes('power')) {
    return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60';
  }

  const fallbacks = [
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=60'
  ];
  return fallbacks[Math.abs(pid) % fallbacks.length];
}

// Initial seed products with valid IDs on demo.inelabteamdev.com
const initialProducts = [
  {
    id: 1,
    product_id: 1,
    slug: "nordkraft-headphones-pro",
    name: "Nordkraft Headphones Pro",
    brand: "Nordkraft",
    category: "Audio",
    sku: "NOR-10001",
    url: "https://demo.inelabteamdev.com/product/1",
    image_url: getUniqueProductImage("Audio", "Nordkraft Headphones Pro", 1),
    current_price: 7593.00,
    current_stock: 14,
    stock_status: "in_stock",
    initial_price: 7593.00,
    target_price: 7000.00,
    seller: "Nordkraft Official",
    rating: 4.8,
    scrape_interval_hours: 2,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_scraped_at: new Date().toISOString(),
    last_scrape_status: "success"
  },
  {
    id: 52,
    product_id: 52,
    slug: "amperage-indoor-camera-pro",
    name: "Amperage Indoor Camera Pro",
    brand: "Amperage",
    category: "Smart Home",
    sku: "AMP-10052",
    url: "https://demo.inelabteamdev.com/product/52",
    image_url: getUniqueProductImage("Smart Home", "Amperage Indoor Camera Pro", 52),
    current_price: 5245.00,
    current_stock: 25,
    stock_status: "in_stock",
    initial_price: 5490.00,
    target_price: 5000.00,
    seller: "Amperage Direct",
    rating: 4.6,
    scrape_interval_hours: 2,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    last_scraped_at: new Date().toISOString(),
    last_scrape_status: "success"
  },
  {
    id: 451,
    product_id: 451,
    slug: "larkspur-video-doorbell-plus",
    name: "Larkspur Video Doorbell Plus",
    brand: "Larkspur",
    category: "Smart Home",
    sku: "LAR-10451",
    url: "https://demo.inelabteamdev.com/product/451",
    image_url: getUniqueProductImage("Smart Home", "Larkspur Video Doorbell Plus", 451),
    current_price: 8990.00,
    current_stock: 8,
    stock_status: "in_stock",
    initial_price: 8990.00,
    target_price: 8000.00,
    seller: "Larkspur Gear",
    rating: 4.9,
    scrape_interval_hours: 2,
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    last_scraped_at: new Date().toISOString(),
    last_scrape_status: "success"
  },
  {
    id: 831,
    product_id: 831,
    slug: "ironwood-curved-monitor-xl",
    name: "Ironwood Curved Monitor XL",
    brand: "Ironwood",
    category: "Monitors",
    sku: "IRO-10831",
    url: "https://demo.inelabteamdev.com/product/831",
    image_url: getUniqueProductImage("Monitors", "Ironwood Curved Monitor XL", 831),
    current_price: 24490.00,
    current_stock: 12,
    stock_status: "in_stock",
    initial_price: 26890.00,
    target_price: 23000.00,
    seller: "Ironwood Tech",
    rating: 4.7,
    scrape_interval_hours: 2,
    created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    last_scraped_at: new Date().toISOString(),
    last_scrape_status: "success"
  }
];

const localDb = {
  tracked_products: initialProducts,
  price_history: [
    { id: 1, product_id: 1, price: 7990.00, stock: 20, stock_status: "in_stock", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, product_id: 1, price: 7593.00, stock: 14, stock_status: "in_stock", timestamp: new Date().toISOString() },
    { id: 3, product_id: 10373, price: 1490.00, stock: 30, stock_status: "in_stock", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 4, product_id: 10373, price: 1290.00, stock: 25, stock_status: "in_stock", timestamp: new Date().toISOString() },
    { id: 5, product_id: 10006, price: 15990.00, stock: 8, stock_status: "in_stock", timestamp: new Date().toISOString() },
    { id: 6, product_id: 10300, price: 3490.00, stock: 12, stock_status: "in_stock", timestamp: new Date().toISOString() }
  ],
  scrape_logs: [
    {
      id: 1,
      product_id: 1,
      product_name: "Nordkraft Headphones Pro",
      timestamp: new Date().toISOString(),
      status: "success",
      attempts_count: 1,
      response_time_ms: 2450,
      price_found: 7593.00,
      stock_found: 14,
      error_message: null,
      strategy_used: "playwright_headed_simulation"
    }
  ],
  alerts: [
    {
      id: 1,
      product_id: 10373,
      alert_type: "price_drop",
      title: "Price Drop Alert!",
      message: "Vista Smart Plug Lite dropped from ₹1,490.00 to ₹1,290.00 (-₹200.00)",
      old_value: "1490.00",
      new_value: "1290.00",
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]
};

async function getTrackedProducts() {
  if (supabase) {
    const { data, error } = await supabase.from('tracked_products').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  }
  return localDb.tracked_products;
}

async function getTrackedProductById(productId) {
  const pid = parseInt(productId, 10);
  if (supabase) {
    const { data, error } = await supabase.from('tracked_products').select('*').eq('product_id', pid).single();
    if (!error && data) return data;
  }
  return localDb.tracked_products.find(p => p.product_id === pid) || null;
}

async function addTrackedProduct(prodData) {
  const pid = parseInt(prodData.id || prodData.product_id, 10);
  const category = prodData.category || 'General';
  const name = prodData.name || `Product ${pid}`;

  const newProduct = {
    product_id: pid,
    slug: prodData.slug || `product-${pid}`,
    name,
    brand: prodData.brand || 'INE Store',
    category,
    sku: prodData.sku || `SKU-${pid}`,
    url: prodData.url || `https://demo.inelabteamdev.com/product/${pid}`,
    image_url: prodData.image_url || getUniqueProductImage(category, name, pid),
    current_price: prodData.price || null,
    current_stock: prodData.stock !== undefined ? prodData.stock : null,
    stock_status: prodData.stock_status || 'unknown',
    initial_price: prodData.price || null,
    target_price: prodData.target_price || (prodData.price ? Math.round(prodData.price * 0.9) : null),
    seller: prodData.seller || null,
    rating: prodData.rating || null,
    scrape_interval_hours: prodData.scrape_interval_hours || 2,
    created_at: new Date().toISOString(),
    last_scraped_at: prodData.price ? new Date().toISOString() : null,
    last_scrape_status: prodData.price ? 'success' : 'pending'
  };

  if (supabase) {
    const { data, error } = await supabase.from('tracked_products').upsert(newProduct, { onConflict: 'product_id' }).select().single();
    if (!error && data) return data;
  }

  const existingIndex = localDb.tracked_products.findIndex(p => p.product_id === pid);
  if (existingIndex !== -1) {
    localDb.tracked_products[existingIndex] = { ...localDb.tracked_products[existingIndex], ...newProduct };
  } else {
    localDb.tracked_products.unshift(newProduct);
  }
  return newProduct;
}

async function updateProductScrapeResult(productId, result) {
  const pid = parseInt(productId, 10);
  const product = await getTrackedProductById(pid);
  if (!product) return;

  const now = new Date().toISOString();
  const updates = {
    last_scraped_at: now,
    last_scrape_status: result.success ? 'success' : 'failed'
  };

  if (result.success && result.price !== null) {
    const oldPrice = product.current_price;
    const oldStock = product.current_stock;

    updates.current_price = result.price;
    updates.current_stock = result.stock;
    updates.stock_status = result.stockStatus;
    if (result.seller) updates.seller = result.seller;
    if (result.rating) updates.rating = result.rating;

    // Check for Price Drop Alert
    if (oldPrice && result.price < oldPrice) {
      await addAlert({
        product_id: pid,
        alert_type: 'price_drop',
        title: 'Price Drop Alert!',
        message: `${product.name} price dropped from ₹${oldPrice} to ₹${result.price} (-₹${(oldPrice - result.price).toFixed(2)})`,
        old_value: String(oldPrice),
        new_value: String(result.price)
      });
    }

    // Check for Back-in-Stock Alert
    if (oldStock === 0 && result.stock > 0) {
      await addAlert({
        product_id: pid,
        alert_type: 'back_in_stock',
        title: 'Back in Stock!',
        message: `${product.name} is now back in stock (${result.stock} units left)`,
        old_value: '0',
        new_value: String(result.stock)
      });
    }

    // Record Price History point
    await addPriceHistory({
      product_id: pid,
      price: result.price,
      stock: result.stock,
      stock_status: result.stockStatus,
      timestamp: now
    });
  }

  if (supabase) {
    await supabase.from('tracked_products').update(updates).eq('product_id', pid);
  } else {
    const idx = localDb.tracked_products.findIndex(p => p.product_id === pid);
    if (idx !== -1) {
      localDb.tracked_products[idx] = { ...localDb.tracked_products[idx], ...updates };
    }
  }
}

async function deleteTrackedProduct(productId) {
  const pid = parseInt(productId, 10);
  if (supabase) {
    await supabase.from('tracked_products').delete().eq('product_id', pid);
  }
  localDb.tracked_products = localDb.tracked_products.filter(p => p.product_id !== pid);
  localDb.price_history = localDb.price_history.filter(ph => ph.product_id !== pid);
  localDb.scrape_logs = localDb.scrape_logs.filter(sl => sl.product_id !== pid);
}

async function addPriceHistory(phData) {
  const record = {
    product_id: parseInt(phData.product_id, 10),
    price: phData.price,
    stock: phData.stock,
    stock_status: phData.stock_status,
    timestamp: phData.timestamp || new Date().toISOString()
  };

  if (supabase) {
    await supabase.from('price_history').insert(record);
  }
  localDb.price_history.push({ id: localDb.price_history.length + 1, ...record });
}

async function getPriceHistory(productId) {
  const pid = parseInt(productId, 10);
  if (supabase) {
    const { data, error } = await supabase.from('price_history').select('*').eq('product_id', pid).order('timestamp', { ascending: true });
    if (!error && data) return data;
  }
  return localDb.price_history.filter(ph => ph.product_id === pid);
}

async function addScrapeLog(logData) {
  const record = {
    product_id: parseInt(logData.product_id, 10),
    product_name: logData.product_name || 'Product ' + logData.product_id,
    timestamp: logData.timestamp || new Date().toISOString(),
    status: logData.status || 'failed',
    attempts_count: logData.attempts_count || 1,
    response_time_ms: logData.response_time_ms || 0,
    price_found: logData.price_found || null,
    stock_found: logData.stock_found !== undefined ? logData.stock_found : null,
    error_message: logData.error_message || null,
    strategy_used: logData.strategy_used || 'playwright_headed_simulation'
  };

  if (supabase) {
    await supabase.from('scrape_logs').insert(record);
  }
  localDb.scrape_logs.unshift({ id: localDb.scrape_logs.length + 1, ...record });
}

async function getScrapeLogs(productId) {
  const pid = parseInt(productId, 10);
  if (supabase) {
    const { data, error } = await supabase.from('scrape_logs').select('*').eq('product_id', pid).order('timestamp', { ascending: false });
    if (!error && data) return data;
  }
  return localDb.scrape_logs.filter(sl => sl.product_id === pid);
}

async function getAllScrapeLogs() {
  if (supabase) {
    const { data, error } = await supabase.from('scrape_logs').select('*').order('timestamp', { ascending: false }).limit(100);
    if (!error && data) return data;
  }
  return localDb.scrape_logs;
}

async function addAlert(alertData) {
  const record = {
    product_id: parseInt(alertData.product_id, 10),
    alert_type: alertData.alert_type,
    title: alertData.title,
    message: alertData.message,
    old_value: alertData.old_value || null,
    new_value: alertData.new_value || null,
    is_read: false,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    await supabase.from('alerts').insert(record);
  }
  localDb.alerts.unshift({ id: localDb.alerts.length + 1, ...record });
}

async function getAlerts() {
  if (supabase) {
    const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return localDb.alerts;
}

async function markAlertRead(alertId) {
  const id = parseInt(alertId, 10);
  if (supabase) {
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
  }
  const alert = localDb.alerts.find(a => a.id === id);
  if (alert) alert.is_read = true;
}

module.exports = {
  getUniqueProductImage,
  getTrackedProducts,
  getTrackedProductById,
  addTrackedProduct,
  updateProductScrapeResult,
  deleteTrackedProduct,
  getPriceHistory,
  addScrapeLog,
  getScrapeLogs,
  getAllScrapeLogs,
  addAlert,
  getAlerts,
  markAlertRead
};
