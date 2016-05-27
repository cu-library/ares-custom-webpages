// Copyright (c) 2015 Atlas Systems, Inc.
// Name      Modern Fade Effect
$(document).ready(function() {

    $.fn.bgColorFade = function (userOptions) {
        // starting color, ending color, duration in ms
        var options = $.extend({
            start: "#FFFF33",
            end: "#E0F5FF",
            time: 1000
        }, userOptions || {});
        $(this).css({
            backgroundColor: options.start
        }).animate({
            backgroundColor: options.end
        }, options.time);
        return this;
    };

    $(".fade").bgColorFade({
        time: 2000
    });

});
	