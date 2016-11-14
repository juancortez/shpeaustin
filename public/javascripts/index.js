$(document).ready(function() { // HTML has loaded
    var socket = io(); // get a handle to the websocket
    var revision; // contains the current revision number, as held by the Redis database
    
    /*********************************/
    // Calendar global variables
    var calendarData; // contains all the calendar data
    var numCalendarItems = 0; // number of calendar items
    var calendarItem = 0; // index of current calendar item being viewed
    /*********************************/
    
    ////////////////////////////////////////////////////////////////////
    // Socket Code
    ////////////////////////////////////////////////////////////////////
    socket.emit('revision', "Get revision number from backend.");
    socket.on('revision', function(rev){
        console.log("Revision is: " + rev);
        revision = rev;
    });

    ////////////////////////////////////////////////////////////////////
    // REST Calls
    ////////////////////////////////////////////////////////////////////

    // These [GET] methods are unique to "/"
    if(window.location.pathname == "/"){
        ajaxUtils.getCalendarData(function(params, err){
            if(err){
                console.error(err);
                return;
            }
            calendarData = params.calendarData;
            numCalendarItems = calendarData.length;
            // don't know why i have to do this but it works...
            $(".fa-angle-double-right").click();
            $(".fa-angle-double-left").click();
        });

        ajaxUtils.getAnnouncements(function(err){
            if(err){
                console.error(err);
            }
        });

        ajaxUtils.getOfficers(function(err){
            if(err){
                console.error(err);
            }
        });

        ajaxUtils.getAuthentication(function(err){
            if(err){
                console.error(err);
            }
        });
    }

    ajaxUtils.postAnnouncement(function(err){
        if(err){
            console.error(err);
        }
    });

    // login for the website
    $('#login-form').submit(function(formText) {
        ajaxUtils.login.call(this, formText, function(err){
            if(err){
                console.error(err);
            }
        });
        return false; // won't refresh the page
    }); 
    $(".cal-button").on('click', function(e){
        if($(e.currentTarget).hasClass('fa-angle-double-right')){
            calendarItem = (calendarItem + 1) % numCalendarItems;
        } else{
            calendarItem--;
            if(calendarItem < 0){
                calendarItem = numCalendarItems - 1;
            }
        }
        $('.fa-calendar').toggleClass('dark-shpe-blue mid-blue');
        var calendarHtml = calendarData[calendarItem];

        $("#event-title").html("<b>Event: </b>" + calendarHtml.event);
        $("span.title").text(calendarHtml.event);
        var time = ajaxUtils._parseCalendarTime(calendarHtml.time);
        var dateFormat;
         if(time.startTime){
            $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
            dateFormat = ajaxUtils._convertToDateFormat(time.month, time.day, time.year, time.startTime);
            $("span.start").text(dateFormat);
            $("span.end").text(dateFormat); //TODO: add ending time support
        } else{
             $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
             dateFormat = ajaxUtils._convertToDateFormat(time.month, time.day, time.year, time.startTime, "");
             $("span.start").text(dateFormat);
             $("span.end").text(dateFormat); //TODO: add ending time support
        }
        if(calendarHtml.location){
            $("#event-location").html("<b>Location: </b>" + calendarHtml.location);
            $("span.location").text(calendarHtml.location);
        } else{
            $("#event-location").html("");
            $("span.location").text("");
        }
        $("#event-link").attr('href', calendarHtml.link);
        $("span.description").text(calendarHtml.link);
    });

    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if(isMobile){
        $(".show-login").empty();
    }

    Number.prototype.pad = function(n) {
        return new Array(n).join('0').slice((n || 2) * -1) + this;
    };

    $(document).keydown(function(event){
        if (event.keyCode == 13) {  // 13 is the Enter key
            if($("#subscribe-container").is(':visible') && $("#subscribe-email").is(':focus')){
                $(".fa-envelope-o").click();
            }
        } else if(event.keyCode == 27){ // 27 is the ESC key
            if($("#subscribe-container").is(':visible')){
                $("#close-subscribe").click();
            }
        }
    });

   
});
