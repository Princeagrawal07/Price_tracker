import React from 'react';
import { Bell, X, Check, TrendingDown, PackageCheck, AlertCircle } from 'lucide-react';
import { markAlertRead } from '../services/api';

export default function AlertsDrawer({ isOpen, onClose, alerts = [], onAlertRead }) {
  if (!isOpen) return null;

  const handleRead = async (id) => {
    await markAlertRead(id);
    onAlertRead();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>In-App Notifications</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 420, overflowY: 'auto' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No notifications yet. Price drop & back in stock alerts will appear here.
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  opacity: alert.is_read ? 0.6 : 1,
                  borderLeft: `4px solid ${alert.alert_type === 'price_drop' ? '#10b981' : alert.alert_type === 'back_in_stock' ? '#3b82f6' : '#f59e0b'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {alert.alert_type === 'price_drop' && <TrendingDown size={18} style={{ color: '#10b981', marginTop: 2 }} />}
                    {alert.alert_type === 'back_in_stock' && <PackageCheck size={18} style={{ color: '#3b82f6', marginTop: 2 }} />}
                    {alert.alert_type === 'structure_change' && <AlertCircle size={18} style={{ color: '#f59e0b', marginTop: 2 }} />}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{alert.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{alert.message}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem', display: 'block' }}>
                        {new Date(alert.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {!alert.is_read && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                      onClick={() => handleRead(alert.id)}
                    >
                      <Check size={12} />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
