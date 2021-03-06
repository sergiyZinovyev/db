var Visitors = require('../models/sql-visitors');
var Shared = require('../models/shared');
var SQLCommon = require('../models/sql-common');
var ControllersShared = require('../controllers/shared');
const Email = require('./email');


exports.all = function(req, res) {
    let table;
    //якщо параметри не задані робимо запит до visitors 
    if(!req.params.id){
        //table = 'visitors';
        Visitors.getVisitors(function(err, doc) {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            res.send(doc);
        });
    }
    else {
        table = req.params.id;
        Visitors.all(table, function(err, doc) {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            res.send(doc);
        });
    }     
};

//-------------------------------------------------------------------------------------------------------------   
// регіони
exports.region = function(req, res) {
    let countryid = req.query.countryid;
    let regionid = req.query.regionid;
    Visitors.region(countryid, regionid, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    }); 
};

//-------------------------------------------------------------------------------------------------------------   
// галузі
exports.branch = function(req, res) {
    Visitors.branch(function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    }); 
};

//-------------------------------------------------------------------------------------------------------------   
// отримання групи виставок по id
exports.groupexhib = function(req, res) {
    let id = req.query.id
    Visitors.groupexhib(id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    }); 
};

//-------------------------------------------------------------------------------------------------------------   
// отримання групи виставок по даті
exports.getexhibitions = function(req, res) {
    let date = req.query.date;
    //console.log('date: ',date);
    Visitors.getexhibitions(date, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    }); 
};

//-------------------------------------------------------------------------------------------------------------   
// отримання виставки по id
exports.getexhibition = function(req, res) {
    let id = req.query.id;
    //console.log('date: ',date);
    Visitors.getexhibition(id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    }); 
};

//-------------------------------------------------------------------------------------------------------------   
// перевірка валідності емейла та телефона
exports.validcontact = function(req, res) {
    if(!req.query.value) return res.sendStatus(204);
    let field = req.query.field;
    let value = [req.query.value, req.query.value, req.query.value];
    let regnum = req.query.regnum;
    let error = {};
    Visitors.validcontact(field, value, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if(!doc[0]) return res.sendStatus(204);
        for (let element of doc){
            if(!regnum || regnum == '' || element.regnum != regnum){
                error[`${field}Valid`] = `такий ${field} вже використовується`;
                return res.send(JSON.stringify(error));
                //break
            }
        }
        return res.sendStatus(204);
    }); 
};

//-------------------------------------------------------------------------------------------------------------   
// отримати візіторів
exports.getVisitors = function(req, res) {
    let table;
    let condition;
    let selectedFields;
    let limit;
    table = req.body.table;
    selectedFields = req.body.fields;
    limit = req.body.limit;
    if(!req.body.regnum){
        condition = '';
    }
    else{condition = `WHERE regnum IN (${req.body.regnum})`}
    Visitors.getVisitors(table, condition, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    }, selectedFields, limit);    
};

//------------------------------------------------------------------------------------------------------------- 
exports.checkIdVisitor = function(req, res) {
    Visitors.getRowOnCondFromTable([req.query.id], 'regnum', 'visitors_create', function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        if(doc == ''){
            Visitors.getRowOnCondFromTable([req.query.id], 'regnum', 'visitors', function(err, doc2){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                else{
                    return res.send(doc2)
                }
            }) 
        }
        else{
            return res.send(doc)
        }
    })  
};
//-------------------------------------------------------------------------------------------------------------

// exports.visexhib = function(req, res) {
//     let data = [
//         req.params.id,
//         req.params.id,
//         req.params.id,
//         req.params.id  
//     ];
// 	Visitors.visexhib(data, function(err, doc) {
// 		if (err) {
// 			console.log(err);
// 			return res.sendStatus(500); 
// 		}
// 		res.send(doc);
// 	});
// };

//-------------------------------------------------------------------------------------------------------------

// exports.checkViv = function(req, res) {
//     var data = [
//         req.query.idVis,
//         req.query.exhib,  
//     ];
// 	Visitors.checkViv(data, function(err, doc) {
// 		if (err) {
// 			console.log(err);
// 			return res.sendStatus(500); 
// 		}
// 		res.send(doc);
// 	});
// };

//-------------------------------------------------------------------------------------------------------------
//перевірка логіну/пароля
// exports.users = function(req, res) {
//     let data =[
//         req.body.login,
//     ]
// 	Visitors.users(data, function(err, doc) {
// 		if (err) {
// 			console.log(err);
// 			return res.sendStatus(500);
//         }
//         if(doc[0]){
//             if(req.body.password == doc[0].passw){
//                 console.log(doc);
//                 let token = jwt.sign(doc[0].id, JWT_Secret);
//                 res.send([
//                     {
//                         "password": "true",
//                         "login": "true"
//                     },
//                     {
//                         'accessRights': doc[0].insupdvisitors,
//                         'id': doc[0].id,
//                         'token': token
//                     }
//                 ]);
//                 //exports.login = true;
//                 //next('true')
//             }
//             else{
//                 console.log(doc);
//                 res.send([{
//                     "password": "false",
//                     "login": "true"
//                 }]);
//                 //exports.login = true;
//             }
//         }
// 		else{
//             console.log(doc);
//             res.send([{
//                 "password": "false",
//                 "login": "false"
//             }]);
//             //exports.login = true;
//         }
// 	});
// };

//-------------------------------------------------------------------------------------------------------------

exports.file = function(req, res) {
    console.log('req.params.id from img', req.params.id);
	Shared.file(req.params.id, req.query.path, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
        }
        console.log('file '+req.params.id+' sent');
		res.send(doc);
	});
};

//-------------------------------------------------------------------------------------------------------------
//створює новий запис/порівняти з наступним методом та обєднати методи /метод враховує чи були змінені емаіл та целфон/
// exports.editRequest = function(req, res) {
//     var visitorData = [
//         req.body.regnum,
//         req.body.email,
//         req.body.prizv,
//         req.body.city,
//         req.body.cellphone,
//         req.body.potvid,
//         req.body.name,
//         req.body.countryid,
//         req.body.regionid,
//         req.body.m_robotu,
//         req.body.pobatkovi,
//         req.body.posada,
//         req.body.sferadij,
//         Visitors.curentDate(req.body.datawnesenny),
//         99,
//         req.body.prizv+' '+req.body.name+' '+req.body.pobatkovi,
//         req.body.postindeks,
//         req.body.address,
//         req.body.postaddreses,
//         req.body.telephon,
//         req.body.gender,
//         req.body.type,
//         req.body.kompeten,
//         Visitors.curentDate(),
//         req.body.rating
//     ];

//     console.log('req.body.checkEmail: ',req.body.checkEmail);
//     console.log('req.body.checkPhone: ',req.body.checkPhone);

