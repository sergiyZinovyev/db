const fs = require('fs');
const path = require('path');
const Port = require('../config').Config.serverConfig.backendPort;
const Host = 'visitors.galexpo.com.ua';
const dist = 'body_files';
const myDir = 'server/users_data/email_files';


function updateHtmlLink(messageID, newMessage){
    return new Promise((resolve, reject) => {
        createArrOffilesFromPath(messageID)
            .then(data => getFileArrFromServer(data))
            .then(FileArr => {
                FileArr.forEach(element => {
                    newMessage = replaceSrc(newMessage, element.filename, element.href);
                });
                return newMessage
            })
            .then(data => {return resolve(data)})
            .catch(err => {
                console.log(err);
                reject(err);
            });
    })
}

// створити масив з посиланнями на існуючі файли в папці (id: "назва папки", dist: "назва підпапки")
function createArrOffilesFromPath(id) {
    return new Promise((resolve, reject) => {
        let myPath = `${myDir}/${id}/${dist}`;
        fs.readdir(myPath, (err, items) => {
            if(err){
                return reject(err)
            }
            return resolve(items.map(fileName => {
                return path.join(myPath, fileName)
            }))
        }) 
    })
}

//створити масив обєктів
function getFileArrFromServer(filesArr) {
    return new Promise((resolve, reject) => {
        let newFile = [];
        let newObj;
        if(!filesArr[0]) return resolve(newFile);
        filesArr.forEach(element => {
            let linkArr = element.split('/');
            let file = linkArr.pop()
            newObj = {
                filename: file,
                href: `https://${Host}:${Port}/img/${file}?path=${linkArr.slice(-3).join('/')}`
            }
            if(newObj.filename){newFile.push(newObj)} //додаємо лише тоді коли є файли в обєкті
        });
        return resolve(newFile)
    })
}

//зробити заміну посилань в тексті
function replaceSrc(str, fileName, newSrc){
    const pattern = `["'][^"']*${fileName}[^"']*["']`;
    let VRegExp = new RegExp(pattern, 'g');
    return str.replace(VRegExp, `"${newSrc}"`)
}

module.exports = updateHtmlLink;