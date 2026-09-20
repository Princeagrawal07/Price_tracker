// Frontend API Service layer

// Use the deployed backend when VITE_API_URL is configured (for example on Vercel).
// Keeping the fallback relative preserves the existing Vite proxy/local behavior.
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = `${configuredApiUrl}/api`;

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export async function searchProducts(query) {
  const data = await request(`/products/search?q=${encodeURIComponent(query)}`);
  return data.items || [];
}

export async function getTrackedProducts() {
  const data = await request('/products');
  return data.products || [];
}

export async function getProductDetail(productId) {
  return request(`/products/${productId}`);
}

export async function trackProduct(productData) {
  const data = await request('/products/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  return data.product;
}

export async function untrackProduct(productId) {
  return request(`/products/${productId}`, { method: 'DELETE' });
}

export async function triggerManualScrape(productId) {
  const data = await request(`/scrape/product/${productId}`, { method: 'POST' });
  return data.result;
}

export async function triggerHeadedRun(productId, slowMo = 600) {
  const data = await request('/scrape/headed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, slowMo })
  });
  return data.result;
}

export async function getAlerts() {
  const data = await request('/alerts');
  return data.alerts || [];
}

export async function markAlertRead(alertId) {
  return request(`/alerts/${alertId}/read`, { method: 'PUT' });
}