//     if (req.body.checkEmail == false){
//         if(req.body.checkPhone == false){
//             //створюємо новий запис
//             console.log('start creating'); 
//             Visitors.create(visitorData, req.body.table, function(err4, doc4){
//                 if (err4) {
//                     console.log('err4: ',err4);
//                     return res.sendStatus(500);
//                 }
//                 return res.send(doc4);
//             });
//         }
//         else{
//             //перевірка чи не зайнятий cellphone
//             var fild2 = 'cellphone';
//             var visitorData3 = [
//                 req.body[fild2],
//                 req.body[fild2],
//                 req.body[fild2]
//             ];
//             Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
//                 if (err4) {
//                     console.log(err4);
//                     return res.sendStatus(500);
//                 }
//                 console.log('check result on cellphone: ', doc4);
//                 if (doc4){
//                     if (doc4[0] == undefined || doc4[0].cellphone == ''){
//                         //створюємо новий запис в табл
//                         console.log('start creating'); 
//                         Visitors.create(visitorData, req.body.table, function(err3, doc3){
//                             if (err3) {
//                                 console.log(err3);
//                                 return res.sendStatus(500);
//                             }
//                             res.send(doc3);
//                         });
//                     }
//                     else{
//                         console.log('phone found');
//                         return res.send(doc4)
//                     }
//                 }
//             }); 
//         }
//     }
//     else{
//         //перевірка чи не зайнятий email
//         var fild = 'email';
//         var visitorData2 = [
//             req.body[fild],
//             req.body[fild],
//             req.body[fild]
//         ];
//         Visitors.getEmail(visitorData2, fild, function(err2, doc2){
//             if (err2) {
//                 console.log(err2);
//                 return res.sendStatus(500);
//             }
//             console.log('check result on email: ', doc2);
//             if (doc2){
//                 if (doc2[0] == undefined || doc2[0].email == ''){
//                     if(req.body.checkPhone == false){
//                         //створюємо новий запис в табл
//                         console.log('start creating'); 
//                         Visitors.create(visitorData, req.body.table, function(err4, doc4){
//                             if (err4) {
//                                 console.log(err4);
//                                 return res.sendStatus(500);
//                             }
//                             return res.send(doc4);
//                         });
//                     }
//                     else{
//                         //перевірка чи не зайнятий cellphone
//                         var fild2 = 'cellphone';
//                         var visitorData3 = [
//                             req.body[fild2],
//                             req.body[fild2],
//                             req.body[fild2]
//                         ];
//                         Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
//                             if (err4) {
//                                 console.log(err4);
//                                 return res.sendStatus(500);
//                             }
//                             console.log('check result on cellphone: ', doc4);
//                             if (doc4){
//                                 if (doc4[0] == undefined || doc4[0].cellphone == ''){
//                                     //створюємо новий запис в табл
//                                     console.log('start creating'); 
//                                     Visitors.create(visitorData, req.body.table, function(err3, doc3){
//                                         if (err3) {
//                                             console.log(err3);
//                                             return res.sendStatus(500);
//                                         }
//                                         res.send(doc3);
//                                     });
//                                 }
//                                 else{
//                                     console.log('phone found');
//                                     return res.send(doc4)
//                                 }
//                             }
//                         });
//                     }
                    
//                 }
//                 else{
//                     console.log('email found');
//                     return res.send(doc2)
//                 }
//             }
//         });
//     } 
// };

//створює новий запис/порівняти з наступним методом та обєднати методи /метод враховує чи були змінені емаіл та целфон/(отримує на вхід req та table)
//метод едентичний до editPro, спробувати об'єднати
let editRequestIn = function(req, table, cb) {
    let reg_user;
    let sending;
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

        if(req.body.sending) sending = 1
        else sending = 0;

        var visitorData = [
            req.body.regnum,
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
            Visitors.curentDate(req.body.datawnesenny),
            reg_user,
            req.body.prizv+' '+req.body.name+' '+req.body.pobatkovi,
            req.body.postindeks,
            req.body.address,
            req.body.postaddreses,
            req.body.telephon,
            req.body.gender,
            req.body.type,
            req.body.kompeten,
            Visitors.curentDate(),
            req.body.rating,
            sending,
            req.body.password
        ];

        console.log('req.body.checkEmail: ',req.body.checkEmail);
        console.log('req.body.checkPhone: ',req.body.checkPhone);

        if (req.body.checkEmail == false){
            if(req.body.checkPhone == false){
                //створюємо новий запис
                console.log('start creating'); 
                Visitors.create(visitorData, table, function(err4, doc4){
                    if (err4) {
                        console.log('err4: ',err4);
                        return cb(err4, doc4);
                    }
                    return cb(err4, doc4);
                });
            }
            else{
                //перевірка чи не зайнятий cellphone
                var fild2 = 'cellphone';
                var visitorData3 = [
                    req.body[fild2],
                    req.body[fild2],
                    req.body[fild2]
                ];
                Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
                    if (err4) {
                        console.log('err4: ',err4);
                        return cb(err4, doc4);
                    }
                    console.log('check result on cellphone: ', doc4);
                    if (doc4){
                        if (doc4[0] == undefined || doc4[0].cellphone == ''){
                            //створюємо новий запис в табл
                            console.log('start creating'); 
                            Visitors.create(visitorData, table, function(err3, doc3){
                                if (err3) {
                                    console.log(err3);
                                    return cb(err3, doc3);
                                }
                                return cb(err3, doc3);
                            });
                        }
                        else{
                            console.log('phone found: ', doc4);
                            return cb(err4, [{
                                "found": "phone",
                            }]);
                        }
                    }
                }); 
            }
        }
        else{
            //перевірка чи не зайнятий email
            var fild = 'email';
            var visitorData2 = [
                req.body[fild],
                req.body[fild],
                req.body[fild]
            ];
            Visitors.getEmail(visitorData2, fild, function(err2, doc2){
                if (err2) {
                    console.log(err2);
                    return cb(err2, doc2);
                }
                console.log('check result on email: ', doc2);
                if (doc2){
                    if (doc2[0] == undefined || doc2[0].email == ''){
                        if(req.body.checkPhone == false){
                            //створюємо новий запис в табл
                            console.log('start creating'); 
                            Visitors.create(visitorData, table, function(err4, doc4){
                                if (err4) {
                                    console.log(err4);
                                    return cb(err4, doc4);
                                }
                                return cb(err4, doc4);
                            });
                        }
                        else{
                            //перевірка чи не зайнятий cellphone
                            var fild2 = 'cellphone';
                            var visitorData3 = [
                                req.body[fild2],
                                req.body[fild2],
                                req.body[fild2]
                            ];
                            Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
                                if (err4) {
                                    console.log(err4);
                                    return cb(err4, doc4);
                                }
                                console.log('check result on cellphone: ', doc4);
                                if (doc4){
                                    if (doc4[0] == undefined || doc4[0].cellphone == ''){
                                        //створюємо новий запис в табл
                                        console.log('start creating'); 
                                        Visitors.create(visitorData, table, function(err3, doc3){
                                            if (err3) {
                                                console.log(err3);
                                                return cb(err3, doc3);
                                            }
                                            return cb(err3, doc3);
                                        });
                                    }
                                    else{
                                        console.log('phone found: ', doc4);
                                        return cb(err4, [{
                                            "found": "phone",
                                        }]);
                                    }
                                }
                            });
                        }
                        
                    }
                    else{
                        console.log('email found: ', doc2);
                        return cb(err2, [{
                            "found": "email",
                        }]);
                    }
                }
            });
        }
    }) 
};
//-------------------------------------------------------------------------------------------------------------
//створити новий запис в таблиці visitors/visitors_edit (regnum відомий)
exports.editRequest = function(req, res) {
    editRequestIn(req, req.body.table, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        console.log('doc: ', doc);
        return res.send(doc); 
    });
}
//-------------------------------------------------------------------------------------------------------------
//потрібен виключно для створення запису в таблиці visitors_create
// exports.createCpecTable = function(req, res) {
//     //отримуємо всі regnum  з таблиць visitors та visitors_create 
//     Visitors.regnVisAndReq(function(err, doc){
//         if (err) {
// 			console.log(err);
// 			return res.sendStatus(500);
//         }
//         var visitorData = [
//             Visitors.nextRegnum(doc), //визначаємо наступний після найбільшого regnum
//             req.body.email,
//             req.body.prizv,
//             req.body.city,
//             req.body.cellphone,
//             req.body.potvid,
//             req.body.name,
//             req.body.countryid,
//             req.body.regionid,
//             req.body.m_robotu,
//             req.body.pobatkovi,
//             req.body.posada,
//             req.body.sferadij,
//             Visitors.curentDate(),
//             99, //поправити
//             req.body.prizv+' '+req.body.name+' '+req.body.pobatkovi,
//             req.body.postindeks,
//             req.body.address,
//             req.body.postaddreses,
//             req.body.telephon,
//             req.body.gender,
//             req.body.type,
//             req.body.kompeten,
//             Visitors.curentDate(),
//             req.body.rating
//         ];

