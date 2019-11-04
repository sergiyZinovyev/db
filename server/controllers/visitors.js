var Visitors = require('../models/sql-visitors');
var Shared = require('../models/shared');
var ControllersShared = require('../controllers/shared');


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
// отримати візіторів
exports.getVisitors = function(req, res) {
    let table;
    let condition;
    table = req.params.id;
    console.log('req.query.id: ',req.query.id);
    if(req.query.id > 0){condition = `where regnum=${req.query.id}`}
    else {condition = ''}
    console.log('condition: ',condition);
    Visitors.getVisitors(table, condition, function(err, doc) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });    
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
	Shared.file(req.params.id, function(err, doc) {
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
            req.body.rating
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
                req.body.rating
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
                console.log('check result on email: ', doc2);
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
//створити n-записів в таблиці visitors (regnum відомий)
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
            let dataVisitors;
            Visitors.createGroup(dataVisitors, function(err, doc){
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                // видаляємо внесені дані з таблиці visitors_create
                console.log('doc: ', doc);
                return res.send(doc); 
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
        //визначаємо права доступу
        ControllersShared.getRights(req.query.login, function(err, rights){
            if (err) {
                console.log('err: ',err);
                return res.sendStatus(500);
            }
            else {
                // res.send([{
                //     "tables": tables,
                //     "rights": rights.insupdvisitors
                // }]);
                console.log(tables);
                //console.log('rights cb: ', rights.insupdvisitors);
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