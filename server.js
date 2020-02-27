const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const compression = require('compression'); 
const WebSocket = require('ws');

//підключаємо контроллери
const visitorsController = require('./server/controllers/visitors');
const visitorsExhibController = require('./server/controllers/visitors_exhib');
const emailController = require('./server/controllers/email');
const pdfController = require('./server/controllers/pdf');
const authController = require('./server/controllers/auth'); 
const sharedController = require('./server/controllers/shared');
//підключаємо файл конфігурації
const Secure = require('./server/config');
//підключаємо внутрішні модулі
const eventsHandler = require('./server/modules/eventshandler');
//підключаємо моделі
const emailMod = require('./server/models/email-mod');
const sqlEmail = require('./server/models/sql-email');
const sqlVisitors = require('./server/models/sql-visitors');
const sqlVisexhib = require('./server/models/sql-exhib');


const urlencodedParser = bodyParser.urlencoded({extended: false});

//back-end server
const app = express();
const host = 'visitors.galexpo.com.ua'; //prod host 
const port = Secure.Config.serverConfig.backendPort;
const server = https.createServer({
  key: fs.readFileSync('./server/cert/key.pem'),
  cert: fs.readFileSync('./server/cert/cert.pem')
}, app)

const wss = new WebSocket.Server({ server });

server.listen(port, host, function () {
  console.log(`Server listens https://${host}:${port}`);
});


//front-end server
const ang = express();
const port2 = Secure.Config.serverConfig.frontendPort;
https.createServer({
  key: fs.readFileSync('./server/cert/key.pem'),
  cert: fs.readFileSync('./server/cert/cert.pem')
}, ang).listen(port2, host, function () {
  console.log(`Server2 listens https://${host}:${port2}`);
});

ang.use(express.static(__dirname + "/dist/db"));
ang.use("/", function(request, response){
  response.sendFile(path.join(__dirname+'/dist/db/index.html')); 
});


app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(compression());

app.use('/static', express.static(__dirname + "/server/users_data"));


//------------------------------------------------------------------------------------------------------ 
// WebSockets