//         //перевірка на email
//         if (req.body.email == ''){

//         }
//         var fild = 'email';
//         var visitorData2 = [
//             req.body[fild],
//             req.body[fild],
//             req.body[fild]
//         ];
//         Visitors.getEmail(visitorData2, fild, function(err2, doc2){
//             if (err2) {
//                 console.log(err2);
//                 return res.sendStatus(500);
//             }
//             console.log('check result on email: ', doc2);
//             if (doc2){
//                 if (doc2[0] == undefined || doc2[0].email == ''){
//                     //перевірка на cellphone
//                     var fild2 = 'cellphone';
//                     var visitorData3 = [
//                         req.body[fild2],
//                         req.body[fild2],
//                         req.body[fild2]
//                     ];
//                     Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
//                         if (err4) {
//                             console.log(err4);
//                             return res.sendStatus(500);
//                         }
//                         console.log('check result on cellphone: ', doc4);
//                         if (doc4){
//                             if (doc4[0] == undefined || doc4[0].cellphone == ''){
//                                  //створюємо новий запис в табл.
//                                 console.log('start creating'); 
//                                 Visitors.create(visitorData, 'visitors_create', function(err3, doc3){
//                                     if (err3) {
//                                         console.log(err3);
//                                         return res.sendStatus(500);
//                                     }
//                                     res.send(doc3);
//                                 });
//                             }
//                             else{
//                                 console.log('phone found');
//                                 return res.send(doc4)
//                             }
//                         }
//                     });
//                 }
//                 else{
//                     console.log('email found');
//                     return res.send(doc2)
//                 }
//             }
//         });
//     });
// };

//потрібен для створення запису в таблиці visitors_create, visitors /присвоюється новий regnum
let createCpecTableIn = function(req, table, cb) {
    
    let reg_user;
    let sending;
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

        if(req.body.sending) sending = 1
        else sending = 0;

        //отримуємо всі regnum  з таблиць visitors та visitors_create
        Visitors.regnVisAndReq(function(err, doc){
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            
            //let regnVisAndReq = doc
            let newRegnum = doc[0].max + 1;
            var visitorData = [
                //Visitors.nextRegnum(doc), //визначаємо наступний після найбільшого regnum
                newRegnum,
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
                reg_user,
                req.body.prizv+' '+req.body.name+' '+req.body.pobatkovi,
                req.body.postindeks,
                req.body.address,
                req.body.postaddreses,
                req.body.telephon,
                req.body.gender,
                req.body.type,
                req.body.kompeten,
                Visitors.curentDate(),
                req.body.rating,
                sending,
                req.body.password
            ];

            //перевірка на email
            if (req.body.email == ''){

            }
            var fild = 'email';
            var visitorData2 = [
                req.body[fild],
                req.body[fild],
                req.body[fild]
            ];
            Visitors.getEmail(visitorData2, fild, function(err2, doc2){
                if (err2) {
                    console.log('err2: ',err2);
                    return cb(err2, doc2);
                }
                //console.log('check result on email: ', doc2);
                if (doc2){
                    if (doc2[0] == undefined || doc2[0].email == ''){
                        //перевірка на cellphone
                        var fild2 = 'cellphone';
                        var visitorData3 = [
                            req.body[fild2],
                            req.body[fild2],
                            req.body[fild2]
                        ];
                        Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
                            if (err4) {
                                console.log('err4: ',err4);
                                return cb(err4, doc4);
                            }
                            console.log('check result on cellphone: ', doc4);
                            if (doc4){
                                if (doc4[0] == undefined || doc4[0].cellphone == ''){
                                    //створюємо новий запис в табл.
                                    console.log('start creating');
                                    //console.log('regnVisAndReq: ', regnVisAndReq);
                                    //console.log('newRegnum: ', newRegnum); 
                                    Visitors.create(visitorData, table, function(err3, doc3){
                                        if (err3) {
                                            console.log(err3);
                                            return cb(err3, doc3);
                                        }
                                        return cb(err3, doc3);
                                    });
                                }
                                else{
                                    console.log('phone found: ', doc4);
                                    return cb(err4, [{
                                        "found": "phone",
                                    }]);
                                }
                            }
                        });
                    }
                    else{
                        console.log('email found: ', doc2);
                        return cb(err2, [{
                            "found": "email",
                        }]);
                    }
                }
            });
        });
    })
};

//-------------------------------------------------------------------------------------------------------------
//створити новий запис в таблиці visitors_create (regnum невідомий)
exports.createCpecTable = function(req, res) {
    createCpecTableIn(req, 'visitors_create', function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        console.log('doc: ', doc);
        return res.send(doc); 
    });
}
//-------------------------------------------------------------------------------------------------------------

//створити новий запис в таблиці visitors_create або visitors (regnum невідомий)
exports.createNewVisAuth = function(req, res) {
    let table;
    ControllersShared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return cb(err, null);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![1,2,3,4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return cb(err, [{
                    "rights": "false",
                }]);
            }
            if([1,2].includes(doc.insupdvisitors)){
                table = 'visitors_create';
            }
            if([3,4,5].includes(doc.insupdvisitors)){
                table = 'visitors';
            }
            createCpecTableIn(req, table, function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                console.log('doc: ', doc);
                return res.send(doc); 
            });
        }
    })
}

