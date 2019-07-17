var mySend = {
  "posts": [
    {
      "title": "test",
      "body": "new edit",
      "id": 5
    },
    {
      "title": "new",
      "body": "new task",
      "id": 6
    }
  ]
}

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


app.get('/', (req, res) => {
  res.status(200).type('text/plain');
  res.send(mySend);
  console.log(`get test`);
});

app.post("/", (req, res) => {
  res.status(200).type('text/plain');
  mySend = req.body;
  console.log(`post test`);
});

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

app.post("/get", urlencodedParser, function (req, res) {
        
  if(!req.body) return res.sendStatus(400);

  const email = req.body.email;
  console.log(req.body.email);

  connection.query("SELECT * FROM visitors WHERE email=?", [email], function(err, data) {
    if(err) return console.log(err);
    console.log(data);
    res.status(200).type('text/plain');
    res.send(data);
  });

});

app.get("/create", function(req, res){
  connection.query("SELECT * FROM visitors", function(err, data) {
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