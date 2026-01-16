const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController.js');
const geneatereport = require('../controllers/generateReport.js');
router.post('/clockin', attendanceController.markAttendance);
router.put('/clockout', attendanceController.clockOut);
router.get('/date', attendanceController.getAttendanceByDate);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/', attendanceController.getAttendance)

router.get('/employee/:employee_id', attendanceController.getAttendanceByEmployee);
router.delete("/:id", attendanceController.deleteAttendance);
router.get('/filter', attendanceController.getAttendanceFiltered);
router.get('/export/excel', geneatereport.exportAttendanceExcel);
router.get('/employee/today/:employeeId', attendanceController.getTodayAttendanceByEmployee);

module.exports = router;
