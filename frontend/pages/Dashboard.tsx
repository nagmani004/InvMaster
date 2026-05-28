import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import type { Product, Customer, Order } from '../types';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    Promise.all([
      fetch(`${API_URL}/products`).then(res => res.json()),
      fetch(`${API_URL}/customers`).then(res => res.json()),
      fetch(`${API_URL}/orders`).then(res => res.json())
    ]).then(([p, c, o]) => {
      setProducts(p);
      setCustomers(c);
      setOrders(o);
    });
  }, []);

  const lowStockProducts = products.filter(p => p.quantity < 10);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {lowStockProducts.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">All products are sufficiently stocked.</p>
          ) : (
            lowStockProducts.map(product => (
              <div key={product.id} className="p-6 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-200">
                    {product.quantity} left in stock
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
