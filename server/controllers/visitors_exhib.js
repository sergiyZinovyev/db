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
            req.body.referrer_url,
            req.body.utm_source,
            req.body.utm_medium,
            req.body.utm_campaign,
            req.body.utm_term,
            req.body.utm_content,
            req.body.new_visitor,
        ];
        console.log('visitorData: ', visitorData); 
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

//-------------------------------------------------------------------------------------------------------------  
//редагування запису відвідування виставки у таблиці Exhibition_vis відміна відвідування  

exports.editExhibition_vis_visited_cancel = function(req, res) {
    ControllersShared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return res.send([{
                    "rights": "false",
                }]);
            }
            else{
                let id_exhibition = [req.body.id_exhibition];
                let id_visitor = req.body.id_visitor;
                console.log('req.id_exhibition: ',req.body.id_exhibition);
                console.log('id_visitors: ',req.body.id_visitor);
                SQL.editExhibition_vis_visited_cancel(id_exhibition, id_visitor, function(err, doc2){
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500);
                    }
                    res.send(doc2);
                });
            }
        }
    })   
};

//-------------------------------------------------------------------------------------------------------------  
//редагування запису тип реєстрації у таблиці Exhibition(в req має прийти значення типу та id виставки)

exports.editExhibition_typeOfReg = function(req, res) {
    ControllersShared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return res.send([{
                    "rights": "false",
                }]);
            }
            else{
                let reqdata = [
                    req.body.typeOfReg,
                    req.body.id_exhibition
                ];
                
                SQL.editExhibition_typeOfReg(reqdata, function(err, doc2){
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500);
                    }
                    res.send(doc2);
                });
            }
        }
    })   
};