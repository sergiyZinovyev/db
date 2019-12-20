const fs = require('fs');
const SQLEmail = require('../models/sql-email');
const AuthController = require('../controllers/auth');

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

//отримання масиву всіх id для розсилки
function getArrDataForMailing(id) {
    //console.log(`getDataForMailing is work whith argument: id = ${id}`);
    return new Promise((resolve, reject) => {
        //console.log('Promise of getDataForMailing is work');
        SQLEmail.getDataMailingAll(id, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log('ArrDataForMailing: ', doc);
            return resolve(doc);
        });
    })
}

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
            //console.log('getDataMailing: ', doc);
            return resolve(doc);
        });
    })
}

// відправка листа де params - параметри листа, transporter - обєкт nodemailer
function sendEmail(params, transporter) {
    console.log(`sendEmail is work whith argument: params.path = ${params.path}`);
    class Attach {
        constructor(params) {
            this.path = params;
        }
    }
    let attachArr;
    return new Promise((resolve, reject) => {
        if (params.is_send != 'pending'){
            return resolve('NO_SEND')
        }
        if(params.path == ''){
            attachArr = ''
        }
        else{
            attachArr = params.path.split('; ').map(item => new Attach(item));
        }
        
        //console.log('attachArr: ', attachArr);
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
            }   
            else{
                resolve(params.id);
            }   
        });
    })
}

// позначаємо як відправлене в SQL
function noteAsSent(id) {
    const currentDate = new Date();
    return new Promise((resolve, reject) => {
        if (id == 'NO_SEND'){
            return resolve(id);
        }
        let data = [
            //дані для внесення 
            //is_send, date, id
            'sent',
            currentDate,
            id
        ];
        //console.log('data for SQL: ', data);
        SQLEmail.editVisitorsMailingLists(data, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve({'id':id, 'date send': currentDate});
        });
    })
}

//-------------------------------------------------------------------------------------------------------------------------
//розбити масив на підмасиви
function arrToSubarr(arr, size) {
    return res = arr.reduce((p,c)=>{
        if(p[p.length-1].length == size){
          p.push([]);
        }
        
        p[p.length-1].push(c);
        return p;
      }, [[]]); 
}



//--------------------------------------------------------------------------------------------------------------------------

//відправка одного листа зі списку
function sendDataSendMail(id, transporter){
    //console.log(`sendDataSendMail is work whith arguments: idMailinngList = ${idMailinngList}; transporter = ${transporter}`);
    return new Promise((resolve, reject) => {
        //console.log('Promise of sendDataSendMail is work');
        getDataForMailing(id) //отримуємо з бази SQL дані для відправки
            .then(data => {console.log('data params:', data[0]); return sendEmail(data[0], transporter)}) //відправляємо лист
            .then(data => {console.log('params.id:', data); return noteAsSent(data)}) //записуємо дані про відправлення в SQL
            .then(data => {console.log('doc:', data); return resolve(data)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

//--------------------------------------------------------------------------------------------------------------------------

//відправка всіх листів синхронно
function sendDataSendMailAllParts(arr, transporter){
    // Promise.resolve()
    // .then(() => Promise.all(arr.map(element => sendDataSendMail(element.id, transporter))))
    // .catch(err => {
    //     console.log(err);
    //     reject(err);
    // });
    return Promise.all(arr.map(element => sendDataSendMail(element.id, transporter)))
}

//--------------------------------------------------------------------------------------------------------------------------

// послідовне виконання промісів
function awaitEx(tasks, interval, transporter){
    return new Promise((resolve, reject) => {
        let promise = Promise.resolve();
        console.log('tasks.length: ', tasks.length);
        tasks.forEach((task, i) => {
            //console.log(`task(${i}) start; arr = ${task}`);
            setTimeout(() => {
                console.log(`i = `,i);
                if(i == tasks.length){
                    console.log(`last task task(${i}) start; arr = ${task}`);
                    return promise.then(() => {return sendDataSendMailAllParts(task, transporter)})
                        .then((data) => {console.log('data last promise: ', data); return resolve({'allDone': true})})
                }
                else{
                    console.log(`task(${i}) start; arr = ${task}`);
                    promise = promise.then(() => {sendDataSendMailAllParts(task, transporter)})
                }   
            }, interval * ++i);
            
        });
    });

    //return promise.then((data) => {console.log('data: ', data); return data})
}

//--------------------------------------------------------------------------------------------------------------------------

//відправка всіх листів синхронно(з обмеженнями)
exports.sendDataSendMailAll = function(idMailinngList, transporter){
    return getArrDataForMailing(idMailinngList) //отримуємо всі id по яким має бути розсилка
        .then(arr =>  awaitEx(arrToSubarr(arr, 2), 5000, transporter)) //послідовно виконуємо групи промісів з заданим інтервалом
        .catch(err => {
            console.log(err);
            reject(err);
        });
}

//запис на сервер інформації про розсилку
exports.saveDataSendMail = function(req, res, arrAccess){
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        let idUser;
        let idMailinngList;
        AuthController.getUsersaccountId(req.query.login, arrAccess)//перевіряємо права та id користувача
            .then(id => idUser = id) //зберігаємо id користувача
            .then(data => {return data}) //створюємо лист
            .then(data => {console.log('idUser data: ', data); return createDir(req.body.subject, currentDate.getTime())}) //створюємо папку для файлів розсилки
            .then(data => {console.log('createDir data: ', data); return createFiles(req.body.attach, data)}) //зберігаємо файли
            .then(data => {console.log('attachments: ', data); return saveMessage(req.body, data, '', idUser)}) //зберігаємо лист //вносимо зміни в лист
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