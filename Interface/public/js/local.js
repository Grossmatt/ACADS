$(document).ready(function () {
 
});
   
$(function($) {
     var motor1 = $('#motor1');
     var motor2 = $('#motor2');
     var fg_color_enable = '#1bf782';
      var fg_color_disable = '#4d2834';
      var bg_color_enable = '#4a4646';
      var bg_color_disable = '#4d2834';
      $('.motor').css('pointer-events','none');
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

    $('.knob').trigger('configure', {'fgColor':fg_color_disable}, {'bgColor':bg_color_disable});
    $('#motor1').val(motor1.val()).trigger('change');
    $('#motor2').val(motor2.val()).trigger('change');
    $('#powerswitch').click(function() {
      
      if ($(this).is(':checked')) {
        $('.motor').css('pointer-events','auto');
        $('.knob').trigger('configure', {'fgColor':fg_color_enable}, {'bgColor':bg_color_enable});
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
        $('.status-off').addClass('status-on').removeClass('status-off');
        $('.status-on').text('ON');
      } else {
        $('.motor').css('pointer-events','none');
        $('.knob').trigger('configure', {'fgColor':fg_color_disable}, {'bgColor':bg_color_disable});
        $('#motor1').val(motor1.val()).trigger('change');
        $('#motor2').val(motor2.val()).trigger('change');
        $('.status-on').addClass('status-off').removeClass('status-on');
        $('.status-off').text('OFF');
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
      $('#motor2inputbox').val("40");
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
  $('#motor12nputbox').val(value);
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