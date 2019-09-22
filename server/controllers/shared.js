var SQLvis = require('../models/sql-visitors');
var Shared = require('../models/shared');


//-------------------------------------------------------------------------------------------------------------
//отримати запис з вказаної таблиці по вказаному полю

exports.getAll = function(req, res) {
    var data = [
        req.query.id,  
    ];
	SQLvis.getRowOnCondFromTable(data, req.query.q1, req.query.q2,  function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); 
		}
		res.send(doc);
	});
};


//-------------------------------------------------------------------------------------------------------------
// отримати запис з usersaccount по логіну
exports.getRights = function(login, cb){
    SQLvis.getRowOnCondFromTable(login, 'name', 'usersaccount', function(err, doc){
        if (err) {
			console.log(err);
			return cb(err);
        }
        else {
            console.log('user data: ',doc);
			//return cb(doc[0].insupdvisitors); 
		}
		return cb(err, doc[0]);
    })
}

//-------------------------------------------------------------------------------------------------------------
// отримати таблиці в яких присутній заданий regnum (на виході отримуємо масив з імен таблиць)
exports.getTablesOnRegnum = function(regnum, cb){
	let table = [];
    SQLvis.getRowOnCondFromTable(regnum, 'regnum', 'visitors', function(err, doc){
        if (err) {
			console.log(err);
			return cb(err, table);
        }
        else {
			console.log('data: ',doc);
			if(doc[0]){
				table.push('visitors');
			}
			SQLvis.getRowOnCondFromTable(regnum, 'regnum', 'visitors_create', function(err, doc){
				if (err) {
					console.log(err);
					return cb(err, table);
				}
				else {
					console.log('data: ',doc);
					if(doc[0]){
						table.push('visitors_create');
					}
					SQLvis.getRowOnCondFromTable(regnum, 'regnum', 'visitors_edit', function(err, doc){
						if (err) {
							console.log(err);
							return cb(err, table);
						}
						else {
							console.log('data: ',doc);
							if(doc[0]){
								table.push('visitors_edit');
							}
							
							return cb(err, table);
						}
					})
				}
			})
		}
    })
}


