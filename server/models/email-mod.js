const nodemailer = require('nodemailer');
const fs = require('fs');
const Secure = require("../config");
const ControllersShared = require('../controllers/shared');
const SQLEmail = require('../models/sql-email');

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

exports.saveDataSendMail = function(req, res){
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        let idUser;
        let idMailinngList;
        getUsersaccountId(req.query.login)
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
                return res.send(err);
            });
    })
}