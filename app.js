const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');
var uuid = require('node-uuid')
const http = require('http');
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const connectDB = require('./db');
const Logger = require('./src/helpers/logger.helper')

function assignId (req, res, next) {
  req.id = uuid.v4()
  next()
}


dotenv.config();

app.set('view engine', 'ejs');
mongoose.Promise  = global.Promise;

if(process.env.NODE_ENV==="test"){
  process.env.DB = process.env.TEST_DB
}

//Mongodb connection
connectDB();

//Init logger
Logger();

//To enable Cross-Origin Resource Sharing
let domain = "*"
if(process.env.NODE_ENV === "dev"){
  domain = "*"
}
app.use(cors({
  origin: domain
}));


// File Upload
app.use(fileUpload());


//BodyParser
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


if(process.env.NODE_ENV === "dev"){
  app.use(morgan(':url - :status - :res[content-length] Bytes - :response-time ms - :referrer'))
}else{
  app.use(assignId)
  app.use(morgan(':url - :status - :res[content-length] Bytes - :response-time ms - :referrer',{
    stream: fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' })
  }))
}



//Route
app.use('/api/v1/user',require('./src/routes/v1/user.route'));

//Error Handling
app.use(function(err,req,res,next){
  console.log('ErrorCatch', err);
  if(process.env.NODE_ENV === "production"){
    res.status(500).send({ desc: err.desc || "Something Went Wrong" });
    logger.error(JSON.stringify(log));
  }else{
    res.status(500).send({ desc: err.desc, stack: err.stack, message: err.message });
  }
});


console.log(process.env.DOMAIN)


io.on('connection', (socket) => {
  global.gSocket = socket
})

module.exports = app
