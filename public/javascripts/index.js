$(document).ready(function() { // HTML has loaded
    var newsletterItem = 0;
    var populatedItems = 0;
    var newsletterData;

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
        }).fail(function(e) {
            console.error("GET method for /newsletterdata failed.");
        });


    $("#prev-newsletter").click(function() {
        $($('ol li')[newsletterItem]).removeClass('active');
        if (newsletterItem == 0) {
            newsletterItem = populatedItems - 1;
        } else {
            newsletterItem--;
        }
        updateNewsletter();
    });

    $("#next-newsletter").click(function() {
        $($('ol li')[newsletterItem]).removeClass('active');
        newsletterItem = ((newsletterItem + 1) % (populatedItems));
        updateNewsletter();
    });

    function updateNewsletter() {
        $("#title").empty()
        $("#description").empty();
        if (newsletterItem < populatedItems) {
            $($('ol li')[newsletterItem]).addClass('active');
            $("#title").append(newsletterData.newsletter[newsletterItem].title);
            $("#description").append("<span class = 'bold'> Description: </span>" + newsletterData.newsletter[newsletterItem].description);
            //$("#image-newsletter").attr('src', newsletterData.newsletter[newsletterItem].image);
            $("#image-newsletter").attr('src', "../assets/newsletter/newsletter"+newsletterItem);
            $("#image-newsletter").parent()[0].setAttribute('href', newsletterData.newsletter[newsletterItem].image_link);
        }
    }
});