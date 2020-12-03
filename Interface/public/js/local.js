var fg_color_enable;
var fg_color_disable;
var bg_color_enable;
var bg_color_disable;
var _power = 0;
var _posmotor1 = 0;
var _posmotor2 = 0;
var _runidchange = 0;
var _functionality_test = 0;
var _currentrunid = 0;
var _idleactive = 1;
var runidarray = [];
const apiserver =  "localhost";
const apirefresh = 1000;

//This function is used to Toggle the colors of motors with Dark/light mode switch
function ToggleMotorColors() {
  if($('body').hasClass('dark')) {
    $('#motor1leftarrow').attr('src','img/backward-arrow-dark.png');
    $('#motor1rightarrow').attr('src','img/forward-arrow-dark.png');
    $('#motor2leftarrow').attr('src','img/backward-arrow-dark.png');
    $('#motor2rightarrow').attr('src','img/forward-arrow-dark.png');
    fg_color_enable = '#1bf782';
    fg_color_disable = '#4d2834';
    bg_color_enable = '#4a4646';
    bg_color_disable = '#4a4646';
   } else {
    $('#motor1leftarrow').attr('src','img/backward-arrow-light.png');
    $('#motor1rightarrow').attr('src','img/forward-arrow-light.png');
    $('#motor2leftarrow').attr('src','img/backward-arrow-light.png');
    $('#motor2rightarrow').attr('src','img/forward-arrow-light.png');
    fg_color_enable = ' #0099ff';
    fg_color_disable = '#008080';
    bg_color_enable = '#dad7d7';
    bg_color_disable = '#dad7d7';
   }
}


//This is to disable/enable motor controls for active/idle and poweron/poweroff
//action = 0 disable, 1 enable
function EnableDisableKnobs(action) {
  if (action == 0) {
    $('.motor').css('pointer-events','none');
    
    $('.knob').trigger('configure', {'fgColor':fg_color_disable});
    $('.knob').trigger('configure', {'bgColor':bg_color_disable}); 
    $('#motor1').trigger('change');
    $('#motor2').trigger('change');

  } else {
    $('.motor').css('pointer-events','auto');
    $('.knob').trigger('configure', {'fgColor':fg_color_enable});
    $('.knob').trigger('configure', {'bgColor':bg_color_enable});
    $('#motor1').trigger('change');
    $('#motor2').trigger('change');
  }
}


//this function is use to send new data to API, should happen
//after every interaction
function SendtoAPI() { 
  var js_obj = new Object(); 
 
      js_obj["pos_motor1"] = _posmotor1;
      js_obj["pos_motor2"] = _posmotor2;
      js_obj["power"] =  _power;
      js_obj["runid_change"] = _runidchange;
      js_obj["functionality_test"] = _functionality_test;
      js_obj["idleactive"] = _idleactive;

  var data = JSON.stringify(js_obj);
  //console.log(data);

  $.ajax({
    type: "POST",
    url: "http://"+apiserver+":3001/api/ACADS",
    data: data,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(result){
      UpdateGUI(result);
      _runidchange = 0;
      _functionality_test = 0;
    },
    error: function(errMsg) {
       console.log(errMsg);
    }
});

}


//this is to add a new entry to log on troubleshooting page
function AddLogEntry(entry, type) {
    $('#logbox').append('<log class="'+type+'">'+entry+'</br></log>');
}

