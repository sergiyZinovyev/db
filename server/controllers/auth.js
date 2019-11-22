//var bodyParser = require('body-parser');
var request = require('request');
var Visitors = require('../models/sql-visitors');
var Shared = require('../controllers/shared');
//const jwt = require('jsonwebtoken');

const JWT_Secret = 'secret_key_ge';

//-------------------------------------------------------------------------------------------------------------
// отримати права доступу по логіну
// exports.getRights = function(login, cb){
//     Visitors.getRowOnCondFromTable(login, 'name', 'usersaccount', function(err, doc){
//         if (err) {
// 			console.log(err);
// 			return cb(err);
//         }
//         else {
//             console.log(doc[0].insupdvisitors);
// 			return cb(doc[0].insupdvisitors); 
//         }
//     })
// }


//-------------------------------------------------------------------------------------------------------------
//перевірка google reCaptcha2
exports.reCaptcha2 = function(req, res, next) {
    console.log("reCaptcha2 REPORT: req.body.captcha=", req.body.captcha);
    console.log("reCaptcha2 REPORT: req.connection.remoteAddress=", req.connection.remoteAddress);
    // g-recaptcha-response is the key that browser will generate upon form submit.
    // if its blank or null means user has not selected the captcha, so return the error.
    if(req.body.captcha === undefined || req.body.captcha === '' || req.body.captcha === null) {
        return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    }
    // Put your secret key here.
    var secretKey = "";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl,function(error,response,body) {
        body = JSON.parse(body);
        console.log("reCaptcha2 REPORT: body=", body);
        // Success will be true or false depending upon captcha validation.
        if(body.success !== undefined && !body.success) {
            console.log("reCaptcha2 REPORT: Failed captcha verification");
            return res.send([
                {
                    "responseCode": 1,
                    "responseDesc": "Failed captcha verification"
                },
            ]);
        }
        // res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
        // res.send([
        //     {
        //         "responseCode": 0,
        //         "responseDesc": "Sucess"
        //     },
        // ]);
        console.log("reCaptcha2 REPORT: responseDesc: Sucess");
        return next();
    });
}



//-------------------------------------------------------------------------------------------------------------
//перевірка логіну/пароля
exports.users = function(req, res) {
    let data =[
        req.body.login,
    ]
	Visitors.users(data, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
        }
        if(doc[0]){
            if(req.body.password == doc[0].passw){
                console.log(doc);
                //let token = jwt.sign(doc[0].id, JWT_Secret);
                res.send([
                    {
                        "password": "true",
                        "login": "true"
                    },
                    {
                        'accessRights': doc[0].insupdvisitors,
                        'id': doc[0].id,
                        //'token': token
                    }
                ]);
                //exports.login = true;
                //next('true')
            }
            else{
                console.log(doc);
                res.send([{
                    "password": "false",
                    "login": "true"
                }]);
                //exports.login = true;
            }
        }
		else{
            console.log(doc);
            res.send([{
                "password": "false",
                "login": "false"
            }]);
            //exports.login = true;
        }
	});
};

//-----------------------------------------------------------------------------------------------------------   
// підтвердження пароля
exports.checkAuth = function(req, res, next){
    Shared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![1,2,3,4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return res.send([{
                    "rights": "false",
                }]);
            }
            else{
                let data =[
                req.query.login,
                ]
                console.log(data)
                Visitors.users(data, function(err, doc) {
            
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500);
                    }

                    if(doc[0]){
                        if(req.query.password == doc[0].passw){
                            console.log(doc);
                            return next();
                        }
                        else{
                            console.log(doc);
                            return console.log("checkAuth: error!")
                        }
                    }
                    else{
                        console.log(doc);
                        return console.log("checkAuth: error!")
                    }
                });
            }    
        }
    })
    
};
