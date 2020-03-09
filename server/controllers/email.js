const nodemailer = require('nodemailer');
const fs = require('fs');
const Secure = require("../config");
const ControllersShared = require('../controllers/shared');
const SQLEmail = require('../models/sql-email');
const SQLCommon = require('../models/sql-common');
const EmailModule = require('../models/email-mod');
const AuthController = require('../controllers/auth');
//const EventEmitter = require('events');

const transporter = nodemailer.createTransport({
    host: Secure.Config.emailConfig.host,
    port: 587,
    secure: false, //disable SSL    
    requireTLS: true, //Force TLS 
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        pass: Secure.Config.emailConfig.pass,
        user: Secure.Config.emailConfig.user
    }
});

// const emitter = new EventEmitter();
// exports.emitter = emitter;

//-------------------------------------------------------------------------------------------------------------------------------------
exports.sendEmail = function(req, res){
    const mailOptions = {
        from: 'send@galexpo.lviv.ua', // sender address
        to: req.body.email, // list of receivers
        subject: 'Запрошення на виставку', // Subject line
        attachments: [
            {   
                path: req.body.file
            }
        ],
        html: `<p>Шановний(а) <strong>${req.body.prizv} ${req.body.name} ${req.body.pobatkovi}</strong>, у вкладенні Ви отримали персональне запрошення на виставку.</p>
                <p>Якщо Ви не змогли зберегти чи отримати на пошту повне запрошення зі штрихкодом то покажіть цей код на реєстрації:</p>
                <p><strong>${req.body.regnum}</strong></p>
                <p>З повагою ПрАТ "Гал-Експо"</p>`// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            console.log(err);
            //res.send(err)
        }   
        else{
            //console.log(info);
            res.send(info);
        }   
    });
}

