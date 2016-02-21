# SHPE Austin Node.js Application

The following Node.js application contains both the server and client side code for the [shpeaustin.mybluemix.net][] website. Currently,
it is running on IBM's Bluemix platform, so creating an [IBM Bluemix account][] is necessary. Since this application only requires 512MB of memory and only one instance, the hosting is free. This application has access to the Google Calendar API, SendGrid, and Redis Cloud services so additional steps are required. 

*IMPORTANT* The .gitignore file includes the private_credentials folder. Please ask the current SHPE webmaster for these credentials
so that all of the services work properly.

## Project Layout
```
shpeaustin/
	google_service/
		google_calendar.js 		This script sends an API request to the SHPE Austin Google Calendar and outputs it to metadata/calendar_data.json
	metadata/
		calendar_data.json 		Contains the calendar data that populates the index.html
		newsletter_data.json 	Contains the newsletter data that populates the index.html
		officers.json 			Contains the officer data that populates the officers.ejs file.	 
	models/
		globals.js 				File that holds global data
		officers.js 			Contains the class that constructs an object for each officer
	node_modules/
		*/						Dependencies used in the Node.js application
	private_credentials/
		*.json					Credentials used to connect to services (not on github)
	public/
		assets/
			newsletter/ 		Contains all newsletter pictures that populate the index.html file
			officer_pictures/	The pictures rendered on the /officers endpoint
			*.jpg,*.png			Includes all .jpg and .png files used in Node.js application
		javascripts/
			libs/				jQuery library
				index.js 		The javascript file used for the index.html page
		stylesheets/
			/libs 				Bootstrap, FontAwesome, and OwlCarousel
			*.css 				Styling pages used for all views
	redis/
		redis.js 				File used to cache all data stored in the /metadata folder
	router/
		main.js 				Contains all the routes for the SHPE Austin website
	utils/
		util.js 				Helper functions used throughout the node.js application. 
	views/
		newsletters/ 			These are the newsletters written by the Secretary every month
		*.html 					The HTML pages for all the routes defined in router/main.js
		*.ejs 					Template that is used to populate the officers page
	views/
	app.js 						Starts and runs the Node.js application
	manifest.yml 				Contains information used when deploying to Bluemix
	package.json 				Dependencies used in Node.js app
```

## Running the app locally
1. [Install Node.js][] (version 0.12.7)
2. Clone this project onto your computer.
3. Run `npm install` to install the app's dependencies.
5. Run `node app.js` to start the application
6. Access the running app in a browser at http://localhost:6001
7. [Note] In order to connect the Node.js application to SendGrid (the service that sends out e-mails) and the
Redis database, please follow the directions in the 'Deploying to Bluemix' section.

## Deploying to Bluemix
1. In the terminal, navigate to the project's root directory.
2. [Create a Bluemix account][]. It's free. 
3. [Follow the instructions 3-6 on this page][] 
4. Follow the directions in the 'Creating and Binding SendGrid' section below to connect to the SendGrid application.
5. Follow the directions in the 'Redis Database Binding' section below to connect to the Redis service.

## Creating and Binding SendGrid to Application
In the root directory of the shpeaustin application, run the following commands:
```
$cf create-service sendgrid free shpeaustinemail
$cf bind-service shpeaustin shpeaustinemail
$cf restage shpeaustin
```

After those steps have been completed, follow the directions below.
 1. Go to the online [IBM Console][]. 
 2. Click on the shpeaustin nodejs application. 
 3. Under SendGrid, click on the Show Credentials button. 
 4. Copy those credentials and replace them with the existing /private_credentials/send_grid.json file.
 5. Verify that it works by running node app.js locally and sending an email.
 6. If it suceeded, the terminal output should output: { message: 'success' }

 ## Redis Cloud Database Binding
 1. Go to the online [IBM Console][].
 2. Click on Catalog on the main menu on top of the screen
 3. Search for [Redis Cloud][] in the catalog
 4. On the right hand side of the screen, you should be able to add a Service. Bind it to the Node.js application and click on create. [The 30MB selected plan is sufficient and is free.]
 5. Once the application has been binded, go back to the [IBM Console][] and click on the shpeaustin nodejs application.
 6. Under the Redis Cloud application, click on the Show Credentials button.
 7. Copy those credentials and replace them with the existing /private_credentials/redis.json file.
 8. Verify that the binding was succesful by running the node application. The terminal should output {Connected to Redis}

[shpeaustin.mybluemix.net]: shpeaustin.mybluemix.net
[Install Node.js]: https://nodejs.org/en/download/
[IBM Bluemix account]: https://console.ng.bluemix.net/registration/
[Create a Bluemix account]: https://console.ng.bluemix.net/registration/
[Follow the instructions 3-6 on this page]: https://www.ng.bluemix.net/docs/starters/install_cli.html
[IBM Console]: https://console.ng.bluemix.net/dashboard/
[Redis Cloud]: https://console.ng.bluemix.net/catalog/services/redis-cloud/
