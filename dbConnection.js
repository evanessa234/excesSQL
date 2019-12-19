/* eslint-disable no-useless-catch */
const mysql = require('promise-mysql');

const config = require('./config');

const dbConfig = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  port: config.database.port,
  database: config.database.db,
  connectionLimit: 10,
};

module.exports = async () => {
  try {
    let pool;
    let con;
    if (pool) con = pool.getConnection();
    else {
      pool = await mysql.createPool(dbConfig);
      con = pool.getConnection();
    }
    return con;
  } catch (ex) {
    throw ex;
  }
};
