import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// In-Memory Database for Mock Express Backend
const db = {
  products: [
    { id: 1, name: "Lenovo ThinkPad", sku: "LEN-001", price: 1200.0, quantity: 45 },
    { id: 2, name: "Mechanical Keyboard", sku: "MK-104", price: 150.0, quantity: 8 },
  ],
  customers: [
    { id: 1, full_name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", address: "123 Main St" },
  ],
  orders: [],
  productIdCounter: 3,
  customerIdCounter: 2,
  orderIdCounter: 1,
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK API FOR AI STUDIO PREVIEW ---
  // (Mimics the exact behavior of the Python backend)

  // Products
  app.post("/api/products", (req, res) => {
    const { name, sku, price, quantity } = req.body;
    if (quantity < 0) return res.status(400).json({ detail: "Quantity cannot be negative" });
    if (db.products.find(p => p.sku === sku)) return res.status(400).json({ detail: "Product SKU already exists" });
    
    const newProduct = { id: db.productIdCounter++, name, sku, price, quantity };
    db.products.push(newProduct);
    res.status(201).json(newProduct);
  });

  app.get("/api/products", (req, res) => res.json(db.products));
  app.get("/api/products/:id", (req, res) => {
    const p = db.products.find((p) => p.id === parseInt(req.params.id));
    p ? res.json(p) : res.status(404).json({ detail: "Not found" });
  });

  app.put("/api/products/:id", (req, res) => {
    const idx = db.products.findIndex((p) => p.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ detail: "Not found" });
    const { name, sku, price, quantity } = req.body;
    
    if (quantity !== undefined && quantity < 0) return res.status(400).json({ detail: "Quantity cannot be negative" });
    if (sku !== undefined && sku !== db.products[idx].sku && db.products.find(p => p.sku === sku)) {
      return res.status(400).json({ detail: "Product SKU already exists" });
    }

    db.products[idx] = { ...db.products[idx], ...req.body };
    res.json(db.products[idx]);
  });
  
  app.delete("/api/products/:id", (req, res) => {
    const idx = db.products.findIndex((p) => p.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ detail: "Not found" });
    db.products.splice(idx, 1);
    res.status(204).send();
  });

  // Customers
  app.post("/api/customers", (req, res) => {
    const { full_name, email, phone, address } = req.body;
    if (!phone) return res.status(400).json({ detail: "Phone number is required" });
    if (db.customers.find(c => c.email === email)) return res.status(400).json({ detail: "Email already registered" });
    const newCust = { id: db.customerIdCounter++, full_name, email, phone, address };
    db.customers.push(newCust);
    res.status(201).json(newCust);
  });

  app.get("/api/customers", (req, res) => res.json(db.customers));
  app.get("/api/customers/:id", (req, res) => {
    const c = db.customers.find((c) => c.id === parseInt(req.params.id));
    c ? res.json(c) : res.status(404).json({ detail: "Not found" });
  });

  app.delete("/api/customers/:id", (req, res) => {
    const idx = db.customers.findIndex((c) => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ detail: "Not found" });
    db.customers.splice(idx, 1);
    res.status(204).send();
  });

  // Orders
  app.post("/api/orders", (req, res) => {
    const { customer_id, product_id, quantity } = req.body;
    const cust = db.customers.find(c => c.id === customer_id);
    if (!cust) return res.status(404).json({ detail: "Customer not found" });
    
    const prod = db.products.find(p => p.id === product_id);
    if (!prod) return res.status(404).json({ detail: "Product not found" });
    
    if (prod.quantity < quantity) return res.status(400).json({ detail: `Insufficient inventory. Only ${prod.quantity} left.` });
    
    const total_amount = prod.price * quantity;
    prod.quantity -= quantity; // Reduce stock

    const newOrder = { id: db.orderIdCounter++, customer_id, product_id, quantity, total_amount };
    db.orders.push(newOrder);
    res.status(201).json(newOrder);
  });

  app.get("/api/orders", (req, res) => res.json(db.orders));
  app.get("/api/orders/:id", (req, res) => {
    const o = db.orders.find((o) => o.id === parseInt(req.params.id));
    o ? res.json(o) : res.status(404).json({ detail: "Not found" });
  });

  app.delete("/api/orders/:id", (req, res) => {
    const idx = db.orders.findIndex((o) => o.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ detail: "Not found" });
    db.orders.splice(idx, 1);
    res.status(204).send();
  });


  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
