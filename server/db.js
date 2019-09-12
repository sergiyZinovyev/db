const mysql = require("mysql2");

// my db
// const connection = mysql.createPool({
//     connectionLimit: 100,
//     host: "remotemysql.com",
//     user: "bMDyIZAQkP",
//     database: "bMDyIZAQkP",
//     password: "OALl3svGQf"
//   });

//dev db
const connection = mysql.createPool({
	connectionLimit: 100,
  host: "192.168.5.105",
  user: "galexpo",
  database: "visitorsdev",
  password: "ufktrcgj",
  charset: "cp1251"

});


exports.get = function() {
	return connection;
};