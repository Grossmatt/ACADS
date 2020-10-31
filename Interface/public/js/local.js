var fg_color_enable;
var fg_color_disable;
var bg_color_enable;
var bg_color_disable;
var brake_voltages = [];
var power_voltages = [];
var poweron = 0;

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

function GetTestData(url) {
  
  $.ajax({url: url, success: function(result){

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
    
    
    var braking_total = 0.00;
    var power_total = 0.00;

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

        if (key.includes("megacap")) {
          braking_total += parseFloat(data[key]);
        }

        if (key.includes("powersupply")) {
          power_total += parseFloat(data[key]);
        }

      } 
    }
    brake_voltages.push(braking_total);
    power_voltages.push(power_total);

    var powersum =   power_voltages.reduce(function(a, b) { return a + b; }, 0);
    var brakesum =   brake_voltages.reduce(function(a, b) { return a + b; }, 0);

    if (powersum > 0) {
      $('#power_total').text(power_total.toFixed(2)).addClass('status-on').removeClass('status-off').removeClass('status-error');
      $('#average_power').text(averagePower()).addClass('status-on').removeClass('status-off').removeClass('status-error');   
    } else {
      $('#power_total').text(power_total).addClass('status-error').removeClass('status-off').removeClass('status-on');
      $('#average_power').text(averagePower()).addClass('status-erro').removeClass('status-off').removeClass('status-on');   
    }

    if (brakesum > 0) {
      $('#braking_total').text(braking_total.toFixed(2)).addClass('status-on').removeClass('status-off').removeClass('status-error');
      $('#average_braking').text(averageBraking()).addClass('status-on').removeClass('status-off').removeClass('status-error');
      $('#average_braking_5s').text(averageBrakingMA(5)).addClass('status-on').removeClass('status-off').removeClass('status-error');
      $('#average_braking_10s').text(averageBrakingMA(10)).addClass('status-on').removeClass('status-off').removeClass('status-error');
      $('#average_braking_30s').text(averageBrakingMA(30)).addClass('status-on').removeClass('status-off').removeClass('status-error');
    } else {
      $('#braking_total').text(braking_total).addClass('status-error').removeClass('status-off').removeClass('status-on');
      $('#average_braking').text(averageBraking()).addClass('status-error').removeClass('status-off').removeClass('status-on');
      $('#average_braking_5s').text(averageBrakingMA(5)).addClass('status-error').removeClass('status-off').removeClass('status-on');
      $('#average_braking_10s').text(averageBrakingMA(10)).addClass('status-error').removeClass('status-off').removeClass('status-on');
      $('#average_braking_30s').text(averageBrakingMA(30)).addClass('status-error').removeClass('status-off').removeClass('status-on');
    }


  }});
}

function averagePower() {
  var sum = power_voltages.reduce(function(a, b) { return a + b; }, 0);
  var average = sum / power_voltages.length;
  return average.toFixed(2);
}

function averageBraking() {
  var sum = brake_voltages.reduce(function(a, b) { return a + b; }, 0);
  var average = sum / brake_voltages.length;
  return average.toFixed(2);
}

function averageBrakingMA(seconds) {
  var i = 0.00;
  var sum = 0.00;
  if (seconds <= brake_voltages.length) {
    for (i = brake_voltages.length - 1; i >= brake_voltages.length - seconds; i--) {
    console.log(brake_voltages[i]);
    sum += brake_voltages[i];
    }
   var average = (sum / seconds).toFixed(2);
  } else {
    var average = averageBraking();
  }
  return average;
}

function updateMotor1(pos) {
  $('#motor1').val(pos).trigger('change');
}

function updateMotor2(pos) {
  $('#motor2').val(pos).trigger('change');
}


function PowerOn () {
  var motor1 = $('#motor1');
  var motor2 = $('#motor2');
  EnableDisableKnobs(1);
  poweron = 1.
  $('#motor1').val(motor1.val()).trigger('change');
  $('#motor2').val(motor2.val()).trigger('change');
  $('#powerswitch').children('input').prop('checked',true)
  $('#power').text("ON").addClass('status-on').removeClass('status-error').removeClass('status-off');
}

function PowerOff () {
  var motor1 = $('#motor1');
     var motor2 = $('#motor2');
  EnableDisableKnobs(0);
  poweron = 0;
  $('#motor1').val(motor1.val()).trigger('change');
  $('#motor2').val(motor2.val()).trigger('change');
  $('#powerswitch').children('input').prop('checked',false)
  $('#power').text("OFF").addClass('status-off').removeClass('status-error').removeClass('status-on');
  $('.status').text("OFF").addClass('status-off').removeClass('status-error').removeClass('status-on');
  $('.voltage').text("0.00").addClass('status-off').removeClass('status-error').removeClass('status-on');
  brake_voltages = [];
  power_voltages = [];
 // $('.status-on').addClass('status-off').removeClass('status-on');
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
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .informationbox, .statusbox, .bottomcolumn, .control-button, .logbox, .datetimebox').addClass('dark').removeClass('light');
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
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .informationbox, .statusbox, .bottomcolumn, .control-button, .logbox, .datetimebox').addClass('light').removeClass('dark');
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
    motor1.val($(obj).val());
    $('#motor1').val(motor1.val()).trigger('change');
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
    motor2.val($(obj).val());
    $('#motor2').val(motor2.val()).trigger('change');
    }, 1000);
  });

  $('#motor1leftarrow').click( function() {
      var value = parseInt(motor1.val()) - 1;
      if (value < -40)
        value = -40;
      $('#motor1inputbox').val(value);
      motor1.val(value);
      $('#motor1').val(motor1.val()).trigger('change');
  });
  $('#motor1rightarrow').click( function() {
    var value = parseInt(motor1.val()) + 1;
    if (value > 40)
      value = 40;
    $('#motor1inputbox').val(value);
    motor1.val(value);
    $('#motor1').val(motor1.val()).trigger('change');
  });

  $('#motor2leftarrow').click( function() {
    var value = parseInt(motor2.val()) - 1;
    if (value < -40)
      value = -40;
    $('#motor2inputbox').val(value);
    motor2.val(value);
    $('#motor2').val(motor2.val()).trigger('change');
});
$('#motor2rightarrow').click( function() {
  var value = parseInt(motor2.val()) + 1;
  if (value > 40)
    value = 40;
  $('#motor2inputbox').val(value);
  motor2.val(value);
  $('#motor2').val(motor2.val()).trigger('change');
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