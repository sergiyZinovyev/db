var SQL = require('../models/sql-exhib');
var Shared = require('../models/shared');


//-------------------------------------------------------------------------------------------------------------
//отримати всі записи про відвідувачів з вказаної виставки
exports.visexhib = function(req, res) {
    let data = [
        req.params.id,
        req.params.id,
        req.params.id,
        req.params.id  
    ];
	SQL.visexhib(data, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); 
		}
		res.send(doc);
	});
};


//-------------------------------------------------------------------------------------------------------------
//отримати запис з  exhibition_vis про відвідувача вказаної виставки

exports.checkViv = function(req, res) {
    var data = [
        req.query.idVis,
        req.query.exhib,  
    ];
	SQL.checkViv(data, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); 
		}
		res.send(doc);
	});
};


//-------------------------------------------------------------------------------------------------------------
//додавання запису в exhibition_vis

exports.createInExhibition_vis = function(req, res) {
    let date_vis;
    let date_reg;
    if(req.body.date_vis){date_vis = Shared.curentDate(req.body.date_vis)}
    else date_vis = '';
    if(req.body.date_reg){date_reg = Shared.curentDate(req.body.date_reg)}
    else date_reg = '';
    var visitorData = [
        req.body.id_exhibition,
        req.body.id_visitor,
        req.body.registered,
        req.body.visited,
        date_vis,
        date_reg
    ];
    SQL.createExhibition_vis(visitorData, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });     
};


//-------------------------------------------------------------------------------------------------------------
//редагування запису в exhibition_vis

exports.editExhibition_vis = function(req, res) {
    var visitorData = [
        req.body.visited,
        req.body.registered,
        Shared.curentDate(req.body.date_vis),
        Shared.curentDate(req.body.date_reg),
        req.body.id_visitor,
        req.body.id_exhibition,
    ];
    console.log('editExhibition_vis data: ',visitorData)
    SQL.editExhibition_vis(visitorData, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });     
};