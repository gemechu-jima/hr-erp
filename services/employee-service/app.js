// app.js
import express from 'express';
import employeeRoutes from './src/routes/employee.routes.js'; // <-- adjust path

const app = express();
app.use(express.json());

// Mount employee routes
app.use('/employees', employeeRoutes);

export default app;
