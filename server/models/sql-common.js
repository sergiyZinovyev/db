const db = require('../db');
const EventEmitter = require('events');

const emitter = new EventEmitter();
exports.emitter = emitter;

//Видалення запису з вказаного поля з вказаної таблиці 
exports.editExhibition_del_rec = function(table, field, id, ids, cb){
  let sql = `UPDATE ${table} SET ${field}='' WHERE ${id} IN (${ids})`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//редагування запису вказаного поля з вказаної таблиці  
exports.edit = function(table, field, field_val, id, id_val){
  return new Promise((resolve, reject) => {
    let sql = `UPDATE ${table} SET ${field}=${field_val} WHERE ${id}=${id_val}`;
    db.get().query(sql, function(err, data) {
      if(err) reject(err);
      emitter.emit('edit', {'table': table, 'id': id_val});
      resolve(data)
    })
  }) 
}

