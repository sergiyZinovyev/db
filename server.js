const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsController = require('./server/controllers/visitors');

const urlencodedParser = bodyParser.urlencoded({extended: false});

//back-end server
const app = express();
const host = 'localhost';
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



app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



//отримати всі записи з вказаної таблиці
app.get("/db/:id", visitorsController.all);

//додавання запису в заявку на внесення
app.post("/create/req", urlencodedParser, visitorsController.create);

//додавання запису в основну базу
app.post("/createVis", urlencodedParser, visitorsController.createNewVis);

//редагування запису
app.post("/edit", urlencodedParser, visitorsController.edit)

//отримання запису по електронній адресі або мобільному з двох таблиць
app.post("/get", cors(), urlencodedParser, visitorsController.getEmail);

//отримання запису по вказаній умові
app.post("/get_spec_cond", cors(), urlencodedParser, visitorsController.getSpecCond);

//видалення запису з обраної таблиці
app.post("/delete", urlencodedParser, visitorsController.delete)


