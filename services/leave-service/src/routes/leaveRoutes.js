import { getAllPendingLeaveRequests, createLeaveRequest, getMyRequests } from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import express from 'express';

const router = express.Router();
router.use(authMiddleware);

router.post('/', createLeaveRequest);
router.get('/my', getMyRequests);
router.get('/', getAllPendingLeaveRequests); // Mapping root GET to pending for now to match current usage
router.get('/getAllPending', getAllPendingLeaveRequests);

// router.post('/', createLeaveRequest);
// router.get('/', getMyRequests);
// router.put('/:id', updateLeaveRequest);
// router.put('/:id/cancel', cancelLeaveRequest);
// router.put("/getAllPending", getAllPendingLeaveRequests)
// router.put("/", (req, res)=>{ return "Hello There!"; })
export default router;
