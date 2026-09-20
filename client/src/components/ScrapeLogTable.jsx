import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function ScrapeLogTable({ logs = [] }) {
  const [selectedError, setSelectedError] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No scrape log attempts recorded for this product yet.
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Outcome</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Attempts</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Latency</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Price Found</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Stock</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Strategy</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {new Date(log.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {log.status === 'success' && (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Success
                    </span>
                  )}
                  {log.status === 'retried' && (
                    <span className="badge badge-retried">
                      <AlertTriangle size={12} /> Retried
                    </span>
                  )}
                  {log.status === 'failed' && (
                    <span className="badge badge-failed">
                      <XCircle size={12} /> Failed
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{log.attempts_count || 1}</td>
                <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>{log.response_time_ms ? `${log.response_time_ms}ms` : '-'}</td>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: log.price_found ? '#fff' : 'var(--text-dim)' }}>
                  {log.price_found ? `₹${Number(log.price_found).toLocaleString()}` : 'N/A'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {log.stock_found !== null && log.stock_found !== undefined ? log.stock_found : 'N/A'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {log.strategy_used || 'playwright'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {log.error_message ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: '#f87171' }}
                      onClick={() => setSelectedError(log.error_message)}
                    >
                      <Info size={12} /> View Error
                    </button>
                  ) : (
                    <span style={{ color: '#34d399', fontSize: '0.75rem' }}>Clean extract</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedError && (
        <div className="modal-overlay" onClick={() => setSelectedError(null)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171', marginBottom: '0.75rem' }}>Honest Failure Log Detail</h3>
            <div className="log-console" style={{ color: '#fca5a5' }}>
              {selectedError}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setSelectedError(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
