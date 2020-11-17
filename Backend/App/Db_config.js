require("dotenv").config();
const util = require("util");
const mysql = require("mysql");


let pool = mysql.createPool({
  host:process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
});


pool.getConnection((err, connection) => {
  if (err) console.log(err);
  else console.log("Connected to Database");
  if (connection) connection.release();
  return;
});
pool.query = util.promisify(pool.query);
module.exports = pool;
