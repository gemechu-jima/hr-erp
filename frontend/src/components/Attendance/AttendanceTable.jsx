import React, { useEffect, useState } from "react";
import AttendanceFilter from "./AttendanceFilter";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3004/api",
});

export default function AttendanceTable() {
  const [attendances, setAttendances] = useState([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  const fetchAllAttendance = async () => {
    try {
      const res = await api.get("/attendance");
      setAttendances(res.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

 const fetchAttendanceByDate = async () => {
  if (!date) return;
  try {
    const res = await api.get("/attendance/date", {
      params: { date },
    });
    setAttendances(res.data);
  } catch (err) {
    console.error("Error fetching attendance:", err);
  }
};


  const fetchFilteredAttendance = async ({ startDate, endDate, employeeId }) => {
    try {
      const res = await api.get("/attendance/filter", {
        params: { startDate, endDate, employeeId },
      });
      setAttendances(res.data);
    } catch (err) {
      console.error("Error fetching filtered attendance:", err);
    }
  };

  const handleDelete = async (attendanceId) => {
    try {
      await api.delete(`/attendance/${attendanceId}`);
      setAttendances((prev) =>
        prev.filter((att) => att.id !== attendanceId)
      );
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete attendance.");
    }
  };

  return (
    <div className="overflow-x-auto space-y-4">
      <AttendanceFilter onFilter={fetchFilteredAttendance} />

      <div className="flex items-center space-x-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-md px-3 py-2"
        />
        <button
          onClick={fetchAttendanceByDate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
        <button
          onClick={fetchAllAttendance}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      <table className="min-w-full border shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Employee</th>
            <th className="px-4 py-2">Clock In</th>
            <th className="px-4 py-2">Clock Out</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendances.map((att) => (
            <tr key={att.id} className="border-t">
              <td className="px-4 py-2">{att.employee_id}</td>
              <td className="px-4 py-2">
                {att.clock_in
                  ? new Date(att.clock_in).toLocaleTimeString()
                  : "-"}
              </td>
              <td className="px-4 py-2">
                {att.clock_out
                  ? new Date(att.clock_out).toLocaleTimeString()
                  : "-"}
              </td>
              <td className="px-4 py-2">{att.clock_date}</td>
              <td className="px-4 py-2">
                {!att.clock_out &&
                att.clock_in &&
                (new Date() - new Date(att.clock_in)) /
                  (1000 * 60 * 60) >=
                  8
                  ? "Missed"
                  : att.status}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleDelete(att.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
