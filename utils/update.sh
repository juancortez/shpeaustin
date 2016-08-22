#!/bin/bash

# Author: Juan Cortez
# Date Created: March 15, 2015 at 21:00

# The following file updates the google calendar and newsletter data used for the shpeaustin website.
# It sends a GET request to the 2 endpoints, updates the JSON file in the metadata/ folder, and moves
# all newsletter images in the appropriate folder.


# Instructions:
# $node app.js 
# $sudo chmod -X update.sh
# $./update.sh

echo "TODO: NEED TO UPDATE THIS FILE, DOESNT WORK"

# echo "Updating calendar data..."
# curl -s http://localhost:6006/calendar > /dev/null
# echo "Updating newsletter data..."
# open http://localhost:6006/newsletterload
# echo "Waiting for request to finish..."
# sleep 3 # Wait 3 seconds for the GET and POST to finish
# echo "Moving newsletter data into appropriate folder..."
# cd ..
# for f in newsletter*
# 	do 
#     mv $f public/assets/newsletter
# 	done
# echo "Don't forget to clear the cache from the Redis database."
# pkill node