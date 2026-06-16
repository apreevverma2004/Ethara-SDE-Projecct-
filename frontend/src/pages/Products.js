import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { useApp } from '../context/AppContext';

function ProductModal({ product, onClose, onSaved }) {
  const { notify } = useApp();
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || '',
    quantity: product?.quantity ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = 'Valid price required';
    if (form.quantity === '' || isNaN(form.quantity) || +form.quantity < 0) e.quantity = 'Quantity must be ≥ 0';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, sku: form.sku, price: +form.price, quantity: +form.quantity };
      if (isEdit) await updateProduct(product.id, payload);
      else await createProduct(payload);
      notify(isEdit ? 'Product updated' : 'Product created');
      onSaved();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isEdit ? 'Edit Product' : 'Add Product'}</div>
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={f('name')} placeholder="e.g. Wireless Mouse" />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">SKU / Code</label>
            <input className={`form-input ${errors.sku ? 'error' : ''}`} value={form.sku} onChange={f('sku')} placeholder="e.g. WM-001" />
            {errors.sku && <div className="form-error">{errors.sku}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Price ($)</label>
            <input type="number" min="0.01" step="0.01" className={`form-input ${errors.price ? 'error' : ''}`} value={form.price} onChange={f('price')} placeholder="0.00" />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity in Stock</label>
          <input type="number" min="0" className={`form-input ${errors.quantity ? 'error' : ''}`} value={form.quantity} onChange={f('quantity')} placeholder="0" />
          {errors.quantity && <div className="form-error">{errors.quantity}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { notify } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | product obj

  const load = () => {
    setLoading(true);
    getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      notify('Product deleted');
      load();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to delete', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage your product catalog and stock levels</p>
      </div>
      <div className="toolbar">
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{products.length} products</span>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Product</button>
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="icon">⬡</div><p>No products yet. Add your first product.</p></div></td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td className="td-muted">{p.sku}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? 'badge-red' : p.quantity <= 10 ? 'badge-yellow' : 'badge-green'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
