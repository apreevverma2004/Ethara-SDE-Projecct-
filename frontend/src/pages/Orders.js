import React, { useEffect, useState } from 'react';
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../services/api';
import { useApp } from '../context/AppContext';

function CreateOrderModal({ onClose, onSaved }) {
  const { notify } = useApp();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCustomers().then(r => setCustomers(r.data));
    getProducts().then(r => setProducts(r.data));
  }, []);

  const addItem = () => setItems(p => [...p, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  const calcTotal = () => {
    return items.reduce((sum, item) => {
      const p = products.find(p => p.id === +item.product_id);
      return sum + (p ? p.price * +item.quantity : 0);
    }, 0).toFixed(2);
  };

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Select a customer';
    if (items.some(i => !i.product_id)) e.items = 'All items must have a product selected';
    if (items.some(i => +i.quantity < 1)) e.items = 'Quantity must be at least 1';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createOrder({
        customer_id: +customerId,
        items: items.map(i => ({ product_id: +i.product_id, quantity: +i.quantity }))
      });
      notify('Order placed successfully');
      onSaved();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to place order', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Create New Order</div>
        <div className="form-group">
          <label className="form-label">Customer</label>
          <select className={`form-select ${errors.customer ? 'error' : ''}`} value={customerId} onChange={e => { setCustomerId(e.target.value); setErrors(p => ({ ...p, customer: '' })); }}>
            <option value="">Select customer…</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
          </select>
          {errors.customer && <div className="form-error">{errors.customer}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Order Items</label>
          {errors.items && <div className="form-error" style={{ marginBottom: 8 }}>{errors.items}</div>}
          <div className="order-items-list">
            {items.map((item, i) => (
              <div key={i} className="order-item-row">
                <select className="form-select" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)}) — Stock: {p.quantity}</option>)}
                </select>
                <input type="number" min="1" className="form-input" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)} disabled={items.length === 1}>✕</button>
              </div>
            ))}
          </div>
          <button className="add-item-btn" onClick={addItem}>+ Add Item</button>
        </div>

        {+calcTotal() > 0 && (
          <div className="card" style={{ marginBottom: 4, background: 'var(--bg-surface)' }}>
            <strong>Estimated Total: </strong>
            <span style={{ color: 'var(--accent-lit)', fontWeight: 700 }}>${calcTotal()}</span>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Placing…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(orderId).then(r => setOrder(r.data));
  }, [orderId]);

  if (!order) return <div className="modal-backdrop"><div className="modal"><div className="loading">Loading…</div></div></div>;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Order #{order.id}</div>
        <div className="detail-grid">
          <div className="detail-item"><div className="lbl">Customer</div><div className="val">{order.customer?.full_name}</div></div>
          <div className="detail-item"><div className="lbl">Status</div><div className="val"><span className={`badge badge-blue`}>{order.status}</span></div></div>
          <div className="detail-item"><div className="lbl">Total</div><div className="val" style={{ color: 'var(--accent-lit)' }}>${order.total_amount.toFixed(2)}</div></div>
          <div className="detail-item"><div className="lbl">Date</div><div className="val">{new Date(order.created_at).toLocaleDateString()}</div></div>
        </div>
        <div className="section-title" style={{ marginTop: 16 }}>Items</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || `Product #${item.product_id}`}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td><strong>${(item.quantity * item.unit_price).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { notify } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const load = () => {
    setLoading(true);
    getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}? Stock will be restored.`)) return;
    try {
      await deleteOrder(o.id);
      notify('Order cancelled and stock restored');
      load();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to cancel order', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <p>Track and manage customer orders</p>
      </div>
      <div className="toolbar">
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{orders.length} orders</span>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Order</button>
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="icon">◷</div><p>No orders yet. Create the first order.</p></div></td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td><span className="badge badge-blue">#{o.id}</span></td>
                  <td><strong>{o.customer?.full_name || '—'}</strong></td>
                  <td className="td-muted">{o.items?.length || 0} item(s)</td>
                  <td><strong style={{ color: 'var(--accent-lit)' }}>${o.total_amount.toFixed(2)}</strong></td>
                  <td><span className="badge badge-green">{o.status}</span></td>
                  <td className="td-muted">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setDetailId(o.id)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o)}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal === 'create' && <CreateOrderModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {detailId && <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}
