const db = require('../db');
const EventEmitter = require('events');

const emitter = new EventEmitter();
exports.emitter = emitter;

//створення нового запису в messages 
exports.createMessage = function(dataMessage, cb){
  let sql = `INSERT INTO messages (subject, message, attachments, body_files, id_user) VALUES (?,?,?,?,?)`;
  db.get().query(sql, dataMessage, function(err, data) {
    emitter.emit('createEditMessage', data.insertId);
    cb(err, data)
  })
}

//редагування 'subject', 'message', 'id_user' у таблиці 'messages'
exports.editMessages = function(dataUpdate, cb){
  let sql = `UPDATE messages SET 
  subject=?, 
  message=?,  
  id_user=?
    WHERE id=?`;
  db.get().query(sql, dataUpdate, function(err, data) {
    emitter.emit('createEditMessage', dataUpdate[3]);
    cb(err, data)
  })
}

//редагування 'attachments', 'body_files' у таблиці 'messages'
exports.editMessagesAttachAndBodyFiles = function(dataUpdate, cb){
  let sql = `UPDATE messages SET 
  attachments=?, 
  body_files=? 
    WHERE id=?`;
  db.get().query(sql, dataUpdate, function(err, data) {
    emitter.emit('createEditMessage', dataUpdate[2]);
    cb(err, data)
  })
}

//отримання attachments та body_files з messages
exports.getDataMessage = function(id, cb){
  let sql = `SELECT attachments, body_files FROM messages WHERE id=${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання обраного листа з messages
exports.getFullMessage = function(id, cb){
  let sql = `SELECT * FROM messages WHERE id=${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримати всі записи з messages
exports.getAllMessages = function(cb){
  let sql = `SELECT Messages.id AS id, subject, id_user, Users.realname AS realname, date FROM 
      (SELECT id, subject, id_user, date FROM messages) AS Messages
    LEFT OUTER JOIN
      (SELECT id, realname FROM usersaccount) AS Users
    ON Messages.id_user = Users.id
  ORDER BY date DESC`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримати запис по id з messages
exports.getMessage = function(id, cb){
  let sql = `SELECT Messages.id AS id, subject, id_user, Users.realname AS realname, date FROM 
      (SELECT id, subject, id_user, date FROM messages) AS Messages
    LEFT OUTER JOIN
      (SELECT id, realname FROM usersaccount) AS Users
    ON Messages.id_user = Users.id
  WHERE Messages.id = ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}
//--------------------------------------------------------------------------------------------------------

//перевірка чи була розсилка по заданому messagesID
exports.isMailing = function(id, cb){
  let sql = `SELECT id FROM mailing_list WHERE message_id=${id} AND date_start IS NOT NULL`;
  db.get().query(sql, function(err, data) {
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

//редагування запису в mailing_list
exports.editMailingList = function(dataMailingList, fieldName, cb){
  let sql = `UPDATE mailing_list SET ${fieldName}=? WHERE id=?`;
  db.get().query(sql, dataMailingList, function(err, data) {
    cb(err, data)
  })
}

//отримати всі записи з mailing_list
exports.getMailingList = function(cb){
  let sql = `SELECT Mailing.id AS id, name, user_id, Users.realname AS realname, date_end FROM 
      (SELECT id, name, user_id, date_end FROM mailing_list) AS Mailing
    LEFT OUTER JOIN
      (SELECT id, realname FROM usersaccount) AS Users
    ON Mailing.user_id = Users.id
  ORDER BY date_end DESC`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримати запис по id з mailing_list
exports.getMailingPlus = function(id, cb){
  let sql = `SELECT Mailing.id AS id, name, user_id, Users.realname AS realname, date_end FROM 
      (SELECT id, name, user_id, date_end FROM mailing_list) AS Mailing
    LEFT OUTER JOIN
      (SELECT id, realname FROM usersaccount) AS Users
    ON Mailing.user_id = Users.id
    WHERE Mailing.id = ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання вказаної розсилки з mailing_list
exports.getMailing = function(id, cb){
  let sql = `SELECT * FROM mailing_list WHERE id = ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//--------------------------------------------------------------------------------------------------------

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

//редагування запису у visitors_mailing_lists
exports.editVisitorsMailingLists = function(dataUpdate, cb){
  let sql = `UPDATE visitors_mailing_lists SET 
  is_send=?, 
  date=? 
    WHERE id=?`;
  db.get().query(sql, dataUpdate, function(err, data) {
    emitter.emit('editVisitorsMailingLists', dataUpdate[2]);
    cb(err, data)
  })
}


//отримання даних для розсилки по вказаному id розсилки
exports.getDataMailing = function(id, cb){
  let sql = `SELECT id, is_send, email AS 'to', namepovne, sender AS 'from', subject, attachments AS path, body_files, message FROM
  (SELECT id, is_send, mail_list_id as ml_id, email, namepovne FROM visitors_mailing_lists) AS list
  LEFT OUTER JOIN
  (SELECT mail_list_id, sender, subject, attachments, body_files, message FROM
  ((SELECT id as mail_list_id, message_id as m_id, sender FROM mailing_list) AS mailing_list
  LEFT OUTER JOIN 
      (SELECT id as message_id, subject, attachments, body_files, message FROM messages) AS messages 
      ON mailing_list.m_id = messages.message_id)) AS email
  ON list.ml_id = email.mail_list_id
  WHERE (id=${id})`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання масиву всіх даних для розсилки (повертає масив id розсилок)  
exports.getDataMailingAll = function(id, cb){
  let sql = `SELECT id FROM
  (SELECT id, is_send, mail_list_id as ml_id, email, namepovne FROM visitors_mailing_lists) AS list
  LEFT OUTER JOIN
  (SELECT mail_list_id, sender, subject, attachments, body_files, message FROM
  ((SELECT id as mail_list_id, message_id as m_id, sender FROM mailing_list) AS mailing_list
  LEFT OUTER JOIN 
      (SELECT id as message_id, subject, attachments, body_files, message FROM messages) AS messages 
      ON mailing_list.m_id = messages.message_id)) AS email
  ON list.ml_id = email.mail_list_id
  WHERE (mail_list_id=${id})`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання даних зі списку розсилкок по mail_list_id
exports.getVisitorsMailingList = function(id, cb){
  let sql = `SELECT * FROM visitors_mailing_lists WHERE mail_list_id = ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання даних зі списку розсилкок по id
exports.getEmailData = function(id, cb){
  let sql = `SELECT * FROM visitors_mailing_lists WHERE id = ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}



