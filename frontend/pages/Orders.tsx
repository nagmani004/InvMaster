import { useEffect, useState } from 'react';
import type { Order, Product, Customer } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const [formData, setFormData] = useState({ customer_id: '', product_id: '', quantity: '' });
  const [error, setError] = useState('');

  const loadData = () => {
    fetch(`${API_URL}/orders`).then(res => res.json()).then(setOrders);
    fetch(`${API_URL}/products`).then(res => res.json()).then(setProducts);
    fetch(`${API_URL}/customers`).then(res => res.json()).then(setCustomers);
  };

  useEffect(() => loadData(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      customer_id: parseInt(formData.customer_id),
      product_id: parseInt(formData.product_id),
      quantity: parseInt(formData.quantity)
    };

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setFormData({ customer_id: '', product_id: '', quantity: '' });
      loadData();
    } else {
      const data = await res.json();
      setError(data.detail || 'Failed to create order');
    }
  };

  const deleteOrder = async (id: number) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Management</h2>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select required className="border rounded px-3 py-2 bg-white" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
            <option value="">Select Customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
          </select>
          <select required className="border rounded px-3 py-2 bg-white md:col-span-2" value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
            <option value="">Select Product...</option>
            {products.map(p => <option key={p.id} value={p.id} disabled={p.quantity === 0}>
              {p.name} - ${p.price.toFixed(2)} ({p.quantity} in stock)
            </option>)}
          </select>
          <input required type="number" min="1" placeholder="Quantity" className="border rounded px-3 py-2" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          <div className="md:col-span-4 flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 gap-4">
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold mr-2">Total Amount:</span>
              <span className="text-2xl font-bold text-indigo-600">
                ${((products.find(p => p.id.toString() === formData.product_id)?.price || 0) * (parseInt(formData.quantity) || 0)).toFixed(2)}
              </span>
            </div>
            <button type="submit" className="w-full sm:w-auto px-6 bg-indigo-600 text-white font-medium py-2 rounded shadow hover:bg-indigo-700 transition">
              Place Order
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const cust = customers.find(c => c.id === o.customer_id);
              const prod = products.find(p => p.id === o.product_id);
              return (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">#{o.id}</td>
                  <td className="px-6 py-4">{cust?.full_name || `Unknown (${o.customer_id})`}</td>
                  <td className="px-6 py-4">{prod?.name || `Unknown (${o.product_id})`}</td>
                  <td className="px-6 py-4">{o.quantity}</td>
                  <td className="px-6 py-4 font-semibold">${o.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteOrder(o.id)} className="text-red-500 hover:text-red-700 font-medium">Cancel / Delete</button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
