import React from "react";
import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3004/api",
});


export default function GeneratereReport({ date }) {
    const downloadExcel = async () => {
  try {
    const res = await api.get("/attendance/export/excel", {
      params: { date },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance_report.xlsx";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Excel download failed", error);
  }
};
  return (
    <div>
      <button
        onClick={downloadExcel}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Download Excel
      </button>
    </div>
  );
}
