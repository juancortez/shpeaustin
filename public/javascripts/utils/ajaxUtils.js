/******************************************************************
This file contains the AJAX calls made to the backend from the
index.html page. On load, the ajaxUtils variable is initialized
and is used in the /public/javascripts/index.js file. The REST
calls are handled in the router/main.js file
******************************************************************/

var ajaxUtils = (function(){
	var _months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var endpoints = {
		newsletter : "/data/newsletterdata",
		calendar : "/data/calendardata",
		announcements : "/data/announcements",
		officers : "/data/officerlist",
		officerLogin: "/data/officerlogin",
		postAnnouncement: "/update/announcements",
		login: "/authentication/login",
		subscribe: "/communication/contact"
	}

    function getNewsletterData(revision, callback){
    	$.ajax({
	        method: "GET",
	        url: endpoints.newsletter
	    })
	    .done(function(data) {
	    	if(typeof data != "object"){
	    		callback("", "GET method for " + endpoints.newsletter + " failed.");
	    		return;
	    	}
	    	var returnParams = {};
	    	var newsletterItem = 0;
			var newsletterData = data;
	        var populatedItems = data.newsletter.length;
	        for (var i = 1; i < populatedItems; i++) {
	            var elem = document.createElement("li"); // create carousel indicators
	            $('.carousel-indicators').append(elem);
	        }
	        $($('ol li')[newsletterItem]).addClass('active');
	        $("#title").append(data.newsletter[newsletterItem].title);
	        $("#description").append("<span class = 'bold'> Description: </span>" + data.newsletter[newsletterItem].description);
	        $("#image-newsletter").attr('src', "../assets/newsletter/newsletter0?v="+revision);
	        var image_link = document.createElement('a');
	        image_link.href = data.newsletter[newsletterItem].image_link;
	        $("#image-newsletter").wrap(image_link);
	        
	        if(!data.newsletter[newsletterItem].image_link){
	            $("#image-newsletter").parent()[0].setAttribute('onclick', "return false;");
	        } else{
	            $("#image-newsletter").parent()[0].setAttribute('onclick', "return true;");
	        }
	        returnParams.newsletterData = data;
	        returnParams.populatedItems = populatedItems;
	        returnParams.message = "[GET] newsletter data successful.";
	        callback(returnParams);
	    }).fail(function(e) {
	    	callback("", "GET method for " + endpoints.newsletter + " failed.");
	    });
	}

	function getCalendarData(callback){
		$.ajax({
	        method: "GET",
	        url: endpoints.calendar
	    }).done(function(calendar){
	    	if(typeof calendar != "object"){
	    		callback("", "GET method for " + endpoints.calendar + " failed.");
	    		return;
	    	}
	    	var returnParams = {};
	    	var calendarItem = 0;
	        var calendarData = calendar;
	        var numCalendarItems = calendarData.calendar.length;
	        var valid = false;
	        var dateFormat;
	        var date = new Date();
	        var currentMonth = date.getMonth();
	        var currentDay = date.getDate();
	        while(valid === false){
	            calendarHtml = calendarData.calendar[calendarItem];
	            $("#event-title").html("<b>Event: </b>" + calendarHtml.event);
	            $("span.title").text(calendarHtml.event);
	            var time = _parseCalendarTime(calendarHtml.time);
	            if(time.startTime){
	                $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
	                dateFormat = _convertToDateFormat(time.month, time.day, time.year, time.startTime);
	                $("span.start").text(dateFormat);
	                $("span.end").text(dateFormat); //TODO: add ending time support
	            } else{
	                $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
	                dateFormat = _convertToDateFormat(time.month, time.day, time.year, "");
	                $("span.start").text(dateFormat);
	                $("span.end").text(dateFormat); //TODO: add ending time support
	            }

	            if(time.month <= currentMonth && time.day < currentDay) {
	                calendarData.calendar.splice(0, 1); // remove all of the old calendar items from the array
	                numCalendarItems--;
	                continue;
	            } else{
	                valid = true;
	            }
	            if(calendarHtml.location){
	                $("#event-location").html("<b>Location: </b>" + calendarHtml.location);
	                $("span.location").text(calendarHtml.location);
	            } else{
	                $("span.location").text("");
	            }
	            $("#event-link").attr('href', calendarHtml.link);
	            $("span.description").text(calendarHtml.link);
	        }
	        $("#calendar-loader").hide();

	        returnParams.calendarData = calendarData; 
	        returnParams.numCalendarItems = numCalendarItems;
	        callback(returnParams);
	    }).fail(function(e){
	    	callback("", "GET method for " + endpoints.calendar + " failed.");
	    });
	}

	function getAnnouncements(callback){
	    $.ajax({
	        method: "GET",
	        url: endpoints.announcements
	    }).done(function(data){
	    	if(typeof data != "object"){
	    		$(".fa-spinner").hide();
	    		callback("GET method for " + endpoints.announcements + " failed.");
	    		return;
	    	}
	        var announcement = data.announcements;
	        var numAnnouncements = data.announcements.length;
	        for(var i = numAnnouncements-1; i > -1; i--){ 
	            _constructAnnouncement(announcement, i, 0);
	        }
	        $(".announcement-content-container").css({'text-align': 'left'});
	        $(".fa-spinner").hide();
	    }).fail(function(e){
	        $(".announcement-content-container").css({'text-align': 'left'});
	        $(".fa-spinner").hide();
	        callback("GET method for " + endpoints.announcements + " failed.");
	    });
	}

	function postAnnouncement(callback){
		$("#announcement-form").submit(function(formText){
	        var date = new Date();
	        var authenciated = $(".form-announ #post-announcement").attr('data-login');
	        if(!(!!$(".form-announ #post-announcement").attr('data-login'))){
	            alert("Access Denied. How did you get here? You're not supposed to be here!");
	            callback("Announcement post unsuccessful, not authenciated");
	            return false;
	        } else{
	            $.ajax({
	                type: 'POST',
	                url: endpoints.postAnnouncement,
	                data: { officer: formText.target.officer.value, 
	                        timestamp: date,
	                        announcement: formText.target.announcement.value
	                       }
	            }).done(function(status){
	                console.log("Announcement post successful!");
	                _constructAnnouncement(status.announcements, status.announcements.length - 1, 1);
	            }).fail(function(status){	
	            	callback("Announcement " + endpoints.postAnnouncement + " POST unsuccessful.");
	            });
	            return false; // won't refresh the page
	        }
	    });
	}

	function getOfficers(callback){
	    $.ajax({
	        method: "GET",
	        url: endpoints.officers
	    }).done(function(data){
	    	if(typeof data != "object"){
	    		callback("GET method for " + endpoints.officers + " failed. Unsupported return type.");
	    		return;
	    	}
	        for(var i = 0, length = data.length; i < length; i++){
	            $("select").append('<option value="' + data[i].name + '">' + data[i].name + '</option>');
	        }
	    }).fail(function(e){
	    	callback("GET method for " + endpoints.officers + " failed.");
	    });
	}

	function getAuthentication(callback){
	    if(localStorage.getItem('credentials')){
	        $.ajax({
	            method: "GET",
	            url: endpoints.officerLogin + "?" +"credentials="+ localStorage.getItem('credentials'),
	        }).done(function(status){
	            if(status === undefined){
	            	callback(endpoints.officerLogin + " endpoint failed");
	                return;
	            } else if(status.indexOf('404') >= 0){
	            	callback(endpoints.officerLogin + " endpoint failed");
	                return;
	            }
	            if(status == "OK"){
	                $(".post-announcement").css({'display':'flex'});
	                $(".announcement-container").css({'height':'250px'});
	                $(".show-login").empty();
	                $(".form-announ #post-announcement").attr('data-login', true);
	            }
	        }).fail(function(){
	        	callback(endpoints.officerLogin + " endpoint failed");
	        });
	    }
	}

	function login(formText, callback){
        $.ajax({
            type: 'POST',
            url: endpoints.login,
            data: { username: formText.target.name.value, 
                    password: formText.target.password.value
                   }
        }).done(function(login){
            var id = login.uuid; // a unique UUID sent from the server
            $(".form-announ #post-announcement").attr('data-login', true);
            console.log("Login successful with UUID " + id);
            localStorage.setItem('credentials', id);
            $(".mes").hide();
            $(".status").text("Login successful!").css({'color': '#4CAF50'}).show();
            $(".post-announcement").show();
            $(".announcement-container").css({'height':'275px'});
            setTimeout(function(){
                $(".status").hide();
                $(".close-modal").click();
            }, 1500);
        }).fail(function(status){
            $(".status").text("Login unsuccessful.").css({'color': '#F44336'}).show();
            setTimeout(function(){
                $(".status").hide();
                $(".mes").show();
            }, 2500);
            callback("Login unsuccessful.. Error Code: " + JSON.stringify(status))
        });    
	}

	function subscribe(callback){
		var address = $("#subscribe-email").val();
        if(!_checkIfEmailInString(address)){
            $("#stat").css({'color':'red'});
            $("#stat").text("Invalid e-mail.");
        } else{
            $("#stat").css({'color':'green'});
            $("#stat").text("Subscription successful!");
            $.ajax({
                type: 'POST',
                url: endpoints.subscribe,
                data: { name: "new user", 
                        email: address,
                        phone: "n/a",
                        category: "SHPE Austin: Newletter Subscription Request",
                        message: "Please add " + address + " to the newsletter.",
                        subscribe: true
                       }
            }).done(function(status){
                console.log("Success!");
            }).fail(function(status){
            	callback(status);
            }); 	
            setTimeout(function(){
                $("#subscribe-container").css({'display':'none'});
                $("#newsletter-buttons").show();
                $(".fa-archive").show();
                $(".fa-envelope").show();
                $("#stat").text("Subscribe to our newsletter!");
                $("#stat").css({'color':'black'});
            }, 2500);
        }
	}

    function _checkIfEmailInString(text) { 
        var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        return re.test(text);
    }

    function _parseCalendarTime(time){
        var date = [];
        var year = time.substring(0,time.indexOf('-'));
        time = time.substring(time.indexOf('-')+1, time.length);
        var month = time.substring(0, time.indexOf('-'));
        month = _getMonthString(month);
        time = time.substring(time.indexOf('-')+1, time.length);
        day = time.substring(0, 2);
        if(time.length > 2){
            var hour = time.substring(3, time.length);
            var startTime = hour.substring(0, 5);
            //var timeOfDay = parseInt(startTime.replace(/^0+/, ''));
            var timeOfDay = parseInt(startTime);
            if(timeOfDay >= 12){
                if(timeOfDay > 12){
                    var restOfTime = startTime.substring(2, startTime.length);
                    var militaryConvert = parseInt(startTime.substring(0,2)) - 12;
                    if((militaryConvert / 10) < 1){
                        militaryConvert = militaryConvert.pad(2);
                    }
                    startTime = militaryConvert + restOfTime;
                }
                timeOfDay = "PM";
            } else{
                timeOfDay = "AM";
            }
            //startTime = startTime.replace(/^0+/, '');
            date.startTime = startTime + " " + timeOfDay;
        } else{
            date.startTime = "";
        } 
        date.month = month;
        date.day = day;
        date.year = year;
        return date;
    }

    function _getMonthString(month){
        month = parseInt(month.replace(/^0+/, '')); // strip leading 0's
        switch(month){
            case 1:
                return "January";
            case 2:
                return "February";
            case 3:
                return "March";
            case 4:
                return "April";
            case 5:
                return "May";
            case 6:
                return "June";
            case 7:
                return "July";
            case 8:
                return "August";
            case 9:
                return "September";
            case 10:
                return "October";
            case 11:
                return "November";
            case 12:
                return "December";
            default:
                return "Invalid Month";
        }
    }

    // convert to MM/DD/YYYY HH:SS format
    // example: 04/03/2016 08:00 AM
    function _convertToDateFormat(month, day, year, time){
        if(time === ""){
            time = "12:00 PM"; // set default time of 12:00 PM
        } 
        month = _months.indexOf(month) + 1;
        if((month / 10) < 1){
            month = month.pad(2); // add a zero in front
        }
        // if((day / 10) < 1){
        //     day = day.pad(2); // add a zero in front
        // }
        return month + "/" + day + "/" + year + " " + time;
    }

    function _constructAnnouncement(announcement, i, flag){
    	if(typeof i == "undefined"){
    		i = announcement.length - 1;// can fall here due to asynchornous call
    	}
        var announcementInfo = '<p class="officer-post"> <span class="post-info"></span> <span class="post-content"></span></p>';
        var officerName = announcement[i].officer;
        var timestamp = announcement[i].timestamp;
        var content = announcement[i].announcement;
        var date = new Date(timestamp);
        var calDate = date.toLocaleDateString();
        var time = date.toLocaleTimeString();
        var postInfoText = officerName + " (" + calDate + " @ " + time  + ")";
        var postInfo = $(announcementInfo).find('.post-info')[0];
        $(postInfo).text(postInfoText + " ");
        var postContent = $(announcementInfo).find('.post-content')[0];
        var announcementLink;
        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(content)) {
            var splitAnnouncement = content.split(' ');
            for(var j = 0, length = splitAnnouncement.length; j < length; j++){
                if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(splitAnnouncement[j])){
                    announcementLink = document.createElement('a');
                    announcementLink.setAttribute('href', splitAnnouncement[j]);
                    announcementLink.text = "(Attached link)";
                }
            }
        }
        $(postContent).html(content + " ");
        $(postContent).append(announcementLink);
        var innerP = '<p class="officer-post">';
        var completeHtml = innerP;
        completeHtml = $(completeHtml).append(postInfo);
        completeHtml = $(completeHtml).append(postContent);
        if(flag === 0){
            $('.announcement-content-container').append(completeHtml);
        } else if(flag === 1){
            $('.announcement-content-container').prepend(completeHtml);
        }
    }

	return {
		getNewsletterData: getNewsletterData,
		getCalendarData: getCalendarData,
		getAnnouncements: getAnnouncements,
		postAnnouncement: postAnnouncement,
		getOfficers: getOfficers,
		getAuthentication: getAuthentication,
		login: login,
		subscribe: subscribe,
		_parseCalendarTime: _parseCalendarTime,
		_convertToDateFormat: _convertToDateFormat
	}


})();