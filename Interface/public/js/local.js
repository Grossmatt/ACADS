var fg_color_enable;
var fg_color_disable;
var bg_color_enable;
var bg_color_disable;


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
        EnableDisableKnobs(1);
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
        $('.status-off').addClass('status-on').removeClass('status-off');
      } else {
        EnableDisableKnobs(0);
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
        $('.status-on').addClass('status-off').removeClass('status-on');
      }
  });
  $('#modeswitch').click(function() {
    if($(this).children('input').is(':checked')) {
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .informationbox, .statusbox, .bottomcolumn, .control-button').addClass('dark').removeClass('light');
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
      $('body, .top-menu, .top-menu-item, #motor1, #motor2, .motor, .informationbox, .statusbox, .bottomcolumn, .control-button').addClass('light').removeClass('dark');
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
   
 });