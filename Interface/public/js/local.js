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
        //$('.knob').trigger('configure', {'readonly':false});
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
   
 });