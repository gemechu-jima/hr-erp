import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { leaveAPI } from '../../services/api';

// Common leave types (you can fetch these from backend later if needed)
const leaveTypes = [
  { value: 'Annual Leave', label: 'Annual Leave' },
  { value: 'Sick Leave', label: 'Sick Leave' },
  { value: 'Maternity Leave', label: 'Maternity Leave' },
  { value: 'Paternity Leave', label: 'Paternity Leave' },
  { value: 'Unpaid Leave', label: 'Unpaid Leave' },
  { value: 'Compassionate Leave', label: 'Compassionate Leave' },
];

function LeaveRequestForm() {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchMyRequests = async () => {
    try {
      setFetchingRequests(true);
      const response = await leaveAPI.getMyLeaves();
      setMyRequests(response.data);
    } catch (err) {
      console.error('Error fetching my requests:', err);
    } finally {
      setFetchingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Basic validation
    if (!formData.leaveType || !formData.startDate || !formData.endDate) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (dayjs(formData.startDate).isAfter(dayjs(formData.endDate))) {
      setError('End date must be after start date.');
      setLoading(false);
      return;
    }

    // Real API call to leave-service
    try {
      const payload = {
        leave_type: formData.leaveType,
        start_date: formData.startDate.format('YYYY-MM-DD'),
        end_date: formData.endDate.format('YYYY-MM-DD'),
      };

      await leaveAPI.createLeave(payload);

      setSuccess(true);
      setFormData({
        leaveType: '',
        startDate: null,
        endDate: null,
      });
      // Refresh the requests list
      fetchMyRequests();
    } catch (err) {
      console.error('Leave submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit request. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Submit Leave Request
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Leave request submitted successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            select
            fullWidth
            label="Leave Type"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
            margin="normal"
            variant="outlined"
          >
            {leaveTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => handleDateChange('startDate', newValue)}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    margin: 'normal',
                  },
                }}
              />

              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => handleDateChange('endDate', newValue)}
                minDate={formData.startDate || dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    margin: 'normal',
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 4, py: 1.5 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </Box>
      </Paper>

      {/* My Leave Requests Table */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          My Leave Requests
        </Typography>

        {fetchingRequests ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : myRequests.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No leave requests found. Submit your first request above!
          </Alert>
        ) : (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.leave_type}</TableCell>
                    <TableCell>
                      {new Date(request.start_date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      {new Date(request.end_date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell align="center">{request.days_requested}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={request.status.toUpperCase()}
                        color={
                          request.status === 'approved'
                            ? 'success'
                            : request.status === 'pending'
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default LeaveRequestForm;
