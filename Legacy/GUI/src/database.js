const sqlite3 = require('sqlite3').verbose();
var d = new Date();

let db = new sqlite3.Database('./db/Feedback' + '_' + (d.getMonth() + 1).toString() + 
    '_' + d.getDate().toString() + '_' + ((d.getHours() > 12) ? d.getHours() - 12 : d.getHours()).toString() + '_' + 
    d.getMinutes().toString() + '_' + d.getSeconds().toString() + '.db', (err) => {

    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the feedback data SQlite database.');
  });

db.run('CREATE TABLE Feedback(Time REAL PRIMARY KEY ASC, Position1 REAL, Position2 REAL, SupplyVoltage1 REAL, SupplyVoltage2 REAL, BrakingVoltage REAL)', function(err) {
  if (err) {
    return console.log(err.message);
  }
});

// npm install sqlite3 --build-from-source --runtime=electron --target=7.1.8 --dist-url=https://atom.io/download/electron needs to use this command for sqlite3 to be compatible with electron