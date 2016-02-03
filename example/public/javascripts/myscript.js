$( document ).ready(function() { // HTML has loaded



  $("#submit").click(function(){
  	$("#buttonText").text('Button has been clicked');
  	$("#buttonText").css('color', 'red');
  });


  $("#Juan").click(function(){
	$("#text").fadeToggle(1000, function(){
	  		$(this).css({ 'font-weight': 'bold', 'color' : 'green'});
	  	});
  	});

});