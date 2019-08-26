var Visitors = require('../models/sql-visitors');
var Shared = require('../models/shared');

exports.all = function(req, res) {
	Visitors.all(req.params.id, function(err, doc) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		res.send(doc);
	});
};

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
                res.send([
                    {
                        "password": "true",
                        "login": "true"
                    },
                    {
                        'accessRights': doc[0].insupdvisitors,
                        'id': doc[0].id
                    }
                ]);
            }
            else{
                console.log(doc);
                res.send([{
                    "password": "false",
                    "login": "true"
                }]);
            }
        }
		else{
            console.log(doc);
            res.send([{
                "password": "false",
                "login": "false"
            }]);
        }
	});
};

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
//порівняти з наступним методом та обєднати методи
exports.editRequest = function(req, res) {
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
        99,
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
            Visitors.create(visitorData, req.body.table, function(err4, doc4){
                if (err4) {
                    console.log('err4: ',err4);
                    return res.sendStatus(500);
                }
                return res.send(doc4);
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
                    return res.sendStatus(500);
                }
                console.log('check result on cellphone: ', doc4);
                if (doc4){
                    if (doc4[0] == undefined || doc4[0].cellphone == ''){
                        //створюємо новий запис в табл
                        console.log('start creating'); 
                        Visitors.create(visitorData, req.body.table, function(err3, doc3){
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
                return res.sendStatus(500);
            }
            console.log('check result on email: ', doc2);
            if (doc2){
                if (doc2[0] == undefined || doc2[0].email == ''){
                    if(req.body.checkPhone == false){
                        //створюємо новий запис в табл
                        console.log('start creating'); 
                        Visitors.create(visitorData, req.body.table, function(err4, doc4){
                            if (err4) {
                                console.log(err4);
                                return res.sendStatus(500);
                            }
                            return res.send(doc4);
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
                                return res.sendStatus(500);
                            }
                            console.log('check result on cellphone: ', doc4);
                            if (doc4){
                                if (doc4[0] == undefined || doc4[0].cellphone == ''){
                                    //створюємо новий запис в табл
                                    console.log('start creating'); 
                                    Visitors.create(visitorData, req.body.table, function(err3, doc3){
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
                    
                }
                else{
                    console.log('email found');
                    return res.send(doc2)
                }
            }
        });
    } 
};

//-------------------------------------------------------------------------------------------------------------

exports.createCpecTable = function(req, res) {
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
            99,
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
                                Visitors.create(visitorData, req.body.table, function(err3, doc3){
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
exports.editPro = function(req, res) {
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
        99,
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
            Visitors.editPro(visitorData, req.body.table, function(err4, doc4){
                if (err4) {
                    console.log('err4: ',err4);
                    return res.sendStatus(500);
                }
                return res.send(doc4);
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
                    return res.sendStatus(500);
                }
                console.log('check result on cellphone: ', doc4);
                if (doc4){
                    if (doc4[0] == undefined || doc4[0].cellphone == ''){
                        //створюємо новий запис в табл
                        console.log('start creating'); 
                        Visitors.editPro(visitorData, req.body.table, function(err3, doc3){
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
                return res.sendStatus(500);
            }
            console.log('check result on email: ', doc2);
            if (doc2){
                if (doc2[0] == undefined || doc2[0].email == ''){
                    if(req.body.checkPhone == false){
                        //створюємо новий запис в табл
                        console.log('start creating'); 
                        Visitors.editPro(visitorData, req.body.table, function(err4, doc4){
                            if (err4) {
                                console.log(err4);
                                return res.sendStatus(500);
                            }
                            return res.send(doc4);
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
                                return res.sendStatus(500);
                            }
                            console.log('check result on cellphone: ', doc4);
                            if (doc4){
                                if (doc4[0] == undefined || doc4[0].cellphone == ''){
                                    //створюємо новий запис в табл
                                    console.log('start creating'); 
                                    Visitors.editPro(visitorData, req.body.table, function(err3, doc3){
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
                    
                }
                else{
                    console.log('email found');
                    return res.send(doc2)
                }
            }
        });
    }   
};

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

exports.delete = function(req, res) {
    Visitors.delete(req.body.tableName, req.body.regnum, function(err, doc){
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(doc);
    });   
};

//-------------------------------------------------------------------------------------------------------------
// пошук в трьох таблицях по емейлу або телефону

exports.getRowOnCond = function(req, res) {
    if(!req.body.email && !req.body.cellphone){return res.sendStatus(204)}
    var visitorData;
    var fild;
    if(req.body.email == '' || req.body.email == null){
        visitorData = [
            req.body.cellphone
        ];
        fild = 'cellphone';
    }
    else{
        visitorData = [
            req.body.email,
        ];
        fild = 'email';
    }
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
                            console.log('doc is empty: ', doc);
                            res.send(doc);
                        }
                        else{
                            console.log('doc from visitors: ', doc);
                            res.send(doc);
                        }
                        
                    });          
                }
                else{
                    console.log('doc from visitors_create: ', doc);
                    res.send(doc);
                }
                
            });  
        }
        else{
            console.log('doc from visitors_edit: ', doc)
            res.send(doc);
        }
        
    });   
};

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