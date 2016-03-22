$(document).ready(function() { 
	$('form').submit(function(formText) {
        $.ajax({
            type: 'POST',
            url: '/contact',
            data: { name: formText.target.name.value, 
                    email: formText.target.email.value,
                    phone: formText.target.phone.value,
                    category: formText.target.category.value,
                    message: formText.target.message.value
                   }
        }).done(function(status){
        	console.log("Success!");
        	toastStatus(1, "E-mail successful sent!");
        }).fail(function(status){
        	console.error("Unsuccessful. Error Code: " + status);
        	toastStatus(-1, "E-mail unsuccessful sent. Please try again.");
        });
        return false; // won't refresh the page
    }); 

    // this function displays a toast of the status of the REST call for 2.5 seconds
    // @param status 1 = success, -1 = failure
    // @param text the toast message displayed on the screen
    function toastStatus(status, text) {
        if (status == -1) {
            $('.status').css({
                'color': '#F44336'
            }); // red error
            $('.status').text(text);
            $('.status').fadeIn(400).delay(2500).fadeOut(400);
        } else if (status == 1) {
            $('.status').css({
                'color': '#4CAF50'
            }); // green success
            $('.status').text(text);
            $('.status').fadeIn(400).delay(2500).fadeOut(400); //fade out after 3 seconds
        }
    }
});