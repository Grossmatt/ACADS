const fs = require('fs');

function LogEntry(verb, action, data) {

    var date_ob = new Date();
// current date
// adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    let day = ("0" + (date_ob.getDay() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    var logstring = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "|" + verb + "|" + action + "|" + data +"\n";
    var filename = './public/logs/'+year+month+day+'_ACADS.log';
    fs.appendFile(filename, logstring , function (err) {
        if (err) 
        return console.log(err);
      });
}

module.exports = { LogEntry };
