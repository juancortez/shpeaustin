var CALENDAR = function() {
    var wrap, label,
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var globalCalendarData;
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth(); // add one to see what it really is (i.e. January is 0)

    $.ajax({
        method: "GET",
        url: "/calendardata"
    }).done(function(calendar) {
        globalCalendarData = calendar;
        populateCalendar();
    });

    function init(newWrap) {
        wrap = $(newWrap || "#cal");
        label = wrap.find("#label");
        wrap.find("#prev").bind("click.calendar", function() {
            switchMonth(false);
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
            }
            populateCalendar();
        });
        wrap.find("#next").bind("click.calendar", function() {
            switchMonth(true);
            currentMonth = (currentMonth + 1) % 12;
            populateCalendar();
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

    function populateCalendar() {
        numCalendarItems = globalCalendarData.calendar.length;
        for (var i = 0; i < numCalendarItems; i++) {
            calendarHtml = globalCalendarData.calendar[i];
            var time = parseCalendarTime(calendarHtml.time);
            if (getMonthString(currentMonth + 1) == time.month) {
                var day = time.day;
                day = parseInt(day.replace(/^0+/, '')); // strip leading 0's
                var highlightDay = $('td:contains("' + day + '")')[0];
                if(day == currentDate.getDate()){
                    $(highlightDay).removeClass('today');
                }
                $(highlightDay).addClass('forest-green');
                highlightDay.setAttribute("data-date", time.month + " " + day + " " + time.year);
                highlightDay.setAttribute("data-event", calendarHtml.event);
                if (calendarHtml.location) {
                    highlightDay.setAttribute("data-location", calendarHtml.location);
                }
                highlightDay.setAttribute("data-link", calendarHtml.link);
                $(highlightDay).css({
                    'cursor': 'pointer'
                });
            }
        }
    }

    $(".glyphicon-remove-sign").click(function() {
        $("#cal-info").hide();
    });

    $('#cal').click(function(e) {
        if (e.originalEvent && e.toElement.classList[0] == "forest-green") {
            if (e.toElement.classList[0] == "glyphicon") {
                return;
            }
            var attr = $(e.toElement).attr('data-event');
            var location = $(e.toElement).attr('data-location');

            // For some browsers, `attr` is undefined; for others,
            // `attr` is false.  Check for both.
            if (typeof attr !== typeof undefined && attr !== false) {
                var event = $(e.toElement).attr('data-event');
                $("#event").text(event);
                var date = $(e.toElement).attr('data-date');
                $("#date").text(date);
                if (typeof location !== typeof undefined && location !== false) {
                    $(".locationWrapper").css({
                        'display': 'block'
                    });
                    $("#location").text(location);
                } else {
                    $(".locationWrapper").css({
                        'display': 'none'
                    });
                }

                var cal_link = document.createElement('a');
                cal_link.href = $(e.toElement).attr('data-link');
                $('#calLink').wrap(cal_link);
            }

            $("#cal-info").show();
        }
    });

    function parseCalendarTime(time) {
        var date = [];
        var year = time.substring(0, time.indexOf('-'));
        time = time.substring(time.indexOf('-') + 1, time.length);
        var month = time.substring(0, time.indexOf('-'));
        month = getMonthString(month);
        time = time.substring(time.indexOf('-') + 1, time.length);
        day = time.substring(0, 2);
        if (time.length > 2) {
            var hour = time.substring(3, time.length);
            var startTime = hour.substring(0, 5);
            var timeOfDay = parseInt(startTime.replace(/^0+/, ''));
            if (timeOfDay >= 12) {
                if (timeOfDay > 12) {
                    var restOfTime = startTime.substring(2, startTime.length);
                    var militaryConvert = parseInt(startTime.substring(0, 2)) - 12;
                    startTime = militaryConvert + restOfTime;
                }
                timeOfDay = "P.M.";
            } else {
                timeOfDay = "A.M.";
            }
            startTime = startTime.replace(/^0+/, '');
            date.startTime = startTime + " " + timeOfDay;
        } else {
            date.startTime = "";
        }
        date.month = month;
        date.day = day;
        date.year = year;
        return date;
    }

    function getMonthString(month) {
        if (month.length > 1) {
            month = parseInt(month.replace(/^0+/, '')); // strip leading 0's
        }
        switch (month) {
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

    function createCal(year, month) {
        var day = 1,
            i, j, haveDays = true,
            startDay = new Date(year, month, day).getDay(),
            daysInMonths = [31, (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
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
            }).addClass('today');
        }
        createCal.cache[year][month] = {
            calendar: function() {
                return calendar.clone();
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