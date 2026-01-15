import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { leaveAPI } from '../../services/api';



function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await leaveAPI.getLeaves();

        // The backend now returns raw LeaveRequest objects
        // We need to format dates and add placeholder employee data
        const formatted = response.data.map(request => ({
          id: request.id,
          employeeId: request.employee_id,
          // Placeholder employee info (temporary until employee-service integration)
          firstName: 'Employee',
          lastName: `#${request.employee_id}`,
          email: `emp${request.employee_id}@company.et`,
          address: 'N/A',
          leaveType: request.leave_type,
          startDate: new Date(request.start_date).toLocaleDateString('en-GB'),
          endDate: new Date(request.end_date).toLocaleDateString('en-GB'),
          daysRequested: request.days_requested,
          status: request.status,
          createdAt: new Date(request.created_at).toLocaleString(),
        }));

        setLeaveRequests(formatted);
      } catch (err) {
        console.error(err);
        setError('Failed to load pending leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  // Placeholder action – will be replaced with real API call later
  const handleAction = (id, action) => {
    // TODO: Real API call → PATCH/PUT /leave-requests/:id/status
    alert(`Would ${action} request #${id} (simulation)`);

    // Optimistic update example
    setLeaveRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: action } : req
      )
    );
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pending Leave Requests
      </Typography>

      <TableContainer component={Paper} elevation={2} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label="pending leave requests table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell>Employee</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell align="center">Start Date</TableCell>
              <TableCell align="center">End Date</TableCell>
              <TableCell align="center">Days</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No pending leave requests at the moment
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <strong>
                      {request.firstName} {request.lastName}
                    </strong>
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.address}</TableCell>
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell align="center">{request.startDate}</TableCell>
                  <TableCell align="center">{request.endDate}</TableCell>
                  <TableCell align="center">
                    <Box component="span" fontWeight="medium">
                      {request.daysRequested}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleAction(request.id, 'approved')}
                      sx={{ mr: 1, minWidth: 92 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleAction(request.id, 'declined')}
                      sx={{ minWidth: 92 }}
                    >
                      Decline
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default LeaveRequestsPage;
