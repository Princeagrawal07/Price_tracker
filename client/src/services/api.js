// Frontend API Service layer

const API_BASE = '/api';

export async function searchProducts(query) {
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.items || [];
}

export async function getTrackedProducts() {
  const res = await fetch(`${API_BASE}/products`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.products || [];
}

export async function getProductDetail(productId) {
  const res = await fetch(`${API_BASE}/products/${productId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function trackProduct(productData) {
  const res = await fetch(`${API_BASE}/products/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.product;
}

export async function untrackProduct(productId) {
  const res = await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function triggerManualScrape(productId) {
  const res = await fetch(`${API_BASE}/scrape/product/${productId}`, { method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.result;
}

export async function triggerHeadedRun(productId, slowMo = 600) {
  const res = await fetch(`${API_BASE}/scrape/headed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, slowMo })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.result;
}

export async function getAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.alerts || [];
}

export async function markAlertRead(alertId) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/read`, { method: 'PUT' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}
