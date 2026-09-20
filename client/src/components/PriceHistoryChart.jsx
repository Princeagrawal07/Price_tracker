import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PriceHistoryChart({ history = [], targetPrice }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No price history recorded yet. Scrape to generate data points.
      </div>
    );
  }

  const chartData = history.map(item => ({
    time: new Date(item.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    price: Number(item.price),
    stock: item.stock
  }));

  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const yMin = Math.floor(minPrice * 0.95);
  const yMax = Math.ceil(maxPrice * 1.05);

  return (
    <div style={{ width: '100%', height: 280, marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis domain={[yMin, yMax]} stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v => `₹${v}`} />
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem'
            }}
            formatter={(value, name) => [name === 'price' ? `₹${value.toLocaleString()}` : `${value} units`, name === 'price' ? 'Price' : 'Stock']}
          />
          <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#priceGradient)" />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        <span>Lowest Recorded: <strong style={{ color: '#34d399' }}>₹{minPrice.toLocaleString()}</strong></span>
        <span>Highest Recorded: <strong style={{ color: '#f87171' }}>₹{maxPrice.toLocaleString()}</strong></span>
      </div>
    </div>
  );
}
