import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const api = axios.create({
  baseURL: "http://localhost:3004/api",
});

export default function AttendanceCalendar({ employeeId }) {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
        const res = await api.get("/attendance/filter", {
          params: { startDate: start, endDate: end, employeeId },
        });
        setAttendance(res.data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchAttendance();
  }, [currentMonth, employeeId]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getStatus = (date) => {
    const record = attendance.find(
      (att) => att.clock_date === format(date, "yyyy-MM-dd")
    );
    if (!record) return "absent";
    if (!record.clock_out) return "ongoing";
    return record.status; 
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-400";
      case "late":
        return "bg-yellow-400";
      case "missed":
        return "bg-red-400";
      case "ongoing":
        return "bg-blue-400";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4"> Calendar</h2>

      <div className="flex justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <span className="font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-semibold">{day}</div>
        ))}

        {daysInMonth.map((day) => {
          const status = getStatus(day);
          return (
            <div
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`p-3 rounded cursor-pointer ${getStatusColor(status)} hover:opacity-80`}
            >
              <span>{format(day, "d")}</span>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">
            {format(selectedDate, "yyyy-MM-dd")} Attendance
          </h3>
          {attendance.find((att) => att.clock_date === format(selectedDate, "yyyy-MM-dd")) ? (
            <>
              <p>
                Clock In:{" "}
                {attendance.find(
                  (att) => att.clock_date === format(selectedDate, "yyyy-MM-dd")
                ).clock_in || "-"}
              </p>
              <p>
                Clock Out:{" "}
                {attendance.find(
                  (att) => att.clock_date === format(selectedDate, "yyyy-MM-dd")
                ).clock_out || "-"}
              </p>
              <p>
                Status:{" "}
                {attendance.find(
                  (att) => att.clock_date === format(selectedDate, "yyyy-MM-dd")
                ).status}
              </p>
            </>
          ) : (
            <p>No attendance record</p>
          )}
        </div>
      )}
    </div>
  );
}
