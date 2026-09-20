import React, { useState } from 'react';
import { Search, X, Plus, Loader, ExternalLink, ShieldCheck } from 'lucide-react';
import { searchProducts, trackProduct } from '../services/api';

export default function ProductSearchModal({ isOpen, onClose, onTrackedSuccess }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const items = await searchProducts(query);
      setResults(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (item) => {
    setTrackingId(item.id);
    try {
      await trackProduct({
        id: item.id,
        name: item.name,
        slug: item.slug,
        brand: item.brand,
        category: item.category,
        sku: item.sku
      });
      onTrackedSuccess();
      onClose();
    } catch (err) {
      setError(`Failed to track product: ${err.message}`);
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Search Mock Store Products</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search INE's hosted store catalog by partial or full product name</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name (e.g. Headphones, Watch, Camera, Solar)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader size={18} className="animate-spin" /> : 'Search Catalog'}
          </button>
        </form>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              Type a search term above and click "Search Catalog" to explore products.
            </div>
          )}

          {results.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>{item.category || 'General'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.brand} • SKU: {item.sku}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{item.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={`https://demo.inelabteamdev.com/product/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  title="View on Mock Store"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  className="btn btn-emerald btn-sm"
                  onClick={() => handleTrack(item)}
                  disabled={trackingId === item.id}
                >
                  {trackingId === item.id ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
