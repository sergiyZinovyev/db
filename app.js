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

const app = express();

const host = 'localhost';
const port = 7000;

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

app.use((req, res, next) => {
  res.status(404).type('text/plain');
  res.send('Not found');
  //next();
});







app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});