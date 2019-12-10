const db = require('../db');

//створення нового запису в messages
exports.createMessage = function(dataMessage, cb){
  let sql = `INSERT INTO messages (subject, message, attachments, body_files, id_user) VALUES (?,?,?,?,?)`;
  db.get().query(sql, dataMessage, function(err, data) {
    cb(err, data)
  })
}

