const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
//const db = require('./server/db');
const visitorsController = require('./server/controllers/visitors');

const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express();

const host = 'localhost';
const port = 7001;

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// app.use(express.static(__dirname + "/dist/db"));
 
// app.use("/", function(request, response){
//   response.sendFile(path.join(__dirname+'/dist/db/index.html')); 
// });

//отримати всі записи з вказаної таблиці
app.get("/db/:id", visitorsController.all);

//додавання запису в заявку на внесення
app.post("/create/req", urlencodedParser, visitorsController.create);

//редагування запису
app.post("/edit", urlencodedParser, visitorsController.edit)

//отримання запису по електронній адресі з двох таблиць
app.post("/get", cors(), urlencodedParser, visitorsController.getEmail);


