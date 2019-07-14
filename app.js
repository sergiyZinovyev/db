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
  user: "SzE7QNsdHz",
  database: "SzE7QNsdHz",
  password: "Tbd64x4I5b"
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
  const password = req.body.password;
  connection.query("INSERT INTO users (email, pass) VALUES (?,?)", [email, password], function(err, data) {
    if(err) return console.log(err);
    console.log(data);
    res.status(200).type('text/plain');
    res.send(data);
  });

});

app.get("/create", function(req, res){
  connection.query("SELECT * FROM users", function(err, data) {
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