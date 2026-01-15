const ExcelJS = require("exceljs");
const Attendance = require('../models/attendanceModel.js');

const exportAttendanceExcel = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    const where = {};
    if (date) where.clock_date = date;
    if (startDate && endDate) {
      where.clock_date = { 
        [require("sequelize").Op.between]: [startDate, endDate] 
      };
    }

    const records = await Attendance.findAll({
      where,
      order: [["clock_date", "ASC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Date", key: "clock_date", width: 15 },
      { header: "Clock In", key: "clock_in", width: 20 },
      { header: "Clock Out", key: "clock_out", width: 20 },
      { header: "Status", key: "status", width: 15 },
    ];

    records.forEach((att) => {
      worksheet.addRow({
        id: att.id,
        employee_id: att.employee_id,
        clock_date: att.clock_date,
        clock_in: att.clock_in,
        clock_out: att.clock_out,
        status: att.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export report" });
  }
};

module.exports = { exportAttendanceExcel };
