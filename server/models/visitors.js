const db = require('../db');

exports.all = function(id, cb){
    let sql = `SELECT regnum, email, prizv, city, cellphone FROM ${id}`;
    db.get().query(sql, function(err, data) {
        cb(err, data)
      })
}