const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');



async function ensureDatabase() {
  const connection = await mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: 'Mu@0!1Iy' 
  });
  await connection.query('CREATE DATABASE IF NOT EXISTS attendance_db;');
  await connection.end();
}

const sequelize = new Sequelize('attendance_db', 'root', 'Mu@0!1Iy', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, 
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;