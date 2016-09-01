$(document).ready(function() { 

    Chat.initialize();
    
    // form submission for chat
    $('#chat').submit(function(message){
        Chat.sendMessage(message);
        return false;
    });
 

    $("#chat-header i").click(function(){
        $(".content-container").toggle();
        if($(this).hasClass('fa-angle-double-up')){
            $("#chat-container").css({'height': '368px'});
            $(this).removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        } else{
            $("#chat-container").css({'height': '30px'});
            $(this).removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
        }
    });

    $("#chat-header i").click();


    // form submission for e-mails
	$('#email').submit(function(formText) {
        $.ajax({
            type: 'POST',
            url: '/communication/contact',
            data: { name: formText.target.name.value, 
                    email: formText.target.email.value,
                    phone: formText.target.phone.value,
                    category: formText.target.category.value,
                    message: formText.target.message.value
                   }
        }).done(function(status){
        	console.log("Success!");
        	sendEmailStatus(1);
        }).fail(function(status){
        	console.error("Unsuccessful. Error Code:");
            console.log(JSON.stringify(status, null, 4));
        	sendEmailStatus(-1);
        });
        return false; // won't refresh the page
    }); 

    // this function displays the result of the REST call for 2.5 seconds
    // @param status 1 = success, -1 = failure
    function sendEmailStatus(status) {
        if (status == -1) {
            $("#submit-button").text("Failed").css({background: "#D8000C"});
        } else if (status == 1) {
            $("#submit-button").text("Success").css({background: "green"});
        }
        setTimeout(function(){
            $("#submit-button").text("Send it").css({background: "#0137A2"});
        }, 2500);
    }


});