$(document ).ready(function() { // HTML has loaded
  
  var carousel = $("#carousel");
  var currdeg  = 0;
  var titles = [];
  var descriptions = [];
  var newsletterItem = 0;
  var populatedItems = 0;
  var numPanels = 6;

  $("#next").on("click", { d: "n" }, rotateAndUpdate);
  $("#prev").on("click", { d: "p" }, rotateAndUpdate);

  function rotateAndUpdate(e){
    if(e.data.d=="n"){
      newsletterItem = ((newsletterItem + 1) % (numPanels+1));
      currdeg = currdeg - 60;
    }
    if(e.data.d=="p"){
      if(newsletterItem == 0){
        newsletterItem = 6;
      } else {
        newsletterItem--;
      }
      currdeg = currdeg + 60;
    }

    $("#title").empty()
    $("#description").empty();

    if(newsletterItem < populatedItems){
      $("#title").append("<span class = 'bold'> Title: </span>" + titles[newsletterItem]);
      $("#description").append("<span class = 'bold'> Description: </span>" + descriptions[newsletterItem]);
    }
    

    carousel.css({
      "-webkit-transform": "rotateY("+currdeg+"deg)",
      "-moz-transform": "rotateY("+currdeg+"deg)",
      "-o-transform": "rotateY("+currdeg+"deg)",
      "transform": "rotateY("+currdeg+"deg)"
    });
}

  $.get( "../views/newsletters/newsletters.html", function( data ) {
    if ( status == "error" ) {
      console.error("Couldn't load newsletters.html");
    } else{
      console.log("Newsletter successfully loaded.");
      var parser=new DOMParser();
      var htmlDoc= parser.parseFromString(data, "text/html");

      var eventRecap = htmlDoc.getElementsByClassName('mcnImageCardBottomImageContent');
      for(var i = 0; i < eventRecap.length; i++){
        var title = $($($(eventRecap).closest('tbody')[i]).find('strong')[0]).text(); // title of Event Recap
        var description = $($($(eventRecap).closest('tbody')[i]).find('strong')[1]).text();
        var image = $(eventRecap[i]).find('img')[0].getAttribute('src');

        var img = $('<img class="dynamic">'); //Equivalent: $(document.createElement('img'))
        img.attr('src', image);
        img.appendTo($($('#carousel')[0].children[i]));

        titles[i] = title;
        descriptions[i] = description;
        populatedItems++;

        
      }
    }

    $("#title").append("<span class = 'bold'> Title: </span>" + titles[newsletterItem]);
    $("#description").append("<span class = 'bold'> Description: </span>" + descriptions[newsletterItem]);
    
  });




  // var turnCarousel = setInterval(function(){ 
  //   $("#next").trigger('click');
  // }, 2000);

});