//-------------------------------------------------------------------------------------------------------------
//створити n-записів в таблиці visitors (regnum відомий) та видалити їх з visitors_create
exports.createGroup = function(req, res) {
    ControllersShared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return cb(err, null);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return cb(err, [{
                    "rights": "false",
                }]);
            }
            console.log('array of data: ', req.body);
            // формуємо строку в потрібному форматі для внесення
            let dataVisitors = '';
            let coma = ', ';
            let coma2 = ', ';
            let arrToString = '';
            let quotes = '';
            let dataDel = '';
            let val;
            for (let index = 0; index < req.body.regnum.length; index++) {
                for(let key in req.body){
                    val = req.body[key][index];
                    //if (typeof val === 'string' && key != 'datawnesenny' && key != 'datelastcor'){
                    if (typeof val === 'string'){    
                        quotes = "'";
                        val = val.replace(/'/g, "\\'" );
                    }
                    else {quotes = ''}

                    // if (key == 'datawnesenny' || key == 'datelastcor'){
                    //     val = Visitors.curentDate(req.body[key][index]);
                    // }

                    if (arrToString == ''){coma2 = '';}
                    else {coma2 = ', ';}

                    arrToString = arrToString + coma2 + quotes + val +quotes; 
                }
                if (dataVisitors == ''){coma = '';}
                else {coma = ', ';}
                dataVisitors = dataVisitors + coma + '(' + arrToString + ')'; 
                arrToString = ''; 
            }
            req.body.regnum = req.body.regnum.join(', ');
            console.log('dataVisitors: ', dataVisitors);
            console.log('req.body.regnum: ', req.body.regnum);
            
            Visitors.createGroup(dataVisitors, req.body.regnum, function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                // видаляємо внесені дані з таблиці visitors_create
                deleteIn(req, 'visitors_create', function (err, doc2) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500);
                    }
                    res.send(doc2); 
                });
            });
        }
    })
}

//-------------------------------------------------------------------------------------------------------------
//редагувати n-записів в таблиці visitors (regnum відомий) //схожий до попереднього метода. Потрібно обєднати!!!
exports.updateGroup = function(req, res) {
    //перевіряємо права
    ControllersShared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return cb(err, null);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return cb(err, [{
                    "rights": "false",
                }]);
            }
            // тут теба видалити записи які будуть оновлені
            // формуємо строку в потрібному форматі для видалення
            req.body.regnum = req.body.regnum.join(', ');
            deleteIn(req, 'visitors', function (err, doc2) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                // створюємо нові записи на місці видалених
                // повертаємо req.body.regnum до попереднього вигляду
                req.body.regnum = req.body.regnum.split(', ');
                console.log('array of data: ', req.body);
                // формуємо строку в потрібному форматі для внесення 
                let dataVisitors = '';
                let coma = ', ';
                let coma2 = ', ';
                let arrToString = '';
                let quotes = '';
                let val;
                for (let index = 0; index < req.body.regnum.length; index++) {
                    for(let key in req.body){
                        val = req.body[key][index];
                        if (typeof val === 'string'){
                            quotes = "'";
                            val = val.replace(/'/g, "\\'" );
                        }
                        else {quotes = ''}
                        if (arrToString == ''){coma2 = '';}
                        else {coma2 = ', ';}
                        arrToString = arrToString + coma2 + quotes + val +quotes; 
                    }
                    if (dataVisitors == ''){coma = '';}
                    else {coma = ', ';}
                    dataVisitors = dataVisitors + coma + '(' + arrToString + ')'; 
                    arrToString = ''; 
                }
                req.body.regnum = req.body.regnum.join(', ');
                console.log('dataVisitors: ', dataVisitors);
                console.log('req.body.regnum: ', req.body.regnum);
                
                Visitors.createGroup(dataVisitors, req.body.regnum, function(err, doc){
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500);
                    }
                    // видаляємо внесені дані з таблиці visitors_create
                    deleteIn(req, 'visitors_edit', function (err, doc2) {
                        if (err) {
                            console.log(err);
                            return res.sendStatus(500);
                        }
                        res.send(doc2); 
                    });
                });
            }); 
        }
    })
}


//-------------------------------------------------------------------------------------------------------------
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

//-------------------------------------------------------------------------------------------------------------

// exports.createInExhibition_vis = function(req, res) {
//     let date_vis;
//     let date_reg;
//     if(req.body.date_vis){date_vis = Visitors.curentDate(req.body.date_vis)}
//     else date_vis = '';
//     if(req.body.date_reg){date_reg = Visitors.curentDate(req.body.date_reg)}
//     else date_reg = '';
//     var visitorData = [
//         req.body.id_exhibition,
//         req.body.id_visitor,
//         req.body.registered,
//         req.body.visited,
//         //Visitors.curentDate(req.body.date_vis),
//         //Visitors.curentDate(req.body.date_reg)
//         date_vis,
//         date_reg
//     ];
//     Visitors.createExhibition_vis(visitorData, function(err, doc){
//         if (err) {
//             console.log(err);
//             return res.sendStatus(500);
//         }
//         res.send(doc);
//     });     
// };

//-------------------------------------------------------------------------------------------------------------

// exports.editExhibition_vis = function(req, res) {
//     var visitorData = [
//         req.body.visited,
//         Visitors.curentDate(req.body.date_vis),
//         req.body.id_visitor,
//         req.body.id_exhibition,
//     ];
//     console.log('editExhibition_vis data: ',visitorData)
//     Visitors.editExhibition_vis(visitorData, function(err, doc){
//         if (err) {
//             console.log(err);
//             return res.sendStatus(500);
//         }
//         res.send(doc);
//     });     
// };

//-------------------------------------------------------------------------------------------------------------


// exports.edit = function(req, res) {
//     var visitorData = [
//         req.body.email,
//         req.body.prizv,
//         req.body.city,
//         req.body.cellphone,
//         req.body.regnum
//     ];
//     Visitors.edit(visitorData, function(err, doc){
//         if (err) {
//             console.log(err);
//             return res.sendStatus(500);
//         }
//         res.send(doc);
//     });   
// };


