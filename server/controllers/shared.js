var SQLvis = require('../models/sql-visitors');
var Shared = require('../models/shared');


//-------------------------------------------------------------------------------------------------------------
//отримати запис з вказаної виставки по вказаному полю

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



