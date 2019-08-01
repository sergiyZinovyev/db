var Visitors = require('../models/sql-visitors');

exports.all = function(req, res) {
	Visitors.all(req.params.id, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		res.send(doc);
	});
};

exports.create = function(req, res) {
    //отримуємо всі regnum  з таблиць visitors та visitors_create
    Visitors.regnVisAndReq(function(err, doc){
        if (err) {
			console.log(err);
			return res.sendStatus(500);
        }
        var visitorData = [
            Visitors.nextRegnum(doc), //визначаємо наступний після найбільшого regnum
            req.body.email,
            req.body.prizv,
            req.body.city,
            req.body.cellphone,
            req.body.potvid,
            req.body.name,
            req.body.countryid,
            req.body.regionid,
            req.body.m_robotu,
            req.body.pobatkovi,
            req.body.posada,
            req.body.sferadij,
            Visitors.curentDate(),
            99
        ];
        Visitors.create(visitorData, function(err, doc){
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            res.send(doc);
        });   
    });
};

exports.createNewVis = function(req, res) {
    var visitorData = [
        req.body.regnum,
        req.body.email,
        req.body.prizv,
        req.body.city,
        req.body.cellphone,
        req.body.potvid
    ];
    Visitors.createVis(visitorData, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });     
};

exports.edit = function(req, res) {
    var visitorData = [
        req.body.email,
        req.body.prizv,
        req.body.city,
        req.body.cellphone,
        req.body.regnum
    ];
    Visitors.edit(visitorData, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });   
};

exports.getSpecCond = function(req, res) {
    var fild = req.body.condition;
    var visitorData = [
        req.body[fild],
        req.body[fild]
    ];
    Visitors.getEmail(visitorData, fild, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        console.log('doc: ', doc);
        return res.send(doc);
    });
       
};

exports.getEmail = function(req, res) {
    var visitorData;
    var fild;
    if(!req.body.email){
        visitorData = [
            req.body.cellphone,
            req.body.cellphone
        ];
        fild = 'cellphone';
    }
    else{
        visitorData = [
            req.body.email,
            req.body.email
        ];
        fild = 'email';
    }
    
    Visitors.getEmail(visitorData, fild, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if(doc == ''){
            if(!req.body.cellphone){return res.send(doc);}
            visitorData = [
                req.body.cellphone,
                req.body.cellphone
            ];
            fild = 'cellphone';
            Visitors.getEmail(visitorData, fild, function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                console.log('doc2: ', doc);
                return res.send(doc);
            });
        }
        else{
            console.log('doc: ', doc)
            res.send(doc);
        }
        
    });   
};

exports.delete = function(req, res) {
    Visitors.delete(req.body.tableName, req.body.regnum, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });   
};
