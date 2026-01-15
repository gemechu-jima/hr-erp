import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { organizationAPI } from '../../services/api';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        departmentName: '',
        description: '',
        parentDepartmentId: '',
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await organizationAPI.getDepartments();
            // Assuming the backend returns an array directly or inside a data property
            setDepartments(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch departments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setIsEdit(true);
            setSelectedId(dept.id);
            setFormData({
                departmentName: dept.departmentName,
                description: dept.description || '',
                parentDepartmentId: dept.parentDepartmentId || '',
            });
        } else {
            setIsEdit(false);
            setFormData({ departmentName: '', description: '', parentDepartmentId: '' });
        }
        setOpenModal(true);
        setError('');
        setSuccess('');
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setIsEdit(false);
        setSelectedId(null);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const payload = {
                ...formData,
                parentDepartmentId: formData.parentDepartmentId || null
            };

            if (isEdit) {
                await organizationAPI.updateDepartment(selectedId, payload);
                setSuccess('Department updated successfully!');
            } else {
                await organizationAPI.createDepartment(payload);
                setSuccess('Department created successfully!');
            }

            setTimeout(() => {
                handleCloseModal();
                fetchDepartments();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await organizationAPI.deleteDepartment(id);
                fetchDepartments();
            } catch (err) {
                setError('Failed to delete department');
            }
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Department Management</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Configure company organizational structure</p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(to right, #10b981, #3b82f6)',
                        '@media (min-width: 640px)': { width: 'auto' },
                    }}
                >
                    Add Department
                </Button>
            </div>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Department Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Parent Dept</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : departments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <p className="text-gray-500">No departments found.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departments
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((dept) => (
                                        <TableRow key={dept.id} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{dept.departmentName}</TableCell>
                                            <TableCell>{dept.description || '-'}</TableCell>
                                            <TableCell>
                                                {departments.find(d => d.id === dept.parentDepartmentId)?.departmentName || 'None'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenModal(dept)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(dept.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={departments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <span className="text-2xl font-bold">{isEdit ? 'Edit Department' : 'Create New Department'}</span>
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Department Name"
                                name="departmentName"
                                value={formData.departmentName}
                                onChange={handleInputChange}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleInputChange}
                            />

                            <TextField
                                fullWidth
                                select
                                label="Parent Department"
                                name="parentDepartmentId"
                                value={formData.parentDepartmentId}
                                onChange={handleInputChange}
                                helperText="Optional: Select if this is a sub-department"
                            >
                                <MenuItem value=""><em>None (Root Level)</em></MenuItem>
                                {departments
                                    .filter(d => d.id !== selectedId) // Prevent self-parenting
                                    .map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.departmentName}
                                        </MenuItem>
                                    ))}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ background: 'linear-gradient(to right, #10b981, #3b82f6)' }}
                        >
                            {isEdit ? 'Update Department' : 'Create Department'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default DepartmentManagement;