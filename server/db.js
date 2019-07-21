const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "VNXPG3o4kL",
  database: "VNXPG3o4kL",
  password: "XGHAXoGCJk"
});

exports.connect = function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      
   
    }
  };