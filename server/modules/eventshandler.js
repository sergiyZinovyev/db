const SQLEmail = require('../models/sql-email');

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

                       
            

