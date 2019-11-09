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
// const connection = mysql.createPool({ 

// });

//www db prod
const connection = mysql.createPool({
	connectionLimit: 100,
	host: "localhost",
	user: "galexpo",
	//database: "visitors", //prod
	database: "visitors_dev", //dev
	password: "ufktrcgj",
	charset: "cp1251"
});


exports.get = function() {
	return connection;
};