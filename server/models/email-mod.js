const fs = require('fs');
const SQLEmail = require('../models/sql-email');
const AuthController = require('../controllers/auth');
// const nodemailer = require('nodemailer');
// const Secure = require('../config');

// const transporter = nodemailer.createTransport({
//     host: Secure.Config.emailConfig.host,
//     port: 587,
//     secure: false, //disable SSL    
//     requireTLS: true, //Force TLS 
//     tls: {
//         rejectUnauthorized: false
//     },
//     auth: {
//         pass: Secure.Config.emailConfig.pass,
//         user: Secure.Config.emailConfig.user
//     }
// });

// створюємо необхідну директорію
function createDir(name, date) {
    return new Promise((resolve, reject) => {
        fs.mkdir(`server/users_data/email_files/${date}`, {recursive: false}, err => {
            if(err){
                reject(err);
                throw err;
            }
            let path = `server/users_data/email_files/${date}`
            console.log('Created dir: ', path)
            resolve(path);
        })
    })
}

// запис файлу у обрану директорію 
function createFile(path, nameFile, contentFile) {
    return new Promise((resolve, reject) => {
        let base64Data = contentFile.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        let file = Buffer.from(base64Data, 'base64');
        fs.writeFile(`${path}/${nameFile}`, file, err => {
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
    if(!arrFile) return Promise.resolve([]);
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
        SQLEmail.createMessage(data, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(doc);
        });
    })
}

// зберігаємо розсилку в SQL
function saveMailingList(params, message_id, id_user) {
    return new Promise((resolve, reject) => {
        let data = [
            //дані для внесення 
            //name, user_id, message_id, sender
            params.subject,
            id_user,
            message_id,
            params.from
        ];
        //console.log('data for SQL: ', data);
        SQLEmail.createMailingList(data, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(doc);
        });
    })
}

// зберігаємо список розсилки в SQL
function saveVisitorsMailingLists(params, mail_list_id) {
    return new Promise((resolve, reject) => {
        // формуємо строку в потрібному форматі для внесення
        let dataVisitors = '';
        let coma = ', ';
        let coma2 = ', ';
        let arrToString = '';
        let quotes = '';
        let val;
        for (let index = 0; index < params.length; index++) {
            for(let key in params[index]){
                val = params[index][key];
                if (typeof val === 'string'){    
                    quotes = "'";
                    val = val.replace(/'/g, "\\'" );
                }
                else {quotes = ''}

                if (arrToString == ''){coma2 = '';}
                else {coma2 = ', ';}

                arrToString = arrToString + coma2 + quotes + val +quotes; 
            }
            if (dataVisitors == ''){coma = ''}
            else {coma = ', '}
            dataVisitors = dataVisitors + coma + '(' + arrToString + ', ' + mail_list_id + ')'; 
            arrToString = ''; 
        }
        SQLEmail.createGroupVisitorsMailingLists(dataVisitors, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(doc);
        });
    })
}

//--------------------------------------------------------------------------------------------------------------------------

//отримання даних для розсилки
function getDataForMailing(id) {
    //console.log(`getDataForMailing is work whith argument: id = ${id}`);
    return new Promise((resolve, reject) => {
        //console.log('Promise of getDataForMailing is work');
        SQLEmail.getDataMailing(id, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log('getDataMailing: ', doc);
            return resolve(doc);
        });
    })
}

// відправка листа де params - параметри листа, transporter - обєкт nodemailer
function sendEmail(params, transporter) {
    //console.log(`sendEmail is work whith argument: params.to = ${params.to}`);
    class Attach {
        constructor(params) {
            this.path = params;
        }
    }
    return new Promise((resolve, reject) => {
        let attachArr = params.path.split('; ').map(item => new Attach(item));
        console.log('attachArr: ', attachArr);
        const emailOptions = {
            from: params.from, // sender address
            to: params.to, // list of receivers
            subject: params.subject, // Subject line
            attachments: attachArr,
            html: params.message // plain text body
        };
        transporter.sendMail(emailOptions, function (err, info) {
            if(err){
                console.log(err);
                reject(err);
                //res.send(err)
            }   
            else{
                //console.log(info);
                resolve(params.id);
                //res.send(info);
            }   
        });
    })
}

//--------------------------------------------------------------------------------------------------------------------------

//відправка розсилки
exports.sendDataSendMail = function(idMailinngList, transporter){
    //console.log(`sendDataSendMail is work whith arguments: idMailinngList = ${idMailinngList}; transporter = ${transporter}`);
    return new Promise((resolve, reject) => {
        //console.log('Promise of sendDataSendMail is work');
        getDataForMailing(idMailinngList) //отримуємо з бази SQL дані для відправки
            .then(data => {console.log('data params:', data[0]); return sendEmail(data[0], transporter)}) //відправляємо лист
            //.then() //записуємо дані про відправлення в SQL
            //.then(doc => doc)
            .then(doc => {console.log('params.id:', doc); return resolve(doc)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

//запис на сервер інформації про розсилку
exports.saveDataSendMail = function(req, res, arrAccess){
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        let idUser;
        let idMailinngList;
        AuthController.getUsersaccountId(req.query.login, arrAccess)
            .then(id => idUser = id) //перевіряємо права та id користувача
            .then(data => {console.log('idUser data: ', data); return createDir(req.body.subject, currentDate.getTime())}) //створюємо папку для файлів розсилки
            .then(data => {console.log('createDir data: ', data); return createFiles(req.body.attach, data)}) //зберігаємо файли
            .then(data => {console.log('attachments: ', data); return saveMessage(req.body, data, '', idUser)}) //зберігаємо лист
            .then(doc => {console.log('SQLdoc Id: ', doc.insertId); return saveMailingList(req.body, doc.insertId, idUser)}) //зберігаємо розсилку
            .then(doc => {idMailinngList = doc.insertId; return saveVisitorsMailingLists(req.body.sendList, doc.insertId)}) //зберігаємо список розсилки
            .then(doc => resolve(idMailinngList))
            .catch(err => {
                console.log(err);
                reject(err);
                //return res.send(err);
            });
    })
}