var Chat = (function(){
	var chat = {},
		socket,
		name,
		usersOnline = 0;

	chat.initialize = function(){
		socket = io();
		this.activateSockets();
	};

	chat.activateSockets = function(){
		socket.on('chat message', function(msg){
	        $('#chat-content').append("<div class='msgln'> " + "<span class='bold'>" + msg.name + " (" + msg.time + "): </span>" + msg.message + "</div>");
	        $('#chat-content').scrollTop($('#chat-content')[0].scrollHeight); // automatically scrolls textbox with chat
	    });

	    socket.on('usersOnline', function(users){
	        usersOnline = users;
	        console.log("There " + (usersOnline > 1 ? "are " + usersOnline + " users" : "is one user") + " online, including yourself.");
	    });

	    socket.on('new-user', function(userName){
	        if(userName == name || name === undefined){
	            return;
	        }
	        console.log(userName + " joined the chat!");
	        $('#chat-content').append("<div class='msgln new-user'>"+ userName + " just joined the chat!</div>");
	    });
	};

	chat.getSocket = function(){
		if(!!socket){
			return socket;
		}
		console.error("Socket has not yet been initialized");
		return null;
	};

	chat.sendMessage = function(message){
        // the first time, get the name of the user
        if(!(!!name)){
            name = $('#chat-message').val();
            $('#chat-message').val('');
            $("p#name-prompt").remove();
            name = _capitalizeName(name);
            socket.emit('joined-chat', name);
            $('#chat-content').append("<div class='msgln italic'> Welcome " + name + "! There " + (usersOnline > 1 ? "are " + usersOnline + " users" : " is one user") + " online, including yourself.</div>");
            return;
        }

        var msg = {
            'message' : $('#chat-message').val(),
            'name'    : name,
            'time'    : _getTime()
        };

        if(!!socket){
        	socket.emit('chat message', msg);
        } else{
        	console.error("socket.io not connected. Make sure to initialize socket.io!");
        	$('#chat-content').append("<span class='error'>Sorry, unable to send messages at the time.</span></br>");
        }
        $('#chat-message').val('');
        return false;
	};

	function _capitalizeName(str){
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

    // get the current time in CST in the following format: hh:mm
    function _getTime() {
        var date = new Date();
        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        var nd = new Date(utc + (3600000 * (-5)));
        return nd.toLocaleTimeString();
    }   

    return chat;
})();