/**
 * LaptopHub Backend Server
 * Express REST API — Products, Cart, Orders, Payments
 *
 * Endpoints:
 *   GET    /api/products          — list all products (filter, sort, search via query params)
 *   GET    /api/products/:id      — single product detail
 *   GET    /api/cart/:sessionId   — get cart for session
 *   POST   /api/cart/:sessionId   — add item to cart  { productId, qty }
 *   PUT    /api/cart/:sessionId/:productId  — update qty  { qty }
 *   DELETE /api/cart/:sessionId/:productId  — remove item
 *   DELETE /api/cart/:sessionId   — clear cart
 *   POST   /api/orders            — create order  { sessionId, customer, payment }
 *   GET    /api/orders/:orderId   — get order status
 *   POST   /api/payments/intent   — create payment intent (Stripe mock)
 *   POST   /api/payments/confirm  — confirm payment
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Serve frontend static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ─── In-Memory Data Store ─────────────────────────────────────────────────────
const products = [
  {
    id: 1, name: "ASUS ROG Strix G16", category: "Gaming", brand: "ASUS",
    price: 1499, originalPrice: 1799, discount: 17,
    rating: 4.8, reviews: 312, inStock: true, stockCount: 8,
    emoji: "🎮",
    images: ["rog-strix.jpg"],
    specs: {
      cpu: "Intel Core i9-13980HX",
      ram: "32GB DDR5 4800MHz",
      storage: "1TB PCIe 5.0 NVMe SSD",
      display: '16" QHD+ 240Hz IPS',
      gpu: "NVIDIA GeForce RTX 4070 8GB",
      battery: "90Wh — up to 10 hrs",
      os: "Windows 11 Home",
      weight: "2.5 kg",
      ports: "USB-C (TB4), 3× USB-A, HDMI 2.1, SD card, 3.5mm"
    },
    highlights: ["240Hz QHD+ display", "RTX 4070 GPU", "MUX Switch", "Per-key RGB"],
    description: "Dominate every game with the ROG Strix G16. Powered by Intel's latest i9-13980HX and paired with an RTX 4070, this beast delivers buttery-smooth framerates at stunning QHD+ resolution. The 240Hz display and MUX Switch eliminate GPU overhead, giving you every competitive edge."
  },
  {
    id: 2, name: 'MacBook Pro 14"', category: "Creator", brand: "Apple",
    price: 1999, originalPrice: 1999, discount: 0,
    rating: 4.9, reviews: 541, inStock: true, stockCount: 15,
    emoji: "🍎",
    specs: {
      cpu: "Apple M3 Pro (11-core)",
      ram: "18GB Unified Memory",
      storage: "512GB SSD",
      display: '14.2" Liquid Retina XDR (3024×1964)',
      gpu: "18-core Apple GPU",
      battery: "70Wh — up to 18 hrs",
      os: "macOS Sonoma",
      weight: "1.61 kg",
      ports: "3× Thunderbolt 4, MagSafe 3, HDMI, SD, 3.5mm"
    },
    highlights: ["M3 Pro chip", "XDR ProMotion 120Hz", "18hr battery", "MagSafe charging"],
    description: "The MacBook Pro 14 with M3 Pro is a powerhouse for video editors, 3D artists, and developers. The Liquid Retina XDR display with ProMotion 120Hz is breathtaking, and the M3 Pro chip handles everything from 4K timelines to complex Xcode builds with ease."
  },
  {
    id: 3, name: "Dell XPS 13", category: "Ultrabook", brand: "Dell",
    price: 1199, originalPrice: 1399, discount: 14,
    rating: 4.7, reviews: 228, inStock: true, stockCount: 12,
    emoji: "💎",
    specs: {
      cpu: "Intel Core Ultra 7 155H",
      ram: "16GB LPDDR5x",
      storage: "512GB PCIe 4.0 SSD",
      display: '13.4" OLED 3.5K (3456×2160) 60Hz',
      gpu: "Intel Arc Graphics",
      battery: "55Wh — up to 12 hrs",
      os: "Windows 11 Home",
      weight: "1.17 kg",
      ports: "2× Thunderbolt 4, USB-C 3.2, 3.5mm"
    },
    highlights: ["OLED 3.5K display", "Ultra-thin 14.8mm", "Core Ultra 7", "1.17 kg"],
    description: "The iconic XPS 13 reimagined with Intel's latest Core Ultra 7 chip and a dazzling OLED display. Weighing just 1.17 kg with a 3.5K OLED panel, this is the ultimate ultrabook for professionals who demand beauty and brains in equal measure."
  },
  {
    id: 4, name: "ThinkPad X1 Carbon Gen 11", category: "Business", brand: "Lenovo",
    price: 1349, originalPrice: 1599, discount: 16,
    rating: 4.8, reviews: 197, inStock: true, stockCount: 20,
    emoji: "⬛",
    specs: {
      cpu: "Intel Core i7-1365U vPro",
      ram: "16GB LPDDR5",
      storage: "512GB PCIe 4.0 SSD",
      display: '14" IPS 2.8K (2880×1800) 90Hz',
      gpu: "Intel Iris Xe Graphics",
      battery: "57Wh — up to 15 hrs",
      os: "Windows 11 Pro",
      weight: "1.12 kg",
      ports: "2× Thunderbolt 4, 2× USB-A 3.2, HDMI 2.0, 3.5mm"
    },
    highlights: ["MIL-SPEC durability", "vPro security", "2.8K IPS 90Hz", "Windows 11 Pro"],
    description: "The gold standard for business laptops since 1992. The X1 Carbon Gen 11 combines military-grade durability with enterprise vPro security, an exceptional backlit keyboard, and a 2.8K display — all in a 1.12 kg carbon-fiber chassis that survives everything business travel throws at it."
  },
  {
    id: 5, name: "Razer Blade 15", category: "Gaming", brand: "Razer",
    price: 2199, originalPrice: 2499, discount: 12,
    rating: 4.7, reviews: 189, inStock: true, stockCount: 5,
    emoji: "🐍",
    specs: {
      cpu: "Intel Core i9-13900H",
      ram: "32GB DDR5 5200MHz",
      storage: "1TB PCIe 5.0 SSD",
      display: '15.6" QHD 240Hz IPS',
      gpu: "NVIDIA GeForce RTX 4080 12GB",
      battery: "80Wh — up to 8 hrs",
      os: "Windows 11 Home",
      weight: "2.01 kg",
      ports: "2× USB-C (TB4), 3× USB-A, HDMI 2.1, SD, 3.5mm"
    },
    highlights: ["RTX 4080 12GB", "Sleek CNC aluminum", "240Hz QHD", "Vapor chamber cooling"],
    description: "Premium gaming in a suit. The Razer Blade 15 marries desktop-class RTX 4080 power with a precision CNC-milled aluminum chassis so thin it looks like a MacBook. For gamers who refuse to sacrifice style for performance."
  },
  {
    id: 6, name: "HP Spectre x360 14", category: "Ultrabook", brand: "HP",
    price: 1449, originalPrice: 1649, discount: 12,
    rating: 4.6, reviews: 164, inStock: true, stockCount: 9,
    emoji: "✨",
    specs: {
      cpu: "Intel Core Ultra 7 155U",
      ram: "16GB LPDDR5",
      storage: "1TB PCIe 4.0 SSD",
      display: '14" OLED 2.8K (2880×1800) Touch 120Hz',
      gpu: "Intel Arc Graphics",
      battery: "68Wh — up to 17 hrs",
      os: "Windows 11 Home",
      weight: "1.41 kg",
      ports: "2× Thunderbolt 4, USB-A 3.2, microSD, 3.5mm"
    },
    highlights: ["2-in-1 convertible", "OLED touch 120Hz", "17hr battery", "HP tilt pen included"],
    description: "The Spectre x360 is the most elegant convertible laptop money can buy. A 2.8K OLED touch display, up to 17 hours of battery life, and a 360° hinge let you work, sketch, and relax in any mode. Includes HP Tilt Pen for creative work."
  },
  {
    id: 7, name: "Lenovo Yoga 9i Gen 8", category: "Creator", brand: "Lenovo",
    price: 1599, originalPrice: 1799, discount: 11,
    rating: 4.7, reviews: 143, inStock: true, stockCount: 7,
    emoji: "🎨",
    specs: {
      cpu: "Intel Core Ultra 9 185H",
      ram: "32GB LPDDR5x",
      storage: "1TB PCIe 4.0 SSD",
      display: '14" OLED 2.8K (2880×1800) 120Hz Touch',
      gpu: "Intel Arc Graphics",
      battery: "75Wh — up to 14 hrs",
      os: "Windows 11 Home",
      weight: "1.39 kg",
      ports: "2× Thunderbolt 4, USB-A 3.2, HDMI, 3.5mm"
    },
    highlights: ["OLED 100% DCI-P3", "Core Ultra 9", "Yoga convertible", "Bowers & Wilkins audio"],
    description: "A creator's canvas. The Yoga 9i's 120Hz OLED display covers 100% of the DCI-P3 color gamut for perfect color accuracy in photo and video editing. Premium Bowers & Wilkins speakers, a Core Ultra 9, and 360° hinge round out a truly exceptional machine."
  },
  {
    id: 8, name: "HP EliteBook 840 G10", category: "Business", brand: "HP",
    price: 1099, originalPrice: 1299, discount: 15,
    rating: 4.6, reviews: 211, inStock: true, stockCount: 18,
    emoji: "🔒",
    specs: {
      cpu: "Intel Core i5-1340P vPro",
      ram: "16GB DDR5",
      storage: "512GB PCIe 4.0 SSD",
      display: '14" IPS FHD (1920×1200) Sure View',
      gpu: "Intel Iris Xe Graphics",
      battery: "51Wh — up to 13 hrs",
      os: "Windows 11 Pro",
      weight: "1.33 kg",
      ports: "2× Thunderbolt 4, 2× USB-A, HDMI, RJ-45, 3.5mm"
    },
    highlights: ["HP Wolf Security", "Sure View privacy", "vPro platform", "RJ-45 ethernet"],
    description: "Built for the enterprise. The EliteBook 840 G10 ships with HP Wolf Security baked into silicon, a Sure View privacy screen, and full vPro manageability. An aluminum chassis, comfortable keyboard, and Ethernet port make it the no-compromise business laptop."
  },
  {
    id: 9, name: "ASUS ZenBook 14 OLED", category: "Ultrabook", brand: "ASUS",
    price: 899, originalPrice: 1049, discount: 14,
    rating: 4.5, reviews: 276, inStock: true, stockCount: 22,
    emoji: "🪷",
    specs: {
      cpu: "AMD Ryzen 7 7730U",
      ram: "16GB DDR4",
      storage: "512GB PCIe 3.0 SSD",
      display: '14" OLED 2.8K (2880×1800) 90Hz',
      gpu: "AMD Radeon 680M",
      battery: "75Wh — up to 13 hrs",
      os: "Windows 11 Home",
      weight: "1.39 kg",
      ports: "Thunderbolt 4, USB-C 3.2, USB-A 3.2, HDMI 2.0, SD, 3.5mm"
    },
    highlights: ["OLED 2.8K display", "Ryzen 7", "1.39 kg", "Best value OLED"],
    description: "The best OLED ultrabook under $1,000. The ZenBook 14 packs a stunning 2.8K OLED display, AMD Ryzen 7, and 13 hours of battery life into a 1.39 kg package. Perfect for students, remote workers, and everyday professionals who want great value without compromise."
  },
  {
    id: 10, name: "MSI Titan GT77 HX", category: "Gaming", brand: "MSI",
    price: 2799, originalPrice: 2999, discount: 7,
    rating: 4.8, reviews: 94, inStock: true, stockCount: 3,
    emoji: "⚡",
    specs: {
      cpu: "Intel Core i9-13980HX",
      ram: "64GB DDR5 4800MHz",
      storage: "4TB (2×2TB) PCIe NVMe SSD",
      display: '17.3" UHD (3840×2160) 144Hz IPS',
      gpu: "NVIDIA GeForce RTX 3080 Ti 16GB",
      battery: "99Wh — up to 6 hrs",
      os: "Windows 11 Home",
      weight: "3.3 kg",
      ports: "Thunderbolt 4, 3× USB-A 3.2, USB-C, HDMI 2.1, mDP, RJ-45, SD"
    },
    highlights: ["4K 144Hz display", "RTX 3080 Ti 16GB", "64GB DDR5", "Desktop replacement"],
    description: "The absolute pinnacle of mobile gaming. The MSI Titan GT77 HX is a desktop replacement in every sense — 64GB DDR5, 4TB of NVMe storage, and RTX 3080 Ti in a 17.3\" 4K chassis. If you need the absolute best and weight is no object, this is your machine."
  },
  {
    id: 11, name: "Samsung Galaxy Book4 Pro", category: "Business", brand: "Samsung",
    price: 999, originalPrice: 1199, discount: 17,
    rating: 4.5, reviews: 132, inStock: true, stockCount: 14,
    emoji: "💼",
    specs: {
      cpu: "Intel Core Ultra 7 155H",
      ram: "16GB LPDDR5x",
      storage: "512GB NVMe SSD",
      display: '15.6" Dynamic AMOLED 2X FHD 120Hz',
      gpu: "Intel Arc Graphics",
      battery: "76Wh — up to 21 hrs",
      os: "Windows 11 Home",
      weight: "1.55 kg",
      ports: "2× Thunderbolt 4, USB-A 3.2, HDMI 2.0, microSD, 3.5mm"
    },
    highlights: ["21hr battery", "AMOLED 120Hz", "Galaxy ecosystem", "Core Ultra 7"],
    description: "Unbeatable battery life meets Samsung's brilliant Dynamic AMOLED 2X display. The Galaxy Book4 Pro is the ideal choice for Samsung ecosystem users — seamless Galaxy AI integration, phone linking, and second screen features make it a powerful productivity hub."
  },
  {
    id: 12, name: "MacBook Air 15\" M3", category: "Ultrabook", brand: "Apple",
    price: 1299, originalPrice: 1299, discount: 0,
    rating: 4.9, reviews: 608, inStock: true, stockCount: 25,
    emoji: "🌬️",
    specs: {
      cpu: "Apple M3 (8-core)",
      ram: "16GB Unified Memory",
      storage: "512GB SSD",
      display: '15.3" Liquid Retina (2880×1864) 60Hz',
      gpu: "10-core Apple GPU",
      battery: "66.5Wh — up to 18 hrs",
      os: "macOS Sonoma",
      weight: "1.51 kg",
      ports: "2× Thunderbolt 3, MagSafe 3, 3.5mm"
    },
    highlights: ["Fanless silent design", "M3 chip", "18hr battery", "Largest Air ever"],
    description: "Fanless, featherlight, and ferociously fast. The MacBook Air 15 with M3 is the perfect everyday laptop — near-silent operation, 18 hours of real-world battery life, and a gorgeous 15.3\" Liquid Retina display in a 1.51 kg chassis that needs no fan and no compromise."
  }
];

// In-memory carts: { sessionId: [{ productId, qty }] }
const carts = {};

// In-memory orders: { orderId: { ... } }
const orders = {};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getCart(sessionId) {
  if (!carts[sessionId]) carts[sessionId] = [];
  return carts[sessionId];
}

function cartWithDetails(sessionId) {
  const cart = getCart(sessionId);
  const items = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;
  return { items, subtotal, tax, total };
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, search, sort, minPrice, maxPrice } = req.query;
  let result = [...products];

  if (category && category !== 'All') {
    result = result.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.specs.cpu.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

  switch (sort) {
    case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
    case 'discount':   result.sort((a, b) => b.discount - a.discount); break;
    default: break;
  }

  res.json({ success: true, count: result.length, products: result });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  res.json({ success: true, product, related });
});

// ─── CART ─────────────────────────────────────────────────────────────────────
app.get('/api/cart/:sessionId', (req, res) => {
  res.json({ success: true, cart: cartWithDetails(req.params.sessionId) });
});

app.post('/api/cart/:sessionId', (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = products.find(p => p.id === Number(productId));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const cart = getCart(req.params.sessionId);
  const existing = cart.find(i => i.productId === Number(productId));
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stockCount);
  } else {
    cart.push({ productId: Number(productId), qty: Math.min(qty, product.stockCount) });
  }
  res.json({ success: true, cart: cartWithDetails(req.params.sessionId) });
});

app.put('/api/cart/:sessionId/:productId', (req, res) => {
  const { qty } = req.body;
  const cart = getCart(req.params.sessionId);
  const item = cart.find(i => i.productId === Number(req.params.productId));
  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });
  if (qty <= 0) {
    carts[req.params.sessionId] = cart.filter(i => i.productId !== Number(req.params.productId));
  } else {
    item.qty = qty;
  }
  res.json({ success: true, cart: cartWithDetails(req.params.sessionId) });
});

app.delete('/api/cart/:sessionId/:productId', (req, res) => {
  carts[req.params.sessionId] = getCart(req.params.sessionId)
    .filter(i => i.productId !== Number(req.params.productId));
  res.json({ success: true, cart: cartWithDetails(req.params.sessionId) });
});

app.delete('/api/cart/:sessionId', (req, res) => {
  carts[req.params.sessionId] = [];
  res.json({ success: true, message: 'Cart cleared' });
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
// Mock payment intent creation (replace with real Stripe/PayPal SDK in production)
app.post('/api/payments/intent', (req, res) => {
  const { sessionId, method } = req.body;
  const cart = cartWithDetails(sessionId);
  if (!cart.items.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

  const intentId = 'pi_' + uuidv4().replace(/-/g, '').slice(0, 24);
  res.json({
    success: true,
    intentId,
    amount: cart.total,
    currency: 'usd',
    method,
    // In production: return Stripe client_secret or PayPal order ID here
    clientSecret: 'mock_secret_' + intentId,
    message: method === 'paypal'
      ? 'Redirect to PayPal to complete payment'
      : method === 'gpay'
        ? 'Google Pay sheet ready'
        : 'Enter card details to complete payment'
  });
});

app.post('/api/payments/confirm', (req, res) => {
  const { intentId, method } = req.body;
  // In production: confirm with Stripe/PayPal here
  // For demo, we simulate a successful payment
  const success = Math.random() > 0.05; // 95% success rate simulation
  if (success) {
    res.json({
      success: true,
      status: 'succeeded',
      transactionId: 'txn_' + uuidv4().replace(/-/g, '').slice(0, 16),
      intentId,
      method
    });
  } else {
    res.status(402).json({ success: false, status: 'failed', message: 'Payment declined. Please try another card.' });
  }
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { sessionId, customer, payment } = req.body;

  if (!customer?.name || !customer?.email) {
    return res.status(400).json({ success: false, message: 'Customer name and email are required' });
  }

  const cart = cartWithDetails(sessionId);
  if (!cart.items.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const orderId = 'LH-' + Date.now().toString(36).toUpperCase();
  const order = {
    orderId,
    sessionId,
    customer,
    payment: {
      method: payment?.method || 'card',
      transactionId: payment?.transactionId || 'pending',
      status: payment?.status || 'paid'
    },
    items: cart.items.map(i => ({
      productId: i.productId,
      name: i.product.name,
      price: i.product.price,
      qty: i.qty,
      subtotal: i.product.price * i.qty
    })),
    pricing: {
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: 0,
      total: cart.total
    },
    status: 'confirmed',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  orders[orderId] = order;
  // Clear cart after order
  carts[sessionId] = [];

  res.json({ success: true, order });
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = orders[req.params.orderId];
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

// ─── CATEGORIES & META ────────────────────────────────────────────────────────
app.get('/api/meta', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  const priceRange = { min: Math.min(...products.map(p => p.price)), max: Math.max(...products.map(p => p.price)) };
  res.json({ success: true, categories, brands, priceRange, totalProducts: products.length });
});

// ─── CATCH-ALL: serve frontend ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 LaptopHub backend running at http://localhost:${PORT}`);
  console.log(`📦 ${products.length} products loaded`);
  console.log(`\nAPI endpoints:`);
  console.log(`  GET  /api/products`);
  console.log(`  GET  /api/products/:id`);
  console.log(`  GET  /api/cart/:sessionId`);
  console.log(`  POST /api/cart/:sessionId`);
  console.log(`  POST /api/orders`);
  console.log(`  POST /api/payments/intent`);
  console.log(`  POST /api/payments/confirm\n`);
});

module.exports = app;
