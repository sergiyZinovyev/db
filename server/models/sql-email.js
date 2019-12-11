const db = require('../db');

//створення нового запису в messages
exports.createMessage = function(dataMessage, cb){
  let sql = `INSERT INTO messages (subject, message, attachments, body_files, id_user) VALUES (?,?,?,?,?)`;
  db.get().query(sql, dataMessage, function(err, data) {
    cb(err, data)
  })
}

//створення нового запису в mailing_list
exports.createMailingList = function(dataMailingList, cb){
  let sql = `INSERT INTO mailing_list (name, user_id, message_id, sender) VALUES (?,?,?,?)`;
  db.get().query(sql, dataMailingList, function(err, data) {
    cb(err, data)
  })
}

//створення n-записів у таблиці visitors_mailing_lists
// dataVisitors - запис у форматі: '(data1, data1, ...), (data2, data2, ...), (data3, data3, ...), ...'
exports.createGroupVisitorsMailingLists = function(dataVisitors, cb){
  let sql = `INSERT INTO visitors_mailing_lists (
      regnum,
      email,
      namepovne,
      mail_list_id
    ) 
    VALUES ${dataVisitors}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}
