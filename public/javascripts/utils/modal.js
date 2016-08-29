var modal = (function(){
    var method = {},
        $content,
        $close,
        $overlay,
        $modal;

    method.initialize = function(args){
        console.log("Initializing modal...");
        $content = args.$content;
        $close = args.$close;
        $overlay = args.$overlay;
        $modal = args.$modal;
    };
    // $modal.hide();
    // $overlay.hide();
    // $modal.append($content, $close);

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

    $(document).keydown(function(event){
        if (event.keyCode == 27) {  // 27 is the ESC key
            $("#close").click();
        }
    });


    return method;
}());