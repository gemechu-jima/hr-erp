
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mu@0!1Iy",
  database: "attendance_db",
  waitForConnections: true,
  connectionLimit: 10,
});

async function seedUsers() {
  console.log("Seeding users...");

  const users = [
    { name: "Alice", email: "alice@example.com", password: "password1" },
    { name: "Bob", email: "bob@example.com", password: "password2" },
    { name: "Charlie", email: "charlie@example.com", password: "password3" },
  ];

  for (let user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await db.query(
      `INSERT INTO emp_employees (name, email, password)
       VALUES (?, ?, ?)`,
      [user.name, user.email, hashedPassword]
    );
  }

  console.log("Users seeded successfully!");
}

async function seedAttendance() {
  console.log("Seeding attendance...");
  const attendanceRecords = [
    {
      employee_id: 1,
      clock_date: "2026-01-14",
      clock_in: "2026-01-14 08:05:00",
      clock_out: "2026-01-14 16:30:00",
      shift_start: "08:00:00",
      shift_end: "16:00:00",
      status: "present",
    },
    {
      employee_id: 2,
      clock_date: "2026-01-14",
      clock_in: "2026-01-14 09:10:00",
      clock_out: "2026-01-14 17:15:00",
      shift_start: "08:00:00",
      shift_end: "16:00:00",
      status: "late",
    },
    {
      employee_id: 3,
      clock_date: "2026-01-14",
      clock_in: "2026-01-14 08:00:00",
      clock_out: null,
      shift_start: "08:00:00",
      shift_end: "16:00:00",
      status: "present",
    },
  ];

  for (let record of attendanceRecords) {
    await db.query(
      `INSERT INTO att_records 
      (employee_id, clock_date, clock_in, clock_out, shift_start, shift_end, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        record.employee_id,
        record.clock_date,
        record.clock_in,
        record.clock_out,
        record.shift_start,
        record.shift_end,
        record.status,
      ]
    );
  }

  console.log("Attendance seeded successfully!");
}

async function main() {
  try {
    await seedUsers();
    await seedAttendance();
    console.log("All seeds completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

main();
