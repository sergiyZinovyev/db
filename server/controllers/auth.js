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
    Shared.getRights(req.query.login, function(err, rights){
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        else {
            console.log('rights cb: ', rights);
            if(rights == '0'){
                console.log('у вас немає прав доступу: ', rights);
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
