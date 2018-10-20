'use strict';
/* jshint node: true */

// Load the http module to create an http server.
var http = require('http');
var datejs = require('safe_datejs');
var fs = require('fs');
var uuid = require('node-uuid');
var jsonfile = require('jsonfile');
var url = require('url');
const {google} = require('googleapis');
var drive = google.drive({
	version: 'v2'
});

var removeFile = function(fullFileName) {
	fs.unlink(fullFileName, function (err) {
		console.log('fs.unlink ' + fullFileName + ' error: ' + err);
	});
};

var serverFile = function (filename, response) {
	var path = require('path');
	var fullFileName = path.join(process.cwd() + '/public/', filename);

	console.log('Live.com download file: ' + fullFileName);
	fs.exists(fullFileName, function(exists) {
		console.log('fs.exists ' + fullFileName + ': ' + exists);
		if(!exists) {
			// response.writeHead(404, {'Content-Type': 'text/plain'});
			// response.write('404 Not Found\n');
			// response.end();
			sendWarning(response);
			return;
		}

		fs.readFile(fullFileName, 'binary', function(err, file) {
			console.log('fs.readFile' + fullFileName + ': ' + err);
			if(err) {        
				response.writeHead(500, {'Content-Type': 'text/plain'});
				response.write(err + '\n');
				response.end();
				return;
			}

			var mime = require('mime');
			var contentType = mime.lookup(filename);
			console.log('File (' + filename + ') contentType (' + contentType + ')');
			response.writeHead(200, {'Content-Type': contentType});
				response.write(file, 'binary');
				response.end();
				setImmediate(removeFile, fullFileName);
			});
	});
};

var serveDefaultFile = function (response) {
	var officeUrl = 'https://view.officeapps.live.com/op/view.aspx?src=';
	var debugUrl = 'http://officeongmail.cloudapp.net/files?name=stub.docx';
	var fullUrl = officeUrl + debugUrl;
	//todo: redirect to the office online website.

	response.writeHead(302, {
	  'Location': fullUrl
	});

	response.end();
};

var sendRedirect = function (response, fileName) {
	var officeUrl = 'https://view.officeapps.live.com/op/view.aspx?src=';
	var debugUrl = 'http://officeongmail.cloudapp.net/files?name=' + fileName;
	var fullUrl = officeUrl + debugUrl;

	console.log('FullUrl: ' + officeUrl);
	response.writeHead(302, {
	  'Location': fullUrl
	});

	response.end();
};

var sendErrorResponse = function (response, err) {
	response.writeHead(400, {'Content-Type': 'text/plain'});
	response.write('Error: ' + err);
	response.end();
};

var sendWarning = function (response) {
	var advice = 'Why waste time trying to discover the truth, when you can so easily create it? ';
	var contact = 'Contact XYXYZYYYYZYXZXYZXXYZYXXXZYYZYX if you want know more:-)';
	sendErrorResponse(response, advice + '\r\n' + contact);
};

var fetchFileByRequestLib = function (downloadUrl, saveFullFileName, tokens, next) {
	var request = require('request');
	var wstream = fs.createWriteStream(saveFullFileName);
	var dlOption = {
		uri: downloadUrl,
		headers: {authorization: 'Bearer ' + tokens.access_token}
	};

	// console.log('fetchFileByRequestLib with options: ');
	// console.log(dlOption);
	request.get(dlOption, function(err, response, body) {
		if (err) {
			console.log('request.get error: ' + err);
			next(err);
		} else {
			console.log(JSON.stringify(response.headers));
			wstream.write(body);
			wstream.end();
			next();
		}
	});
};

