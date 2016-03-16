$(document).ready(function() { // HTML has loaded
    var newsletterItem = 0;
    var populatedItems = 0;
    var newsletterData;
    var calendarData;
    var numCalendarItems = 0;
    var calendarItem = 0;

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
            var time = parseCalendarTime(calendarHtml.time);
            if(time.startTime){
                $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
            } else{
                 $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
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
            }
            $("#event-link").attr('href', calendarHtml.link);
        }
    });

    // try this: http://keith-wood.name/icalendar.html
    $("#event-thumbnail").on('click', function(e){
        if(e.toElement.tagName == "A"){
            return;
        }
        calendarItem = (calendarItem + 1) % numCalendarItems;
        $('.fa-calendar').toggleClass('dark-shpe-blue mid-blue');
        calendarHtml = calendarData.calendar[calendarItem];
        $("#event-title").html("<b>Event: </b>" + calendarHtml.event);
        var time = parseCalendarTime(calendarHtml.time);
         if(time.startTime){
            $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year + " at " +  time.startTime);
        } else{
             $("#event-date").html("<b>Date: </b>" + time.month + " " + time.day + ", " + time.year);
        }
        if(calendarHtml.location){
            $("#event-location").html("<b>Location: </b>" + calendarHtml.location);
        } else{
            $("#event-location").html("");
        }
        $("#event-link").attr('href', calendarHtml.link);
    });

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
            var timeOfDay = parseInt(startTime.replace(/^0+/, ''));
            if(timeOfDay >= 12){
                if(timeOfDay > 12){
                    var restOfTime = startTime.substring(2, startTime.length);
                    var militaryConvert = parseInt(startTime.substring(0,2)) - 12;
                    startTime = militaryConvert + restOfTime;
                }
                timeOfDay = "P.M.";
            } else{
                timeOfDay = "A.M.";
            }
            startTime = startTime.replace(/^0+/, '');
            date.startTime = startTime + " " + timeOfDay;
        } else{
            date.startTime = "";
        } 
        date.month = month;
        date.day = day;
        date.year = year;
        return date;
    }

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
});