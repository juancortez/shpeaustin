var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public')); // declare a static directory
require('./router/main')(app); // adds the main.js file to send response to browser
app.set('views', __dirname + '/views'); // defines where our HTML files are placed
app.set('view engine', 'ejs'); // used for HTML rendering
app.engine('html', require('ejs').renderFile); // rendering HTML files through EJS

var server = app.listen(8000, function(){
	console.log("We have started our server on port 8000");
});




// var http = require('http');
// var fs = require('fs');
// http.createServer(function(request, response){
// 	var url = request.url;
// 	switch(url){
// 		case '/':
// 			getStaticFileContent(response, 'public/home.html', 'text/html');
// 			break;
// 		case '/about':
// 			getStaticFileContent(response, 'public/about.html', 'text/html');
// 			break;
// 		case '/contact':
// 			getStaticFileContent(response, 'public/contact.html', 'text/html');
// 			break;
// 		default:
// 			response.writeHead(404, {'Content-Type': 'text/plain'});
// 			response.end('404 - Page not found.');
// 	}
// }).listen(8000);

// console.log('Server running at: http://localhost:8000');

// function getStaticFileContent(response, filepath, content){
// 	fs.readFile(filepath, function(error, data){
// 		if(error){
// 			response.writeHead(500, {'Content-Type':'text/plain'});
// 			response.end('500 - Internal Server Error');
// 		}
// 		if(data){
// 			response.writeHead(200, {'Content-Type': 'text/html'});
// 			response.end(data);
// 		}
// 	});

// }