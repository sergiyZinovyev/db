const nodemailer = require('nodemailer');
const fs = require('fs');
const Secure = require("../config");
const ControllersShared = require('../controllers/shared');
const SQLEmail = require('../models/sql-email');
const EmailModule = require('../models/email-mod');

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
    //console.log(req.body.file);
    //res.send(req.body);
    //fs.createWriteStream('server/img/file.pdf').write(req.body.file.buffer);  
    // var base64Data = req.body.file.replace(/^data:image\/png;base64,/, ""); 
    // fs.writeFile('server/img/file.pdf', base64Data, 'base64', function(err) {
    // console.log(err);
    // });

    //console.log(req.body);
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
    const mailOptions = {
        from: req.body.from, // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        html: req.body.message, // plain text body
        attachments: req.body.attach
    };
    EmailModule.saveDataSendMail(req, res)
        .then(data => {
            console.log('data saveDataSendMail: ', data);
            res.send({"data": data});
            // transporter.sendMail(mailOptions, function (err, info) {
            //     if(err){
            //         //console.log(err);
            //         res.send(err)
            //     }   
            //     else{
            //         //console.log(info);
            //         res.send(info);
            //     }   
            // })
        })
}


