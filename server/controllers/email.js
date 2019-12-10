const nodemailer = require('nodemailer');
const fs = require('fs');
const Secure = require("../config");
const ControllersShared = require('../controllers/shared');
var SQLEmail = require('../models/sql-email');

let testEmailAccount = nodemailer.createTestAccount();

var transporter = nodemailer.createTransport({
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
    //записуємо дані в базу
    //запускаємо розсилку
    //const currentDate = new Date();
    const mailOptions = {
        from: req.body.from, // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        html: req.body.message, // plain text body
        attachments: req.body.attach
    };
    //console.log('req.body.attach: ', req.body.attach);
    //let idUser;
    saveDataSendMail(req, res).then(

    
    // getUsersaccountId(req.query.login)
    //     .then(id => idUser = id) //перевіряємо права та id користувача
    //     .then(data => {console.log('idUser data: ', data);return createDir(req.body.subject, currentDate.getTime())}) //створюємо папку для файлів розсилки
    //     .then(data => {console.log('createDir data: ', data);return createFiles(req.body.attach, data)}) //зберігаємо файли
    //     .then(data => saveMessage(req.body, data, '', idUser)) //зберігаємо лист
    //     .then(doc => console.log('SQLdoc Id: ', doc.insertId))
    //     .catch(err => {
    //         console.log(err);
    //         return res.send(err);
    //     });
        
    transporter.sendMail(mailOptions, function (err, info) {
        if(err){
            //console.log(err);
            res.send(err)
        }   
        else{
            //console.log(info);
            res.send(info);
        }   
    }))
}


// mailOptions.attachments = [
                //     {   
                //         filename: req.body.filename,
                //         path: req.body.attachments
                //     }
                // ]
//записуємо дані в базу
function saveDataSendMail(req, res) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        let idUser;
        getUsersaccountId(req.query.login)
            .then(id => idUser = id) //перевіряємо права та id користувача
            .then(data => {console.log('idUser data: ', data);return createDir(req.body.subject, currentDate.getTime())}) //створюємо папку для файлів розсилки
            .then(data => {console.log('createDir data: ', data);return createFiles(req.body.attach, data)}) //зберігаємо файли
            .then(data => saveMessage(req.body, data, '', idUser)) //зберігаємо лист
            .then(doc => console.log('SQLdoc Id: ', doc.insertId))
            .then(resolve('done'))
            .catch(err => {
                console.log(err);
                reject(err);
                return res.send(err);
            });
    })
}

// створюємо необхідну директорію
function createDir(name, date) {
    return new Promise((resolve, reject) => {
        fs.mkdir(`server/users_data/email_files/${name}_${date}`, {recursive: false}, err => {
            if(err){
                reject(err);
                throw err;
            }
            let path = `server/users_data/email_files/${name}_${date}`
            console.log('Created dir: ', path)
            resolve(path);
        })
    })
}

// запис файлу у обрану директорію
function createFile(path, nameFile, contentFile) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${path}/${nameFile}`, contentFile, 'utf8', err => {
            if(err){
                reject(err);
                throw err;
            }
            console.log('Done: ',nameFile)
            resolve(`${path}/${nameFile}`);
        });
    })
}

// запис масиву файлів у обрану директорію
function createFiles(arrFile, path) {
    if(!arrFile) return Promise.resolve();
    return Promise.all(arrFile.map(function(element){return createFile(path, element.filename, element.path)}));
}

// зберігаємо лист в SQL
function saveMessage(params, attachments, body_files, id_user) {
    return new Promise((resolve, reject) => {
        let data = [
            //дані для внесення 
            params.subject,
            params.message, 
            attachments.join('; '), 
            body_files, 
            id_user
        ];
        console.log('data for SQL: ', data);
        SQLEmail.createMessage(data, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(doc);
        });
    })
}

// отримати дані про юзера (права, id)
function getUsersaccountId (login) {
    return new Promise((resolve, reject) => {
        ControllersShared.getRights(login, function(err, doc){
            if (err) {
                console.log('err: ',err);
                reject(err);
            }
            else {
                console.log('rights cb: ', doc.insupdvisitors);
                if(![3,4,5].includes(doc.insupdvisitors)){  
                    console.log('у вас немає прав доступу: ', doc.insupdvisitors);
                    reject([{
                        "rights": "false",
                    }]);
                }
                else{
                    resolve(doc.id); 
                }
            }
        })   
    })
    
};