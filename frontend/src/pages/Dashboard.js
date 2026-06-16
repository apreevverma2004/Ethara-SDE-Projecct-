import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (error)   return <div className="loading" style={{color:'var(--danger)'}}>{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your inventory and sales operations</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-accent-purple">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products}</div>
          <div className="stat-sub">Active catalog items</div>
        </div>
        <div className="stat-card stat-accent-green">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers}</div>
          <div className="stat-sub">Registered accounts</div>
        </div>
        <div className="stat-card stat-accent-yellow">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
          <div className="stat-sub">Placed orders</div>
        </div>
        <div className="stat-card stat-accent-red">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value">{stats.low_stock_products.length}</div>
          <div className="stat-sub">Products ≤ 10 units</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">⚠ Low Stock Alerts</div>
        {stats.low_stock_products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">✓</div>
            <p>All products are well-stocked</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="td-muted">{p.sku}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
