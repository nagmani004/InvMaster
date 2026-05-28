import { useEffect, useState } from 'react';
import type { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [error, setError] = useState('');

  const loadProducts = () => {
    fetch(`${API_URL}/products`).then(res => res.json()).then(setProducts);
  };

  useEffect(() => loadProducts(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    };

    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setFormData({ name: '', sku: '', price: '', quantity: '' });
      loadProducts();
    } else {
      const data = await res.json();
      setError(data.detail || 'Failed to create product');
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Are you sure?')) {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      loadProducts();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products Management</h2>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input required placeholder="Product Name" className="border rounded px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="SKU" className="border rounded px-3 py-2" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <input required type="number" step="0.01" min="0.01" placeholder="Price ($)" className="border rounded px-3 py-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <input required type="number" min="0" placeholder="Initial Quantity" className="border rounded px-3 py-2" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          <button type="submit" className="md:col-span-4 bg-indigo-600 text-white font-medium py-2 rounded shadow hover:bg-indigo-700 transition">Add Product</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{p.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4">{p.sku}</td>
                <td className="px-6 py-4">${p.price.toFixed(2)}</td>
                <td className="px-6 py-4">{p.quantity}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
