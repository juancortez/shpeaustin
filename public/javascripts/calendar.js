$(document).ready(function() {
     $.ajax({
        method: "GET",
        url: "/calendardata"
    }).done(function(calendar){
        calendarData = calendar;
        numCalendarItems = calendarData.calendar.length;
        var date = new Date();
        var currentMonth = date.getMonth();

        for(var i = 0; i < numCalendarItems; i++){
            calendarHtml = calendarData.calendar[i];
            var time = parseCalendarTime(calendarHtml.time);
            if(getMonthString(currentMonth+1) == time.month){
                var day = time.day;
                var highlightDay = $('td:contains("' + time.day + '")')[0];
                $(highlightDay).addClass('forest-green');
                var image_link = document.createElement('a');
                image_link.href = calendarHtml.link;
                $(highlightDay).wrap(image_link);
            }
        }
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
        if(month.length > 1){
            month = parseInt(month.replace(/^0+/, '')); // strip leading 0's
        }
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


});



var CALENDAR = function() {
    var wrap, label,
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function init(newWrap) {
        wrap = $(newWrap || "#cal");
        label = wrap.find("#label");
        wrap.find("#prev").bind("click.calendar", function() {
            switchMonth(false);
        });
        wrap.find("#next").bind("click.calendar", function() {
            switchMonth(true);
        });
        label.bind("click", function() {
            switchMonth(null, new Date().getMonth(), new Date().getFullYear());
        });
        label.click();
    }

    function switchMonth(next, month, year) {

        var curr = label.text().trim().split(" "),
            calendar, tempYear = parseInt(curr[1], 10);
        month = month || ((next) ? ((curr[0] === "December") ? 0 : months.indexOf(curr[0]) + 1) : ((curr[0] === "January") ? 11 : months.indexOf(curr[0]) - 1));
        year = year || ((next && month === 0) ? tempYear + 1 : (!next && month === 11) ? tempYear - 1 : tempYear);
        calendar = createCal(year, month);
        $("#cal-frame", wrap)
            .find(".curr")
            .removeClass("curr")
            .addClass("temp")
            .end()
            .prepend(calendar.calendar())
            .find(".temp")
            .fadeOut("slow", function() {
                $(this).remove();
            });

        $('#label').text(calendar.label);
    }

    function createCal(year, month) {
        var day = 1,
            i, j, haveDays = true,
            startDay = new Date(year, month, day).getDay(),
            daysInMonths = [31, (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            calendar = [];
        if (createCal.cache[year]) {
            if (createCal.cache[year][month]) {
                return createCal.cache[year][month];
            }
        } else {
            createCal.cache[year] = {};
        }

        i = 0;
        while (haveDays) {
            calendar[i] = [];
            for (j = 0; j < 7; j++) {
                if (i === 0) {
                    if (j === startDay) {
                        calendar[i][j] = day++;
                        startDay++;
                    }
                } else if (day <= daysInMonths[month]) {
                    calendar[i][j] = day++;
                } else {
                    calendar[i][j] = "";
                    haveDays = false;
                }
                if (day > daysInMonths[month]) {
                    haveDays = false;
                }
            }
            i++;
        }

        if (calendar[5]) {
            for (i = 0; i < calendar[5].length; i++) {
                if (calendar[5][i] !== "") {
                    calendar[4][i] = "<span>" + calendar[4][i] + "</span><span>" + calendar[5][i] + "</span>";
                }
            }
            calendar = calendar.slice(0, 5);
        }

        for (i = 0; i < calendar.length; i++) {
            calendar[i] = "<tr><td>" + calendar[i].join("</td><td>") + "</td></tr>";
        }
        calendar = $("<table>" + calendar.join("") + "</table>").addClass("curr");

        $("td:empty", calendar).addClass("nil");
        if (month === new Date().getMonth()) {
            $('td', calendar).filter(function() {
                return $(this).text() === new Date().getDate().toString();
            }).addClass("today");
        }
        createCal.cache[year][month] = {
            calendar: function() {
                return calendar.clone()
            },
            label: months[month] + " " + year
        };

        return createCal.cache[year][month];
    }
    createCal.cache = {};
    return {
        init: init,
        switchMonth: switchMonth,
        createCal: createCal
    };
};