//this function is called on ajax callbacks to update the interface
//with new values
function UpdateGUI(data) { 
    
    updateMotor1(data.pos_motor1,false);
    updateMotor2(data.pos_motor2,false);
    
    _currentrunid = data.runid;
    $('#runidtext').html(_currentrunid);
    
    if (data.power == 0) {
      PowerOff(false);
      return;
    } else {
      PowerOn(false);
    }

    if (!data.idleactive && data.power == 1) {
      $('#idleactive').css('color','red');
      EnableDisableKnobs(0);
    } else if (data.idleactive && data.power == 1){
      $('#idleactive').css('color','green');
      EnableDisableKnobs(1);
    }
    

    for (var key in data.logentries) {
      var logentry = data.logentries[key];
      AddLogEntry(logentry.timestamp + "  |  " +logentry.runid+ "  |  "+ logentry.verb + "  |  " + logentry.action + "  |  " + logentry.data,logentry.verb);
    }
    
    for (var key in data) {
      
      if (key.substring(0,6) == "status") {
        if (data[key] == 1) {
           $('#'+key).text("OK").addClass('status-on').removeClass('status-off').removeClass('status-error');

        } else {
          $('#'+key).text("ERR").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
        
      } else if (key.substring(0,11) == "power_input") {
        if (data[key] > 0) {
          $('#'+key).text(data[key]).addClass('status-on').removeClass('status-off').removeClass('status-error');
        } else {
          $('#'+key).text("0.00").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
      }  else if (key.substring(0,7) == "braking") {
        if (data[key] > 0) {
          $('#'+key).text(data[key]).addClass('status-on').removeClass('status-off').removeClass('status-error');
        } else {
          $('#'+key).text("0.00").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
      }
    }
  }


//this function is used only to upload a manual JSON file for testing
//or possibly if we want to do a "start' configuration
function GetTestData(url) {  
  $.ajax({url: url, success: function(result) {
    
    var data = JSON.parse(result);
    updateMotor1(data.pos_motor1);
    updateMotor2(data.pos_motor2);
    $('#motor1inputbox').val(Math.round(data.pos_motor1));
    $('#motor2inputbox').val(Math.round(data.pos_motor2));
    
    if (data.power == 0) {
      PowerOff();
      return;
    } else {
      PowerOn();
    }
    
    

    for (var key in data.logentries) {
      var logentry = data.logentries[key];
      AddLogEntry(logentry.timestamp + "  |  " +logentry.runid+ "  |  "+ logentry.verb + "  |  " + logentry.action + "  |  " + logentry.data,logentry.verb);
    }
    
    for (var key in data) {
      
      if (key.substring(0,6) == "status") {
        if (data[key] == 1) {
           $('#'+key).text("OK").addClass('status-on').removeClass('status-off').removeClass('status-error');

        } else {
          $('#'+key).text("ERR").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
        
      } else if (key.substring(0,11) == "power_input") {
        if (data[key] > 0) {
          $('#'+key).text(data[key]).addClass('status-on').removeClass('status-off').removeClass('status-error');
        } else {
          $('#'+key).text("0.00").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
      }  else if (key.substring(0,7) == "braking") {
        if (data[key] > 0) {
          $('#'+key).text(data[key]).addClass('status-on').removeClass('status-off').removeClass('status-error');
        } else {
          $('#'+key).text("0.00").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
      }
    }
  }
  });
}

//these  functions updates the motor control
//you have to trigger change when change values for it to 
//reflect on the page
function updateMotor1(pos,send = true) {
  $('#motor1').val(pos).trigger('change');
  _posmotor1 = pos;
  if(send) {
   SendtoAPI();
  }
}

function updateMotor2(pos,send = true) {
  $('#motor2').val(pos).trigger('change');
  _posmotor2 = pos;
  if(send) {
   SendtoAPI();
  }
}

//these functions are for the power on and off switch
//the send parameter is if we want to send the values to 
//API or not
function PowerOn (send = true) {
  var motor1 = $('#motor1');
  var motor2 = $('#motor2');
  EnableDisableKnobs(1);
  _power = 1.
  $('#motor1').val(motor1.val()).trigger('change');
  $('#motor2').val(motor2.val()).trigger('change');
  $('#powerswitch').children('input').prop('checked',true)
  $('#power').text("ON").addClass('status-on').removeClass('status-error').removeClass('status-off');
  if(send) {
    SendtoAPI();
  }
}

function PowerOff (send = true) {
  var motor1 = $('#motor1');
  var motor2 = $('#motor2');
  EnableDisableKnobs(0);
  _power = 0;
  $('#motor1').val(motor1.val()).trigger('change');
  $('#motor2').val(motor2.val()).trigger('change');
  $('#powerswitch').children('input').prop('checked',false)
  $('#power').text("OFF").addClass('status-off').removeClass('status-error').removeClass('status-on');
  $('.status').text("OFF").addClass('status-off').removeClass('status-error').removeClass('status-on');
  $('.voltage,.power').text("0.00").addClass('status-off').removeClass('status-error').removeClass('status-on');
  if(send) {
    SendtoAPI();
   }
}
 
 
//this is all actions that occur on document load
//contains all dom object bindings
$(function($) {
  var motor1 = $('#motor1');
     var motor2 = $('#motor2');
     
     //this is for the autorefesh of the page
     window.setInterval(function(){
      SendtoAPI();
    }, apirefresh);
     
     //this is the inital toggle for the light mode as a start
     //mode
     ToggleMotorColors();
     
     
     
     //these motor1 and motor2 knob intialize the motor controls
     //the change, release, cancel and format are the used parms
     motor1.knob({
      change : function (value) {
          console.log("change1 : " + value);
          $('#motor1inputbox').val(Math.round(value));
          _posmotor1 = Math.round(value);
          SendtoAPI();
      },



      release : function (value) {
          //console.log(this.$.attr('value'));
          console.log("release1 : " + value)
      },
      cancel : function () {
          console.log("cancel1 : ", this);
      },
      format : function (value) {
          //alert('format');
          return value + '\u00B0';
      },
      draw : function () { 
       
      }
     });

      motor2.knob({
      change : function (value) {
          console.log("change1 : " + value);
          $('#motor2inputbox').val(Math.round(value))
          _posmotor2 = Math.round(value);
          SendtoAPI();
      },
      release : function (value) {
          //console.log(this.$.attr('value'));
          console.log("release1 : " + value);
      },
      cancel : function () {
          console.log("cancel1 : ", this);
      },
      format : function (value) {
          //alert('format');
          return value + '\u00B0';
      },
      draw : function () {   
      }
     });
    //this starts knobs in disabled mode
    EnableDisableKnobs(0);
    
    //we have to trigger a change to update the knobs on front end
    $('#motor1').val(motor1.val()).trigger('change');
    $('#motor2').val(motor2.val()).trigger('change');
    
    //this binding is to detect when the power is switched on and off
    $('#powerswitch').click(function() {
      if($(this).children('input').is(':checked')) {
       PowerOn();
      } else {
        PowerOff();
      }
  });
  
  //this is to switch from light/dark mode
  $('#modeswitch').click(function() {
    if($(this).children('input').is(':checked')) {
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .s_informationbox,.labelcolumn, '+
      '.informationbox, .statusbox, s_statusbox, .bottomcolumn, .control-button, .logbox, .datetimebox,'+
      ' .filterbox, .runidtext, .submitbutton, .runiddropdown, .datetimeselect').addClass('dark').removeClass('light');
      ToggleMotorColors();
      if($('#powerswitch').children('input').is(':checked')) {
        EnableDisableKnobs(1);
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
      } else {
        EnableDisableKnobs(0);
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
      }
    } else {
      ToggleMotorColors();
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .s_informationbox,.labelcolumn, '+
      '.informationbox, .statusbox, s_statusbox, .bottomcolumn, .control-button, .logbox, .datetimebox,'+
      ' .filterbox, .runidtext, .submitbutton, .runiddropdown, .datetimeselect').addClass('light').removeClass('dark');
      ToggleMotorColors();
      if($('#powerswitch').children('input').is(':checked')) {
        EnableDisableKnobs(1);
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');

      } else {
        EnableDisableKnobs(0);
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
      }
    }
});


//this is the binding for the functionality test button
$('#functionalitycheck').click(function() {
  _functionality_test = 1;
  SendtoAPI();
});


//idleactive is the button to toggle idle active/idle
//this function changes the color
$('#idleactive').css('color','green');

$('#idleactive').click(function () {
  if ($(this).text() == "Active") {
      $(this).css('color','red');
      _idleactive = 0;
      updateMotor1(0);
      updateMotor2(0);
      $(this).text("Idle");
      if (_power == 1 ) {
      EnableDisableKnobs(0);
      }   
    } else {
        $(this).text("Active");
        $(this).css('color','green');
        _idleactive = 1;
        if (_power == 1 ) {
          EnableDisableKnobs(1);
      }
    }
  });
  var timeout = null;
  
  //motor input boxes are the boxes beneath the motor control
  //this controls all the boxes actions, including the constraints
  //as well as updating the motors
  
  $('#motor1inputbox').keyup( function() { 
    var obj = this;
    if (timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
    var value = parseInt($(obj).val());
    if(value > 40) {
      $(obj).val('40');
      $('#motor1inputbox').val("40");
    }
    if(value < -40) {
      $(obj).val("-40");
      $('#motor1inputbox').val("-40");
    }
    updateMotor1($(obj).val());
    }, 1000);
  });

  $('#motor2inputbox').keyup( function() { 
    var obj = this;
    if (timeout !== null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
    var value = parseInt($(obj).val());
    if(value > 40) {
      $(obj).val('40');
    }
    if(value < -40) {
      $(obj).val("-40");
      $('#motor2inputbox').val("-40");
    }
    updateMotor2($(obj).val());
    }, 1000);
  });

  //these control the arrows on the sides of the input boxes
  //they move the motors in 1 degree increments
  $('#motor1leftarrow').click( function() {
      var value = parseInt(motor1.val()) - 1;
      if (value < -40)
        value = -40;
      $('#motor1inputbox').val(value);
      updateMotor1(value);
  });
  $('#motor1rightarrow').click( function() {
    var value = parseInt(motor1.val()) + 1;
    if (value > 40)
      value = 40;
    $('#motor1inputbox').val(value);
    updateMotor1(value);
  });

  $('#motor2leftarrow').click( function() {
    var value = parseInt(motor2.val()) - 1;
    if (value < -40)
      value = -40;
    $('#motor2inputbox').val(value);
    updateMotor2(value);
});
$('#motor2rightarrow').click( function() {
  var value = parseInt(motor2.val()) + 1;
  if (value > 40)
    value = 40;
  $('#motor2inputbox').val(value);
  updateMotor2(value);
});


  //the next two bindings are the top menu
  //they toggle between the troubleshooting page
  //and the motor control page
  $('#MotorControl').click(function (){
      $('#ScreenMotorControl').show();
      $('#ScreenTroubleShooting').hide();
      $('#TroubleShooting').removeClass('selected');
      $(this).addClass('selected');
  });

  $('#TroubleShooting').click(function (){
    $('#ScreenMotorControl').hide();
    $('#ScreenTroubleShooting').show();
    $('#MotorControl').removeClass('selected');
    $(this).addClass('selected');
   });

  //this binding is for the Manual JSON button to upload aLinkcolor
  //manual file
   $('#jsontest').click(function () {
     GetTestData('json/example.json');
     //SendtoAPI();
   });
   
   
   //the next bindings control the filtering functions of the troubleshooting page
   $("#filterall").click(function() {
    $(".filtertest").prop("checked", $(this).prop("checked"));
    if ($(this).prop("checked")) {
      $("log").show();
    } else {
      $("log").hide();
    }
  });

  $(".filtertest").click(function() {
    var filter = $(this).val();
    if (!$(this).prop("checked")) {
        $("#filterall").prop("checked", false);
        $("."+filter).hide();
    } else {
        $("."+filter).show();
    }
  });

  //this controls the run id changing functions and the button
  $("#generaterunid").click(function(){
    _runidchange = 1;
    $('#runidtext').html(_currentrunid);
    runidarray.push(_currentrunid);
    SendtoAPI();
  });

 });

//this is to generate a timestamp
//Epochs are generated for run id in the api/ACADS
//this is no longer used
function generateEpoch () {
  var now = Date.now() / 1000;
  return now;
}

