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
                        complete(true);
                    }
                });
            });
        }

        keysProcessed = 0;
        if (keys.length > 0 && request == "update") {
            $(this).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');
            keys.forEach(function(key) {
                if (key == "newsletterdata") {
                    var baseUrl = window.location.protocol + "//" + window.location.host + "/";
                    window.open(baseUrl + "update/newsletterload");
                    keysProcessed++;
                    console.info("Don't forget to move the newsletter* images to public/assets/newsletter");
                    if (keysProcessed == keys.length) {
                        complete(false);
                    }
                    return;
                }

                $.ajax({
                    method: "PUT",
                    url: "/data/" + key
                }).done(function(status) {
                    if (status === "OK") {
                        console.log(key + " was successfully updated!");
                    }
                }).fail(function(e) {
                    console.error(key + " was unsuccessfully updated.");
                    console.error(e);
                }).always(function() {
                    keysProcessed++;
                    if (keysProcessed == keys.length) {
                        complete(false);
                    }
                });
            });
        }

        function complete(reload) {
            console.log("Request complete");
            if (!!reload) {
                location.reload();
            }
            $(self).html();
            $(self).text("Submit");
            return false;
        }
        return false;
    });
});