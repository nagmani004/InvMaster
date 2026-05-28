import { useEffect, useState } from 'react';
import type { Customer } from '../types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const loadCustomers = () => {
    fetch(`${API_URL}/customers`).then(res => res.json()).then(setCustomers);
  };

  useEffect(() => loadCustomers(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setFormData({ full_name: '', email: '', phone: '', address: '' });
      loadCustomers();
    } else {
      const data = await res.json();
      setError(data.detail || 'Failed to create customer');
    }
  };

  const deleteCustomer = async (id: number) => {
    if (confirm('Are you sure?')) {
      await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
      loadCustomers();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Management</h2>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input required placeholder="Full Name" className="border rounded px-3 py-2" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
          <input required type="email" placeholder="Email Address" className="border rounded px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required placeholder="Phone Number" className="border rounded px-3 py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input placeholder="Address (Optional)" className="border rounded px-3 py-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <button type="submit" className="md:col-span-4 bg-indigo-600 text-white font-medium py-2 rounded shadow hover:bg-indigo-700 transition">Add Customer</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{c.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{c.full_name}</td>
                <td className="px-6 py-4">{c.email}</td>
                <td className="px-6 py-4">{c.phone}</td>
                <td className="px-6 py-4">{c.address || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteCustomer(c.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
