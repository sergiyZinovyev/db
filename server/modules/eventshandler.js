const SQLEmail = require('../models/sql-email');
const SQLVisitors = require('../models/sql-visitors');
const SQLVisitorsExhib = require('../models/sql-exhib');

// отримати дані по вказаній розсилці
exports.getMailing = function(mailingId){
    console.log('########################### Message from socket getMailing ##########################', mailingId);
    return new Promise((resolve, reject) => {
        SQLEmail.getMailingPlus(mailingId, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%% data from mailingId received %%%%%%%%%%%%%%%%%%%%%%%%%%%');
            let data = {
                event: 'getMailingPlus',
                data: doc
            }
            return resolve(JSON.stringify(data))
        }) 
    })
}

// отримати дані по вказаному листу
exports.getMessage = function(messageId){
    console.log('########################### Message from socket getMessage ##########################', messageId);
    return new Promise((resolve, reject) => {
        SQLEmail.getMessage(messageId, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%% data from messageId received %%%%%%%%%%%%%%%%%%%%%%%%%%%');
            let data = {
                event: 'createEditMessage',
                data: doc
            }
            return resolve(JSON.stringify(data))
        }) 
    })
}

// дані по вказаному емейлу
exports.getEmail = function(d){
    console.log('########################### Message from socket getEmail ##########################', d);
    return new Promise((resolve, reject) => {
        SQLEmail.getEmailData(d, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%% data from getEmail received %%%%%%%%%%%%%%%%%%%%%%%%%%%');
            let data = {
                event: 'editVisitorsMailingLists',
                data: doc
            }
            return resolve(JSON.stringify(data)) 
        }) 
    })
}

// дані які були видалені
exports.getDelData = function(d){
    console.log('########################### Message from socket getDelData ##########################', d);
    return new Promise((resolve, reject) => {
        let data = {
            event: 'getDelData',
            data: d
        }
        return resolve(JSON.stringify(data)) 
    })
}

// дані які були змінені
exports.getEditData = function(d){
    console.log('########################### Message from socket editVisitor ##########################', d);
    let valEvent = 'newSocketEvent';
    let params = `WHERE id IN (${d.id})`;
    let data = {};
    return new Promise((resolve, reject) => {
        if(d.table == 'visitors' || d.table == 'visitors_edit' || d.table == 'visitors_create'){
            valEvent = 'getNewDataVisitors';
            params = `WHERE regnum IN (${d.id})`
            SQLVisitors.getVisitors(d.table, params, function(err, doc) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                data = {
                    event: valEvent,
                    data: {table: d.table, data: doc}
                }
                console.log('visitors:', JSON.stringify(data));
                return resolve(JSON.stringify(data)) 
            })
        }
        if(d.table == 'visitors_mailing_lists'){
            SQLEmail.getEmailData(d.id, function(err, doc) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                data = {
                    event: 'editVisitorsMailingLists',
                    data: doc
                }
                console.log('visitors_mailing_lists:', JSON.stringify(data));
                return resolve(JSON.stringify(data)) 
            })
        }
        // else {
        //     data = {
        //         event: valEvent,
        //         data: d
        //     }
        //     console.log('else:', JSON.stringify(data));
        //     return resolve(JSON.stringify(data)) 
        // }
        
    })
}

// дані які були змінені
exports.getEditDataVis = function(d){
    console.log('########################### Message from socket getEditDataVis ##########################', d);
    return new Promise((resolve, reject) => {
        let dataArr = [
            Number(d.id_exhibition),
            Number(d.id_exhibition),
            Number(d.id_exhibition),
            Number(d.id_exhibition),
            Number(d.id_exhibition),
            Number(d.id_exhibition),
        ];
        SQLVisitorsExhib.visexhib(dataArr, `AND id_vis IN (${d.id_vis})`, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            let data = {
                event: 'getNewDataVisitorsExhib',
                data: doc
            }
            return resolve(JSON.stringify(data)) 
        })
    })
}

// дані які були змінені
exports.getEditDataVis2 = function(val){
    console.log('########################### Message from socket getEditDataVis2 ##########################', val);
    return new Promise((resolve, reject) => {
        SQLVisitorsExhib.checkViv([val.id_visitor, val.id_exhibition], function(err, result){
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log('result: ', result);
            let d = {
                id_exhibition: result[0].id_exhibition,
                id_vis: result[0].id_vis
            }
            let dataArr = [
                Number(d.id_exhibition),
                Number(d.id_exhibition),
                Number(d.id_exhibition),
                Number(d.id_exhibition),
                Number(d.id_exhibition),
                Number(d.id_exhibition),
            ];
            SQLVisitorsExhib.visexhib(dataArr, `AND id_vis IN (${d.id_vis})`, function(err, doc) {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                let data = {
                    event: 'getNewDataVisitorsExhib',
                    data: doc
                }
                return resolve(JSON.stringify(data)) 
            })
        })
    })
}

// дані які були змінені (видалення відвідування)
// exports.getDelDataVis = function(d){
//     console.log('########################### Message from socket getDelDataVis ##########################', d);
//     return new Promise((resolve, reject) => {
//         SQLVisitorsExhib.checkViv2(d, function(err, doc) {
//             if (err) {
//                 console.log(err);
//                 return reject(err);
//             }
//             let data = {
//                 event: 'getNewDataVisitorsExhib',
//                 data: doc
//             }
//             return resolve(JSON.stringify(data)) 
//         })
//     })
// }

// зміна типу реєстрації відвідувачів
exports.getTypeOfReg = function(d){
    console.log('########################### Message from socket getTypeOfReg ##########################', d);
    return new Promise((resolve, reject) => {
        // SQLVisitorsExhib.checkViv2(d, function(err, doc) {
        //     if (err) {
        //         console.log(err);
        //         return reject(err);
        //     }
        //     let data = {
        //         event: 'getTypeOfReg',
        //         data: doc
        //     }
        //     return resolve(JSON.stringify(data)) 
        // })
        let data = {
            event: 'getTypeOfReg',
            data: d
        }
        return resolve(JSON.stringify(data)) 
})
}


                      
            

