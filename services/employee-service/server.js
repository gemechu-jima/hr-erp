// api-gateway/server.js
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 5000; // API Gateway runs on 5000

app.use(cors());
app.use(express.json());

// ====================
// Proxy rules
// ====================

// Employee Service
app.use(
  '/employees',
  createProxyMiddleware({
    target: 'http://localhost:5002', // Employee service
    changeOrigin: true,
    pathRewrite: { '^/employees': '/api/employees' }, // maps /employees → /api/employees
  })
);

// Auth Service (example)
app.use(
  '/auth',
  createProxyMiddleware({
    target: 'http://localhost:5001', // Auth service port
    changeOrigin: true,
    pathRewrite: { '^/auth': '/api/auth' },
  })
);

// Root test
app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
