`
	The initiateSocket function gets executed in app.js whenever the server is first created. From there, it uses the io
	input parameter to take care of all incoming websocket connections.

	@inputs:
			io 			: 	 the object created from the socket.io module


	The websocket is listening to the following events:
		connection 		: 	executed when a new user connects to the server
		disconnect 		: 	executed when a user disconnects from the server
		chat message	: 	used in contact.html whenever a user sends a message in the chat log
`
const database = require('../lib/database.js'),
	Logger = require('./../lib/logger').createLogger("<Socket>"),
	config = require('config');
let revision = config.revision;

function initiateSocket(io){
	let usersOnline = 0;
	io.on('connection', (socket) => {
		Logger.info("New socket connection");

		usersOnline++;

		io.emit('usersOnline', usersOnline);

	    socket.on('chat message', (msg) => {
	    	//console.log(msg);
	        io.emit('chat message', msg);
	    });

	    socket.on('joined-chat', (name) => {
	    	io.emit('new-user', name);
	    });

	    socket.on('disconnect', () =>{
	    	usersOnline--;
	    	io.emit('usersOnline', usersOnline);
			Logger.info("Socket connection left");
	    });
	});
}

module.exports = {
	initiateSocket
}