//-------------------------------------------------------------------------------------------------------------
//Редагування запису
// let editProIn = function(req, res) {
//     var visitorData = [
//         req.body.email,
//         req.body.prizv,
//         req.body.city,
//         req.body.cellphone,
//         req.body.potvid,
//         req.body.name,
//         req.body.countryid,
//         req.body.regionid,
//         req.body.m_robotu,
//         req.body.pobatkovi,
//         req.body.posada,
//         req.body.sferadij,
//         Visitors.curentDate(req.body.datawnesenny),
//         99,
//         req.body.prizv+' '+req.body.name+' '+req.body.pobatkovi,
//         req.body.postindeks,
//         req.body.address,
//         req.body.postaddreses,
//         req.body.telephon,
//         req.body.gender,
//         req.body.type,
//         req.body.kompeten,
//         Visitors.curentDate(),
//         req.body.rating,
//         req.body.regnum
//     ];
//     if (req.body.checkEmail == false){//якщо поле не змінювалося то пропускаємо перевірку на співпадіння
//         if(req.body.checkPhone == false){
//             //створюємо новий запис
//             console.log('start creating'); 
//             Visitors.editPro(visitorData, req.body.table, function(err4, doc4){
//                 if (err4) {
//                     console.log('err4: ',err4);
//                     return res.sendStatus(500);
//                 }
//                 return res.send(doc4);
//             });
//         }
//         else{
//             //перевірка чи не зайнятий cellphone
//             var fild2 = 'cellphone';
//             var visitorData3 = [
//                 req.body[fild2],
//                 req.body[fild2],
//                 req.body[fild2]
//             ];
//             Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
//                 if (err4) {
//                     console.log(err4);
//                     return res.sendStatus(500);
//                 }
//                 console.log('check result on cellphone: ', doc4);
//                 if (doc4){
//                     if (doc4[0] == undefined || doc4[0].cellphone == ''){
//                         //створюємо новий запис в табл
//                         console.log('start creating'); 
//                         Visitors.editPro(visitorData, req.body.table, function(err3, doc3){
//                             if (err3) {
//                                 console.log(err3);
//                                 return res.sendStatus(500);
//                             }
//                             res.send(doc3);
//                         });
//                     }
//                     else{
//                         console.log('phone found');
//                         return res.send(doc4)
//                     }
//                 }
//             }); 
//         }
//     }
//     else{
//         //перевірка чи не зайнятий email
//         var fild = 'email';
//         var visitorData2 = [
//             req.body[fild],
//             req.body[fild],
//             req.body[fild]
//         ];
//         Visitors.getEmail(visitorData2, fild, function(err2, doc2){
//             if (err2) {
//                 console.log(err2);
//                 return res.sendStatus(500);
//             }
//             console.log('check result on email: ', doc2);
//             if (doc2){
//                 if (doc2[0] == undefined || doc2[0].email == ''){
//                     if(req.body.checkPhone == false){
//                         //створюємо новий запис в табл
//                         console.log('start creating'); 
//                         Visitors.editPro(visitorData, req.body.table, function(err4, doc4){
//                             if (err4) {
//                                 console.log(err4);
//                                 return res.sendStatus(500);
//                             }
//                             return res.send(doc4);
//                         });
//                     }
//                     else{
//                         //перевірка чи не зайнятий cellphone
//                         var fild2 = 'cellphone';
//                         var visitorData3 = [
//                             req.body[fild2],
//                             req.body[fild2],
//                             req.body[fild2]
//                         ];
//                         Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
//                             if (err4) {
//                                 console.log(err4);
//                                 return res.sendStatus(500);
//                             }
//                             console.log('check result on cellphone: ', doc4);
//                             if (doc4){
//                                 if (doc4[0] == undefined || doc4[0].cellphone == ''){
//                                     //створюємо новий запис в табл
//                                     console.log('start creating'); 
//                                     Visitors.editPro(visitorData, req.body.table, function(err3, doc3){
//                                         if (err3) {
//                                             console.log(err3);
//                                             return res.sendStatus(500);
//                                         }
//                                         res.send(doc3);
//                                     });
//                                 }
//                                 else{
//                                     console.log('phone found');
//                                     return res.send(doc4)
//                                 }
//                             }
//                         });
//                     }
                    
//                 }
//                 else{
//                     console.log('email found');
//                     return res.send(doc2)
//                 }
//             }
//         });
//     }   
// };

//Редагування запису
//   !!! винести в окремий файл !!!
let editProIn = function(req, table, cb) {
    let reg_user;
    let sending;
    ControllersShared.getRights(req.query.login, function(err, doc){
        console.log('doc: ', doc);
        if (err) {
            console.log('err: ',err);
            return res.sendStatus(500);
        }
        if(!doc) reg_user = 99
        else reg_user = doc.id;

        if(req.body.sending) sending = 1
        else sending = 0;

        var visitorData = [
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
            Visitors.curentDate(req.body.datawnesenny),
            reg_user,
            req.body.prizv+' '+req.body.name+' '+req.body.pobatkovi,
            req.body.postindeks,
            req.body.address,
            req.body.postaddreses,
            req.body.telephon,
            req.body.gender,
            req.body.type,
            req.body.kompeten,
            Visitors.curentDate(),
            req.body.rating,
            sending,
            req.body.regnum
        ];
        if (req.body.checkEmail == false){//якщо поле не змінювалося то пропускаємо перевірку на співпадіння
            if(req.body.checkPhone == false){
                //створюємо новий запис
                console.log('start creating'); 
                Visitors.editPro(visitorData, table, function(err4, doc4){
                    if (err4) {
                        console.log('err4: ',err4);
                        return cb(err4, doc4);
                    }
                    return cb(err4, doc4);
                });
            }
            else{
                //перевірка чи не зайнятий cellphone
                var fild2 = 'cellphone';
                var visitorData3 = [
                    req.body[fild2],
                    req.body[fild2],
                    req.body[fild2]
                ];
                Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
                    if (err4) {
                        console.log(err4);
                        return cb(err4, doc4);
                    }
                    console.log('check result on cellphone: ', doc4);
                    if (doc4){
                        if (doc4[0] == undefined || doc4[0].cellphone == ''){
                            //створюємо новий запис в табл
                            console.log('start creating'); 
                            Visitors.editPro(visitorData, table, function(err3, doc3){
                                if (err3) {
                                    console.log(err3);
                                    return cb(err3, doc3);
                                }
                                return cb(err3, doc3);
                            });
                        }
                        else{
                            console.log('phone found: ', doc4);
                            return cb(err4, [{
                                "found": "phone",
                            }]);
                        }
                    }
                }); 
            }
        }
        else{
            //перевірка чи не зайнятий email
            var fild = 'email';
            var visitorData2 = [
                req.body[fild],
                req.body[fild],
                req.body[fild]
            ];
            Visitors.getEmail(visitorData2, fild, function(err2, doc2){
                if (err2) {
                    console.log(err2);
                    return cb(err2, doc2);
                }
                console.log('check result on email: ', doc2);
                if (doc2){
                    if (doc2[0] == undefined || doc2[0].email == ''){
                        if(req.body.checkPhone == false){
                            //створюємо новий запис в табл
                            console.log('start creating'); 
                            Visitors.editPro(visitorData, table, function(err4, doc4){
                                if (err4) {
                                    console.log(err4);
                                    return cb(err4, doc4);
                                }
                                return cb(err4, doc4);
                            });
                        }
                        else{
                            //перевірка чи не зайнятий cellphone
                            var fild2 = 'cellphone';
                            var visitorData3 = [
                                req.body[fild2],
                                req.body[fild2],
                                req.body[fild2]
                            ];
                            Visitors.getEmail(visitorData3, fild2, function(err4, doc4){
                                if (err4) {
                                    console.log(err4);
                                    return cb(err4, doc4);
                                }
                                console.log('check result on cellphone: ', doc4);
                                if (doc4){
                                    if (doc4[0] == undefined || doc4[0].cellphone == ''){
                                        //створюємо новий запис в табл
                                        console.log('start creating'); 
                                        Visitors.editPro(visitorData, table, function(err3, doc3){
                                            if (err3) {
                                                console.log(err3);
                                                return cb(err3, doc3);
                                            }
                                            return cb(err3, doc3);
                                        });
                                    }
                                    else{
                                        console.log('phone found: ', doc4);
                                        return cb(err4, [{
                                            "found": "phone",
                                        }]);
                                    }
                                }
                            });
                        }
                        
                    }
                    else{
                        console.log('email found: ', doc2);
                        return cb(err2, [{
                            "found": "email",
                        }]);
                    }
                }
            });
        }
    })   
};

