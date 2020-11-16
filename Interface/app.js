const express = require('express')
const path = require('path')
const web_app = express()
const api_app = express()
const web_port = 3000
const api_port = 3001
const dev_mode = 1;
const bodyParser = require('body-parser')
const logging = require('./logging.js');
const { setGlobalVars, SetJSONParms } = require('./control.js')

//console.log(control.i2cobject());

var power_state = -1;
var pos_motor1_state = 0;
var pos_motor2_state = 0;
var idleactivestate = 1;

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
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

api_app.get('/api/ACADS', function(req, res, next) {
  res.send("Not Implemented");
});

api_app.post('/api/ACADS', function(req, res, next) {
    var power = req.body.power;
    var pos_motor1 = req.body.pos_motor1;
    var pos_motor2 = req.body.pos_motor2;
    var runid_change = req.body.runid_change;
    var functionality_check = req.body.functionality_test;
    var idleactive = req.body.idleactive;
    var obj = new Object();

    setGlobalVars(pos_motor1, pos_motor2, power, functionality_check, idleactive, dev_mode);

    if (power != power_state) {
      if (power == 0) {
        logging.LogEntry(logging.epoch,'Power','System Power Off', 0);
        console.log("System Power Off");
      } else {
        logging.LogEntry(logging.epoch,'Power','System Power On', 1);
        console.log("System Power On");
        console.log("Current RunID: "+logging.epoch);
      }
    }

    if(functionality_check) {
      console.log("Functionality Test");
    }

    if(idleactive != idleactivestate && idleactive == 1) {
      logging.LogEntry(logging.epoch,'Power','System Set to Active', 0);
      console.log("System Set to Active");
    }
    
    if(idleactive != idleactivestate && idleactive == 0) {
      logging.LogEntry(logging.epoch,'Power','System Set to Idle', 0);
      console.log("System Set to Idle");
    }


    if (runid_change) {
      logging.epoch = logging.generateEpoch();
      console.log('Request RunID Change');
      console.log('New RunID:'+logging.epoch);

    }



    if (pos_motor1 != pos_motor1_state) {
      logging.LogEntry(logging.epoch,'Motor1','Motor 1 Position Change', pos_motor1)
      console.log('Move Motor 1 to Position '+ pos_motor1)
    }

    if (pos_motor2 != pos_motor2_state) {
      logging.LogEntry(logging.epoch,'Motor2','Motor 2 Position Change', pos_motor2)
      console.log('Move Motor 2 to Position '+ pos_motor2)
    }

    var obj = SetJSONParms();
      /*obj["pos_motor1"] = pos_motor1;
      obj["pos_motor2"] = pos_motor2;
      obj["quadrant_hallsensor1"] = 1;
      obj["quadrant_hallsensor2"] = 4;
      obj["power"] =  power;
      obj["status_encoder1"] =  1;
      obj["status_encoder2"] =  1;
      obj["status_hallsensor1"] =  1;
      obj["status_hallsensor2"] =  1;
      obj["status_motor1"] =  1;
      obj["status_motor2"] =  1;
      obj["status_powersupply1"] =  1;
      obj["status_powersupply2"] =  1;
      obj["status_powersupply3"] =  1;
      obj["status_megacap1"] =  1;
      obj["status_megacap2"] =  1;
      obj["status_braking_circuit1"] =  0;
      obj["status_braking_circuit2"] =  1;
      obj["status_microcontroller1"] =  1;
      obj["status_microcontroller2"] =  1;
      obj["voltage_input"] =  7.88;
      obj["voltage_input_5s"] =  6.53;
      obj["voltage__input_10s"] =  6.44;
      obj["voltage_Input_30s"] =  6.45*/
      obj["runid"] = logging.epoch;
      obj["logentries"] = {};
      for (x in logging.logentries) {
        var item = logging.logentries[x];
        obj["logentries"][x] =  {"timestamp": item.timestamp, "runid": item.runid, "verb" : item.verb, "action": item.action, "data" : item.data};
      }

    var json = JSON.stringify(obj); 
    
   // console.log(json);
  res.send(json);  

   power_state = power;
   pos_motor1_state = pos_motor1;
   pos_motor2_state = pos_motor2;
   idleactivestate = idleactive;
   logging.LogClear();
    next();
});


api_app.listen(api_port, () => {
  console.log(`API app listening at http://localhost:${api_port}`)
})
      
    
    
  