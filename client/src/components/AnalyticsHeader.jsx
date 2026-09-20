import React from 'react';
import { Package, TrendingDown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AnalyticsHeader({ products = [], logs = [] }) {
  const totalTracked = products.length;
  const successLogs = logs.filter(l => l.status === 'success').length;
  const totalLogs = logs.length || 1;
  const successRate = Math.round((successLogs / totalLogs) * 100);

  // Price drops count
  const priceDrops = products.filter(p => p.current_price && p.initial_price && p.current_price < p.initial_price).length;
  const outOfStock = products.filter(p => p.current_stock === 0).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Tracked</span>
          <Package size={18} style={{ color: '#818cf8' }} />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{totalTracked}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Products actively monitored</div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Price Drops</span>
          <TrendingDown size={18} style={{ color: '#34d399' }} />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#34d399' }}>{priceDrops}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Products below starting price</div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scrape Success Rate</span>
          <CheckCircle size={18} style={{ color: '#38bdf8' }} />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#38bdf8' }}>{successRate}%</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Across {totalLogs} total attempts</div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Out of Stock</span>
          <AlertTriangle size={18} style={{ color: outOfStock > 0 ? '#f43f5e' : 'var(--text-muted)' }} />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: outOfStock > 0 ? '#f43f5e' : 'var(--text-main)' }}>{outOfStock}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Currently unavailable</div>
      </div>
    </div>
  );
}
