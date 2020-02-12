/* eslint-disable no-useless-catch */
const mysql = require('promise-mysql');

module.exports = {
  conncn: async (database) => {
    const dbConfig = {
      host: database.host,
      user: database.user,
      password: database.password,
      port: database.port,
      database: database.db,
      connectionLimit: 10,
    };
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
  },
};
