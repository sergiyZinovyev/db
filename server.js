const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const compression = require('compression'); 
//const passport = require('passport');
//const session = require('express-session');
//const RedisStore = require('connect-redis')(session);
//const localStrategy = require('passport-local').Strategy;
//const flash = require('connect-flash');

//підключаємо контроллери
const visitorsController = require('./server/controllers/visitors');
const visitorsExhibController = require('./server/controllers/visitors_exhib');
const emailController = require('./server/controllers/email');
const pdfController = require('./server/controllers/pdf');
const authController = require('./server/controllers/auth'); 
const sharedController = require('./server/controllers/shared');
//const Visitors = require('./server/models/sql-visitors');

const urlencodedParser = bodyParser.urlencoded({extended: false});

//back-end server
const app = express();
//const host = 'localhost'; //dev host
//const host = '192.168.5.107'; //prod host ge
//const host = '31.41.221.156'; //www host test 
const host = 'visitors.galexpo.com.ua'; //prod host 
const port = 7001; //prod
//const port = 7002; //dev
https.createServer({
  key: fs.readFileSync('./server/cert/key.pem'),
  cert: fs.readFileSync('./server/cert/cert.pem')
}, app).listen(port, host, function () {
  console.log(`Server listens https://${host}:${port}`);
});
// app.listen(port, host, function () {
//   console.log(`Server listens http://${host}:${port}`);
// });

//front-end server
const ang = express();
const port2 = 4201; //prod
//const port2 = 4202; //dev
https.createServer({
  key: fs.readFileSync('./server/cert/key.pem'),
  cert: fs.readFileSync('./server/cert/cert.pem')
}, ang).listen(port2, host, function () {
  console.log(`Server2 listens https://${host}:${port2}`);
});

// ang.listen(port2, host, function () {
//   console.log(`Server2 listens http://${host}:${port2}`);
// });
ang.use(express.static(__dirname + "/dist/db"));
ang.use("/", function(request, response){
  response.sendFile(path.join(__dirname+'/dist/db/index.html')); 
});



app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(compression());

//отримати запис з таблиці usersaccount для авторизації
app.post("/users", authController.users);
//------------------------------------------------------------------------------------------------------ 


// *** захищені роути *** 

//отримати всі записи  про візіторсів з вказаної таблиці    
app.get("/visitors/:id", authController.checkAuth, visitorsController.getVisitors);

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


