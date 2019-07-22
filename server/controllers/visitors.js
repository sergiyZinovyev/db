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
    Visitors.regnVisAndReq(function(err, doc){
        if (err) {
			console.log(err);
			return res.sendStatus(500);
        }
        var visitorData = [
            Visitors.nextRegnum(doc),
            req.body.email,
            req.body.prizv,
            req.body.city,
            req.body.cellphone
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

exports.getEmail = function(req, res) {
    var visitorData = [
        req.body.email,
        req.body.email
    ];
    Visitors.getEmail(visitorData, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });   
};
