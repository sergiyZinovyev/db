const mysql = require("mysql2");
const Secure = require("../server/config");


// my db
// const connection = mysql.createPool({
//     connectionLimit: 100,
//     host: "remotemysql.com",
//     user: "bMDyIZAQkP",
//     database: "bMDyIZAQkP",
//     password: "OALl3svGQf"
//   });

//dev db
// const connection = mysql.createPool({ 

// });

//www db prod
const connection = mysql.createPool({
	connectionLimit: 100,
	host: "localhost",
	user: Secure.Config.dbConfig.user,
	password: Secure.Config.dbConfig.pass,
	database: Secure.Config.dbConfig.database,
	charset: "cp1251"
});


exports.get = function() {
	return connection;
};