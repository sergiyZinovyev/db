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

//визначення current date
exports.curentDate = function(d){
  if(d){
    var now = new Date(d);
    var curr_date = ('0' + now.getDate()).slice(-2)
    var curr_month = ('0' + (now.getMonth() + 1)).slice(-2);
    var curr_year = now.getFullYear();
    var curr_hour = now.getHours();
    var curr_minute = now.getMinutes();
    var curr_second = now.getSeconds();
    var formated_date = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minute + ":" + curr_second;
  }
  else {return new Date()};
  return formated_date;
  //return new Date()
}

//отримання всіх записів з обраної таблиці
exports.all = function(id, cb){
  let sql = `SELECT * FROM ${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання всіх id(regnum) з таблиць visitors та visitors_create
exports.regnVisAndReq = function(cb){
  let sql = `(SELECT regnum FROM visitors) UNION (SELECT regnum FROM visitors_create)`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}


//створення нового запису в таблиці visitors_create
exports.create = function(dataVisitor, table, cb){
  let sql = `INSERT INTO ${table} (
      regnum, 
      email, 
      prizv, 
      city, 
      cellphone, 
      potvid, 
      name, 
      countryid, 
      regionid, 
      m_robotu, 
      pobatkovi, 
      posada, 
      sferadij, 
      datawnesenny, 
      ins_user, 
      namepovne,
      postindeks,
      address,
      postaddreses,
      telephon,
      gender,
      type,
      kompeten,
      datelastcor,
      rating
    ) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//створення нового запису в таблиці visitors
exports.createVis = function(dataVisitor, cb){
  let sql = `INSERT INTO visitors (regnum, email, prizv, city, cellphone, potvid) VALUES (?,?,?,?,?,?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//редагування запису !!!недороблене!!!
exports.edit = function(dataVisitor, cb){
  let sql = `UPDATE visitors SET email=?, prizv=?, city=?, cellphone=? WHERE regnum=?`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//редагування запису у вказаній таблиці
exports.editPro = function(dataVisitor, table, cb){
  let sql = `UPDATE ${table} SET 
  email=?, 
  prizv=?, 
  city=?, 
  cellphone=?, 
  potvid=?, 
  name=?, 
  countryid=?, 
  regionid=?, 
  m_robotu=?, 
  pobatkovi=?, 
  posada=?, 
  sferadij=?, 
  datawnesenny=?, 
  ins_user=?, 
  namepovne=?,
  postindeks=?,
  address=?,
  postaddreses=?,
  telephon=?,
  gender=?,
  type=?,
  kompeten=?,
  datelastcor=?,
  rating=? 
    WHERE regnum=?`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//отримання запису по вказаній умові з двох таблиць
exports.getEmail = function(dataVisitor, fild, cb){
  let sql = `(SELECT * FROM visitors WHERE ${fild} LIKE ?) UNION (SELECT * FROM visitors_create WHERE ${fild} LIKE ?) UNION (SELECT * FROM visitors_edit WHERE ${fild} LIKE ?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//отримання запису по вказаній умові з вказаної таблиці
exports.getRowOnCondFromTable = function(dataVisitor, fild, table, cb){
  let sql = `(SELECT * FROM ${table} WHERE ${fild}=?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//видалення запису
exports.delete = function(table, id, cb){
  let sql = `DELETE FROM ${table} WHERE regnum=${id}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

