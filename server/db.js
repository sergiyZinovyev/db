const mysql = require("mysql2");

// const connection = mysql.createConnection({
//   host: "remotemysql.com",
//   user: "VNXPG3o4kL",
//   database: "VNXPG3o4kL",
//   password: "XGHAXoGCJk"
// });

const connection = mysql.createPool({
    connectionLimit: 15,
    host: "remotemysql.com",
    user: "VNXPG3o4kL",
    database: "VNXPG3o4kL",
    password: "XGHAXoGCJk"
  });

// var state = {
// 	db: null
// };

// exports.connect = function(done){
//   if (state.db) {
//     return done();
//   }
//   connection.connect(function(err, db){
//     if (err) {
//       return done("Ошибка: " + err.message);
//     }
//     state.db = db;
//     console.log(db);
//     done();
//     });
// };

exports.get = function() {
	return connection;
};