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

var redis = require('redis');
var client = redis.createClient();

client.on('connect', function(){
	console.log("connected");
});

client.set('purse', '1');

client.exists('purse', function(err, reply) {
	//res.render('index', {database: reply})
    if (reply === 1) {
        console.log('exists');
    } else {
        console.log('doesn\'t exist');
    }
});


app.post('/test-page', function(req, res) {
    console.log('hi');
});
