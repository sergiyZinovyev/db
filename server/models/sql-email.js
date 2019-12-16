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

//отримання даних для розсилки
exports.getDataMailing = function(id, cb){
  let sql = `SELECT id, email AS 'to', namepovne, sender AS 'from', subject, attachments AS path, body_files, message FROM
  (SELECT id, is_send, mail_list_id as ml_id, email, namepovne FROM visitors_mailing_lists) AS list
  LEFT OUTER JOIN
  (SELECT mail_list_id, sender, subject, attachments, body_files, message FROM
  ((SELECT id as mail_list_id, message_id as m_id, sender FROM mailing_list) AS mailing_list
  LEFT OUTER JOIN 
      (SELECT id as message_id, subject, attachments, body_files, message FROM messages) AS messages 
      ON mailing_list.m_id = messages.message_id)) AS email
  ON list.ml_id = email.mail_list_id
  WHERE (mail_list_id=${id} AND is_send = 'pending')
  limit 1`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}
