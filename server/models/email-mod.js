const fs = require('fs');
const SQLEmail = require('../models/sql-email');
const AuthController = require('../controllers/auth');
const Shared = require('../models/shared');
const Update = require('../modules/updateHtmlLinks');
const EventEmitter = require('events');
const Secure = require('../config');

const emitter = new EventEmitter();
exports.emitter = emitter;

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
// path - місце збереження на сервері
// arrFile - масив обєктів {filename: імя файлу, path: вміст файлу в base64Data}
function createFiles(arrFile, path) {
    if(!arrFile) return Promise.resolve([]);
    return Promise.all(arrFile.map(function(element){return createFile(path, element.filename, element.path)}));
}

//--------------------------------------------------------------------------------------------------------------------------

// створити масив з посиланнями на існуючі файли в папці (id: "назва папки", dist: "назва підпапки")
function createArrOffilesFromPath(id, dist) {
    const path = require('path');
    return new Promise((resolve, reject) => {
        let myPath = `server/users_data/email_files/${id}/${dist}`;
        //if (!fs.readdirSync(myPath)){return resolve([])}
        resolve (fs.readdirSync(myPath).map(fileName => {
            return path.join(myPath, fileName)
        }))
        
    })
}

// копіює файл з src в dist
function copyFile(src, dist){
    return new Promise((resolve, reject) => {
        fs.copyFile(src, dist, (err)=>{
            if (err) reject(err)
            resolve (`${dist}`)
        })
    })
}

// копіює файл з масиву arrFile в dist
function copyFiles(arrFile, dist){
    const path = require('path');
    if(!arrFile) return Promise.resolve([]);
    return Promise.all(arrFile.map(function(element){return copyFile(element, `${dist}/${path.basename(element)}`)}));
}

// копіює файли з вказаної підпапки subDir в аналогічну підпапку в іншій директорії
// srcID - директорія з якої копіюємо файли
// distID - директорія куди копіюємо файли
function copyFilesFromDirToDir(srcID, distID, subDir){
    return new Promise((resolve, reject) => {
        createArrOffilesFromPath(srcID, subDir)
            .then(arrFile => copyFiles(arrFile, `server/users_data/email_files/${distID}/${subDir}`))
            .then(result => resolve(result))
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

//--------------------------------------------------------------------------------------------------------------------------

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
            //token, name, user_id, message_id, sender, is_sent
            params.token,
            params.subject,
            id_user,
            message_id,
            params.from,
            'pending'
        ];
        SQLEmail.createMailingList(data, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            emitter.emit('mailingSaved', doc.insertId);
            resolve(doc);
        });
    })
}

