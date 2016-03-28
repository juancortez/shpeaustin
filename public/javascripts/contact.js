$(document).ready(function() { 
    var socket = io(); // get a handle to the websocket
    var name;
    var usersOnline = 0;

    // form submission for chat
    $('#chat').submit(function(message){
        // the first time, get the name of the user
        if(name === undefined){
            name = $('#chat-message').val();
            $('#chat-message').val('');
            $("p#name-prompt").remove();
            name = name.capitalizeFirstLetter();
            socket.emit('joined-chat', name);
            $('#chat-content').append("<div class='msgln italic'> Welcome " + name + "! There are " + usersOnline + " users online, including yourself.</div>");
            return false;
        }

        var msg = {
            'message' : $('#chat-message').val(),
            'name'    : name,
            'time'    : getTime()
        };
        socket.emit('chat message', msg);
        $('#chat-message').val('');
        return false;
    });

    socket.on('chat message', function(msg){
        $('#chat-content').append("<div class='msgln'> " + "<span class='bold'>" + msg.name + " (" + msg.time + "): </span>" + msg.message + "</div>");
        $('#chat-content').scrollTop($('#chat-content')[0].scrollHeight); // automatically scrolls textbox with chat
    });

    socket.on('usersOnline', function(users){
        usersOnline = users;
        console.log("There are " + users + " users online.");
    });

    socket.on('new-user', function(userName){
        if(userName == name || name === undefined){
            return;
        }
        console.log(userName + " joined the chat!");
        $('#chat-content').append("<div class='msgln new-user'>"+ userName + " just joined the chat!</div>");
    });

    // get the current time in CST in the following format: hh:mm
    function getTime() {
        var date = new Date();
        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        var nd = new Date(utc + (3600000 * (-5)));
        return nd.toLocaleTimeString();
    }    

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

    setTimeout(function(){
        $("#chat-header i").click();
    }, 1500);


    // form submission for e-mails
	$('#email').submit(function(formText) {
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

    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
});