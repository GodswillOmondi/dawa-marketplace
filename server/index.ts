import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import promotionsRouter from './routes/promotions.js';
import ordersRouter from './routes/orders.js';
import { addSSEClient } from './sse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend Vite dev server and production deployments
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Express JSON limit set to 25MB to accommodate multi-step 3+ Base64 image payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Server-Sent Events stream endpoint
app.get('/api/events', (req, res) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  addSSEClient(clientId, res);
});

// Mount API routes
app.use('/api/products', productsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/orders', ordersRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Dawa Equips API', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`☕ Dawa Equips API server listening on http://localhost:${PORT}`);
});

export default app;
