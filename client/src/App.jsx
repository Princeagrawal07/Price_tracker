import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AnalyticsHeader from './components/AnalyticsHeader';
import ProductCard from './components/ProductCard';
import ProductSearchModal from './components/ProductSearchModal';
import PriceHistoryChart from './components/PriceHistoryChart';
import ScrapeLogTable from './components/ScrapeLogTable';
import HeadedRunModal from './components/HeadedRunModal';
import AlertsDrawer from './components/AlertsDrawer';
import { getTrackedProducts, getProductDetail, getAlerts } from './services/api';
import { X, RefreshCw, LineChart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isHeadedOpen, setIsHeadedOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'logs'

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [prods, alertItems] = await Promise.all([
        getTrackedProducts(),
        getAlerts()
      ]);
      setProducts(prods);
      setAlerts(alertItems);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await getProductDetail(product.product_id);
      setProductDetail(detail);
    } catch (err) {
      console.error('Failed to load detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const unreadAlertsCount = alerts.filter(a => !a.is_read).length;

  return (
    <div>
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenHeaded={() => setIsHeadedOpen(true)}
        onRefreshAll={loadData}
        isSyncing={isSyncing}
        unreadCount={unreadAlertsCount}
      />

      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Real-time automated price tracking and stock monitoring engine
          </p>
        </div>

        <AnalyticsHeader products={products} logs={productDetail?.scrapeLogs || []} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Tracked Products ({products.length})</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsSearchOpen(true)}>
            + Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>No Products Tracked Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 460, margin: '0 auto 1.5rem' }}>
              Search for products on INE's hosted mock store catalog and click "Track" to start monitoring prices and stock.
            </p>
            <button className="btn btn-primary" onClick={() => setIsSearchOpen(true)}>
              Track First Product
            </button>
          </div>
        ) : (
          <div className="dashboard-grid">
            {products.map(product => (
              <ProductCard
                key={product.product_id}
                product={product}
                onSelectProduct={handleSelectProduct}
                onRefreshList={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {isDetailOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsDetailOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 880 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {selectedProduct.brand} • SKU: {selectedProduct.sku}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.1rem' }}>{selectedProduct.name}</h2>
              </div>
              <button onClick={() => setIsDetailOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Tab Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
              <button
                className={`btn btn-sm ${activeTab === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('chart')}
                style={{ borderRadius: '8px 8px 0 0' }}
              >
                <LineChart size={16} />
                <span>Price & Stock History</span>
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('logs')}
                style={{ borderRadius: '8px 8px 0 0' }}
              >
                <span>Per-Product Scrape Log ({productDetail?.scrapeLogs?.length || 0})</span>
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading product analytics...
              </div>
            ) : (
              <div>
                {activeTab === 'chart' && (
                  <div>
                    <PriceHistoryChart history={productDetail?.priceHistory || []} targetPrice={selectedProduct.target_price} />
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div>
                    <ScrapeLogTable logs={productDetail?.scrapeLogs || []} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal */}
      <ProductSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onTrackedSuccess={loadData}
      />

      {/* Headed Observable Run Modal */}
      <HeadedRunModal
        isOpen={isHeadedOpen}
        onClose={() => setIsHeadedOpen(false)}
        products={products}
        onRunComplete={loadData}
      />

      {/* Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAlertRead={loadData}
      />
    </div>
  );
}
