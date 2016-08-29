$(document).ready(function() { // HTML has loaded
    var socket = io(); // get a handle to the websocket
    var revision; // contains the current revision number, as held by the Redis database

    /*********************************/
    // Newsletter global variables
    var newsletterItem = 0; // index of the current newsletter item being viewed
    var populatedItems = 0; // number of newsletter items
    var newsletterData; // contains all newsletter data
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
        revision = rev;
    });
       

    var newsletterInterval = setInterval(function(e){
        $("#next-newsletter").click(); 
    }, 5000);


    ////////////////////////////////////////////////////////////////////
    // REST Calls
    ////////////////////////////////////////////////////////////////////

    // These [GET] methods are unique to "/"
    if(window.location.pathname == "/"){
        ajaxUtils.getNewsletterData(revision, function(params, err){
            if(err){
                console.error(err);
                return;
            }
            newsletterData = params.newsletterData;
            populatedItems = params.populatedItems;
        });

        ajaxUtils.getCalendarData(function(params, err){
            if(err){
                console.error(err);
                return;
            }
            calendarData = params.calendarData;
            numCalendarItems = params.numCalendarItems;
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

    // button clicked to subcribe to the newsletter
    $(".fa-envelope-o").click(function(e){
        ajaxUtils.subscribe(function(err){
            if(err){
                console.error(err);
            }
        });
    });

    $('.fa-envelope').click(function(){
        $("#subscribe-container").css({'display':'flex'});
        $("#newsletter-buttons").hide();
        $(".fa-archive").hide();
        $(this).hide();
        clearInterval(newsletterInterval);
    });

    $("#close-subscribe").click(function(){
        $("#subscribe-container").css({'display':'none'});
        $("#newsletter-buttons").show();
        $(".fa-archive").show();
        $(".fa-envelope").show();
        $("#stat").text("Subscribe to our newsletter!");
        $("#stat").css({'color':'black'});
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
        calendarHtml = calendarData.calendar[calendarItem];

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
            $("#title").attr('title', newsletterData.newsletter[newsletterItem].title);
            $("#description").append("<span class = 'bold'> Description: </span>" + newsletterData.newsletter[newsletterItem].description);
            $("#image-newsletter").attr('src', "../assets/newsletter/newsletter"+ newsletterData.newsletter[newsletterItem].image+"?v="+revision);
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

    Number.prototype.pad = function(n) {
        return new Array(n).join('0').slice((n || 2) * -1) + this;
    };

    /**********************************************************************************************************************************
    * Modal Code for Newsletter Popup
    *
    **********************************************************************************************************************************/
    var $overlay = $('<div id="overlay"></div>'),
        $modal = $('<div id="modal"></div>'),
        $close = $('<a id="close" href="#">close</a>'),
        $content = $('<div id="modal-content"></div>');

    $modal.hide();
    $overlay.hide();
    $modal.append($content, $close);
    $('.main-page-container').append($overlay, $modal);

    modal.initialize({
        $overlay: $("#overlay"),
        $modal: $("#modal"),
        $close: $("#close"),
        $content: $("#modal-content")
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
        var modalNewsletters = "<h1>View Previous Newsletters</h1> " +
        "<ul class='newsletterList'> " + 
        "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=215199c3b2&e=38ee20bb08'>June 2016</a> </li>" +
        "<li><a href='http://us1.campaign-archive1.com/?u=c8b5a41c875ce918bbd091e52&id=00399bbff9&e=38ee20bb08'>May 2016</a> </li>" + 
        "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=480dcd7865&e=38ee20bb08'>Mid-April 2016</a> </li>" + 
        "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=17cac73925&e=38ee20bb08'>Early-April 2016</a></li>" + 
        "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=a8f7a3cd22&e=38ee20bb08'>March 2016 </a></li>" + 
        "<li><a href='http://us1.campaign-archive2.com/?u=c8b5a41c875ce918bbd091e52&id=ecb6bb1b8c&e=1365fed48c'>February 2016</a></li></ul>";
        modal.open({content: $(modalNewsletters), width: width+"px", height: height+"px", align: "center"});
    });

    $close.click(function(e){
        e.preventDefault();
         modal.close();
    });
    /**********************************************************************************************************************************/
});
