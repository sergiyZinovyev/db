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

        //перевірка на email
        var fild = 'email';
        var visitorData2 = [
            req.body[fild],
            req.body[fild]
        ];
        Visitors.getEmail(visitorData2, fild, function(err2, doc2){
            if (err2) {
                console.log(err2);
                return res.sendStatus(500);
            }
            console.log('check result on email: ', doc2);
            if (doc2){
                if (doc2[0] == undefined || doc2[0].email == ''){
                    //перевірка на cellphone
                    var fild2 = 'cellphone';
                    var visitorData3 = [
                        req.body[fild2],
                        req.body[fild2]
                    ];
                    Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
                        if (err4) {
                            console.log(err4);
                            return res.sendStatus(500);
                        }
                        console.log('check result on cellphone: ', doc4);
                        if (doc4){
                            if (doc4[0] == undefined || doc4[0].cellphone == ''){
                                 //створюємо новий запис в табл. visitors_create
                                console.log('start creating'); 
                                Visitors.create(visitorData, function(err3, doc3){
                                    if (err3) {
                                        console.log(err3);
                                        return res.sendStatus(500);
                                    }
                                    res.send(doc3);
                                });
                            }
                            else{
                                console.log('phone found');
                                return res.send(doc4)
                            }
                        }
                    });
                }
                else{
                    console.log('email found');
                    return res.send(doc2)
                }
            }
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
