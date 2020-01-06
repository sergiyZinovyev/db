const nodemailer = require('nodemailer');
const fs = require('fs');
const Secure = require("../config");
const ControllersShared = require('../controllers/shared');
const SQLEmail = require('../models/sql-email');
const EmailModule = require('../models/email-mod');
const AuthController = require('../controllers/auth');

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

exports.massMaling = function(req, res){
    const arrAccess = [3,4,5];
    let idUser;
    AuthController.getUsersaccountId(req.query.login, arrAccess) //перевіряємо права доступу
        .then(data => {idUser = data; return EmailModule.createEditMessage(req, idUser)}) //створюємо/редагуємо лист
        .then(messageID => {console.log('messageID returnel from createEditMessage: ', messageID.id); return EmailModule.saveDataSendMail(req, messageID.id, idUser)}) //зберігаємо інформацію про розсилку
        .then(data => {
            console.log('data saveDataSendMail: ', data);
            return EmailModule.sendDataSendMailAll(data, transporter); //запускаємо розсилку
        })
        .then(data => res.send(data))
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

exports.createMessageSaveFiles = function(req, res){
    const arrAccess = [3,4,5];
    AuthController.getUsersaccountId(req.query.login, arrAccess)
        .then(id_user => EmailModule.createMessageSaveFiles(req, id_user))
        .then(data => {console.log('returned from createMessageSaveFiles: ', data); console.log('All done!'); return res.send(data)})
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

exports.createMessageSaveMessage = function(req, res){
    const arrAccess = [3,4,5];
    AuthController.getUsersaccountId(req.query.login, arrAccess)
        .then(id_user => EmailModule.createEditMessage(req, id_user))
        .then(data => {console.log('createEditMessage: ', data); console.log('All done!'); return res.send(data)})
        .catch(err => {
            console.log(err);
            return res.send(err);
        });
}

//отримання масиву всіх розсилок
exports.getMailingList = function(req, res) {
    SQLEmail.getMailingList(function(err, doc) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        //console.log('ArrDataForMailing: ', doc);
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
        // console.log('req.query.id for getDataMailing: ', req.query.id);
        // console.log('getDataMailing: ', doc);
        return res.send(doc);
    });
}

//отримання обраного листа з messages
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


