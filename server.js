const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
//const passport = require('passport');
//const session = require('express-session');
//const RedisStore = require('connect-redis')(session);
//const localStrategy = require('passport-local').Strategy;
//const flash = require('connect-flash');


const visitorsController = require('./server/controllers/visitors');
const visitorsExhibController = require('./server/controllers/visitors_exhib');
const emailController = require('./server/controllers/email');
const pdfController = require('./server/controllers/pdf');
const authController = require('./server/controllers/auth');
//const Visitors = require('./server/models/sql-visitors');

const urlencodedParser = bodyParser.urlencoded({extended: false});

//back-end server
const app = express();
const host = 'localhost'; //dev host
//const host = '192.168.5.107'; //prod host
const port = 7001;
app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});

//front-end server
const ang = express();
const port2 = 4201;
ang.listen(port2, host, function () {
  console.log(`Server2 listens http://${host}:${port2}`);
});
ang.use(express.static(__dirname + "/dist/db"));
ang.use("/", function(request, response){
  response.sendFile(path.join(__dirname+'/dist/db/index.html')); 
});



app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));



//отримати запис з таблиці usersaccount для авторизації
app.post("/users", authController.users);
//------------------------------------------------------------------------------------------------------


// *** захищені роути ***

//отримати всі записи з вказаної таблиці 
app.get("/visitors/:id", authController.checkAuth, visitorsController.all);

//додавання запису в основну базу
app.post("/createVis", authController.checkAuth, urlencodedParser, visitorsController.createNewVis);

//видалення запису з обраної таблиці
app.post("/delete", authController.checkAuth, urlencodedParser, visitorsController.delete);

//отримати запис з таблиць visitors, visitors_create по id
app.get("/checkIdVisitor", authController.checkAuth, visitorsController.checkIdVisitor);

//-----------exhibition_vis---------------

//отримати всі записи про відвідувачів з вказаної виставки 
app.get("/visexhib/:id", authController.checkAuth, visitorsExhibController.visexhib);

//редагування запису в exhibition_vis
app.post("/editExhibition_vis", authController.checkAuth, urlencodedParser, visitorsExhibController.editExhibition_vis);

//----------------------------------------
//------------------------------------------------------------------------------------------------------


// *** не захищені роути ***

//отримати всі записи з вказаної таблиці 
app.get("/db/:id", visitorsController.all);

//отримати файли
app.get("/img/:id", cors(), visitorsController.file);

//отримати файли
app.get("/pdf", pdfController.pdf);

//додавання запису в заявку на внесення
//app.post("/create/req", urlencodedParser, visitorsController.createRequest);

//додавання запису в заявку на зміни
app.post("/createInVisitorsEdit", urlencodedParser, visitorsController.editRequest);

//додавання запису в заявку на внесення
app.post("/createInVisitorsCreate", urlencodedParser, visitorsController.createCpecTable);

//редагування запису
//app.post("/edit", urlencodedParser, visitorsController.edit)

//редагування запису
app.post("/editPro", urlencodedParser, visitorsController.editPro)

//отримання запису по електронній адресі або мобільному з 3 таблиць
app.post("/get", cors(), urlencodedParser, visitorsController.getRowOnCond2);

//отримання запису по електронній адресі або мобільному з 3 таблиць
//app.post("/get/regnum", cors(), urlencodedParser, visitorsController.getRowOnCond);

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





