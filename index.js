const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectToMongo = require('./db');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

//endpoints
app.use('/api/auth', require('./routes/auth'))

app.get('/', (req, res)=>{
    res.send('Hello, world!');
})

//start server
app.listen(port, () => {
    connectToMongo();
    console.log(`Backend listening at http://localhost:${port}`);
  })