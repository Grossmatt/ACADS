var fg_color_enable;
var fg_color_disable;
var bg_color_enable;
var bg_color_disable;
var _power = 0;
var _posmotor1 = 0;
var _posmotor2 = 0;

function ToggleMotorColors() {
  if($('body').hasClass('dark')) {
    $('#motor1leftarrow').attr('src','img/dark-leftarrow.png');
    $('#motor1rightarrow').attr('src','img/dark-rightarrow.png');
    $('#motor2leftarrow').attr('src','img/dark-leftarrow.png');
    $('#motor2rightarrow').attr('src','img/dark-rightarrow.png');
    fg_color_enable = '#1bf782';
    fg_color_disable = '#4d2834';
    bg_color_enable = '#4a4646';
    bg_color_disable = '#4a4646';
   } else {
    $('#motor1leftarrow').attr('src','img/light-leftarrow.png');
    $('#motor1rightarrow').attr('src','img/light-rightarrow.png');
    $('#motor2leftarrow').attr('src','img/light-leftarrow.png');
    $('#motor2rightarrow').attr('src','img/light-rightarrow.png');
    fg_color_enable = ' #0099ff';
    fg_color_disable = '#008080';
    bg_color_enable = '#dad7d7';
    bg_color_disable = '#dad7d7';
   }
}

function EnableDisableKnobs(action) {
  if (action == 0) {
    $('.motor').css('pointer-events','none');
    
    $('.knob').trigger('configure', {'fgColor':fg_color_disable});
    $('.knob').trigger('configure', {'bgColor':bg_color_disable}); 
  } else {
    $('.motor').css('pointer-events','auto');
    $('.knob').trigger('configure', {'fgColor':fg_color_enable});
    $('.knob').trigger('configure', {'bgColor':bg_color_enable});
  }
}

function SendtoAPI() {  
  var js_obj = {
    "power": _power,
    "pos_motor1": _posmotor1,
    "pos_motor2": _posmotor2,
    "functionalitycheck": "0"
  };

  
  var data = JSON.stringify(js_obj);

  $.ajax({
    type: "POST",
    url: "http://localhost:3001/api/ACADS",
    data: data,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data){
      console.log(data);
    },
    error: function(errMsg) {
        alert(errMsg);
    }
});

}

function AddLogEntry(entry) {
    $('#logbox').append('<log>'+entry+'</br></log>');
}


function GetTestData(url) {  
  $.ajax({url: url, success: function(result) {

    var data = result;
    updateMotor1(data.pos_motor1);
    updateMotor2(data.pos_motor2);
    $('#motor1inputbox').val(Math.round(data.pos_motor1));
    $('#motor2inputbox').val(Math.round(data.pos_motor2));
    
    if (data.power == 0) {
      alert("System is OFF");
      PowerOff();
      return;
    } else {
      PowerOn();
    }
    

    for (var key in data.logentries) {
      var logentry = data.logentries[key];
      AddLogEntry(logentry.timestamp + "  |  " + "  |  "+ logentry.verb + "  |  " + logentry.action + "  |  " + logentry.data);
    }
    
    for (var key in data) {
      
      if (key.substring(0,6) == "status") {
        if (data[key] == 1) {
           $('#'+key).text("OK").addClass('status-on').removeClass('status-off').removeClass('status-error');

        } else {
          $('#'+key).text("ERR").addClass('status-error').removeClass('status-off').removeClass('status-on');
        }
        
      } else if (key.substring(0,7) == "voltage") {
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


function updateMotor1(pos) {
  $('#motor1').val(pos).trigger('change');
  _posmotor1 = pos;
  SendtoAPI();
}

function updateMotor2(pos) {
  $('#motor2').val(pos).trigger('change');
  _posmotor2 = pos;
  SendtoAPI();
}


function PowerOn () {
  var motor1 = $('#motor1');
  var motor2 = $('#motor2');
  EnableDisableKnobs(1);
  _power = 1.
  SendtoAPI();
  $('#motor1').val(motor1.val()).trigger('change');
  $('#motor2').val(motor2.val()).trigger('change');
  $('#powerswitch').children('input').prop('checked',true)
  $('#power').text("ON").addClass('status-on').removeClass('status-error').removeClass('status-off');
}

function PowerOff () {
  var motor1 = $('#motor1');
  var motor2 = $('#motor2');
  EnableDisableKnobs(0);
  _power = 0;
  SendtoAPI();
  $('#motor1').val(motor1.val()).trigger('change');
  $('#motor2').val(motor2.val()).trigger('change');
  $('#powerswitch').children('input').prop('checked',false)
  $('#power').text("OFF").addClass('status-off').removeClass('status-error').removeClass('status-on');
  $('.status').text("OFF").addClass('status-off').removeClass('status-error').removeClass('status-on');
  $('.voltage').text("0.00").addClass('status-off').removeClass('status-error').removeClass('status-on');
}
   
$(function($) {

  var motor1 = $('#motor1');
     var motor2 = $('#motor2');
     ToggleMotorColors();
     
     motor1.knob({
      change : function (value) {
          console.log("change1 : " + value);
          $('#motor1inputbox').val(Math.round(value))
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

      motor2.knob({
      change : function (value) {
          console.log("change1 : " + value);
          $('#motor2inputbox').val(Math.round(value))
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

    EnableDisableKnobs(0);
    
    $('#motor1').val(motor1.val()).trigger('change');
    $('#motor2').val(motor2.val()).trigger('change');
    $('#powerswitch').click(function() {
      if($(this).children('input').is(':checked')) {
       PowerOn();
      } else {
        PowerOff();
      }
  });
  $('#modeswitch').click(function() {
    if($(this).children('input').is(':checked')) {
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .s_informationbox, .informationbox, .statusbox, .statusbox, .bottomcolumn, .control-button, .logbox, .datetimebox').addClass('dark').removeClass('light');
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
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .s_informationbox, .informationbox, .statusbox, s_statusbox, .bottomcolumn, .control-button, .logbox, .datetimebox').addClass('light').removeClass('dark');
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
  var timeout = null;
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

   $('#jsontest').click(function () {
     GetTestData('json/example.json');
   });   
 });

//I can't get this to work. I was trying the three-line example here:
// https://stackoverflow.com/questions/386281/how-to-implement-select-all-check-box-in-html
$('#filterall').change( function () {
  $( '.filtertest input[type="checkbox"]' ).prop('checked', this.checked)
});