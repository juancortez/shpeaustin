$(document).ready(function() { 

    Chat.initialize();
    
    // form submission for chat
    $('#chat').submit(function(message){
        Chat.sendMessage(message);
        return false;
    });
 

    $("#chat-header i").click(function(){
        $(".content-container").toggle();
        if($(this).hasClass('fa-angle-double-up')){
            $("#chat-container").css({'height': '368px'});
            $(this).removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        } else{
            $("#chat-container").css({'height': '30px'});
            $(this).removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
        }
    });

    $("#chat-header i").click();

    $(".toggle button").click(function(e){
        
        var btn = e.currentTarget.id;
        
        if(btn === "physical-toggle"){
            $("#email-toggle").removeClass('active');
            $("#email-toggle").addClass('inactive');
            $("#physical-toggle").removeClass('inactive');
            $("#physical-toggle").addClass('active');

            $(".form-email").css({'display': 'none'});
            $(".envelope-container").css({'display': 'flex'});
        } else{
            $("#physical-toggle").removeClass('active');
            $("#physical-toggle").addClass('inactive');
            $("#email-toggle").removeClass('inactive');
            $("#email-toggle").addClass('active');

            $(".envelope-container").css({'display': 'none'});
            $(".form-email").show();
        }

    });


    // form submission for e-mails
	$('#email').submit(function(formText) {
        $.ajax({
            type: 'POST',
            url: '/communication/contact',
            data: { name: formText.target.name.value, 
                    email: formText.target.email.value,
                    phone: formText.target.phone.value,
                    category: formText.target.category.value,
                    message: formText.target.message.value
                   }
        }).done(function(status){
        	console.log("Success!");
            _clearBox();
        	sendEmailStatus(1);
        }).fail(function(status){
        	console.error("Unsuccessful. Error Code:");
            console.log(JSON.stringify(status, null, 4));
        	sendEmailStatus(-1);
        });
        return false; // won't refresh the page
    }); 

    function _clearBox(){
        $("input[name='name']").val('');
        $("input[name='email']").val('');
        $("input[name='phone']").val('');
        $("textarea[name='message']").val('');
    }

    // this function displays the result of the REST call for 2.5 seconds
    // @param status 1 = success, -1 = failure
    function sendEmailStatus(status) {
        if (status == -1) {
            modal.open({
                content: "<b>Oh no!</b></br>Email wasn't sent...sorry, try again :(", 
                width: width+"px", 
                height: height+"px", 
                align: "center"
            });
            $("#submit-button").text("Failed").css({background: "#D8000C"});
        } else if (status == 1) {
            modal.open({
                content: "<b>E-mail sent!</b></br>We will answer as soon as we can!", 
                width: "250px", 
                height: "100px", 
                align: "center"
            });
            console.log("open modal");
            $("#submit-button").text("Success").css({background: "green"});
        }
        setTimeout(function(){
            $("#submit-button").text("Send it").css({background: "#0137A2"});
        }, 10000);
    }

    var $overlay = $('<div id="overlay"></div>'),
        $modal = $('<div id="modal"></div>'),
        $close = $('<a id="close" href="#">close</a>'),
        $content = $('<div id="modal-content"></div>');

    $modal.hide();
    $overlay.hide();
    $modal.append($content, $close);
    $('.contact-container').append($overlay, $modal);

    modal.initialize({
        $overlay: $("#overlay"),
        $modal: $("#modal"),
        $close: $("#close"),
        $content: $("#modal-content")
    });

    $('.subscribe-container').click(function(){
        var height = 400;
        var width = 500;
        var window_height = $(window).height();
        var window_width = $(window).width();

        // make sure that it fits within the frame
        height = window_height < height ? window_height - 50: height;
        width = window_width < width ? window_width - 50 : width;
        $("#modal").css({'background':'white'});
        var subscribeData = '<h2>Subscribe to SHPE Newsletter</h2>' + 
        '<form>' +
            '<div class="form-group row">' + 
                '<label for="first_name" class="col-xs-2 col-form-label">First Name:</label>' +
                '<div class="col-xs-10">' + 
                '   <input class="form-control" type="text" placeholder="First Name" name="first_name" id="first_name">'+
                '</div>' +
            '</div>' +
            '<div class="form-group row">' + 
                '<label for="last_name" class="col-xs-2 col-form-label">Last Name:</label>' +
                '<div class="col-xs-10">' + 
                '   <input class="form-control" type="text" placeholder="Last Name" name="last_name" id="last_name">'+
                '</div>' +
            '</div>' +            
            '<div class="form-group row">' + 
                '<label for="email" class="col-xs-2 col-form-label">Email:</label>' +
                '<div class="col-xs-10">' + 
                '   <input class="form-control" type="email" placeholder="E-Mail Address" name="email" id="email">'+
                '</div>' +
            '</div>' +  
            '<div class="button-container">' + 
                '<button type="submit" class="btn btn-primary submit-request">Subscribe</button>' +
            '</div>'+
        '</form>';
        
        modal.open({content: $(subscribeData), width: width+"px", height: height+"px", align: "center"});

        $(".submit-request").bind('click', function(evt){
            var first_name = evt.target.form.first_name.value,
                last_name = evt.target.form.last_name.value,
                email = evt.target.form.email.value;
            var mailchimpId = $(".mailchimp-subscribe").attr('data-mailchimp');
            var self = ".submit-request";
            $(self).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');
            $.ajax({
                type: 'POST',
                url: "/communication/mailchimp/lists/" + mailchimpId + "/subscribe",
                data: {
                    email: email
                }
            }).done(function(status) {
                complete(false, false);
                console.log(email + " was successfully subscribed!");
            }).fail(function(e) {
                if (e.status === 200) {
                    complete(false, false);
                    return;
                }
                complete(true, false);
                console.error(e);
            });
            return false;
        });
    });

    $close.click(function(e){
        e.preventDefault();
         modal.close();
    });

    function complete(err, reload) {
        console.log("Request complete");
        var self = ".submit-request";
        $(self).html();
        var time = 2000;
        if (!!err) {
            $(self).text("Failed, try Again.").css({
                background: "#D8000C"
            });
        } else {
            $(self).text("Success!").css({
                background: "green"
            });
        }

        setTimeout(function() {
            var status = $(self).text();
            $(self).text("Submit").css({
                background: "#0137A2"
            });
            if(status === "Success!"){
                modal.close();
            }
        }, time);

        if (!!reload) {
            location.reload();
        }
        return false;
    }



});