// редагуємо розсилку в SQL / вносимо дати
function editMailingList(fieldName, fieldValue, id) {
    return new Promise((resolve, reject) => {
        let data = [
            //дані для внесення 
            //fieldValue, id
            fieldValue,
            id
        ];
        SQLEmail.editMailingList(data, fieldName, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log('editMailingList data: ', doc);
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
    const protocol = Secure.Config.serverConfig.protocol;
    const host = Secure.Config.serverConfig.host;
    const port = Secure.Config.serverConfig.backendPort;
    class Attach {
        constructor(params) {
            this.path = params;
        }
    }
    let link = `${protocol}://${host}:${port}/unsubscribe/${params.id}/${params.regnum}/${params.ml_id}`;
    let unsubscribe =   `<a href="${link}" 
                            style="display: inline-block; 
                                    background: #8C959D; 
                                    color: #fff; 
                                    padding: 5px 10px 5px 10px; 
                                    text-decoration: none; 
                                    border-radius: 5px; 
                                    font-weight: bold"> 
                            відписатися 
                        </a>`;
    let attachArr;
    let message;
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
        message = params.message.replace(new RegExp("<baza-name>", 'g'), params.namepovne);
        message = message.replace(new RegExp("<baza-unsubscribe>", 'g'), unsubscribe);
        //console.log('attachArr: ', attachArr);
        const emailOptions = {
            from: params.from, // sender address
            to: params.to, // list of receivers
            subject: params.subject, // Subject line
            attachments: attachArr,
            html: message // plain text body
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
        SQLEmail.editMessagesAttachAndBodyFiles(dataUpdate, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            //console.log('editMessagesAttachAndBodyFiles doc: ', doc);
            return resolve(doc);
        });
    })
}

// Доповнюємо БД новими даними про файли
function addNewFilesSQL(messageID, newFilesArr){
    return new Promise((resolve, reject) => {
        let newFiles;
        getAttachAndBodyFales(messageID)  //отримуємо записи з бази
            .then(data => {
                console.log('getAttachAndBodyFales data[0]: ', data[0]);

                let files = {};
                files.id = messageID;
                let newStr;
                for(let key in data[0]){
                    newStr = getIndexValue(newFilesArr, key).join('; ');
                    if(data[0][key] == ''){
                        files[key]=newStr
                    }
                    else {
                        files[key]= data[0][key] + '; ' + newStr
                    }
                }
                //console.log('files1: ',files);
                return files;
            })
            .then(files => {newFiles = files; console.log('files: ',files); return editAttachAndBodyFales(files)})
            .then(data => {console.log('returned from editAttachAndBodyFales: ',data); console.log('newFiles: ',newFiles); return resolve(newFiles)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    }) 
}

// видаляємо файли з БД
exports.delFilesSQL = function (messageID, delFile){
    return new Promise((resolve, reject) => {
        let newFiles;
        getAttachAndBodyFales(messageID)  //отримуємо записи з бази
            .then(data => {
                console.log('getAttachAndBodyFales data[0]: ', data[0]);

                let files = {};
                files.id = messageID;
                for(let key in data[0]){
                    if(key == 'body_files' || key == 'attachments'){
                      let newArr = data[0][key].split('; ');
                      let index = newArr.indexOf(delFile);
                      if(index != -1){
                        file[key] = newArr.splice(index, 1).join('; ')
                      }
                      else file[key] = data[0][key];  
                    }
                }
                //console.log('files1: ',files);
                return files;
            })
            .then(files => {newFiles = files; console.log('files: ',files); return editAttachAndBodyFales(files)})
            .then(data => {console.log('returned from editAttachAndBodyFales: ',data); console.log('newFiles: ',newFiles); return resolve(newFiles)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    }) 
}

//-------------------------------------------------------------------------------------------------------------------------
//редагуємо існуючий лист додаємо нові файли
function editMessageAddNewFiles(messageID, attach, body_files){
    return new Promise((resolve, reject) => {
        let dirArr = [
            `server/users_data/email_files/${messageID}/attachments`, 
            `server/users_data/email_files/${messageID}/body_files`
        ] 
        return Promise.all(dirArr.map(element => { // зберігаємо файли у відповідних дерикторіях
            if(element.includes('attachments')){return createFiles(attach, element)}
            else if(element.includes('body_files')){return createFiles(body_files, element)}
        }))
            .then(newFilesArr => addNewFilesSQL(messageID, newFilesArr))
            .then(data => {console.log('returned from addNewFilesSQL_2: ', data); return resolve(data)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

//-------------------------------------------------------------------------------------------------------------------------
//редагуємо існуючий лист без збереження файлів
// params = req.body
function editMessage(params, id_user){
    return new Promise((resolve, reject) => {
        Update(params.messageID, params.message)
            .then(data => { 
                let dataUpdate = [ //subject, message, id_user, id
                    params.subject, 
                    data,
                    id_user,
                    params.messageID
                ];
                SQLEmail.editMessages(dataUpdate, function(err, doc) {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    return resolve(params.messageID);
                });
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
    })
        
}

//-------------------------------------------------------------------------------------------------------------------------
//створюємо новий лист та зберігаємо лише файли
function createNewMessageForSaveFiles(req, id_user){
    return new Promise((resolve, reject) => {
        let messageID;
        let dirArr;
        saveMessage({subject: '', message: ''}, [], [], id_user) //створюємо новий лист
            .then(doc => {   //створюємо необхідні папки
                console.log('SQLdoc Id: ', doc.insertId);
                messageID = doc.insertId;
                return Promise.all(['attachments', 'body_files'].map(element => createDir(doc.insertId, element)))
            })
            .then(data => { //копіюємо файли з старого листа
                dirArr = data;
                if(req.body.messageID!='new'){
                    return Promise.all(['attachments', 'body_files'].map(element => copyFilesFromDirToDir(req.body.messageID, messageID, element)))
                        .then(newFilesArr => {//редагуємо лист (дописуємо дані про файли)
                            console.log('copyFilesFromDirToDir: ', newFilesArr);
                            return addNewFilesSQL(messageID, newFilesArr)
                        }) 
                }
                else return []
            })
            .then(data => {    //зберігаємо файли
                return Promise.all(dirArr.map(element => {
                    if(element.includes('attachments')){
                        return createFiles(req.body.attach, element) 
                    }
                    else if(element.includes('body_files')){
                        return createFiles(req.body.body_files, element)
                    }
                }))
            })
            .then(newFilesArr => addNewFilesSQL(messageID, newFilesArr)) //редагуємо лист (дописуємо дані про файли)
            .then(doc => {console.log('returned from addNewFilesSQL_1: ', doc); return resolve(doc)})
            .catch(err => {
                console.log(err);
                reject(err);
                //return res.send(err);
            });

    }) 
}

//-------------------------------------------------------------------------------------------------------------------------
//створюємо новий лист без збереження файлів
function createNewMessage(req, id_user){
    return new Promise((resolve, reject) => {
        let messageID;
        saveMessage(req.body, [], [], id_user) //створюємо новий лист
            .then(doc => {console.log('returned from saveMessage: ', doc); return doc.insertId})
            .then(doc => {   //створюємо необхідні папки
                console.log('messageID: ', doc);
                messageID = doc;
                return Promise.all(['attachments', 'body_files'].map(element => createDir(doc, element)))
            })
            .then(data => { //копіюємо файли з старого листа
                dirArr = data;
                if(req.body.messageID!='new'){
                    return Promise.all(['attachments', 'body_files'].map(element => copyFilesFromDirToDir(req.body.messageID, messageID, element)))
                        .then(newFilesArr => {//редагуємо лист (дописуємо дані про файли)
                            console.log('copyFilesFromDirToDir: ', newFilesArr);
                            return addNewFilesSQL(messageID, newFilesArr)
                        }) 
                }
                else return []
            })
            .then(() => editMessage({subject: req.body.subject, message: req.body.message, messageID: messageID}, id_user)) //викликаємо editMessage щоб оновити лінки в листі
            .then(() => resolve(messageID))
            .catch(err => {
                console.log(err);
                reject(err);
            });

    }) 
}

//-------------------------------------------------------------------------------------------------------------------------
//перевіряємо чи була розсилка по заданому листу
function isMailing(messageID) {
    return new Promise((resolve, reject) => {
        SQLEmail.isMailing(messageID, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (doc[0]) resolve(true)
            else resolve(false)
        });
    })
    
}

//// перевірка чи є в розсилці невідправлені листи
function getIsSent(id) {
    return new Promise((resolve, reject) => {
        SQLEmail.getIsSent(id, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (doc[0]) resolve('paused')
            else resolve('sent')
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

//створення/редагування листа (без збереження файлів)  //подумати про обєднання цього і наступного методів!!!
// exports.createEditMessage = function(req, arrAccess){
//     return new Promise((resolve, reject) => {
//         let id_user;
//         AuthController.getUsersaccountId(req.query.login, arrAccess)//перевіряємо права та id користувача
//             .then(id => id_user = id) //зберігаємо id користувача
//             .then(() => {
//                 if(req.body.messageID == 'new'){return createNewMessage(req, id_user)} // створюємо новий лист 
//                 else {
//                     return isMailing(req.body.messageID).then(isMailingState => {
//                         if(isMailingState){return createNewMessage(req, id_user)} // створюємо новий лист 
//                         else return editMessage(req.body, id_user) // редагуємо лист
//                     })
//                 }
//             })
//             .then(data => {console.log('returned from .then: ', data); return resolve({'id': data})})
//             .catch(err => {
//                 console.log(err);
//                 reject(err);
//             });
//     })
// }

//збереження файлів для розсилки/створення нового листа
// exports.createMessageSaveFiles = function(req, arrAccess){
//     return new Promise((resolve, reject) => {
//         let id_user;
//         AuthController.getUsersaccountId(req.query.login, arrAccess)//перевіряємо права та id користувача
//             .then(id => id_user = id) //зберігаємо id користувача
//             .then(() => {
//                 if(req.body.messageID == 'new'){return createNewMessageForSaveFiles(req, id_user)} // створюємо новий лист та зберігаємо тільки файли
//                 else {
//                     return isMailing(req.body.messageID).then(isMailingState => {
//                         if(isMailingState){return createNewMessageForSaveFiles(req, id_user)} // створюємо новий лист та зберігаємо тільки файли
//                         else return editMessageAddNewFiles(req.body.messageID, req.body.attach, req.body.body_files) // редагуємо лист додаємо нові файли
//                     })
//                 }
//             })
//             .then(data => {console.log('returned from .then: ', data); return resolve(data)})
//             .catch(err => {
//                 console.log(err);
//                 reject(err);
//             });
//     })
// }

//створення/редагування листа (без збереження файлів)  //подумати про обєднання цього і наступного методів!!!
exports.createEditMessage = function(req, id_user){
    return new Promise((resolve, reject) => {
        (() => {
            if(req.body.messageID == 'new'){return createNewMessage(req, id_user)} // створюємо новий лист 
            else {
                return isMailing(req.body.messageID).then(isMailingState => {
                    if(isMailingState){return createNewMessage(req, id_user)} // створюємо новий лист 
                    else return editMessage(req.body, id_user) // редагуємо лист
                })
            }
        })()
            .then(data => {console.log('returned from .then: ', data); return resolve({'id': data})})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

//збереження файлів для розсилки/створення нового листа
exports.createMessageSaveFiles = function(req, id_user){
    return new Promise((resolve, reject) => {
        (() => {
            if(req.body.messageID == 'new'){return createNewMessageForSaveFiles(req, id_user)} // створюємо новий лист та зберігаємо тільки файли
            else {
                return isMailing(req.body.messageID).then(isMailingState => {
                    if (isMailingState) { return createNewMessageForSaveFiles(req, id_user) } // створюємо новий лист та зберігаємо тільки файли // робимо копію листа // додаємо нові файли
                    else return editMessageAddNewFiles(req.body.messageID, req.body.attach, req.body.body_files) // редагуємо лист додаємо нові файли
                })
            }
        })()
            .then(data => {console.log('returned from .then: ', data); return resolve(data)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

//відправка всіх листів синхронно(з обмеженнями) отримує id розсилки та поштовий транспорт
exports.sendDataSendMailAll = function(idMailinngList, transporter){
    let is_send;
    return editMailingList('date_start', Shared.curentDate(Date.now()), idMailinngList) // робимо запис про початок розсилки
        .then(() => editMailingList('is_sent', 'pending', idMailinngList)) // робимо запис про статус розсилки
        .then(() => getArrDataForMailing(idMailinngList))  //отримуємо всі id по яким має бути розсилка
        .then(arr =>  awaitEx(arrToSubarr(arr, 5), 3000, transporter)) //послідовно виконуємо групи промісів з заданим інтервалом
        .then(data => is_send = data)
        .then(() => editMailingList('date_end', Shared.curentDate(Date.now()), idMailinngList)) // робимо запис про закінчення розсилки
        .then(() => getIsSent(idMailinngList)) //перевіряємо чи є невідіслані листи
        .then((sentStatus) => editMailingList('is_sent', sentStatus, idMailinngList)) // робимо запис про статус розсилки
        .then(() => {emitter.emit('mailingSaved', idMailinngList); return is_send})
        .catch(err => {
            console.log(err);
            reject(err);
        });
}

//запис на сервер інформації про розсилку
// exports.saveDataSendMail = function(req, res, arrAccess){
//     return new Promise((resolve, reject) => {
//         const currentDate = new Date();
//         let idUser;
//         let idMailinngList;
//         AuthController.getUsersaccountId(req.query.login, arrAccess)//перевіряємо права та id користувача
//             .then(id => idUser = id) //зберігаємо id користувача
//             .then(data => {console.log('idUser data: ', data); return Promise.all(['attachments', 'body_files'].map(element => createDir(req.body.messageID, element)))}) //створюємо папки для файлів розсилки
//             .then(dirArr => {    //зберігаємо файли
//                 console.log('createDir data: ', dirArr); 
//                 return Promise.all(dirArr.map(element => {
//                     if(element.includes('attachments')){return createFiles(req.body.attach, element)}
//                     else if(element.includes('body_files')){return createFiles(req.body.body_files, element)}
//                 }))
//             })
//             .then(filePathArr => {  //зберігаємо лист //вносимо зміни в лист
//                 console.log('attachments: ', filePathArr); 
//                 return saveMessage(req.body, getIndexValue(filePathArr, 'attachments'), getIndexValue(filePathArr, 'body_files'), idUser)
//             }) 
//             .then(doc => {console.log('SQLdoc Id: ', doc.insertId); return saveMailingList(req.body, doc.insertId, idUser)}) //зберігаємо розсилку
//             .then(doc => {idMailinngList = doc.insertId; return saveVisitorsMailingLists(req.body.sendList, doc.insertId)}) //зберігаємо список розсилки
//             .then(doc => resolve(idMailinngList))
//             .catch(err => {
//                 console.log(err);
//                 reject(err);
//                 //return res.send(err);
//             });
//     })
// }

//запис на сервер інформації про розсилку
exports.saveDataSendMail = function(req, messageID, idUser){
    return new Promise((resolve, reject) => {
        saveMailingList(req.body, messageID, idUser) //зберігаємо розсилку
            .then(doc => {idMailinngList = doc.insertId; return saveVisitorsMailingLists(req.body.sendList, doc.insertId)}) //зберігаємо список розсилки
            .then(() => resolve(idMailinngList))
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

// перевіряємо наявність токена в розсилці
exports.checkToken = function(token) {
    return new Promise((resolve, reject) => {
        SQLEmail.checkToken(token, function(err, doc) {
            if (err) {
                console.log(err);
                reject(err);
            }
            if(!doc[0]) resolve('ok');
            else reject(new Error("ignored"));
        });
    })
}

// перевіряємо наявність емейла в розсилці
exports.checkEmail = function(id, regnum, mail_list_id) {
    return new Promise((resolve, reject) => {
        SQLEmail.getEmailData(id, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if(!doc[0]) return reject('Такої пошти немає в даній розсилці');
            if(doc[0].regnum == regnum && doc[0].mail_list_id == mail_list_id) return resolve(doc[0])
            else return reject('Такої пошти немає в даній розсилці')
        });
    })
}

//перевірка прав на операції з листом
exports.verificationAcssesMessage = function(req, arrAccess){
    return new Promise((resolve, reject) => {
        SQLEmail.getMessage(req.body.id_message, function(err, doc) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if(!doc[0]) return reject(false);
            let authorized_id = [doc[0].id_user];
            AuthController.getUsersaccountId(req.query.login, arrAccess, authorized_id)
                .then(data => resolve(data))
                .catch(err => {
                    console.log(err);
                    return reject(err);
                });
        });
    }) 
}

//видалення файла
exports.delFile = function(filePath){
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err);
                return reject(err)
            }
            else {
                console.log(`file ${filePath} was deleted`);
                return resolve(`file ${filePath} was deleted`)
            }
        })
    })
}

// повертає масив який містить задану строку //потрібно перенести в окремий модуль
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