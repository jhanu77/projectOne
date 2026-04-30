# LaptopHub — Full-Stack Ecommerce

A complete laptop ecommerce website with Node.js/Express backend and a polished dark-theme frontend.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Open the site
Visit **http://localhost:3001** in your browser.

That's it! The backend serves the frontend automatically.

---

## 📁 Project Structure

```
laptophub/
├── backend/
│   ├── server.js        ← Express API + static file server
│   └── package.json
└── frontend/
    └── public/
        └── index.html   ← Full frontend (HTML/CSS/JS)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports `?category=`, `?search=`, `?sort=`, `?minPrice=`, `?maxPrice=`) |
| GET | `/api/products/:id` | Single product + related products |
| GET | `/api/cart/:sessionId` | Get cart with totals |
| POST | `/api/cart/:sessionId` | Add item `{ productId, qty }` |
| PUT | `/api/cart/:sessionId/:productId` | Update qty `{ qty }` |
| DELETE | `/api/cart/:sessionId/:productId` | Remove item |
| DELETE | `/api/cart/:sessionId` | Clear cart |
| POST | `/api/payments/intent` | Create payment intent `{ sessionId, method }` |
| POST | `/api/payments/confirm` | Confirm payment `{ intentId, method }` |
| POST | `/api/orders` | Create order `{ sessionId, customer, payment }` |
| GET | `/api/orders/:orderId` | Get order details |
| GET | `/api/meta` | Categories, brands, price range |

---

## 💳 Real Payment Integration

### Stripe (Credit/Debit Card + Google Pay)

1. Install Stripe SDK:
   ```bash
   npm install stripe
   ```

2. Replace the `/api/payments/intent` endpoint in `server.js`:
   ```javascript
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   
   app.post('/api/payments/intent', async (req, res) => {
     const { sessionId, method } = req.body;
     const cart = cartWithDetails(sessionId);
     
     const paymentIntent = await stripe.paymentIntents.create({
       amount: cart.total * 100,  // Stripe uses cents
       currency: 'usd',
       payment_method_types: method === 'gpay' ? ['card'] : ['card'],
     });
     
     res.json({
       success: true,
       clientSecret: paymentIntent.client_secret,
       intentId: paymentIntent.id
     });
   });
   ```

3. Add Stripe.js to `index.html` and use `stripe.confirmCardPayment(clientSecret, ...)`.

4. Set your secret key:
   ```bash
   STRIPE_SECRET_KEY=sk_test_... node server.js
   ```

### PayPal

1. Install PayPal SDK:
   ```bash
   npm install @paypal/checkout-server-sdk
   ```

2. Create a PayPal order in `/api/payments/intent` when `method === 'paypal'`.

3. Load the PayPal JS SDK in `index.html`:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
   ```

---

## 🗄️ Adding a Real Database

The current server uses in-memory storage (data resets on restart). To persist data:

### MongoDB (recommended)
```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const OrderSchema = new mongoose.Schema({ ... });
const Order = mongoose.model('Order', OrderSchema);
```

### PostgreSQL
```bash
npm install pg
```

---

## 🌐 Deployment

### Environment Variables
```
PORT=3001
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
MONGODB_URI=mongodb+srv://...
```

### Deploy to Railway / Render / Heroku
1. Push to GitHub
2. Connect repo to Railway/Render
3. Set environment variables
4. Deploy — done!

---

## ✨ Features

- **12 laptops** across Gaming, Business, Ultrabook, and Creator categories
- **Full product catalog** with specs, ratings, stock, and descriptions
- **Session-based cart** with quantity management
- **3-step checkout** with form validation
- **Payment support** for Card, Google Pay, and PayPal (mock — ready for real integration)
- **Order confirmation** with order ID and delivery estimate
- **Search, filter, sort** — live filtering by category, price range, and keyword
- **Responsive design** — works on mobile and desktop
- **REST API** — clean, documented, easy to extend
