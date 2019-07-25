const db = require('../db');

//визначення наступного унікального id(regnum) для нового запису
exports.nextRegnum = function(result){
  for(let i=0; i < result.length; i++){
    if(result[0].regnum < result[i].regnum){
      result[0].regnum = result[i].regnum;
    }
  }
  return result[0].regnum+1
}

//отримання всіх записів з обраної таблиці
exports.all = function(id, cb){
  let sql = `SELECT regnum, email, prizv, city, cellphone FROM ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання всіх id(regnum) з таблиць visitors та zajavku
exports.regnVisAndReq = function(cb){
  let sql = `(SELECT regnum FROM visitors) UNION (SELECT regnum FROM zajavku)`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//створення нового запису в таблиці zajavku
exports.create = function(dataVisitor, cb){
  let sql = `INSERT INTO zajavku (regnum, email, prizv, city, cellphone) VALUES (?,?,?,?,?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//створення нового запису в таблиці visitors
exports.createVis = function(dataVisitor, cb){
  let sql = `INSERT INTO visitors (regnum, email, prizv, city, cellphone) VALUES (?,?,?,?,?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//редагування запису
exports.edit = function(dataVisitor, cb){
  let sql = `UPDATE visitors SET email=?, prizv=?, city=?, cellphone=? WHERE regnum=?`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//отримання запису по електронній адресі з двох таблиць
exports.getEmail = function(dataVisitor, cb){
  let sql = `(SELECT regnum, email, prizv, city, cellphone FROM visitors WHERE email=?) UNION (SELECT regnum, email, prizv, city, cellphone FROM zajavku WHERE email=?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//редагування запису
exports.delete = function(table, id, cb){
  let sql = `DELETE FROM ${table} WHERE regnum=${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