//-------------------------------------------------------------------------------------------------------------
//Редагування запису
exports.editPro = function(req, res) {
    editProIn(req, req.body.table, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        console.log('doc: ', doc);
        return res.send(doc); 
    });
}

//-------------------------------------------------------------------------------------------------------------
exports.getSpecCond = function(req, res) {
    var fild = req.body.condition;
    var visitorData = [
        req.body[fild],
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

//-------------------------------------------------------------------------------------------------------------

// exports.getEmail = function(req, res) {
//     var visitorData;
//     var fild;
//     if(!req.body.email){
//         visitorData = [
//             req.body.cellphone,
//             req.body.cellphone
//         ];
//         fild = 'cellphone';
//     }
//     else{
//         visitorData = [
//             req.body.email,
//             req.body.email
//         ];
//         fild = 'email';
//     }
    
//     Visitors.getEmail(visitorData, fild, function(err, doc){
//         if (err) {
//             console.log(err);
//             return res.sendStatus(500);
//         }
//         if(doc == ''){
//             if(!req.body.cellphone){return res.send(doc);}
//             visitorData = [
//                 req.body.cellphone,
//                 req.body.cellphone
//             ];
//             fild = 'cellphone';
//             Visitors.getEmail(visitorData, fild, function(err, doc){
//                 if (err) {
//                     console.log(err);
//                     return res.sendStatus(500);
//                 }
//                 console.log('doc2: ', doc);
//                 return res.send(doc);
//             });
//         }
//         else{
//             console.log('doc: ', doc)
//             res.send(doc);
//         }
        
//     });   
// };

//-------------------------------------------------------------------------------------------------------------
// перевіряє права на видалення та видаляє 
// має отримати req який має містити [req.query.login, req.body.regnum] та назву таблиці з якої робимо видалення 
//   !!! винести в окремий файл !!!
let deleteIn = function(req, tableName, cb) {
    ControllersShared.getRights(req.query.login, function(err, doc){
        if (err) {
            console.log('err: ',err);
            return cb(err, null);
        }
        else {
            console.log('rights cb: ', doc.insupdvisitors);
            if(![3,4,5].includes(doc.insupdvisitors)){  
                console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                return cb(err, [{
                    "rights": "false",
                }]);
            }
            else{
                if(['visitors', 'exhibition_vis'].includes(tableName) && [3].includes(doc.insupdvisitors)){
                    console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                    return cb(err, [{
                        "rights": "false",
                    }]); 
                }
                else{
                    Visitors.delete(tableName, req.body.regnum, function(err, doc){
                        if (err) {
                            console.log(err);
                            return cb(err, null);
                        }
                        cb(err, doc);
                    });
                }     
            }
        }
    })   
};

//-------------------------------------------------------------------------------------------------------------
exports.delete = function(req, res){
    deleteIn(req, req.body.tableName, function (err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc); 
    });
}

//------------------------------------------------------------------------------------------------------------- 
//робить все!
exports.editPro2 = function(req, res){
    //визначаємо в яких таблицях є такий регнам
    ControllersShared.getTablesOnRegnum(req.body.regnum, function (err, tables) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        console.log('getTablesOnRegnum: ', tables);
        //визначаємо права доступу
        ControllersShared.getRights(req.query.login, function(err, rights){
            if (err) {
                console.log('err: ',err);
                return res.sendStatus(500);
            }
            else {
                //якщо повний доступ
                if(rights && [3,4,5].includes(rights.insupdvisitors)){
                    //якщо запис є в visitors_edit
                    if(tables.includes('visitors_edit')){
                        console.log('запис є в visitors_edit');
                        //редагуємо запис в visitors
                        editProIn(req, 'visitors', function(err, doc){
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            //якщо є співпадіння по email/cellphone
                            if(doc[0]){
                                if(doc[0].found){
                                    return res.send(doc);
                                }
                            }
                            //якщо нема то видаляємо запис в visitors_edit
                            else{
                                deleteIn(req, 'visitors_edit', function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                        return res.sendStatus(500);
                                    }
                                    return res.send(doc); 
                                });
                            }
                        });
                    }
                    //якщо запис є в visitors_create
                    else if(tables.includes('visitors_create')){
                        console.log('запис є в visitors_create');
                        //створюємо новий запис в visitors
                        editRequestIn(req, 'visitors', function(err, doc){
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            //якщо є співпадіння по email/cellphone
                            if(doc[0]){
                                if(doc[0].found){
                                    return res.send(doc);
                                }
                            }
                            //якщо нема то видаляємо запис в visitors_create
                            else{
                                deleteIn(req, 'visitors_create', function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                        return res.sendStatus(500);
                                    }
                                    return res.send(doc); 
                                });
                            }
                        });
                    }
                    //якщо запис тільки в visitors
                    else {
                        console.log('запис тільки в visitors');
                        editProIn(req, 'visitors', function(err, doc){
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            //якщо є співпадіння по email/cellphone
                            if(doc[0]){
                                if(doc[0].found){
                                    return res.send(doc);
                                }
                            }
                            return res.send(doc); 
                        });
                    }
                }
                //якщо обмежений доступ
                //if([0,1,2].includes(rights.insupdvisitors)){
                else{
                    //якщо запис є в visitors_edit
                    if(tables.includes('visitors_edit')){
                        console.log('запис є в visitors_edit, обмежений доступ');
                        editProIn(req, 'visitors_edit', function(err, doc){
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            //якщо є співпадіння по email/cellphone
                            if(doc[0]){
                                if(doc[0].found){
                                    return res.send(doc);
                                }
                            }
                            return res.send(doc); 
                        });
                    }
                    //якщо запис є в visitors_create
                    else if(tables.includes('visitors_create')){
                        console.log('запис є в visitors_create, обмежений доступ');
                        editProIn(req, 'visitors_create', function(err, doc){
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            //якщо є співпадіння по email/cellphone
                            if(doc[0]){
                                if(doc[0].found){
                                    return res.send(doc);
                                }
                            }
                            return res.send(doc); 
                        });
                    }
                    //якщо запис тільки в visitors
                    else {
                        console.log('запис тільки в visitors, обмежений доступ');
                        editRequestIn(req, 'visitors_edit', function(err, doc){
                            if (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            //якщо є співпадіння по email/cellphone
                            if(doc[0]){
                                if(doc[0].found){
                                    return res.send(doc);
                                }
                            }
                            return res.send(doc); 
                        });
                    }
                }
            }
        });
    });
}
//------------------------------------------------------------------------------------------------------------- 
// пошук в трьох таблицях по емейлу або телефону

