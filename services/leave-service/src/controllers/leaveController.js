import LeaveRequest from '../models/leave_request.js';
import LeaveBalance from '../models/leave_balance.js';
//import { Op } from 'sequelize';

// Helper to calculate days between dates (inclusive)
const calculateDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// For development/demo phase - dummy employee data
// In real implementation → call employee-service via HTTP/gRPC or use service discovery

/**
 * @route   GET /getAllPending
 * @desc    Get all pending leave requests with employee basic info (HR/Admin view)
 * @access  Private (HR / Admin only)
 */
export const getAllPendingLeaveRequests = async (req, res) => {
  try {
    const pendingRequests = await LeaveRequest.findAll({
      where: {
        status: 'pending'
      },
      order: [['created_at', 'DESC']],
      attributes: [
        'id',
        'employee_id',
        'leave_type',
        'start_date',
        'end_date',
        'days_requested',
        'status',
        'created_at'
      ]
    });

    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(200).json([]);
    }

    // Map with dummy employee info (temporary solution)
    // const formattedRequests = pendingRequests.map(request => {
    //   const employee = dummyEmployeeData[request.employee_id] || {
    //     firstName: 'Unknown',
    //     lastName: 'Employee',
    //     email: 'unknown@company.et',
    //     address: 'N/A'
    //   };

    //   return {
    //     id: request.id,
    //     employeeId: request.employee_id,
    //     firstName: employee.firstName,
    //     lastName: employee.lastName,
    //     email: employee.email,
    //     address: employee.address,
    //     leaveType: request.leave_type,
    //     startDate: request.start_date.toISOString().split('T')[0],
    //     endDate: request.end_date.toISOString().split('T')[0],
    //     daysRequested: request.days_requested,
    //     status: request.status,
    //     createdAt: request.created_at
    //   };
    // });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error in getAllPendingLeaveRequests:', error);
    res.status(500).json({
      message: 'Failed to fetch pending leave requests',
      error: error.message
    });
  }

};

/**
 * @route   GET /api/leave-requests/pending
 * @desc    Get all pending leave requests (for HR/Admin)
 * @access  Private (HR / Admin only)
 */
export const createLeaveRequest = async (req, res) => {
  try {
    const { leave_type, start_date, end_date } = req.body;
    const employee_id = req.user.id; // From authMiddleware

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const days_requested = calculateDays(start_date, end_date);

    // Check if balance exists and is sufficient
    const balance = await LeaveBalance.findOne({
      where: {
        employee_id,
        leave_type,
        year: new Date().getFullYear() // Assuming current year
      }
    });

    if (!balance) {
      return res.status(404).json({ message: `No leave balance found for type ${leave_type}` });
    }

    if (balance.balance_days < days_requested) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    const newRequest = await LeaveRequest.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      days_requested,
      status: 'pending'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const employee_id = req.user.id;
    const requests = await LeaveRequest.findAll({
      where: { employee_id },
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { leave_type, start_date, end_date } = req.body;
    const employee_id = req.user.id;

    const request = await LeaveRequest.findOne({ where: { id, employee_id } });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending' && request.status !== 'rejected') {
      // Allow updating rejected requests to "re-request" them, effectively resetting to pending
      // But the user specifically asked for "re requesting again (for notifying)"
      // If it's approved or cancelled, usually can't be changed easily without a new request or specific flow.
      return res.status(400).json({ message: 'Cannot update a request that is already processed (approved/cancelled)' });
    }

    // Recalculate days if dates change
    let days_requested = request.days_requested;
    if (start_date && end_date) {
      days_requested = calculateDays(start_date, end_date);
    }

    // Update fields
    if (leave_type) request.leave_type = leave_type;
    if (start_date) request.start_date = start_date;
    if (end_date) request.end_date = end_date;
    request.days_requested = days_requested;

    // If it was rejected, set back to pending for re-review
    if (request.status === 'rejected') {
      request.status = 'pending';
    }

    await request.save();
    res.json(request);

  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const employee_id = req.user.id;

    const request = await LeaveRequest.findOne({ where: { id, employee_id } });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'approved') {
      // If approved, we should theoretically credit back the balance, but that logic depends on if the balance was deducted *on approval* or *on creation*. 
      // My plan says deduct on approval. So if we cancel an approved request, we must credit back.
      // BUT, admin features are next. Let's assume for now user can only cancel pending. 
      // If they cancel approved, it might need admin approval in a real large system, but for now lets allow it and refund.

      // However, keep it simple for now as requested: "canceling requested leave". 
      // Usually implies pending requests.
      // If I follow the plan: "Approve -> Deduct".
      // So validation logic in createRequest checked balance but didn't deduct? 
      // Actually, in `createRequest` I checked balance but didn't deduct. Deduct happens on approval.
      // So checking balance is 'tentative'.

      // Wait, if I cancel an approved request, I need to add back the balance.
      // For now, let's restrict cancellation to pending requests to be safe, or handle refund.
      // Let's implement refunding logic later in Admin or just restrict to pending for employee self-service.
      // Often employees can't just cancel approved leave without manager ack.
      // I will restrict to pending for now to avoid complexity unless user specifically requested "cancel approved".
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled. Contact HR for approved leaves.' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
