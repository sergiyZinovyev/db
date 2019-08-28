const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
//const RedisStore = require('connect-redis')(session);
const localStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');


const visitorsController = require('./server/controllers/visitors');
const emailController = require('./server/controllers/email');
const pdfController = require('./server/controllers/pdf');

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

// function checkAuth(){
//   return app.use((req, res, next) => {
//     if(req.user)
//       next();
//     else
//       console.log("checkAuth: error!")
//       //res.redirect('/login');
//   });
//  }

// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// app.use(session({
//   secret: 'you secret key',
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new localStrategy(
//   {
//     usernameField: 'login',
//     passwordField: 'password'
//   },
//   (user, password, done) => {
//   if(user !== 'Sergey')
//     return done(null, false, {message: 'User not found'});
//   else if(password !== 'serg')
//     return done(null, false, {message: 'Wrong password'});
 
//   return done(null, {id: 14, name: 'Sergey', age: 39});
//  }));
app.use(function (req, res, next) {
  console.log('Request Type:', req.headers);
  next()
});
// app.use((req, res, next) => {
//   if(req.user)
//     next();
//   else
//     console.log("app.use: res.redirect('/login')")
//     //res.redirect('/login');
//  });
 
//отримати запис з таблиці usersaccount
app.post("/users", visitorsController.users);

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

//додавання запису в основну базу
app.post("/createVis", urlencodedParser, visitorsController.createNewVis);

//редагування запису
//app.post("/edit", urlencodedParser, visitorsController.edit)

//редагування запису
app.post("/editPro", urlencodedParser, visitorsController.editPro)

//отримання запису по електронній адресі або мобільному з 3 таблиць
app.post("/get", cors(), urlencodedParser, visitorsController.getRowOnCond2);

//отримання запису по електронній адресі або мобільному з 3 таблиць
app.post("/get/regnum", cors(), urlencodedParser, visitorsController.getRowOnCond);

//отримання запису по вказаній умові
app.post("/get_spec_cond", cors(), urlencodedParser, visitorsController.getSpecCond);

//видалення запису з обраної таблиці
app.post("/delete", urlencodedParser, visitorsController.delete)

//відправка файлу по вказаній адресі
app.post("/email", cors(), urlencodedParser, emailController.sendEmail);
