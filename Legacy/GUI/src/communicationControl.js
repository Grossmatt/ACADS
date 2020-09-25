var net = require('net');

function commandParse(data){
  var dataArray = data.toString().split(',');
  
  console.log(dataArray[0]);
  console.log(dataArray[1]);

  switch(dataArray[0]){
    case "feedback":
      var time = parseFloat(dataArray[1]);
      var position1 = parseFloat(dataArray[2]);
      var position2 = parseFloat(dataArray[3]);
      var supplyVoltage1 = parseFloat(dataArray[4]);
      var supplyVoltage2 = parseFloat(dataArray[5]);
      var brakingVoltage = parseFloat(dataArray[6]);
      myKnob1.setValue(position1);
      myKnob2.setValue(position2);
      db.run('INSERT INTO Feedback(Time, Position1, Position2, SupplyVoltage1, SupplyVoltage2, BrakingVoltage) VALUES (?, ?, ?, ?, ?, ?)',[time, position1, position2, supplyVoltage1, supplyVoltage2, brakingVoltage], function(err) {
        if (err) {
          return false, console.log(err.message);
        }
        else{
          addData(feedbackPositionChart, 'Position 1', {x: time,y: position1});
          addData(feedbackPositionChart, 'Position 2', {x: time,y: position2});
          addData(feedbackVoltageChart, 'Supply Voltage 1', {x: time,y: supplyVoltage1});
          addData(feedbackVoltageChart, 'Supply Voltage 2', {x: time,y: supplyVoltage2});
          addData(feedbackVoltageChart, 'Braking Voltage', {x: time,y: brakingVoltage});
          return true;
        }
      });
      break;
    case "functionality":
      var functioning = parseInt(dataArray[1]);
      alert("The motor system is " + (functioning == 1 ? "functioning correctly." : "not functioning correctly."))
      break;
    default: alert("Unsupported or Corrupted feedback received");
  }
}

var client = new net.Socket();

client.connect(5535, '10.0.0.1', function() {
  console.log('Connected');
  // client.write('Hello; Client.');  
});

client.on('data', function(data) {
  var newData = commandParse(data); 
  if(newData){
    console.log("New Data");
  }
});

client.on('close', function() {
  console.log('Connection closed');
});

client.on('error', function() {
  alert("Error writing to carrier board");
});

function sendOff(){
    client.write('powerOff');
    client.destroy(); // kill client 
}

function functionalityTest(){
  client.write('functionalityTest');

}

function powerOn(){
  client.write('powerOn');
}

function updateMotor1(){
  var position = document.getElementById("degrees1").value;
  client.write("updateMotor1, " + position);
}

function updateMotor2(){
  var position = document.getElementById("degrees2").value;
  client.write("updateMotor2, " + position);
}

function uploadProfile(){
  var f = document.getElementById("fileSelect");

  if ('files' in f){
    if (f.files.length == 0) {
      alert("No file selected");
    }
    else if(f.files.length > 1) {
      alert("too many files selected");
    }
    else{
      var data = Papa.parse(f.files[0], {
        complete: function(results) {
          var position; 
          client.write("profile");
              position = results.data;
              console.log(position);
              client.write(position + '#');
        }
      });
    }
  }
  else{
    alert("File not Found")
  }
}


document.getElementById("powerOff").onclick = function(){sendOff()};
document.getElementById("sendPosition1").onclick = function(){updateMotor1()};
document.getElementById("sendPosition2").onclick = function(){updateMotor2()};
document.getElementById("uploadData").onclick = function(){uploadProfile()};
document.getElementById("checkFunction").onclick = function(){functionalityTest()};
document.getElementById("powerOn").onclick = function(){powerOn()};