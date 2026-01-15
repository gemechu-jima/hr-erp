// src/routes/employee.routes.js
import express from 'express';
import { getEmployees, createEmployee } from '../controllers/employee.controller.js';

const router = express.Router();

// GET /api/employees → fetch all employees
router.get('/', getEmployees);

// POST /api/employees → create a new employee
router.post('/', createEmployee);

export default router;
