$(document).ready(function() { // HTML has loaded
    var socket = io(); // get a handle to the websocket
    var newsletterItem = 0;
    var populatedItems = 0;
    var newsletterData;
    var calendarData;
    var numCalendarItems = 0;
    var calendarItem = 0;
    var authenticated = false;
    var numAnnouncements;
    var revision;

    ////////////////////////////////////////////////////////////////////
    // Socket Code
    ////////////////////////////////////////////////////////////////////
    socket.emit('revision', "Get revision number from backend.");
    socket.on('revision', function(rev){
        revision = rev;
    });
       

    var newsletterInterval = setInterval(function(e){
        $("#next-newsletter").click(); 
    }, 5000);

    ////////////////////////////////////////////////////////////////////
    // REST Calls
    ////////////////////////////////////////////////////////////////////
    $.ajax({
            method: "GET",
            url: "/newsletterdata"
        })
        .done(function(data) {
            newsletterData = data;
            populatedItems = data.newsletter.length;
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
        }).fail(function(e) {
            console.error("GET method for /newsletterdata failed.");
        });

    $.ajax({
        method: "GET",
        url: "/calendardata"
    }).done(function(calendar){
        calendarData = calendar;
        numCalendarItems = calendarData.calendar.length;
        var valid = false;
        var dateFormat;
        var date = new Date();
        var currentMonth = date.getMonth();
        var currentDay = date.getDate();
        while(valid === false){
            calendarHtml = calendarData.calendar[calendarItem];
            $("#event-title").html("<b>Event: </b>" + calendarHtml.event);
            $("span.title").text(calendarHtml.event);
            var time = parseCalendarTime(calendarHtml.time);
            if(time.startTime){
                $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
                dateFormat = convertToDateFormat(time.month, time.day, time.year, time.startTime);
                $("span.start").text(dateFormat);
                $("span.end").text(dateFormat); //TODO: add ending time support
            } else{
                $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
                dateFormat = convertToDateFormat(time.month, time.day, time.year, "");
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
    });

    $.ajax({
        method: "GET",
        url: "/announcements"
    }).done(function(data){
        var announcement = data.announcements;
        numAnnouncements = data.announcements.length;
        for(var i = numAnnouncements-1; i > -1; i--){ 
            constructAnnouncement(announcement, i, 0);
        }
        $(".announcement-content-container").css({'text-align': 'left'});
        $(".fa-spinner").hide();
    }).fail(function(e){
        $(".announcement-content-container").css({'text-align': 'left'});
        $(".fa-spinner").hide();
        console.error("GET method for /announcements failed.");
    });


    if(localStorage.getItem('credentials')){
        $.ajax({
            method: "GET",
            url: "/officerlogin?"+"credentials="+localStorage.getItem('credentials'),
        }).done(function(status){
            if(status === undefined){
                return;
            }
            if(status == "OK"){
                $(".post-announcement").css({'display':'flex'});
                $(".announcement-container").css({'height':'250px'});
                $(".show-login").empty();
                authenticated = true;
            }
        }).fail(function(){
            console.error("/officerlogin endpoint failed");
        });
    }

    $('.fa-envelope').click(function(){
        $("#subscribe-container").css({'display':'flex'});
        $("#newsletter-buttons").hide();
        $(".fa-archive").hide();
        $(this).hide();
        clearInterval(newsletterInterval);
    });

    $(".fa-envelope-o").click(function(e){
        var address = $("#subscribe-email").val();
        if(!checkIfEmailInString(address)){
            $("#stat").css({'color':'red'});
            $("#stat").text("Invalid e-mail.");
        } else{
            $("#stat").css({'color':'green'});
            $("#stat").text("Subscription successful!");
            $.ajax({
                type: 'POST',
                url: '/contact',
                data: { name: "new user", 
                        email: address,
                        phone: "n/a",
                        category: "SHPE Austin: Newletter Subscription Request",
                        message: "Please add " + address + " to the newsletter."
                       }
            }).done(function(status){
                console.log("Success!");
            }).fail(function(status){
                console.error("Unsuccessful. Error Code: " + status);
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
        
    });

    function checkIfEmailInString(text) { 
        var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        return re.test(text);
    }
    
    function constructAnnouncement(announcement, i, flag){
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
        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(content)) {
            //console.log("Contains URL"); //TODO: figure out how to enclose link in a <a>
        }
        $(postContent).html(content);
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

    // try this: http://keith-wood.name/icalendar.html
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
        calendarHtml = calendarData.calendar[calendarItem];

        $("#event-title").html("<b>Event: </b>" + calendarHtml.event);
        $("span.title").text(calendarHtml.event);
        var time = parseCalendarTime(calendarHtml.time);
        var dateFormat;
         if(time.startTime){
            $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
            dateFormat = convertToDateFormat(time.month, time.day, time.year, time.startTime);
            $("span.start").text(dateFormat);
            $("span.end").text(dateFormat); //TODO: add ending time support
        } else{
             $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
             dateFormat = convertToDateFormat(time.month, time.day, time.year, time.startTime, "");
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

    // convert to MM/DD/YYYY HH:SS format
    // example: 04/03/2016 08:00 AM
    function convertToDateFormat(month, day, year, time){
        if(time === ""){
            time = "12:00 PM"; // set default time of 12:00 PM
        } 
        month = months.indexOf(month) + 1;
        if((month / 10) < 1){
            month = month.pad(2); // add a zero in front
        }
        // if((day / 10) < 1){
        //     day = day.pad(2); // add a zero in front
        // }
        return month + "/" + day + "/" + year + " " + time;
    }

    function parseCalendarTime(time){
        var date = [];
        var year = time.substring(0,time.indexOf('-'));
        time = time.substring(time.indexOf('-')+1, time.length);
        var month = time.substring(0, time.indexOf('-'));
        month = getMonthString(month);
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

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function getMonthString(month){
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

    $("#prev-newsletter").click(function(evt) {
        if(evt.originalEvent){
            clearInterval(newsletterInterval); // this means user clicked
        }
        $($('ol li')[newsletterItem]).removeClass('active');
        if (newsletterItem === 0) {
            newsletterItem = populatedItems - 1;
        } else {
            newsletterItem--;
        }
        updateNewsletter();
    });

    $("#next-newsletter").click(function(evt) {
        if(evt.originalEvent){
            clearInterval(newsletterInterval); // this means user clicked
        }
        $($('ol li')[newsletterItem]).removeClass('active');
        newsletterItem = ((newsletterItem + 1) % (populatedItems));
        updateNewsletter();
    });

    $("#close-subscribe").click(function(){
        $("#subscribe-container").css({'display':'none'});
        $("#newsletter-buttons").show();
        $(".fa-archive").show();
        $(".fa-envelope").show();
        $("#stat").text("Subscribe to our newsletter!");
        $("#stat").css({'color':'black'});
    });

    function updateNewsletter() {
        $("#title").empty();
        $("#description").empty();
        if (newsletterItem < populatedItems) {
            $($('ol li')[newsletterItem]).addClass('active');
            $("#title").append(newsletterData.newsletter[newsletterItem].title);
            $("#description").append("<span class = 'bold'> Description: </span>" + newsletterData.newsletter[newsletterItem].description);
            $("#image-newsletter").attr('src', "../assets/newsletter/newsletter"+newsletterItem+"?v="+revision);
            $("#image-newsletter").parent()[0].setAttribute('href', newsletterData.newsletter[newsletterItem].image_link);
            if(!newsletterData.newsletter[newsletterItem].image_link){
                $("#image-newsletter").parent()[0].setAttribute('onclick', "return false;");
            } else{
                $("#image-newsletter").parent()[0].setAttribute('onclick', "return true;");
            }
        }
    }

    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if(isMobile){
        $(".show-login").empty();
    }

    $('#login-form').submit(function(formText) {
        $.ajax({
            type: 'POST',
            url: '/login',
            data: { username: formText.target.name.value, 
                    password: formText.target.password.value
                   }
        }).done(function(login){
            var id = login.uuid; // a unique UUID sent from the server
            authenticated = true;
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
            console.error("Login unsuccessful.. Error Code: " + JSON.stringify(status));
        });
        return false; // won't refresh the page
    }); 

    $("#announcement-form").submit(function(formText){
        var date = new Date();
        if(!authenticated){
            alert("Access Denied. How did you get here? You're not supposed to be here!");
            return false;
        } else{
            $.ajax({
                type: 'POST',
                url: '/announcements',
                data: { officer: formText.target.officer.value, 
                        timestamp: date,
                        announcement: formText.target.announcement.value
                       }
            }).done(function(status){
                console.log("Announcement post successful!");
                constructAnnouncement(status.announcements, numAnnouncements, 1);
                numAnnouncements++;
            }).fail(function(status){
                console.error("Announcement post unsuccessful.");
            });
            return false; // won't refresh the page
        }
    });
    


    Number.prototype.pad = function(n) {
        return new Array(n).join('0').slice((n || 2) * -1) + this;
    };

});


var modal = (function(){
    var 
    method = {},
    $overlay = $('<div id="overlay"></div>');
    $modal = $('<div id="modal"></div>');
    $content = $('<div id="modal-content"></div>');
    $close = $('<a id="close" href="#">close</a>');

    $modal.hide();
    $overlay.hide();
    $modal.append($content, $close);

    // Center the modal in the viewport
    method.center = function () {
        var top, left;

        top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
        left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

        $modal.css({
            top:top + $(window).scrollTop(), 
            left:left + $(window).scrollLeft()
        });
    };

    // Open the modal
    method.open = function (settings) {
        $content.empty().append(settings.content);

        $modal.css({
            width: settings.width-10 || 'auto', 
            height: settings.height-10 || 'auto',
            "text-align" : settings.align
        });

        $content.css({
            width: settings.width || 'auto', 
            height: settings.height || 'auto'
        });

        method.center();

        $(window).bind('resize.modal', method.center);

        $modal.show();
        $overlay.show();
    };

    // Close the modal
    method.close = function () {
        $modal.hide();
        $overlay.hide();
        $content.empty();
        $(window).unbind('resize.modal');
    };

    $(document).ready(function(){
        $('.main-page-container').append($overlay, $modal);
        $close.click(function(e){
            e.preventDefault();
             method.close();
        });
        $('.fa-archive').click(function(){
            var height = 400;
            var width = 500;
            window_height = $(window).height();
            window_width = $(window).width();

            // make sure that it fits within the frame
            height = window_height < height ? window_height - 50: height;
            width = window_width < width ? window_width - 50 : width;
            $("#modal").css({'background':'white'});
            var modalNewsletters = "<h1>View Previous Newsletters<h1> " +
            "<ul class='newsletterList'> " + 
            "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=215199c3b2&e=38ee20bb08'>June 2016</a> </li>" +
            "<li><a href='http://us1.campaign-archive1.com/?u=c8b5a41c875ce918bbd091e52&id=00399bbff9&e=38ee20bb08'>May 2016</a> </li>" + 
            "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=480dcd7865&e=38ee20bb08'>Mid-April 2016</a> </li>" + 
            "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=17cac73925&e=38ee20bb08'>Early-April 2016</a></li>" + 
            "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=a8f7a3cd22&e=38ee20bb08'>March 2016 </a></li>" + 
            "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=ecb6bb1b8c&e=1365fed48c'>February 2016</a></li></ul>";
            modal.open({content: $(modalNewsletters), width: width+"px", height: height+"px", align: "center"});
        });

        $(document).keydown(function(event){
            if (event.keyCode == 27) {  // 27 is the ESC key
                $("#close").click();
            }
        });
    });

    return method;
}());