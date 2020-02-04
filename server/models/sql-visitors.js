const db = require('../db');
const EventEmitter = require('events');

const emitter = new EventEmitter();
exports.emitter = emitter;

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

//отримання всіх записів з visitors
exports.getVisitors = function(id, condition, cb){
  let sql = `SELECT * 
  FROM
  (SELECT * FROM ${id}) AS vis 
  LEFT OUTER JOIN 
    (SELECT id AS userid, realname FROM usersaccount) AS users 
    ON vis.ins_user = users.userid 
  LEFT OUTER JOIN 
    (SELECT countryid AS reg_countryid, regionid AS reg_regionid, teretory AS country FROM region) AS reg 
    ON vis.countryid = reg.reg_countryid AND reg.reg_regionid=0
  LEFT OUTER JOIN 
    (SELECT countryid AS reg2_countryid, regionid AS reg2_regionid, teretory AS region, cityid FROM region) AS reg2 
    ON vis.regionid = reg2.reg2_regionid AND reg2.reg2_countryid=vis.countryid AND cityid=0
  LEFT OUTER JOIN 
    (SELECT id_visitor, GROUP_CONCAT(DISTINCT nameexhibkor SEPARATOR ', ') AS visited_exhib
      FROM (SELECT id_visitor, nameexhibkor
      FROM(SELECT *
          FROM
          (SELECT * FROM exhibition_vis WHERE visited>0) AS vis_exhib 
          LEFT OUTER JOIN 
          (SELECT numexhib, nameexhibkor FROM exhibitions) AS exhib 
              ON vis_exhib.id_exhibition = exhib.numexhib) AS exhib_2) AS exhib_3
      GROUP BY id_visitor) AS exhib_vis 
    ON vis.regnum = exhib_vis.id_visitor ${condition}`;
  db.get().query(sql, function(err, data) {
    cb(err, data)
  })
}

//отримання відвідувачів виставки
// exports.visexhib = function(data, cb){
//   let sql = `SELECT *
//     FROM (
//       (
      
//       SELECT *
//       FROM (
//         (
        
//         SELECT *
//         FROM exhibition_vis
//         LEFT OUTER JOIN visitors_create ON exhibition_vis.id_visitor = visitors_create.regnum
//         WHERE id_exhibition =?
//         )
//         UNION ALL (
        
//         SELECT *
//         FROM exhibition_vis
//         LEFT OUTER JOIN visitors ON exhibition_vis.id_visitor = visitors.regnum
//         WHERE id_exhibition =?
//         )
//         ) AS v_table
//       WHERE namepovne IS NOT NULL
//       )
//       UNION (
      
//       SELECT *
//       FROM (
//       (
      
//         SELECT *
//         FROM exhibition_vis
//         LEFT OUTER JOIN visitors_create ON exhibition_vis.id_visitor = visitors_create.regnum
//         WHERE id_exhibition =?
//         )
//         UNION ALL (
        
//         SELECT *
//         FROM exhibition_vis
//         LEFT OUTER JOIN visitors ON exhibition_vis.id_visitor = visitors.regnum
//         WHERE id_exhibition =?
//         )
//         ) AS v_table
//       WHERE namepovne IS NULL
//       )
//       ) AS r_table
//     GROUP BY id`;
//   db.get().query(sql, data, function(err, data) {
//     cb(err, data)
//   })
// }

//отримання відвідувача виставки
// exports.checkViv = function(data, cb){
//   let sql = `SELECT * FROM exhibition_vis WHERE (id_visitor=? AND id_exhibition=?)`;
//   db.get().query(sql, data, function(err, data) {
//     cb(err, data)
//   })
// }

//отримання ...
exports.users = function(data, cb){
  let sql = `SELECT * FROM usersaccount WHERE name=?`;
  db.get().query(sql, data, function(err, data) {
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


//створення нового запису у вказаній таблиці
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
    console.log('################################################# create data: ',data);
    emitter.emit('createVisitor', {'table': table, 'id': dataVisitor[0]});
    cb(err, data)
  })
}

//створення n-записів у таблиці visitors
// dataVisitors - запис у форматі: '(data1, data2, ...), (data1, data2, ...), (data1, data2, ...), ...'
exports.createGroup = function(dataVisitors, cb){
  let sql = `INSERT INTO visitors (
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
    VALUES ${dataVisitors}`;
  db.get().query(sql, function(err, data) {
    console.log('################################################# createGroup data: ',data);
    cb(err, data)
  })
}

//створення нового запису у Exhibition_vis
// exports.createExhibition_vis = function(dataVisitor, cb){
//   let sql = `INSERT INTO exhibition_vis (
//     id_exhibition,
//     id_visitor, 
//     registered, 
//     visited, 
//     date_vis, 
//     date_reg
//     ) 
//     VALUES (?,?,?,?,?,?)`;
//   db.get().query(sql, dataVisitor, function(err, data) {
//     cb(err, data)
//   })
// }

//створення нового запису в таблиці visitors
// exports.createVis = function(dataVisitor, cb){
//   let sql = `INSERT INTO visitors (regnum, email, prizv, city, cellphone, potvid) VALUES (?,?,?,?,?,?)`;
//   db.get().query(sql, dataVisitor, function(err, data) {
//     cb(err, data)
//   })
// }

//редагування запису !!!недороблене!!!
// exports.edit = function(dataVisitor, cb){
//   let sql = `UPDATE visitors SET email=?, prizv=?, city=?, cellphone=? WHERE regnum=?`;
//   db.get().query(sql, dataVisitor, function(err, data) {
//     cb(err, data)
//   })
// }

//редагування запису відвідування виставки у таблиці Exhibition_vis
// exports.editExhibition_vis = function(dataVisitor, cb){
//   let sql = `UPDATE exhibition_vis SET visited=?, date_vis=? WHERE (id_visitor=? AND id_exhibition=?)`;
//   db.get().query(sql, dataVisitor, function(err, data) {
//     cb(err, data)
//   })
// }

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
    console.log('################################################# editPro data: ',data);
    emitter.emit('editVisitor', {'table': table, 'id': dataVisitor[24]});
    cb(err, data)
  })
}

//отримання запису по вказаній умові з трьох таблиць
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
  let sql = `DELETE FROM ${table} WHERE regnum IN (${id})`;
  db.get().query(sql, function(err, data) {
    emitter.emit('deleteVisitor', {'table': table, 'id': id});
    cb(err, data) 
  })
}


