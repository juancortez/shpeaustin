$(document).ready(function() { // HTML has loaded
    var newsletterItem = 0;
    var populatedItems = 0;
    var newsletterData;
    var calendarData;
    var numCalendarItems = 0;
    var calendarItem = 0;
    var authenticated = false;

    var newsletterInterval = setInterval(function(e){
        $("#next-newsletter").click(); 
    }, 5000);

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
            $("#image-newsletter").attr('src', "../assets/newsletter/newsletter0");
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
                var dateFormat = convertToDateFormat(time.month, time.day, time.year, time.startTime);
                $("span.start").text(dateFormat);
                $("span.end").text(dateFormat); //TODO: add ending time support
            } else{
                $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
                var dateFormat = convertToDateFormat(time.month, time.day, time.year, "");
                $("span.start").text(dateFormat);
                $("span.end").text(dateFormat); //TODO: add ending time support
            }
            if(time.day < date.getDate()) {
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
    });

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
         if(time.startTime){
            $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
            var dateFormat = convertToDateFormat(time.month, time.day, time.year, time.startTime);
            $("span.start").text(dateFormat);
            $("span.end").text(dateFormat); //TODO: add ending time support
        } else{
             $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
             var dateFormat = convertToDateFormat(time.month, time.day, time.year, time.startTime, "");
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
        if(time == ""){
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

    function updateNewsletter() {
        $("#title").empty();
        $("#description").empty();
        if (newsletterItem < populatedItems) {
            $($('ol li')[newsletterItem]).addClass('active');
            $("#title").append(newsletterData.newsletter[newsletterItem].title);
            $("#description").append("<span class = 'bold'> Description: </span>" + newsletterData.newsletter[newsletterItem].description);
            $("#image-newsletter").attr('src', "../assets/newsletter/newsletter"+newsletterItem);
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
        $(".fa-sign-in").hide();
    }

    $('form').submit(function(formText) {
        $.ajax({
            type: 'POST',
            url: '/login',
            data: { username: formText.target.name.value, 
                    password: formText.target.password.value
                   }
        }).done(function(status){
            console.log("Login successful!");
            $(".status").text("Login successful!");
            $(".status").css({'color': '#4CAF50'});
            $(".status").show();
            $(".secret").show();
            authenticated = true;
            setTimeout(function(){
                $(".status").hide();
                $(".close-modal").click();
            }, 1500);
        }).fail(function(status){
            $(".status").text("Login unsuccessful.");
            $(".status").css({'color': '#F44336'});
            $(".status").show();
            setTimeout(function(){
                $(".status").hide();
            }, 2500);
            console.error("Login unsuccessful.. Error Code: " + JSON.stringify(status));
        });
        return false; // won't refresh the page
    }); 

    Number.prototype.pad = function(n) {
        return new Array(n).join('0').slice((n || 2) * -1) + this;
    };
});