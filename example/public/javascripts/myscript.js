$( document ).ready(function() {
  $("#submit").click(function(){
  	$("#buttonText").text('Button has been clicked');
  	$("#buttonText").css('color', 'red');
  });
});