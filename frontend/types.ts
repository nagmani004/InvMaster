// React UI Types

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Order {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  total_amount: number;
}
