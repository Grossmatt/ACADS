const express = require('express')
const path = require('path')
const web_app = express()
const api_app = express()
const web_port = 3000
const api_port = 3001
const bodyParser = require('body-parser')
require('./control.js');

web_app.use(express.static(path.join(__dirname, 'public')));

web_app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/control.html'));
});

web_app.listen(web_port, () => {
  console.log(`ACADS web app listening at http://localhost:${web_port}`)
})
    

api_app.use(bodyParser.json()); // support json encoded bodies
api_app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
api_app.use(express.static(path.join(__dirname, 'public')));


api_app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

api_app.get('/api/ACADS', function(req, res, next) {
  res.send("Not Implmented");
});

api_app.post('/api/ACADS', function(req, res, next) {
    var power = req.body.power;
    var pos_motor1 = req.body.pos_motor1;
    var pos_motor2 = req.body.pos_motor2;

    var obj = {"power": power, "pos_motor1" : pos_motor1, "pos_motor2": pos_motor2};
    var json = JSON.stringify(obj); 
    
    console.log(json);
    res.send(json);  
    next();
});


api_app.listen(api_port, () => {
  console.log(`API app listening at http://localhost:${api_port}`)
})
    
    
    
    
    
    
    
    
    
  