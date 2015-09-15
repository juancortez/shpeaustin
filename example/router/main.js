// module.exports exposes functions that we want to use in a different file
module.exports = function(app){
	app.get('/', function(req, res){
		res.render('index.html');
	});
	app.get('/about', function(req, res){
		res.render('about.html');
	});
	app.get('/contact', function(req, res){
		res.render('contact.html');
	});

	app.get('/drinks', function(req, res){
		var drinks = [
				{ name: 'Bloody mary', drunkness: 3 },
				{ name: 'Martini', drunkness: 5 },
				{ name: 'Scotch', drunkness: 10 }
		];
		var tagline = "Insert a tagline here.";

		res.render('drinks.ejs', {
			drinks: drinks,
			tagline: tagline
		});
	});
}