//розширяємо wss новим методом
wss.sendEventAll = sendEventAllClients;
//розсилка всім підключеним клієнтам
function sendEventAllClients(message){
  this.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

//прослуховуємо події та робимо розсилки  
emailMod.emitter.on('mailingSaved', message => eventsHandler.getMailing(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
emailMod.emitter.on('mailingSended', message => eventsHandler.getMailing(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlEmail.emitter.on('editMailingList', message => eventsHandler.getMailing(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlEmail.emitter.on('createEditMessage', message => eventsHandler.getMessage(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlEmail.emitter.on('editVisitorsMailingLists', message => eventsHandler.getEmail(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlVisitors.emitter.on('deleteVisitor', message => eventsHandler.getDelData(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlVisitors.emitter.on('editVisitor', message => eventsHandler.getEditData(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlVisitors.emitter.on('createVisitor', message => eventsHandler.getEditData(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlVisexhib.emitter.on('changeVisexData', message => eventsHandler.getEditDataVis(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlVisexhib.emitter.on('changeVisexData2', message => eventsHandler.getEditDataVis2(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
//sqlVisexhib.emitter.on('changeVisexData3', message => eventsHandler.getEditDataVis3(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));
sqlVisexhib.emitter.on('changeTypeOfReg', message => eventsHandler.getTypeOfReg(message).then(e=>wss.sendEventAll(e)).catch(err=>console.log(err)));


wss.on('connection', (ws) => {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.sendEventAll(message);
  });
  ws.send(`socket connect`, () => console.log('1 message is send'));
});


//------------------------------------------------------------------------------------------------------ 


//отримати запис з таблиці usersaccount для авторизації
app.post("/users", authController.users);
//------------------------------------------------------------------------------------------------------ 


// *** захищені роути *** 

//отримати всі записи  про візіторсів з вказаної таблиці    
app.post("/visitors", authController.checkAuth, visitorsController.getVisitors);

// //додавання запису в основну базу
// app.post("/createVis", authController.checkAuth, urlencodedParser, visitorsController.createNewVis);

//додавання запису в основну базу
app.post("/createNewVisAuth", authController.checkAuth, urlencodedParser, visitorsController.createNewVisAuth);

//додавання декількох записів в основну базу з visitors_create
app.post("/createGroup", authController.checkAuth, urlencodedParser, visitorsController.createGroup);

//додавання декількох записів в основну базу з visitors_edit
app.post("/updateGroup", authController.checkAuth, urlencodedParser, visitorsController.updateGroup);

//видалення запису з обраної таблиці
app.post("/delete", authController.checkAuth, urlencodedParser, visitorsController.delete);

//отримати запис з таблиць visitors, visitors_create по id
app.get("/checkIdVisitor", authController.checkAuth, visitorsController.checkIdVisitor);

//отримання запису по електронній адресі або мобільному з 3 таблиць
app.post("/get3", cors(), urlencodedParser, authController.checkAuth, visitorsController.getRowOnCond2);

//редагування(видалення) запису з вказаного поля вказаної таблиці
app.post("/editExhibition_del_rec", authController.checkAuth, urlencodedParser, visitorsController.editExhibition_del_rec);

//-----------exhibition_vis--------------- 

//отримати всі записи про відвідувачів з вказаної виставки 
app.get("/visexhib/:id", authController.checkAuth, visitorsExhibController.visexhib);

//редагування запису в exhibition_vis
app.post("/editExhibition_vis", authController.checkAuth, urlencodedParser, visitorsExhibController.editExhibition_vis);

//редагування запису відвідування виставки у таблиці Exhibition_vis відміна відвідування
app.post("/editExhibition_vis_visited_cancel", authController.checkAuth, urlencodedParser, visitorsExhibController.editExhibition_vis_visited_cancel);

//редагування запису тип реєстрації у таблиці Exhibition(в req.body має прийти значення типу та id виставки)
app.post("/editExhibition_typeOfReg", authController.checkAuth, urlencodedParser, visitorsExhibController.editExhibition_typeOfReg);

//----------------------------------------

//розсилка
app.post("/massMaling", cors(), urlencodedParser, authController.checkAuth, emailController.massMaling);

//розсилка вказаної розсилки
app.get("/continueMailing/:id", urlencodedParser, authController.checkAuth, emailController.continueMailing);

//збереження файлів для розсилки/створення нового листа
app.post("/saveMailFile", urlencodedParser, authController.checkAuth, emailController.createMessageSaveFiles);

//збереження/редагування листа
app.post("/saveMessage", urlencodedParser, authController.checkAuth, emailController.createMessageSaveMessage);

//отримання масиву всіх розсилок
app.get("/getMailingList", authController.checkAuth, emailController.getMailingList);

//отримання вказаної розсилки
app.get("/getDataMailing", authController.checkAuth, emailController.getDataMailing);

//отримання обраного листа (всього)
app.get("/getCurrentMessage", authController.checkAuth, emailController.getFullMessage);

//отримання масиву всіх листів
app.get("/getAllMessages", authController.checkAuth, emailController.getAllMessages);

//отримати запис по id з messages
app.get("/getMessage", authController.checkAuth, emailController.getMessage);

//отримання даних зі списку розсилкок по mail_list_id
app.get("/getVisitorsMailingList", authController.checkAuth, emailController.getVisitorsMailingList);

//редагування запису у visitors_mailing_lists (поставити всі листи на паузу)
app.get("/allMailingPaused/:id", authController.checkAuth, emailController.editVisitorsMailingListsPaused);

//редагування запису у mailing_lists (поставити всі розсилки на паузу)
app.get("/mailingListsPaused/:id", authController.checkAuth, emailController.editMailingListsPaused);

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------


// *** не захищені роути ***

//отримати всі записи з вказаної таблиці / !!! незахищений роут використовується в формах реєстрації юзерів, потрібно зробити нові роути для юзерів, а ці захистити !!!
app.get("/db/:id", visitorsController.all);

//отримати файли
app.get("/img/:id", cors(), visitorsController.file);

//отримати файли
app.get("/pdf", pdfController.pdf);

//додавання запису в заявку на внесення
//app.post("/create/req", urlencodedParser, visitorsController.createRequest); 

//додавання нового запису у вказану таблицю /regnam передається в запиті/ !!! незахищений роут використовується в формах реєстрації юзерів, потрібно зробити нові роути для юзерів, а ці захистити !!!
app.post("/createInVisitorsEdit", urlencodedParser, visitorsController.editRequest);

//додавання нового запису у таблицю visitors_create
app.post("/createInVisitorsCreate", urlencodedParser, visitorsController.createCpecTable);

//редагування запису
//app.post("/edit", urlencodedParser, visitorsController.edit)

//редагування запису / зараз не використовується
app.post("/editPro", urlencodedParser, visitorsController.editPro)

//редагування запису / !!! незахищений роут використовується в формах реєстрації юзерів, потрібно зробити нові роути для юзерів, а ці захистити !!!
app.post("/editPro2", urlencodedParser, visitorsController.editPro2)

//отримання запису по електронній адресі або мобільному з 3 таблиць
app.post("/get", cors(), urlencodedParser, visitorsController.getRowOnCond2);

//отримання запису по електронній адресі або мобільному з 3 таблиць authController.reCaptcha2
app.post("/get2", cors(), urlencodedParser, authController.reCaptcha2, visitorsController.getRowOnCond2);

//отримання запису по вказаній умові
app.post("/get_spec_cond", cors(), urlencodedParser, visitorsController.getSpecCond);

//відправка файлу по вказаній адресі
app.post("/email", cors(), urlencodedParser, emailController.sendEmail);


//-----------exhibition_vis--------------- 

//додавання запису в exhibition_vis
app.post("/createInExhibition_vis", urlencodedParser, visitorsExhibController.createInExhibition_vis);

//отримати запис з  exhibition_vis про відвідувача вказаної виставки  
app.get("/checkViv", visitorsExhibController.checkViv);

//----------------------------------------


//отримати запис з вказаної таблиці по вказаному полю
app.get("/getAll", sharedController.getAll);


