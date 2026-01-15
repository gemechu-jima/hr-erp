import React, { useState } from "react";
import AttendanceTable from "../../components/Attendance/AttendanceTable";
import AttendanceForm from "../../components/Attendance/AttendanceForm";
import AttendanceCalendar from "../../components/Attendance/AttendanceCalander";

const Attendance = () => {
    const [date, setDate] = useState("");
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      <div className="w- full grid grid-cols-1 md:grid-cols-2 gap-6">
        <AttendanceForm profile={{ id: 104, name: "Abe" }} />
        <AttendanceCalendar employeeId={104} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <AttendanceTable date={date} setDate={setDate} />
      </div>
    </div>
  );
};

export default Attendance;