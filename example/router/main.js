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

	app.get('/classes', function(req, res){
		var classes = [
				{ abbr: 'EE302', name: "Introduction to Electrical Engineering" },
				{ abbr: 'EE411', name: "Circuit Theory" },
				{ abbr: 'EE461L', name: "Software Design & Implementation II" }
		];
		var tagline = "Insert a tagline here.";

		res.render('classes.ejs', {
			classes: classes,
			tagline: tagline
		});
	});

	app.get('*', function(req, res){
  		res.status(400).send({ error: 'HTML Error 404: Not Found!' });
	});
}
