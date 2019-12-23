const fs = require('fs');
const SQLEmail = require('../models/sql-email');
const AuthController = require('../controllers/auth');

// створюємо необхідну директорію
function createDir(firstName, secondName) {
    return new Promise((resolve, reject) => {
        console.log('new dir: ', `server/users_data/email_files/${firstName}/${secondName}`);
        fs.mkdir(`server/users_data/email_files/${firstName}/${secondName}`, {recursive: true}, err => {
            if(err){
                reject(err);
                throw err;
            }
            let path = `server/users_data/email_files/${firstName}/${secondName}`
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

// зберігаємо лист в SQL (використовується коли є всі параметри)
function saveMessage(params, attachments, body_files, id_user) {
    return new Promise((resolve, reject) => {
        console.log(`data: attachments=${attachments}, body_files=${body_files}`)
        let data = [
            //дані для внесення 
            params.subject,
            params.message, 
            attachments.join('; '), 
            body_files.join('; '), 
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

//--------------------------------------------------------------------------------------------------------------------------

// оримуємо attachments & body_files
function getAttachAndBodyFales(id) {
    return new Promise((resolve, reject) => {
        SQLEmail.getDataMessage(id, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(doc);
        });
    })
}

// редагуємо attachments & body_files
function editAttachAndBodyFales(files) {
    return new Promise((resolve, reject) => {
        let dataUpdate = [
            //дані для внесення 
            //attachments, body_files, id
            files.attachments,
            files.body_files,
            files.id
        ];
        SQLEmail.getDataMessage(dataUpdate, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(doc);
        });
    })
}

// Доповнюємо БД новими даними про файли
function addNewFilesSQL(messageID, newFilesArr){
    return new Promise((resolve, reject) => {
        getAttachAndBodyFales(messageID)  //отримуємо записи з бази
            .then(data => {
                let files = {};
                files.id = messageID;
                let newStr;
                for(let key in data[0]){
                    if(key == 'attachments'){ //тут потрібно спростити ...
                        newStr = getIndexValue(newFilesArr, 'attachments').join('; ');
                        files.attachments = data[0].key + '; ' + newStr
                    }
                    if(key == 'body_files'){
                        newStr = getIndexValue(newFilesArr, 'body_files').join('; ');
                        files.body_files = data[0].key + '; ' + newStr
                    }
                }
                return files;
            })
            .then(files => {console.log('files: ',files); return editAttachAndBodyFales(files)})
            .then(data => resolve(data))
    }) 
}

//-------------------------------------------------------------------------------------------------------------------------
//редагуємо існуючий лист
function editMessage(messageID, attach, body_files){
    return new Promise((resolve, reject) => {
        let dirArr = [
            `server/users_data/email_files/${messageID}/attachments`, 
            `server/users_data/email_files/${messageID}/body_files`
        ] 
        return Promise.all(dirArr.map(element => {
            if(element.includes('attachments')){return createFiles(attach, element)}
            else if(element.includes('body_files')){return createFiles(body_files, element)}
        }))
            .then(newFilesArr => addNewFilesSQL(messageID, newFilesArr))
            .then(data => resolve(data))
    })
}

//-------------------------------------------------------------------------------------------------------------------------
//створюємо новий лист
function createNewMessage(req, id_user){
    return new Promise((resolve, reject) => {
        let messageID;
        saveMessage({subject: '', message: ''}, 'params.attach', 'params.body_files', id_user) //створюємо новий лист
            .then(doc => {   //створюємо необхідні папки
                console.log('SQLdoc Id: ', doc.insertId);
                messageID = doc.insertId;
                return Promise.all(['attachments', 'body_files'].map(element => createDir(doc.insertId, element)))
            })
            .then(dirArr => {    //зберігаємо файли
                console.log('createDir data: ', dirArr); 
                return Promise.all(dirArr.map(element => {
                    if(element.includes('attachments')){return createFiles(req.body.attach, element)}
                    else if(element.includes('body_files')){return createFiles(req.body.body_files, element)}
                }))
            })
            .then(newFilesArr => addNewFilesSQL(messageID, newFilesArr)) //редагуємо лист (дописуємо дані про файли)
            .then(doc => resolve(doc))
            .catch(err => {
                console.log(err);
                reject(err);
                //return res.send(err);
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
}

//--------------------------------------------------------------------------------------------------------------------------

//відправка всіх листів синхронно(з обмеженнями) отримує id розсилки та поштовий транспорт
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
            .then(data => {console.log('idUser data: ', data); return Promise.all(['attachments', 'body_files'].map(element => createDir(req.body.messageID, element)))}) //створюємо папки для файлів розсилки
            .then(dirArr => {    //зберігаємо файли
                console.log('createDir data: ', dirArr); 
                return Promise.all(dirArr.map(element => {
                    if(element.includes('attachments')){return createFiles(req.body.attach, element)}
                    else if(element.includes('body_files')){return createFiles(req.body.body_files, element)}
                }))
            })
            .then(filePathArr => {  //зберігаємо лист //вносимо зміни в лист
                console.log('attachments: ', filePathArr); 
                return saveMessage(req.body, getIndexValue(filePathArr, 'attachments'), getIndexValue(filePathArr, 'body_files'), idUser)
            }) 
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

// повертає масив який містить задану строку
function getIndexValue(arr, pattern){
    let returnedArr;
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        let newArr = element.find(item => item.includes(pattern))
        if(!newArr) {
            returnedArr = [];
            console.log('returnedArr = "": ', element);
        }
        else {
            returnedArr = element;
            console.log('returnedArr: ', element);
            break
        }
    }
    return returnedArr
}