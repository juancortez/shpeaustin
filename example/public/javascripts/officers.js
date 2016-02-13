$( document ).ready(function() { // HTML has loaded
	var showFlip = true;

	$(".card").hover(function(){
		$(this).toggleClass('flipped');
	});




	/* To show that the cards can be flipped */
	if(showFlip == true){
		setTimeout(function (){
		  $($(document).find('.card')[0]).toggleClass('flipped-60');
		}, 100);
		setTimeout(function (){
		  $($(document).find('.card')[0]).toggleClass('flipped-60');
		}, 1100); 
	}

});