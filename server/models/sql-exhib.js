const db = require('../db');

//отримання відвідувачів виставки
exports.visexhib = function(data, condition, cb){
  // let sql = `SELECT *
  //   FROM (
  //     (
      
  //     SELECT *
  //     FROM (
  //       (
        
  //       SELECT *
  //       FROM exhibition_vis
  //       LEFT OUTER JOIN visitors_create ON exhibition_vis.id_visitor = visitors_create.regnum 
  //       WHERE id_exhibition =? ${condition}
  //       )
  //       UNION ALL (
        
  //       SELECT *
  //       FROM exhibition_vis
  //       LEFT OUTER JOIN visitors ON exhibition_vis.id_visitor = visitors.regnum
  //       WHERE id_exhibition =? ${condition}
  //       )
  //       ) AS v_table
  //     WHERE namepovne IS NOT NULL
  //     )
  //     UNION (
      
  //     SELECT *
  //     FROM (
  //     (
      
  //       SELECT *
  //       FROM exhibition_vis
  //       LEFT OUTER JOIN visitors_create ON exhibition_vis.id_visitor = visitors_create.regnum
  //       WHERE id_exhibition =? ${condition}
  //       )
  //       UNION ALL (
        
  //       SELECT *
  //       FROM exhibition_vis
  //       LEFT OUTER JOIN visitors ON exhibition_vis.id_visitor = visitors.regnum
  //       WHERE id_exhibition =? ${condition}
  //       )
  //       ) AS v_table
  //     WHERE namepovne IS NULL
  //     )
  //     ) AS r_table
  //   GROUP BY id`;
  let sql = `SELECT *
  FROM
    (SELECT *
      FROM (
        (
        
        SELECT *
        FROM (
          (
          
          SELECT *
          FROM exhibition_vis
          LEFT OUTER JOIN visitors_create ON exhibition_vis.id_visitor = visitors_create.regnum 
          WHERE id_exhibition =? ${condition}
          )
          UNION ALL (
          
          SELECT *
          FROM exhibition_vis
          LEFT OUTER JOIN visitors ON exhibition_vis.id_visitor = visitors.regnum
          WHERE id_exhibition =? ${condition}
          )
          ) AS v_table
        WHERE namepovne IS NOT NULL
        )
        UNION (
        
        SELECT *
        FROM (
        (
        
          SELECT *
          FROM exhibition_vis
          LEFT OUTER JOIN visitors_create ON exhibition_vis.id_visitor = visitors_create.regnum
          WHERE id_exhibition =? ${condition}
          )
          UNION ALL (
          
          SELECT *
          FROM exhibition_vis
          LEFT OUTER JOIN visitors ON exhibition_vis.id_visitor = visitors.regnum
          WHERE id_exhibition =? ${condition}
          )
          ) AS v_table
        WHERE namepovne IS NULL
        )
        ) AS r_table
      GROUP BY id) AS exhib
    LEFT OUTER JOIN
    (SELECT id, realname FROM usersaccount) AS users
      ON exhib.reg_user = users.id`
  db.get().query(sql, data, function(err, data) {
    cb(err, data)
  })
}

//отримання відвідувача виставки
exports.checkViv = function(data, cb){
  let sql = `SELECT * FROM exhibition_vis WHERE (id_visitor=? AND id_exhibition=?)`;
  db.get().query(sql, data, function(err, data) {
    cb(err, data)
  })
}

//створення нового запису у Exhibition_vis
exports.createExhibition_vis = function(dataVisitor, cb){
  let sql = `INSERT INTO exhibition_vis (
    id_exhibition,
    id_visitor, 
    registered, 
    visited, 
    date_vis, 
    date_reg,
    fake_id,
    reg_user
    ) 
    VALUES (?,?,?,?,?,?,?,?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}

//редагування запису відвідування виставки у таблиці Exhibition_vis 
exports.editExhibition_vis = function(dataVisitor, cb){
  let sql = `UPDATE exhibition_vis SET visited=?, registered=?, date_vis=?, date_reg=?, reg_user=? WHERE (id_visitor=? AND id_exhibition=?)`;
  db.get().query(sql, dataVisitor, function(err, data) {
    cb(err, data)
  })
}
