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

    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
});