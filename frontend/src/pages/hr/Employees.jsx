// Employees.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formEmployee, setFormEmployee] = useState({
    user_id: '',
    employee_code: '',
    hire_date: '',
    department_id: '',
    position_id: '',
    manager_id: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/employees');
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch positions from backend
  const fetchPositions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/positions');
      // Assuming backend returns [{ id, position_name }, ...]
      setPositions(res.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  // Pagination & search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleOpenDialog = (employee = null) => {
    setEditingEmployee(employee);
    setFormEmployee(
      employee || {
        user_id: '',
        employee_code: '',
        hire_date: '',
        department_id: '',
        position_id: '',
        manager_id: '',
      }
    );
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormEmployee({
      user_id: '',
      employee_code: '',
      hire_date: '',
      department_id: '',
      position_id: '',
      manager_id: '',
    });
  };
  const handleInputChange = (e) => {
    setFormEmployee({ ...formEmployee, [e.target.name]: e.target.value });
  };

  // Add or update employee
  const handleSaveEmployee = async () => {
    try {
      if (
        !formEmployee.employee_code ||
        !formEmployee.hire_date ||
        !formEmployee.department_id ||
        !formEmployee.position_id
      ) {
        alert('Employee code, hire date, department, and position are required!');
        return;
      }

      if (editingEmployee) {
        const res = await axios.put(
          `http://localhost:5000/employees/${editingEmployee.id}`,
          formEmployee
        );
        setEmployees(
          employees.map((emp) => (emp.id === editingEmployee.id ? res.data : emp))
        );
      } else {
        const res = await axios.post('http://localhost:5000/employees', formEmployee);
        setEmployees([...employees, res.data]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) =>
    emp.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Employees
      </Typography>

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search employees"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
        />
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Employee
        </Button>
      </Box>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Employee Code"
            name="employee_code"
            fullWidth
            value={formEmployee.employee_code}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Hire Date"
            type="date"
            name="hire_date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formEmployee.hire_date}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Department"
            name="department_id"
            select
            fullWidth
            value={formEmployee.department_id}
            onChange={handleInputChange}
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Position"
            name="position_id"
            select
            fullWidth
            value={formEmployee.position_id}
            onChange={handleInputChange}
          >
            {positions.map((pos) => (
              <MenuItem key={pos.id} value={pos.id}>
                {pos.position_name} {/* changed from pos.name to pos.position_name */}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Manager"
            name="manager_id"
            select
            fullWidth
            value={formEmployee.manager_id || ''}
            onChange={handleInputChange}
          >
            <MenuItem value="">None</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.employee_code} - {emp.user_id}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEmployee}>
            {editingEmployee ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employees Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee Code</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.id}</TableCell>
                    <TableCell>{emp.employee_code}</TableCell>
                    <TableCell>{emp.hire_date}</TableCell>
                    <TableCell>{emp.department_id}</TableCell>
                    <TableCell>
                      {positions.find((p) => p.id === emp.position_id)?.position_name || ''}
                    </TableCell>
                    <TableCell>{emp.manager_id}</TableCell>
                    <TableCell>{emp.created_at}</TableCell>
                    <TableCell>{emp.updated_at}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenDialog(emp)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteEmployee(emp.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