var fetchFileByHttpLib = function (downloadUrl, saveFullFileName, tokens, next) {
	var https = require('https');
	var url_parts = url.parse(downloadUrl, true);

	var options = {
		hostname: url_parts.hostname,
		port: 443,
		path: url_parts.path,
		method: 'GET',
		agent: false,
		headers: {
		    'authorization': 'Bearer ' + tokens.access_token
		}	
	};

	var req = https.request(options, function(response) {
		// console.log('statusCode: ' + response.statusCode);
		// console.log('headers: ' + JSON.stringify(response.headers));
		var wstream = fs.createWriteStream(saveFullFileName);

		response.on('data', function (chunk) {
			wstream.write(chunk);
		}).on('end', function () {
			wstream.end();
			next();
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
		next(e.message);
	});

	req.end();
};

var fetchFileByDriveLib = function (drive, params, saveFullFileName, next) {
	params.alt = 'media';

	// drive.files.get(params, function (err, mediaFile) {
	// 	if (err) {
	// 		console.log('drive.files download media file error: ' + err);
	// 		next(err);
	// 	} else {
	// 	    var wstream = fs.createWriteStream(saveFullFileName);
	// 	    wstream.write(mediaFile);
	// 	    wstream.end();
	// 		next();			
	// 	}
	// });
 const file = fs.createWriteStream("./public/example.docx");

        drive.files.get(
        params, 
        {responseType: 'stream'}, (err, { data }) => {
            if (err) {
                next(err);
            } else {
            	data.pipe(file);
                next();
            }
        });
};

var executeWithToken = function (oauth2Client, tokens, myQuery, myState, response, next) {
	// console.log('tokens: ' + tokens);

	drive = google.drive({version: 'v2', auth: oauth2Client});

	console.log('oauth2Client.getToken completed');
	console.log(myQuery);
	console.log(myState);
	var params = {
		fileId: "1nx_WkZqVoTGgkMzg6joZUkcm6KHDSThl"
	};


	drive.files.get(params, function (err, fileResponse) {
		var result = null;
		if (err) {
                        console.log(err);
			if (err.message.indexOf('Invalid Credentials') >= 0) {
				result = err;
			}
			console.log('drive.files.get: ' + err);
			sendErrorResponse(response, err + '. Access token will get refreshed upon retry.');
		} else {
			console.log(fileResponse);
			// console.log(tokens);
			// var mimeType = fileResponse.mimeType;
			var saveFileName = uuid.v4() + '.' + fileResponse.data.fileExtension;
			var saveFullFileName = './public/' + saveFileName;

			var downloadUrl = fileResponse.data.webContentLink;

			console.log(saveFileName);
			console.log(saveFullFileName);
			console.log(downloadUrl);
			if (!downloadUrl) {
				return sendErrorResponse("DOES NOT HAVE DOWNLOAD URL");
			}
			// fetchFileByHttpLib(downloadUrl, saveFullFileName, tokens, function(err) {
			// 	if (err) {
			// 		sendErrorResponse(response, err);
			// 	} else {
			// 		sendRedirect(response, saveFileName);
			// 	}
			// });

			fetchFileByDriveLib(drive, params, saveFullFileName, function (err) {
				if (err) {
					sendErrorResponse(err);
				} else {
					sendRedirect(response, saveFileName);
				}
			});
		}

		next(result);
	});
};

var server = http.createServer(function (request, response) {
	// Client ID and client secret are available at
	// https://code.google.com/apis/console
	var CLIENT_ID = '576594173241-pepvm006j4npru3f8s7bn0pmgph665ma.apps.googleusercontent.com';
	var CLIENT_SECRET = 'f3Snhq17uR3yyIFj9Vq_bD1-';
	var REDIRECT_URL = 'http://officeongmail.cloudapp.net/';
	var oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

	var wDT = new Date().AsDateJs().toString('MM/dd/yyyy HH:mm:ss');
	var srcIP = '[' + request.connection.remoteAddress + '][' + request.headers['x-forwarded-for'] + ']';
	var myUrl = request.url;
	var delimiter = ' ';
	console.log('[' + wDT + ']' + srcIP + delimiter + myUrl); 

	var url_parts = url.parse(myUrl, true);
	var myQuery = url_parts.query;
	var myState = JSON.parse(myQuery.state);

	fs.readFile("./token.json", (err, token) => {
		if (err) {
			return;
		}

		oauth2Client.setCredentials(JSON.parse(token));
			// console.log(myQuery);
			executeWithToken(oauth2Client, token, myQuery, myState, response, function (err) {
				if (err) {
					console.log('Callback from executeWithToken: ' + err);
				}
			});
	});


	// if (myUrl.indexOf('/files') >= 0) {
	// 	var filename = myQuery.name;
	// 	serverFile(filename, response);
	// } else if (myUrl.indexOf('state') >= 0) {
	// 	// { state: '{'ids':['0B1c1hQjAcN0bVklNbWJHRW40aFJINnBNQ0RBaFVQTWtKc1pV'],'action':
	// 	// 'open','userId':'108185166413894301162'}',
	// 	//   code: '4/R_YzHV8y_HsitNqmz5nbd4u9_gzEWQAtlj1uEWhuq-U' }

	// 	var myState = JSON.parse(myQuery.state);
	// 	var authorizationCode = myQuery.code;

	// 	console.log(authorizationCode);
	// 	console.log(myQuery);

	// 	// Check whether the client exists before
	// 	var userTokenFile = process.cwd() + '/tokens/' + myState.userId + '.token';
	// 	jsonfile.readFile(userTokenFile, function(err, userTokenFromFile) {
	// 		if (err || userTokenFromFile.refresh_token === undefined) {
	// 			console.log('jsonfile.readFile ' + userTokenFile + ' error: ' + err);
	// 			oauth2Client.getToken(authorizationCode, function(err, tokens) {
	// 				// set tokens to the client
	// 				// TODO: tokens should be set by OAuth2 client.
	// 				if(err) {
	// 					console.log('oauth2Client.getToken error: ' + err);
	// 					sendErrorResponse(response, err);
	// 				} else {
	// 					jsonfile.writeFile(userTokenFile, tokens, function(err) {
	// 						if (err) {
	// 							console.log('jsonfile.writeFile error: ' + err);
	// 						}
	// 						executeWithToken(oauth2Client, tokens, myQuery, myState, response, function (err) {
	// 							if (err) {
	// 								console.log('Callback from executeWithToken: ' + err);
	// 							}
	// 						});
	// 					});
	// 				}
	// 			});
	// 		} else { //if file exists
	// 			console.log('User token from file: ' + JSON.stringify(userTokenFromFile));
	// 			var tokens = {
	// 				  access_token: userTokenFromFile.access_token,
	// 				  refresh_token: userTokenFromFile.refresh_token
	// 			};

	// 			executeWithToken(oauth2Client, tokens, myQuery, myState, response, function (err) {
	// 				if (err) {
	// 					fs.unlink(userTokenFile, function (err) {
	// 						console.log('Remove file (' + userTokenFile + ') due to error: ' + err);
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
	// } else {
	// 	sendWarning(response);
	// }
});

server.listen(80);
console.log('Server running at http://0.0.0.0:80/');