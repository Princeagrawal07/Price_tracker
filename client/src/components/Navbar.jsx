import React from 'react';
import { Search, Bell, Eye, RefreshCw, Zap } from 'lucide-react';

export default function Navbar({ onOpenSearch, onOpenAlerts, onOpenHeaded, unreadCount, isSyncing, onRefreshAll }) {
  return (
    <nav className="navbar">
      <div className="brand">
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Zap size={20} />
        </div>
        <span>INE Price Tracker</span>
        <span className="brand-badge">PRO v1.0</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={onOpenHeaded} title="Observable Headed Mode Run">
          <Eye size={16} style={{ color: '#38bdf8' }} />
          <span>Headed Run</span>
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onRefreshAll} disabled={isSyncing}>
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onOpenAlerts} style={{ position: 'relative' }}>
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#f43f5e',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: '700',
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        <button className="btn btn-primary" onClick={onOpenSearch}>
          <Search size={18} />
          <span>Track Product</span>
        </button>
      </div>
    </nav>
  );
}
