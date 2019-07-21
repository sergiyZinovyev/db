// var mySend = {
//   "posts": [
//     {
//       "title": "test",
//       "body": "new edit",
//       "id": 5
//     },
//     {
//       "title": "new",
//       "body": "new task",
//       "id": 6
//     }
//   ]
// }

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "remotemysql.com",
  user: "VNXPG3o4kL",
  database: "VNXPG3o4kL",
  password: "XGHAXoGCJk"
});

const app = express();

const host = 'localhost';
const port = 7000;

connection.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
  else{
    console.log("Подключение к серверу MySQL успешно установлено");
  }
});

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// app.get('/', (req, res) => {
//   res.status(200).type('text/plain');
//   res.send(mySend);
//   console.log(`get test`);
// });

// app.post("/", (req, res) => {
//   res.status(200).type('text/plain');
//   mySend = req.body;
//   console.log(`post test`);
// });

//додавання запису в основну базу
app.post("/create", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  
  const email = req.body.email;
  const prizv = req.body.prizv;
  const city = req.body.city;
  const cellphone = req.body.cellphone;

  connection.query("INSERT INTO visitors (email, prizv, city, cellphone) VALUES (?,?,?,?)", [email, prizv, city, cellphone], function(err, data) {
    if(err) return console.log(err);
    console.log(data);
    res.status(200).type('text/plain');
    res.send(data);
  });

});

//додавання запису в заявку на внесення
app.post("/create/req", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);

  connection.query("(SELECT regnum FROM visitors) UNION (SELECT regnum FROM zajavku)", function(err, result) {
    if(err) return console.log(err);
    console.log(result);

    for(let i=0; i < result.length; i++){
      if(result[0].regnum < result[i].regnum){
        result[0].regnum = result[i].regnum;
      }
    }

    const regnum = result[0].regnum+1;
    const email = req.body.email;
    const prizv = req.body.prizv;
    const city = req.body.city;
    const cellphone = req.body.cellphone;

    connection.query("INSERT INTO zajavku (regnum, email, prizv, city, cellphone) VALUES (?,?,?,?,?)", [regnum, email, prizv, city, cellphone], function(err, data) {
      if(err) return console.log(err);
      console.log(data);
      res.status(200).type('text/plain');
      res.send(data);
    });

  });

});

//редагування запису
app.post("/edit", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  
  const email = req.body.email;
  const prizv = req.body.prizv;
  const city = req.body.city;
  const cellphone = req.body.cellphone;
  const regnum = req.body.regnum;

  connection.query("UPDATE visitors SET email=?, prizv=?, city=?, cellphone=? WHERE regnum=?", [email, prizv, city, cellphone, regnum], function(err, data) {
    if(err) return console.log(err);
    console.log(data);
    res.status(200).type('text/plain');
    res.send(data);
  });

});

//отримання запису по електронній адресі
app.post("/get", urlencodedParser, function (req, res) {
        
  if(!req.body) return res.sendStatus(400);

  const email = req.body.email;
  console.log('req.body.email: ',req.body.email);

  connection.query("(SELECT regnum, email, prizv, city, cellphone FROM visitors WHERE email=?) UNION (SELECT regnum, email, prizv, city, cellphone FROM zajavku WHERE email=?)", [email, email], function(err, data) {
    if(err) return console.log(err);
    console.log(data);
    res.status(200).type('text/plain');
    res.send(data);
  });

});


app.get("/db/:id", function(req, res){
  console.log('req.params: ',req.params)
  connection.query(`SELECT regnum, email, prizv, city, cellphone FROM ${req.params.id}`, function(err, data) {
    if(err) return console.log(err);
    res.send(data);
  });
});


app.use((req, res, next) => {
  res.status(404).type('text/plain');
  res.send('Not found');
  //next();
});







app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});