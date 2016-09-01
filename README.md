# SHPE Austin Node.js Application

The following Node.js application (v6.2.1) contains both the server and client side code for the [austinshpe.org][] website. The application runs on IBM's Bluemix platform, so creating an [IBM Bluemix account][] is necessary. Since this application only requires 512MB of memory and only one instance, the hosting is **free**. In order to forward the [austinshpe.org][] domain to the BlueMix application, you will need to have domain access to the austinshpe.org domain on [GoDaddy][]. The credentials for the GoDaddy account are located in the private_credentials/*.json file. Once the GoDaddy account is accessible, follow the directions in the 'Setting up Bluemix and GoDaddy' section at the end of the README file. This application also has access to the Google Calendar API, SendGrid, Slack, and Redis Cloud services so additional steps are required. Please start in the 'Getting Started' section and further instructions will be provided to set everything up. Any questions can be forwarded to the webmaster at Juan_Cortez@utexas.edu

*IMPORTANT* The .gitignore file includes the private_credentials folder. Please ask the current SHPE webmaster for these credentials
so that all of the services work properly.

## Project Layout
```
shpeaustin/
	config/
		default.json 			File that holds data for the application
	controllers/
		*.js 					Controllers that serve all endpoints {GET, POST, DELETE, PUT} to the SHPE Austin Application
	lib/
		authorization.js 		A module that determines if a user is authorized to perform actions on the website
		console.js 				Enhancements to the logging on the terminal
		database.js 			A wrapper for the Redis database that includes retrieval, setting, and updating of data
	metadata/
		backup/*.json			Files that are automatically generated after database is deleted
		announcements.json 		Contains the announcements data that populates the index.html file
		calendar_data.json 		Contains the calendar data that populates the index.html
		id.json 				Contains the unique ID's of all users that have logged into the website
		newsletter_data.json 	Contains the newsletter data that populates the index.html
		officers.json 			Contains the officer data that populates the officers.ejs file.	 
	models/
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
		dist/
			*.min.js 			The production files used on the website for faster loading times
			main.css 			The production file used on the website after it is compiled from LESS
		javascripts/
			utils/ 				
				ajaxUtils.js 	Module that contains all the AJAX requests made from the index.html file
				calendar.js  	Module used to create a calendar on the membership page
				modal.js  		Module used to create a modal on the home and membership page
			libs/				jQuery library
			*.js 				JavaScript files used on the website, as specified by the title name
		stylesheets/
			/less
				*.less			The CSS pre-processor file that gets convert to .css with gulp				
			/libs 				Bootstrap, FontAwesome, and OwlCarousel
			*.css 				Styling pages used for all views
	router/
		main.js 				Contains all the routes for the SHPE Austin website
	services/
		google_calendar.js 		This script sends an API request to the SHPE Austin Google Calendar and outputs it to metadata/calendar_data.json
		redis.js 				File that creates a connection to the Redis database and caches data locally using the lib/database.js file
		slack.js 				Holds a method that listens to requests made by the Slackbot on the SHPE Austin slack channel
		socket.js 				Contains all web socket code for the SHPE Austin website
	utils/
		util.js 				Helper functions used throughout the node.js application
	views/
		newsletters/ 			These are the newsletters written by the Secretary every month
		*.html 					The HTML pages for all the routes defined in router/main.js
		*.ejs 					Template that is used to populate the officers page
	app.js 						Starts and runs the Node.js application
	manifest.yml 				Contains information used when deploying to Bluemix
	package.json 				Dependencies used in Node.js app
	gulpfile.js 				Gulp file used for development
```

## Getting Started
1. [Install Node.js][] (v6.2.1)
2. Clone this project onto your computer.
3. Run `npm install` to install the app's dependencies.
4. [Create a Bluemix account][]. It's free. 
5. [Follow instructions 3-6 on this page][] 
6. Follow the directions in the 'Creating and Binding SendGrid' section below to connect to the SendGrid application.
7. Follow the directions in the 'Redis Database Binding' section below to connect to the Redis service.
8. Setup the Google Calendar API by following the directions in the 'Setting up the Google Calendar API' section.
9. Once all of these steps are done, run `$node app.js`. If the SendGrid and Redis applications were binded correctly, the app should run with no problems.
10. Access the running app in a browser at http://localhost:6001
11. When developing locally, please keep in mind there are tools available to make development easier. Please read the 'Developing Locally' section for further instructions.
12. Follow the directions in the 'Setting up Bluemix and GoDaddy' section to route the bluemix application to the austinshpe.org domain.

## Developing Locally
There are various tools that are included in this project that makes development easier and automated. All automated tasks are located in the gulpfile.js. Some of the more important features are minifying and concatinating *.js files, and compiling *.less files. When developing, run the app locally with `node app.js` and open up another terminal to run the gulp file by typing, `gulp`. The gulpfile will watch all the changes and will run the tasks automatically. 

## SendGrid Application
The sole purpose of the SendGrid application is to serve as a mailing client for the Bluemix application. The SendGrid API is connected to the
Contact Us page, but can be placed in multiple locations. You just have to make a POST to the communication/contact endpoint with the appropriate data in the
BODY of the request. The recipient of e-mails is set in the config/default.json file under the sendGridEmail key.

### Creating and Binding SendGrid to Application
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
 4. Copy those credentials and replace them with the existing /private_credentials *.json file

