import React, { useState } from 'react';
import { Eye, X, Play, Loader, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { triggerHeadedRun } from '../services/api';

export default function HeadedRunModal({ isOpen, onClose, products = [], onRunComplete }) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.product_id || 1);
  const [slowMo, setSlowMo] = useState(600);
  const [running, setRunning] = useState(false);
  const [telemetry, setTelemetry] = useState([]);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleStartHeadedRun = async () => {
    setRunning(true);
    setTelemetry([
      `[0.0s] Launching Playwright browser instance with { headless: false, slowMo: ${slowMo}ms }...`,
      `[0.5s] Navigating to https://demo.inelabteamdev.com/product/${selectedProductId}...`,
      `[1.2s] Detecting page DOM elements...`,
      `[1.8s] Checking for cookie overlays and popup blockers...`,
      `[2.3s] Simulating cursor movement over .price-block (15 trajectories)...`,
      `[3.0s] Dwell time verification >= 600ms satisfied!`,
      `[3.5s] Clicking "Reveal price" button...`,
      `[4.2s] Awaiting async price resolution / error retry check...`
    ]);
    setResult(null);

    try {
      const res = await triggerHeadedRun(selectedProductId, slowMo);
      setResult(res);
      setTelemetry(prev => [
        ...prev,
        `[COMPLETED] Headed scrape run finished in ${res.durationMs}ms`,
        `Extracted Price: ₹${res.price}`,
        `Extracted Stock: ${res.stock} units (${res.stockStatus})`,
        `Attempts required: ${res.attempts}`
      ]);
      onRunComplete();
    } catch (err) {
      setTelemetry(prev => [
        ...prev,
        `[ERROR] Headed run error: ${err.message}`
      ]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Eye size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Observable (Headed) Scraper Run</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Watch Playwright interact with the mock store live on screen</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Select Product</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, background: '#1e293b', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '0.9rem' }}
                disabled={running}
              >
                {products.map(p => (
                  <option key={p.product_id} value={p.product_id}>
                    Product #{p.product_id} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Slow-Motion Delay</label>
              <select
                value={slowMo}
                onChange={e => setSlowMo(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, background: '#1e293b', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '0.9rem' }}
                disabled={running}
              >
                <option value={300}>Fast (300ms delay)</option>
                <option value={600}>Normal Observable (600ms delay)</option>
                <option value={1000}>Video Recording Mode (1000ms delay)</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleStartHeadedRun} disabled={running}>
            {running ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Running Headed Chrome Browser...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Launch Observable Headed Run</span>
              </>
            )}
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Live Telemetry & Browser Console
          </h4>
          <div className="log-console">
            {telemetry.length === 0 ? (
              <span style={{ color: 'var(--text-dim)' }}>Click "Launch Observable Headed Run" to open Chrome browser on screen and watch Playwright scrape.</span>
            ) : (
              telemetry.map((line, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        {result && (
          <div style={{ background: result.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {result.success ? <CheckCircle2 size={24} style={{ color: '#34d399' }} /> : <AlertCircle size={24} style={{ color: '#f87171' }} />}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {result.success ? 'Headed Run Completed Successfully!' : 'Headed Run Encountered Error'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Price: ₹{result.price} • Stock: {result.stock} • Attempts: {result.attempts} • Duration: {result.durationMs}ms
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
