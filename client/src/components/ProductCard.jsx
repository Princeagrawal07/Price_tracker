import React, { useState } from 'react';
import { RefreshCw, Trash2, LineChart, ExternalLink, ShieldCheck, Star } from 'lucide-react';
import { triggerManualScrape, untrackProduct } from '../services/api';

function getCardImage(product) {
  const n = (product.name || '').toLowerCase();
  const c = (product.category || '').toLowerCase();

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

  if (product.image_url && !product.image_url.includes('photo-1523275335684')) {
    return product.image_url;
  }

  const fallbacks = [
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=60'
  ];
  return fallbacks[Math.abs(product.product_id || 1) % fallbacks.length];
}

export default function ProductCard({ product, onSelectProduct, onRefreshList }) {
  const [scraping, setScraping] = useState(false);
  const imgSrc = getCardImage(product);

  const handleScrapeNow = async (e) => {
    e.stopPropagation();
    setScraping(true);
    try {
      await triggerManualScrape(product.product_id);
      onRefreshList();
    } catch (err) {
      alert(`Scrape error: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };

  const handleUntrack = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Untrack ${product.name}?`)) {
      await untrackProduct(product.product_id);
      onRefreshList();
    }
  };

  const isPriceDown = product.current_price && product.initial_price && product.current_price < product.initial_price;
  const isPriceUp = product.current_price && product.initial_price && product.current_price > product.initial_price;
  const priceDiff = product.current_price && product.initial_price ? (product.current_price - product.initial_price).toFixed(2) : 0;

  return (
    <div className="glass-panel product-card">
      <div>
        <div className="product-img-wrapper">
          <img src={imgSrc} alt={product.name} />
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '0.5rem' }}>
            <span style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 700 }}>
              {product.category || 'General'}
            </span>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            {product.stock_status === 'out_of_stock' ? (
              <span className="badge badge-failed">Out of Stock</span>
            ) : product.stock_status === 'low_stock' ? (
              <span className="badge badge-retried">Low Stock ({product.current_stock})</span>
            ) : (
              <span className="badge badge-success">In Stock ({product.current_stock || 10})</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.brand} • SKU: {product.sku}</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.1rem' }}>{product.name}</h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0' }}>
          <div className="price-display">
            {product.current_price ? `₹${product.current_price.toLocaleString()}` : 'Price Hidden'}
          </div>

          {isPriceDown && (
            <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.15)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
              ₹{priceDiff}
            </span>
          )}
          {isPriceUp && (
            <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(248, 113, 113, 0.15)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
              +₹{priceDiff}
            </span>
          )}
        </div>

        {product.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
            <span style={{ color: '#fff', fontWeight: 600 }}>{product.rating}</span>
            <span>• Sold by {product.seller || 'Official Seller'}</span>
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
          <span>Last Scraped: {product.last_scraped_at ? new Date(product.last_scraped_at).toLocaleTimeString() : 'Never'}</span>
          <span className={`badge ${product.last_scrape_status === 'success' ? 'badge-success' : 'badge-failed'}`}>
            {product.last_scrape_status || 'Pending'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onSelectProduct(product)}>
            <LineChart size={14} />
            <span>History & Logs</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleScrapeNow} disabled={scraping} title="Scrape latest price now">
            <RefreshCw size={14} className={scraping ? 'animate-spin' : ''} />
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleUntrack} title="Untrack product" style={{ color: '#f87171' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