### Redis Database
Redis is an open source (BSD licensed), in-memory data structure store, used as database, cache and message broker. When the node application first runs, the application populates the database with the data. After each subsequent run, the application loads data from the database, and caches it, which enables quicker performance.

## Redis Cloud Database Binding
 1. Go to the online [IBM Console][].
 2. Click on Catalog on the main menu on top of the screen
 3. Search for [Redis Cloud][] in the catalog
 4. On the right hand side of the screen, you should be able to add a Service. Bind it to the Node.js application and click on create. [The 30MB selected plan is sufficient and is free.]
 5. Once the application has been binded, go back to the [IBM Console][] and click on the shpeaustin nodejs application.
 6. Under the Redis Cloud application, click on the Show Credentials button.

### Setting up the Google Calendar API
In order to set up the Google Calendar API, you need to authorize the node application to the Google Calendar API. Go to the `services/google_calendar.js` file, and follow the directions in the comments at the top of the file. After it is done, copy down the google credentials and replace them in the private_credentials/google_calendar.json file, under the access_token key.

## Setting up Bluemix and GoDaddy
Pre-requisites: You must have shpeaustin.mybluemix.net deployed to BlueMix, and have access to the GoDaddy account. If you haven't deployed to BlueMix, follow the directions in the 'Deploying to Bluemix' section. 
In order to set up BlueMix and GoDaddy, there are a couple of steps we need to do to re-route shpeaustin.mybluemix.net to the austinshpe.org domain. I was unable to figure out how to preserve austinshpe.org in its entirety, but it will instead go to me.austinshpe.org. In order to do this, following the directions below:

 1. Login to GoDaddy and go to the GoDaddy [My Domain][] page. Click on the settings icon, and click on Manage DNS. 
 2. Click ADD under the Records section, and select CNAME. 
 3. Set HOST to `www`, Points to to `shpeaustin.mybluemix.net`, and TTL, 1/2 Hour.
 4. Click Save.
 5. Look for the Forwarding Section, and click ADD. 
 6. Forward `http` to me.austinshpe.org, with a `Permanent (301)` option, `Forward only` option, and click on the checkbox to update DNS settings. Click Save.
 7. This concludes the steps on the GoDaddy side. It may take a couple of [minutes to hours][] for the changes to propagate. 
 8. Login to Bluemix using the credentials provided in the private_credentials/*.json file. 
 9. In the [Bluemix dashboard][] view, look for the shpeaustin application and click on the settings icon. Then, click on `Edit Routes and App Access` option.
 10. Click on, `Manage Domains`. This will bring you to another window. Make sure you are on the DOMAINS tab. Click, `Add Domain`, and type in austinshpe.org, and click on `SAVE`. 
 11. Go back to the [Bluemix dashboard][] view, and go back to the `Edit Routes and App Access` window.
 12. Click on Add route and type, `me`, as the Host. On the right, there should be a drop down menu. Select `austinshpe.org`, and click on Save.
 13. Once it has been saved, you may have to wait a couple of minutes to hours, depending on how quickly GoDaddy processes the results. Once everything is setup, austinshpe.org will forward you to me.austinshpe.org and everything is complete!

## Steps to Completely Update Website
I have created an admin page that has made it easier to update the SHPEAustin application. Navigate to the following URL http://me.austinshpe.org/update/admin and login with the credentials in the private_credentials.json file. In this UI, you are able to View, Delete, and Update data to the Redis database. Please contact the webmaster for instructions on how to appropriately update the data on the application.

## BlueMix Auto Deployment with Travis CI

 1. Register at https://travis-ci.org/
 2. Authorize the Travis CI application to access the GitHub account
 3. Follow Directions in the https://travis-ci.org/getting_started page. Enable the shpeaustin application.
 4. Go to the root directoy of the SHPE Austin application and execute `$gem install travis`
 5. Run `$travis encrypt XXXX`, where XXXX corresponds to the bluemix password on private_credentials/*.json
 6. Replace the current "secure" string with the one outputted on the console
 7. Encrypt the Bluemix email, and run the same command as step 6. Replace the new "secure" string in both the organization and username section.
 8. Everytime you push to the repository, austinshpe.org will re-deploy with the new changes :)


[austinshpe.org]: http://austinshpe.org
[shpeaustin.mybluemix.net]: http://shpeaustin.mybluemix.net
[GoDaddy]: https://www.godaddy.com/
[Install Node.js]: https://nodejs.org/en/download/
[IBM Bluemix account]: https://console.ng.bluemix.net/registration/
[Create a Bluemix account]: https://console.ng.bluemix.net/registration/
[Follow instructions 3-6 on this page]: https://www.ng.bluemix.net/docs/starters/install_cli.html
[IBM Console]: https://console.ng.bluemix.net/dashboard/
[Redis Cloud]: https://console.ng.bluemix.net/catalog/services/redis-cloud/
[Bluemix dashboard]: https://console.ng.bluemix.net/?direct=classic
[Using Custom Domain Names In Bluemix]: https://www.youtube.com/watch?v=fG7UbOHywXc
[Linking godaddy domain to my bluemix web Application]: http://myutilite.com/utility/75/linking-godaddy-domain-to-my-bluemix-web-application/utility.htm/
[minutes to hours]: http://stackoverflow.com/questions/5696937/godaddy-set-name-server-long-time-to-take-effect
[My Domain]: https://dcc.godaddy.com/manage/
