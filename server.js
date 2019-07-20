const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express();

const host = 'localhost';
const port = 7001;


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) => {
  res.status(200).type('text/plain');
  res.send(`Server started`);
});


app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});