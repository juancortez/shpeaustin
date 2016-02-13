$( document ).ready(function() { // HTML has loaded

  $("#Juan").click(function(){
	$("#text").fadeToggle(1000, function(){
	  		$(this).css({ 'font-weight': 'bold', 'color' : 'green'});
	  	});
  	});

  $('#database').click(function(){
	   $.get('http://localhost:8000/employees', {}, function(data){
	        console.log("Data received: " + JSON.stringify(data));
			var columns = [ "ID", "Name", "Location"]
			createTable(data, columns);
	   });
	});


  // https://desandro.github.io/3dtransforms/docs/carousel.html
  $('#flip').click(function(){
  	$('#card').toggleClass('flipped');
  });

  function createTable(data, columns){
	var html = '<table><tbody>';
	html += '<thead>';
	for (var i = 0, len = columns.length; i < len; ++i) {
		html += '<td><b>' + columns[i] + '</b></td>';
	}
	html += "</thead>";
	for (var i = 0, len = data.length; i < len; ++i) {
	    html += '<tr>';
        html += '<td>' + data[i].id + '</td>';
        html += '<td>' + data[i].name + '</td>';
        html += '<td>' + data[i].location + '</td>';
	    html += "</tr>";
	}
	html += '</tbody><tfoot><tr></tr></tfoot></table>';
	$(html).appendTo('#div1');
  }

});