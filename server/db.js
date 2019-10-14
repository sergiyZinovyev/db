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
// 	
// });

//www db prod
const connection = mysql.createPool({

});


exports.get = function() {
	return connection;
};