// exports.getRowOnCond = function(req, res) {
//     if(!req.body.email && !req.body.cellphone){return res.sendStatus(204)}
//     var visitorData;
//     var fild;
//     if(req.body.email == '' || req.body.email == null){
//         visitorData = [
//             req.body.cellphone
//         ];
//         fild = 'cellphone';
//     }
//     else{
//         visitorData = [
//             req.body.email,
//         ];
//         fild = 'email';
//     }
//     Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors_edit', function(err, doc){
//         if (err) {
//             console.log(err);
//             return res.sendStatus(500);
//         }
//         if(doc == ''){
//             Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors_create', function(err, doc){
//                 if (err) {
//                     console.log(err);
//                     return res.sendStatus(500);
//                 }
//                 if(doc == ''){
//                     Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors', function(err, doc){
//                         if (err) {
//                             console.log(err);
//                             return res.sendStatus(500);
//                         }
//                         if(doc == ''){
//                             console.log('doc is empty: ', doc);
//                             res.send(doc);
//                         }
//                         else{
//                             console.log('doc from visitors: ', doc);
//                             res.send(doc);
//                         }
                        
//                     });          
//                 }
//                 else{
//                     console.log('doc from visitors_create: ', doc);
//                     res.send(doc);
//                 }
                
//             });  
//         }
//         else{
//             console.log('doc from visitors_edit: ', doc)
//             res.send(doc);
//         }
        
//     });   
// };
//-------------------------------------------------------------------------------------------------------------
//скидання пароля*
exports.resetpassword = function(req, res) {
    let VisitorData;
    getVisitor(req.body.email, req.body.cellphone)
        .then(getVisitorData => {
            VisitorData = getVisitorData[0];
            if (!VisitorData || !VisitorData.email) throw {resetpassError: 'email not found'};
            return addPassword(VisitorData.regnum, '', VisitorData.password)
        })
        .then(data => Email.sendPasswordToEmail(data, VisitorData.email))
        .then(data => res.send(JSON.stringify(data)))
        .catch(err => {
            console.log(err);
            res.status(400).send(JSON.stringify(err));
        });
}

//-------------------------------------------------------------------------------------------------------------
//збереження нового пароля в таблицю passwords*
exports.changePass = function(req, res) {
    addPassword(req.body.regnum, req.body.password, req.body.firstpassword)
        .then(data => Email.sendPasswordToEmail(data, req.body.email))
        .then(data => res.send(JSON.stringify(data)))
        .catch(err => {
            console.log(err);
            res.status(400).send(JSON.stringify(err));
        });
}

function addPassword(regnum, password, firstpassword) {
    return new Promise((resolve, reject) => {
        Visitors.checkRegnumInPasswords(regnum)
            .then(data => {
                if(data.length > 0) return Visitors.editRowInPasswords([password, firstpassword, regnum])
                else return Visitors.createRowInPasswords([regnum, password, firstpassword])
            })
            .then(_ => resolve(`setpassword/?regnum=${regnum}&password=${password}&firstpassword=${firstpassword}`))
            .catch(err => reject(err));
    })
}

//-------------------------------------------------------------------------------------------------------------
//встановлення пароля у всіх таблицях*
exports.setpassword = function(req, res) {
    Visitors.checkRegnumInPasswords(req.query.regnum)
        .then(data => checkPasswordData(data, req.query.firstpassword))
        .then(data => {
            if(data === 'EDIT') return editPassword(req.query.regnum, req.query.password)
            else return data
        })
        .then(data => {
            if(data === 'DONE') return Visitors.delRowInPasswords([req.query.regnum])
            else return data
        })
        .then(data => res.send(JSON.stringify(data)))
        .catch(err => {
            console.log(err);
            res.status(400).send(JSON.stringify(err));
        });
}

function checkPasswordData(data, firstpassword) {
    if(data.length > 0){
        if(!data[0].firstpassword) return 'EDIT'
        else if(data[0].firstpassword === firstpassword) return 'EDIT'
        else return 'ERROR'
    }
    else return 'All necessary changes have already been made'
}

function editPassword(regnum, password) {
    const arr = ['visitors', 'visitors_create', 'visitors_edit'];
    return Promise.all(arr.map(table => Visitors.editPasswordInTable(table, [password, regnum]))).then(_ => "DONE")
}

//-------------------------------------------------------------------------------------------------------------
// пошук в трьох таблицях по емейлу або телефону *

class ArgumentgetRowOnCondPromise {
    constructor(value, field, table){
        this.value = value;
        this.field = field;
        this.table = table
    }
}

getVisitor = function(email, cellphone) {
    const arguments = [
        new ArgumentgetRowOnCondPromise(email, 'email', 'visitors_edit'),
        new ArgumentgetRowOnCondPromise(cellphone, 'cellphone', 'visitors_edit'),
        new ArgumentgetRowOnCondPromise(email, 'email', 'visitors_create'),
        new ArgumentgetRowOnCondPromise(cellphone, 'cellphone', 'visitors_create'),
        new ArgumentgetRowOnCondPromise(email, 'email', 'visitors'),
        new ArgumentgetRowOnCondPromise(cellphone, 'cellphone', 'visitors')
    ];
    let promise = Promise.resolve([]);
    arguments.forEach(argument => {
        promise = promise
            .then(res => {
                //console.log('res: ', res);
                if (!res || res.length == 0) return Visitors.getRowOnCondFromTablePromise([argument.value], argument.field, argument.table)
                    .then(data => {
                        //console.log(`data from ${argument.table} on ${argument.field}:`, data);
                        if(data.length > 0) {
                            data.push({
                                "receivedTable": argument.table,
                                "receivedParam": argument.field
                            });
                            return data
                        }
                    })
                return res;    
            })
                
    })
    return promise
}

exports.getRowOnCond3 = function(req, res) {
    let visitorData = [];
    getVisitor(req.body.email, req.body.cellphone)
        .then(getVisitorData => {
            if(getVisitorData) {
                visitorData = getVisitorData;
                return Visitors.getPassPromise(getVisitorData[0].regnum, getVisitorData[1].receivedTable)
            }
            return []
        })
        .then(getPassPromiseData => {
            if(getPassPromiseData[0] && getPassPromiseData[0].password){
                if(getPassPromiseData[0].password != req.body.password) return res.send(['incorrect password'])
            }
            res.send(visitorData)
        })
}
//-------------------------------------------------------------------------------------------------------------

// пошук в трьох таблицях по емейлу або телефону 2***