//------------------------------------------------------------------------------------------------------------------------------------- 
exports.massMaling = function(req, res){
    //emitter.on('mailingSended', message => console.log('Message from email: ', message));
    const arrAccess = [3,4,5];
    let idUser;
    let mailingId;
    let data;
    AuthController.getUsersaccountId(req.query.login, arrAccess) //перевіряємо права доступу
        .then(data => {
            idUser = data;
            return EmailModule.checkToken(req.body.token)
        })
        .then(() => { //перевіряємо чи відбулися зміни та створюємо/редагуємо лист або передаємо далі messageID
            let message = {};
            if(req.body.changed) {
                return EmailModule.createEditMessage(req, idUser)
            }
            else { //передаємо далі messageID у вигляді властивості обєкту message, щоб повязати з наступним методом
                message.id = req.body.messageID;
                return message
            }
        }) 
        .then(messageID => {console.log('messageID returned from createEditMessage: ', messageID.id); return EmailModule.saveDataSendMail(req, messageID.id, idUser)}) //зберігаємо інформацію про розсилку
        .then(data => {
            mailingId = data;
            //emitter.emit('mailingStarted', mailingId);
            console.log('data saveDataSendMail: ', data);
            return EmailModule.sendDataSendMailAll(data, transporter); //запускаємо розсилку
        })
        .then(data => {
            //emitter.emit('mailingSended', mailingId);
            // тут потрібно отримати id розсилки          
            return res.send({'mailingId': mailingId})
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

//-------------------------------------------------------------------------------------------------------------------------------------
exports.continueMailing = function(req, res){
    const arrAccess = [3,4,5];
    AuthController.getUsersaccountId(req.query.login, arrAccess)
        .then(() => { // переводимо невідправлені листи в статус очікування
            let options = [
                'pending',
                'paused', 
            ]
            return SQLEmail.editVisitorsMailingListsPaused(options, req.params.id, function(err, doc) {
                if (err) {
                    console.log(err);
                    return res.send(err);
                }
            })
        })
        .then(() => {
            return EmailModule.sendDataSendMailAll(req.params.id, transporter); //запускаємо розсилку
        })
        .then(data => {        
            return res.send(data)
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

//-------------------------------------------------------------------------------------------------------------------------------------

exports.createMessageSaveFiles = function(req, res){
    const arrAccess = [3,4,5];
    AuthController.getUsersaccountId(req.query.login, arrAccess) //перевіряємо права доступу
        .then(id_user => EmailModule.createMessageSaveFiles(req, id_user))
        .then(data => {console.log('returned from createMessageSaveFiles: ', data); console.log('All done!'); return res.send(data)})
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

//-------------------------------------------------------------------------------------------------------------------------------------

exports.createMessageSaveMessage = function(req, res){
    const arrAccess = [3,4,5];
    AuthController.getUsersaccountId(req.query.login, arrAccess) //перевіряємо права доступу
        .then(data => { //перевіряємо чи відбулися зміни та створюємо/редагуємо лист або передаємо далі messageID
            let message = {};
            idUser = data;
            if(req.body.changed) {
                return EmailModule.createEditMessage(req, idUser)
            }
            else { //передаємо далі messageID у вигляді властивості обєкту message, щоб повязати з наступним методом
                message.id = req.body.messageID;
                return message
            }
        }) 
        //.then(messageID => {console.log('messageID returned from createEditMessage: ', messageID.id); return EmailModule.saveDataSendMail(req, messageID.id, idUser)}) //зберігаємо інформацію про розсилку
        .then(messageID => {
            //emitter.emit('createEditMessage', messageID.id);
            console.log('data saveDataSendMail: ', messageID.id); 
            console.log('All done!'); 
            return res.send({'messageID': messageID.id})
        })
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//отримання масиву всіх розсилок
exports.getMailingList = function(req, res) {
    SQLEmail.getMailingList(function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//отримання вказаної розсилки
exports.getDataMailing = function(req, res) {
    SQLEmail.getMailing(req.query.id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//отримати всі записи з messages
exports.getAllMessages = function(req, res) {
    SQLEmail.getAllMessages(function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//отримати запис по id з messages
exports.getMessage = function(req, res) {
    SQLEmail.getMessage(req.query.id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//отримання всього листа по id з messages
exports.getFullMessage = function(req, res) {
    SQLEmail.getFullMessage(req.query.id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        // console.log('req.query.id for getAllMessage: ', req.query.id);
        // console.log('getAllMessage: ', doc);
        return res.send(doc);
    });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//отримання даних зі списку розсилкок по mail_list_id
exports.getVisitorsMailingList = function(req, res) {
    SQLEmail.getVisitorsMailingList(req.query.id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//редагування запису у visitors_mailing_lists (поставити всі листи на паузу)
exports.editVisitorsMailingListsPaused = function(req, res) {
    let options = [
        'paused',
        'pending'
    ]
    SQLEmail.editVisitorsMailingListsPaused(options, req.params.id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//редагування запису у mailing_lists (поставити всі розсилки на паузу)
exports.editMailingListsPaused = function(req, res) {
    SQLEmail.editMailingListsPaused(req.params.id, function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(doc);
    });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//відписка
exports.unsubscribe = function(req, res) {
    EmailModule.checkEmail(req.params.id, req.params.regnum, req.params.mail_list_id)
        .then(()=> SQLCommon.edit('visitors', 'sending', 0, 'regnum', req.params.regnum))
        .then(()=> SQLCommon.edit('visitors_mailing_lists', 'unsubscribed', 1, 'id', req.params.id))
        .then(()=>res.send('Ви успішно відписалися від розсилок'))
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

//-------------------------------------------------------------------------------------------------------------------------------------
//ввидалити файл з розсилки
exports.delFile = function(req, res){
    const arrAccess = [5];
    EmailModule.verificationAcssesMessage(req, arrAccess)
        .then(() => SQLEmail.isMailing2(req.body.id_message))
        .then(() => EmailModule.delFile(req.body.path))
        .then(() => EmailModule.delFilesSQL(req.body.id_message, req.body.path))
        .then(() => res.send('the operation was successful'))
        .catch(err => {
            console.log(err);
            return res.send(err);
        });  
}
