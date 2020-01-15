const SQLEmail = require('../models/sql-email');

// отримати дані по вказаній розсилці
exports.getMailing = function(mailingId){
    console.log('########################### Message from socket ##########################', mailingId);
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

                       
            

