const db = require('../db');

//редагування запису (видалення запису з вказаного поля з вказаної таблиці)
exports.editExhibition_del_rec = function(table, field, id, ids, cb){
  let sql = `UPDATE ${table} SET ${field}='' WHERE ${id} IN (${ids})`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

