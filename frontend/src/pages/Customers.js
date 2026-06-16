import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';
import { useApp } from '../context/AppContext';

function CustomerModal({ onClose, onSaved }) {
  const { notify } = useApp();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createCustomer(form);
      notify('Customer added');
      onSaved();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to save customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Customer</div>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className={`form-input ${errors.full_name ? 'error' : ''}`} value={form.full_name} onChange={f('full_name')} placeholder="John Doe" />
          {errors.full_name && <div className="form-error">{errors.full_name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={f('email')} placeholder="john@example.com" />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className={`form-input ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={f('phone')} placeholder="+1 555-000-0000" />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { notify } = useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.full_name}"?`)) return;
    try {
      await deleteCustomer(c.id);
      notify('Customer deleted');
      load();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to delete', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <p>Manage your customer database</p>
      </div>
      <div className="toolbar">
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{customers.length} customers</span>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="icon">◉</div><p>No customers yet.</p></div></td></tr>
              ) : customers.map(c => (
                <tr key={c.id}>
                  <td className="td-muted">#{c.id}</td>
                  <td><strong>{c.full_name}</strong></td>
                  <td className="td-muted">{c.email}</td>
                  <td className="td-muted">{c.phone}</td>
                  <td className="td-muted">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && <CustomerModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
