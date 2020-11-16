const fs = require('fs');
var logentries = new Object();
var logcounter = 1;
var epoch = generateEpoch();


function generateEpoch () {
    var now = Date.now() / 1000;
    return now;
  }

function LogClear() {
  for (var member in logentries) delete logentries[member];
}
  

function LogEntry(epoch, verb, action, data) {
    var date_ob = new Date();
// current date
// adjust 0 before single digit date   
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth())).slice(-2);

    let day = ("0" + (date_ob.getDay())).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = ("0" + (date_ob.getHours())).slice(-2);

    // current minutes
    let minutes = ("0" + (date_ob.getMinutes())).slice(-2);

    // current seconds
    let seconds = ("0" + (date_ob.getSeconds())).slice(-2);

    var datestring = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    logentries[logcounter] =  {"timestamp": datestring, "runid": epoch, "verb" : verb, "action": action, "data" : data};
    logcounter++;

    var logstring = datestring + "|" +epoch+ "|"+ verb + "|" + action + "|" + data +"\n";
    var filename = './public/logs/'+year+month+day+'_'+epoch+'_ACADS.log';
    fs.appendFile(filename, logstring , function (err) {
        if (err) 
        return console.log(err);
      });
}

module.exports = { LogEntry, generateEpoch, LogClear, logentries:logentries, logcounter:logcounter, epoch: epoch };
