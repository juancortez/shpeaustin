$(document).ready(function() {
    $(".submit-request").click(function(evt) {
        var formElements = evt && evt.target && evt.target.form && evt.target.form.children || null,
            request = $(this).attr('data-request'),
            self = this,
            keys = [];

        if (!!formElements && formElements.length > 1) {
            var formArray = $.map(formElements, function(value, index) {
                if ($(value).is('.form-check')) {
                    return [value];
                }
                return; // don't add
            });

            var selectedItems = formArray.filter(function(form) {
                if ($(form).find(".form-check-input").is(":checked")) {
                    keys.push($(form).find(".form-check-input").val());
                    return true;
                }
                return false;
            });
        }
        var keysProcessed = 0;
        if (keys.length > 0 && request == "delete") {
            $(this).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');
            keys.forEach(function(key) {
                $.ajax({
                    method: "DELETE",
                    url: "/data/" + key
                }).done(function(status) {
                    if (status === "OK") {
                        console.log(key + " was successfully cleared!");
                    }
                }).fail(function(e) {
                    console.error(key + " was unsuccessfully cleared.");
                    console.error(e);
                }).always(function() {
                    keysProcessed++;
                    if (keysProcessed == keys.length) {
                        complete(false, true);
                    }
                });
            });
        }

        if (request == "update") {
            $(this).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');
            var radioValueUpdate = findSelectedRadio("updateoptions");

            if (radioValueUpdate == "newsletterdata") {
                var baseUrl = window.location.protocol + "//" + window.location.host + "/";
                window.open(baseUrl + "update/newsletterload");
                keysProcessed++;
                console.info("Don't forget to move the newsletter* images to public/assets/newsletter");
                if (keysProcessed == keys.length) {
                    complete(false, true);
                }
                return;
            }

            var data = $("#data-update").val(),
                type,
                error = false;

            try{
                var tmp = JSON.parse(data);
                type = typeof tmp;
            } catch(e){
                error = true;
            }

            data = (!!error && type !== "object") ? null : data;

            $.ajax({
                method: "PUT",
                url: "/data/" + radioValueUpdate,
                dataType: "json",
                contentType: "application/json",
                data: data
            }).done(function(status) {
                console.log(status);
                if (status === "OK") {
                    complete(false, false);
                    console.log(radioValueUpdate + " was successfully updated!");
                }
            }).fail(function(e) {
                if(e.status === 200){
                    complete(false, false);
                    return;
                }
                complete(true, false);
                console.error(radioValueUpdate + " was unsuccessfully updated.");
                console.error(e);
            }).always(function() {
            });
        }

        if (request == "view") {
            $(this).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');
            var radioValue = findSelectedRadio("keyoptions");

            console.log(radioValue);
            $.ajax({
                method: "GET",
                url: "/data/" + radioValue
            }).done(function(data) {
                $(".json-container div").show();
                $(".output").text(JSON.stringify(data, null, 4));
                complete(false, false);
            }).fail(function(e) {
                complete(true, false);
                console.error("Unable to find " + radioValue + ". Error: " + JSON.stringify(e));
            }).always(function() {
                $('html, body').animate({
                    scrollTop: $(".json-container").offset().top - 20
                }, 1000);
            });
        }

        var outputJSON = function output(inp) {
            var jsonBlock = $(".output").append(document.createElement('pre'));
            jsonBlock.innerHTML = inp;
        };


        function complete(err, reload) {
            console.log("Request complete");
            $(self).html();

            if(!!err){
                $(self).text("Failure");
            } else{
                $(self).text("Success!");
            }

            setTimeout(function(){
                $(self).text("Submit");
            }, 2000);

            if (!!reload) {
                location.reload();
            }   

            return false;
        }

        function findSelectedRadio(name){
            var keys = document.getElementsByName(name);
            var key;
            for(var i = 0; i < keys.length; i++){
                if(keys[i].checked){
                    return keys[i].value;
                }
            }
        }
        return false;
    });
});