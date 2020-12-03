const express = require('express')
const path = require('path')
const web_app = express()
const api_app = express()
const web_port = 3000
const api_port = 3001
const dev_mode = 1;
const bodyParser = require('body-parser')
const logging = require('./logging.js');
//for developent use dev-control, for non use control.js
//it excludes i2c code
const { setGlobalVars, SetJSONParms } = require('./dev-control.js')

//intial global variable values
//these update as teh program runs
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
    
//these allow us to post json as well as allows public access to the public folder
api_app.use(bodyParser.json()); // support json encoded bodies
api_app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
api_app.use(express.static(path.join(__dirname, 'public')));

//need to allow cross origin since web and api are on different ports
api_app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//get function disabled for api, must be sent through post
api_app.get('/api/ACADS', function(req, res, next) {
  res.send("Not Implemented");
});

api_app.post('/api/ACADS', function(req, res, next) {
  //recieved json, now to process request
    var power = req.body.power;
    var pos_motor1 = req.body.pos_motor1;
    var pos_motor2 = req.body.pos_motor2;
    var runid_change = req.body.runid_change;
    var functionality_check = req.body.functionality_test;
    var idleactive = req.body.idleactive;
    var obj = new Object();
    
    //the resets all global variables
    setGlobalVars(pos_motor1, pos_motor2, power, functionality_check, idleactive, dev_mode);


    //this is detecting a change in power state, from on to off and logging if necessary
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
    
    //functionality_check, just logs as far a now, waiting for integration to implement
    if(functionality_check) {
      console.log("Functionality Test");
    }
    
    //this controls idle/active state buttons
    if(idleactive != idleactivestate && idleactive == 1) {
      logging.LogEntry(logging.epoch,'Power','System Set to Active', 0);
      console.log("System Set to Active");
    }
    
    if(idleactive != idleactivestate && idleactive == 0) {
      logging.LogEntry(logging.epoch,'Power','System Set to Idle', 0);
      console.log("System Set to Idle");
    }

    //this detects run id changes
    if (runid_change) {
      logging.epoch = logging.generateEpoch();
      console.log('Request RunID Change');
      console.log('New RunID:'+logging.epoch);

    }


    //this is detecting if there is a motor position change, if so it's logging the action
    if (pos_motor1 != pos_motor1_state) {
      logging.LogEntry(logging.epoch,'Motor1','Motor 1 Position Change', pos_motor1)
      console.log('Move Motor 1 to Position '+ pos_motor1)
    }

    if (pos_motor2 != pos_motor2_state) {
      logging.LogEntry(logging.epoch,'Motor2','Motor 2 Position Change', pos_motor2)
      console.log('Move Motor 2 to Position '+ pos_motor2)
    }
    
    //this is setting the JSON parms received to a javascript object
    var obj = SetJSONParms();
      obj["runid"] = logging.epoch;
      obj["logentries"] = {};
      for (x in logging.logentries) {
        var item = logging.logentries[x];
        obj["logentries"][x] =  {"timestamp": item.timestamp, "runid": item.runid, "verb" : item.verb, "action": item.action, "data" : item.data};
      }

    var json = JSON.stringify(obj); 
   //sending the response back to interface
  res.send(json);  
  
   //setting new state information
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
      
    
    
  