exports.getRowOnCond2 = function(req, res) {
    if(!req.body.email && !req.body.cellphone){return res.sendStatus(400)} //якщо немає даних в запиті то повертаємо помилку
    else{
        let visitorData;
        let fild;
        if(req.body.email && req.body.cellphone){
            // якщо є email починаємо послідовну перевірку в 3-х таблицях по емейлу та телефону якщо він є
            Visitors.getRowOnCondFromTable([req.body.email], 'email', 'visitors_edit', function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                if(doc == ''){
                    //якщо у visitors_edit не знайдено даних по емейл - перевіряємо по телефону
                    Visitors.getRowOnCondFromTable([req.body.cellphone], 'cellphone', 'visitors_edit', function(err, doc){
                        if (err) {
                            console.log(err);
                            return res.sendStatus(500);
                        }
                        if(doc == ''){
                            //якщо у visitors_edit не знайдено даних по cellphone - перевіряємо по email in visitors_create
                            //recurs...
                            Visitors.getRowOnCondFromTable([req.body.email], 'email', 'visitors_create', function(err, doc){
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(500);
                                }
                                if(doc == ''){
                                    //якщо у visitors_create не знайдено даних по емейл - перевіряємо по телефону
                                    Visitors.getRowOnCondFromTable([req.body.cellphone], 'cellphone', 'visitors_create', function(err, doc){
                                        if (err) {
                                            console.log(err);
                                            return res.sendStatus(500);
                                        }
                                        if(doc == ''){
                                            //якщо у visitors_create не знайдено даних по cellphone - перевіряємо по email in visitors
                                            //recurs...
                                            Visitors.getRowOnCondFromTable([req.body.email], 'email', 'visitors', function(err, doc){
                                                if (err) {
                                                    console.log(err);
                                                    return res.sendStatus(500);
                                                }
                                                if(doc == ''){
                                                    //якщо у visitors не знайдено даних по емейл - перевіряємо по телефону
                                                    Visitors.getRowOnCondFromTable([req.body.cellphone], 'cellphone', 'visitors', function(err, doc){
                                                        if (err) {
                                                            console.log(err);
                                                            return res.sendStatus(500);
                                                        }
                                                        if(doc == ''){
                                                            //якщо у visitors не знайдено даних по cellphone - повертаємо null
                                                            //recurs...
                                                            console.log('doc is empty: ', doc);
                                                            // doc.push({
                                                            //     "receivedTable": "",
                                                            //     "receivedParam": ""
                                                            // });
                                                            res.send(doc);
                                                        }
                                                        else{
                                                            //дані у visitors по cellphone знайдено, повертаємо їх клієнту
                                                            console.log('doc from visitors on cellphone: ', doc);
                                                            doc.push({
                                                                "receivedTable": "visitors",
                                                                "receivedParam": "cellphone"
                                                            });
                                                            res.send(doc);
                                                        } 
                                                    })
                                                }
                                                else{
                                                    //дані у visitors по email знайдено, повертаємо їх клієнту
                                                    console.log('doc from visitors on email: ', doc);
                                                    doc.push({
                                                        "receivedTable": "visitors",
                                                        "receivedParam": "email"
                                                    });
                                                    res.send(doc);
                                                }  
                                            })
                                            
                                        }
                                        else{
                                            //дані у visitors_create по cellphone знайдено, повертаємо їх клієнту
                                            console.log('doc from visitors_create on cellphone: ', doc);
                                            doc.push({
                                                "receivedTable": "visitors_create",
                                                "receivedParam": "cellphone"
                                            })
                                            res.send(doc);
                                        } 
                                    })
                                }
                                else{
                                    //дані у visitors_create по email знайдено, повертаємо їх клієнту
                                    console.log('doc from visitors_create on email: ', doc);
                                    doc.push({
                                        "receivedTable": "visitors_create",
                                        "receivedParam": "email"
                                    })
                                    res.send(doc);
                                }  
                            })
                        }
                        else{
                            //дані у visitors_edit по cellphone знайдено, повертаємо їх клієнту
                            console.log('doc from visitors_edit on cellphone: ', doc);
                            doc.push({
                                "receivedTable": "visitors_edit",
                                "receivedParam": "cellphone"
                            })
                            res.send(doc);
                        } 
                    })
                }
                else{
                    //дані у visitors_edit по email знайдено, повертаємо їх клієнту
                    console.log('doc from visitors_edit on email: ', doc);
                    doc.push({
                        "receivedTable": "visitors_edit",
                        "receivedParam": "email"
                    })
                    res.send(doc);
                }  
            })

        }
        else if(!req.body.email && req.body.cellphone){
            //є тільки телефон, перевіряємо в 3-х таблицях тільки телефон
            visitorData = [req.body.cellphone];
            fild = 'cellphone';
            Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors_edit', function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                if(doc == ''){
                    Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors_create', function(err, doc){
                        if (err) {
                            console.log(err);
                            return res.sendStatus(500);
                        }
                        if(doc == ''){
                            Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors', function(err, doc){
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(500);
                                }
                                if(doc == ''){
                                    console.log('doc(cellphone) is empty: ', doc);
                                    // doc.push({
                                    //     "receivedTable": "",
                                    //     "receivedParam": ""
                                    // })
                                    res.send(doc);
                                }
                                else{
                                    console.log('doc(cellphone) from visitors: ', doc);
                                    doc.push({
                                        "receivedTable": "visitors",
                                        "receivedParam": "cellphone"
                                    })
                                    res.send(doc);
                                }
                                
                            });          
                        }
                        else{
                            console.log('doc(cellphone) from visitors_create: ', doc);
                            doc.push({
                                "receivedTable": "visitors_create",
                                "receivedParam": "cellphone"
                            })
                            res.send(doc);
                        }
                        
                    });  
                }
                else{
                    console.log('doc(cellphone) from visitors_edit: ', doc);
                    doc.push({
                        "receivedTable": "visitors_edit",
                        "receivedParam": "cellphone"
                    })
                    res.send(doc);
                }
            });
        }  
        else {
            //є тільки email, перевіряємо в 3-х таблицях тільки email
            visitorData = [req.body.email];
            fild = 'email';
            Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors_edit', function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                if(doc == ''){
                    Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors_create', function(err, doc){
                        if (err) {
                            console.log(err);
                            return res.sendStatus(500);
                        }
                        if(doc == ''){
                            Visitors.getRowOnCondFromTable(visitorData, fild, 'visitors', function(err, doc){
                                if (err) {
                                    console.log(err);
                                    return res.sendStatus(500);
                                }
                                if(doc == ''){
                                    console.log('doc(email) is empty: ', doc);
                                    // doc.push({
                                    //     "receivedTable": "",
                                    //     "receivedParam": ""
                                    // })
                                    res.send(doc);
                                }
                                else{
                                    console.log('doc(email) from visitors: ', doc);
                                    doc.push({
                                        "receivedTable": "visitors",
                                        "receivedParam": "email"
                                    })
                                    res.send(doc);
                                }
                                
                            });          
                        }
                        else{
                            console.log('doc(email) from visitors_create: ', doc);
                            doc.push({
                                "receivedTable": "visitors_create",
                                "receivedParam": "email"
                            })
                            res.send(doc);
                        }
                        
                    });  
                }
                else{
                    console.log('doc(email) from visitors_edit: ', doc);
                    doc.push({
                        "receivedTable": "visitors_edit",
                        "receivedParam": "email"
                    })
                    res.send(doc);
                }
            });
        }           
    } 
};

//-------------------------------------------------------------------------------------------------------------  
//редагування(видалення) запису з вказаного поля вказаної таблиці

exports.editExhibition_del_rec = function(req, res) {
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
                let table = req.body.table;
                let field = req.body.field;
                let id = req.body.id;
                let ids = req.body.ids;
                console.log('req.id_exhibition: ',req.body.id_exhibition);
                console.log('id_visitors: ',req.body.id_visitor);
                SQLCommon.editExhibition_del_rec(table, field, id, ids, function(err, doc2){
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