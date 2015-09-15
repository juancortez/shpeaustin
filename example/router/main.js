// module.exports exposes functions that we want to use in a different file
module.exports = function(app){
	app.get('/', function(req, res){
		res.render('home.html');
	});
	app.get('/about', function(req, res){
		res.render('about.html');
	});
	app.get('/contact', function(req, res){
		res.render('contact.html');
	});

}
