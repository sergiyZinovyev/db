var SQL = require('../models/sql-exhib');
var Shared = require('../models/shared');
var ControllersShared = require('../controllers/shared');


//-------------------------------------------------------------------------------------------------------------
//отримати всі записи про відвідувачів з вказаної виставки
exports.visexhib = function(req, res) {
    console.log(req.query.cond);
    let condition;
    switch (req.query.cond) {
        case '1':
            condition = 'AND visited > 0';
            break;
        case '2':
            condition = 'AND registered > 0';
            break;
        case '3':
            condition = 'AND (registered > 0 AND visited = 0)';
            break;
        default:
            condition = '';
      }
    let data = [
        req.params.id,
        req.params.id,
        req.params.id,
        req.params.id,
        req.params.id,
        req.params.id,  
    ];
    console.log(condition);
	SQL.visexhib(data, condition, function(err, doc) {
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
    let reg_user;
    if(req.body.visited){date_vis = Shared.curentDate(req.body.date_vis)}
    else date_vis = '';
    if(req.body.registered){date_reg = Shared.curentDate(req.body.date_reg)}
    else date_reg = '';
    ControllersShared.getRights(req.query.login, function(err, doc){
        console.log('doc: ', doc);
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        if(!doc){
            reg_user = 99;
        }
        else reg_user = doc.id;

        let visitorData = [
            req.body.id_exhibition,
            req.body.id_visitor,
            req.body.registered,
            req.body.visited,
            date_vis,
            date_reg,
            req.body.fake_id,
            reg_user,
        ]; 
        SQL.createExhibition_vis(visitorData, function(err, doc){
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            res.send(doc);
        });
        
    })     
};


//------------------------------------------------------------------------------------------------------------- 
//редагування запису в exhibition_vis

exports.editExhibition_vis = function(req, res) {
    let date_vis;
    let date_reg;
    let reg_user;
    if(req.body.vis){
        date_vis = Shared.curentDate();
        if(req.body.date_reg){
            date_reg = Shared.curentDate(req.body.date_reg)
        }
        else { date_reg = '' }
        
    }
    else {
        if(req.body.date_vis){
            date_vis = Shared.curentDate(req.body.date_vis)
        }
        else { date_vis = '' }
        date_reg = Shared.curentDate();
    }
    ControllersShared.getRights(req.query.login, function(err, doc){
        console.log('doc: ', doc);
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        if(!doc){
            reg_user = 99;
        }
        else reg_user = doc.id;
        var visitorData = [
            req.body.visited,
            req.body.registered,
            date_vis,
            date_reg,
            reg_user,
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
    })     
};