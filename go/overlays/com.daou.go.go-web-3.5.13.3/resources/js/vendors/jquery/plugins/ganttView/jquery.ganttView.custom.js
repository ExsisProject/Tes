/*
jQuery.ganttView v.0.8.8
Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
MIT License Applies
*/

/*
Options
-----------------
weekday: list,
data: object
contentHeight: number
behavior: {
    clickable: boolean,
    draggable: boolean,
    resizable: boolean,
    resizableDirection: string, //'w,e' or 'w' or 'e' or ''
    onClick: function,
    onDrag: function,
    onResize: function
}
*/

(function (jQuery) {

    jQuery.fn.ganttView = function () {

        var args = Array.prototype.slice.call(arguments);

        if (args.length == 1 && typeof (args[0]) == "object") {
            return build.call(this, args[0]);
        }

        if (args.length == 2 && typeof (args[0]) == "string") {
            handleMethod.call(this, args[0], args[1]);
        }
    };

    function build(options) {

        var _this = this;
        var defaults = {
            weekday: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            cellWidth: 20, // 디자인과 맞춰야 함
            cellHeight: 20, // 디자인과 맞춰야 함
            behavior: {
                clickable: true,
                draggable: true,
                resizable: true,
                resizableDirection: "e,w"
            }
        };

        var opts = jQuery.extend(true, defaults, options);
        return build();

        function build() {
            var startEnd = DateUtils.getMinMaxDateFromData(opts.data);
            opts.start = startEnd[0];
            opts.end = startEnd[1];

            var today = new Date();
            var beforeFromToday = today.clone().addMonths(-1);
            var afterFromToday = today.clone().addMonths(6);

            if (opts.start >= today) { //시작날짜가 오늘이후일 때
                opts.start = beforeFromToday;
                opts.end = opts.end.clone().addMonths(6);
            } else { //시작날짜가 오늘 이전이고
                opts.start = opts.start.clone().addMonths(-1);
                if (opts.end <= today) { //종료날짜가 오늘 이전일 때
                    opts.end = afterFromToday;
                } else { //종료날짜가 오늘 이후일 때
                    opts.end = opts.end.clone().addMonths(6);
                }
            }

            var div = jQuery("<div>", {"class": "ganttview"});
            new Chart(div, opts).render();

            var container = _this;
            container.append(div);
            return opts;
        }
    }

    function handleMethod(method, value) {
        if (method == "applyBehavior") {
            var $container = jQuery(this);
            new Behavior($container, value).apply();
        }
    }

    var Chart = function (div, opts) {

        function render() {
            var slideDiv = jQuery("<div>", {
                "class": "ganttview-slide-container",
                "css": {"width": "100%"}
            });
            var dates = getDates(opts.start, opts.end);
            addHzHeader(slideDiv, dates, opts.cellWidth, opts.weekday, opts.contentHeight);
            var contentsDiv = jQuery("<div>", {
                "class": "ganttview-contents",
                "id": "gantt_graph_contents",
                "css": {"height": opts.contentHeight + "px"}
            });
            slideDiv.append(contentsDiv);
            addGrid(contentsDiv, opts.data, dates, opts.cellWidth);
            addBlockContainers(contentsDiv, opts.data);
            addBlocks(contentsDiv, opts.data, opts.cellWidth, opts.start, opts.end);
            div.append(slideDiv);
            applyLastClass(div.parent());
        }

        // Creates a 3 dimensional array [year][month][day] of every day
        // between the given start and end dates
        function getDates(start, end) {
            var dates = [];
            dates[start.getFullYear()] = [];
            dates[start.getFullYear()][start.getMonth()] = [start]
            var last = start;
            while (last.compareTo(end) == -1) {
                var next = last.clone().addDays(1);
                if (!dates[next.getFullYear()]) {
                    dates[next.getFullYear()] = [];
                }
                if (!dates[next.getFullYear()][next.getMonth()]) {
                    dates[next.getFullYear()][next.getMonth()] = [];
                }
                dates[next.getFullYear()][next.getMonth()].push(next);
                last = next;
            }
            return dates;
        }

        function addHzHeader(div, dates, cellWidth, weekday, contentHeight) {
            var totalW = 0;
            var dayTags = [];
            var dayLangTags = [];
            var monthTags = [];

            dates.map(function (months, y) {
                months.map(function (month, m) {
                    var w = month.length * cellWidth;
                    totalW = totalW + w;
                    var monthHtml = "<div style='width:" + w + 'px' +
                        "' class='ganttview-hzheader-month'>" + y + '-' + (parseInt(m) + 1) + "</div>";
                    monthTags.push(monthHtml);

                    month.map(function (day, d, mon) {
                        var classes = ["ganttview-hzheader-day"];
                        if (DateUtils.isToday(day)) {
                            classes.push("today");
                        }
                        if (DateUtils.isLastOfMonth(mon, d)) {
                            classes.push("month");
                        }
                        if (DateUtils.isSaturday(day)) {
                            classes.push("sat");
                        } else if (DateUtils.isSunday(day)) {
                            classes.push("sun");
                        }
                        var dayHtml = "<div class='" + classes.join(' ') + "'>" + day.getDate() + "</div>";
                        dayTags.push(dayHtml);
                        var dayLangHtml = "<div style='height:" + (contentHeight) + 'px' + "' class='" + classes.join(' ')
                            + "'>" + weekday[day.getDay()] + "</div>";
                        dayLangTags.push(dayLangHtml);
                    });
                });
            });
            var monthsHtml = "<div style='width:" + totalW + 'px' + "' class='ganttview-hzheader-months'>"
                + monthTags.join('') + "</div>";
            var daysHtml = "<div style='width:" + totalW + 'px' + "' class='ganttview-hzheader-days'>"
                + dayTags.join('') + "</div>";
            var dayLangsHtml = "<div style='width:" + totalW + 'px' + "' class='ganttview-hzheader-days week'>"
                + dayLangTags.join('') + "</div>";

            var headerHtml = "<div style='width:" + totalW + 'px' + "' class='ganttview-hzheader'>"
                + monthsHtml + daysHtml + dayLangsHtml + "</div>";
            div.append(jQuery(headerHtml));
        }

        function addGrid(div, data, dates, cellWidth) {
            var cellTags = [];
            var cellCnt = 0;
            dates.map(function (months) {
                months.map(function (month) {
                    cellCnt += month.length;
                });
            });

            var rowTags = [];
            rowTags.push("<div class='ganttview-grid-row totalProgressRow'></div>");
            var cellHtmls = cellTags.join('');
            jQuery.each(data, function (i, datum) {
                if (!datum.type) {
                    return;
                }
                jQuery.each(datum.series, function (j, series) {
                    var rowHtml = "<div class='ganttview-grid-row";
                    if (!_.isEmpty(series) && _.isUndefined(series.parent_id)) {
                        rowHtml += " folder"
                    }
                    rowHtml += "'";
                    if (!_.isEmpty(series) && !_.isUndefined(series.parent_id)) {
                        rowHtml += (" parent-id=" + series.parent_id);
                    }
                    rowHtml += ">" + cellHtmls + "</div>";
                    rowTags.push(rowHtml);
                });
            });
            var w = cellCnt * cellWidth;
            var gridHtml = "<div style='width:" + w + 'px' + "' class='ganttview-grid'>" + rowTags.join('') + "</div>";
            div.append(gridHtml);
        }

        function addBlockContainers(div, data) {
            var containerTags = [];
            containerTags.push("<div class='ganttview-block-container totalProgressRow'></div>");
            jQuery.each(data, function (i, datum) {
                if (!datum.type) {
                    return;
                }
                var last = (data.length - 1) == i;
                jQuery.each(datum.series, function (j, series) {
                    var containerHtml = "<div class='ganttview-block-container";
                    if (last) {
                        containerHtml += " last";
                    }
                    containerHtml += "'";
                    if (!_.isEmpty(series) && !_.isUndefined(series.parent_id)) {
                        containerHtml += (" parent-id=" + series.parent_id);
                    }
                    containerHtml += "></div>";
                    containerTags.push(containerHtml);
                });
            });
            var blocksHtml = "<div class='ganttview-blocks'>" + containerTags.join('') + "</div>";
            div.append(blocksHtml);
        }

        function addBlocks(div, data, cellWidth, start, end) {
            var rows = jQuery("div.ganttview-blocks div.ganttview-block-container", div).not('.totalProgressRow');
            var rowIdx = 0;
            var leftBookmarkHtml = "<div class='bookmark left'><span class='ic_set ic_arrow_prev'></span></div>";
            var rightBookmarkHtml = "<div class='bookmark right'><span class='ic_set ic_arrow_next'></span></div>";
            jQuery.each(data, function (i, datum) {
                jQuery.each(datum.series, function (j, series) {
                    if (series.start == null || series.end == null) {
                        rowIdx++;
                        return true; //continue;
                    }

                    var size = DateUtils.daysBetween(series.start, series.end) + 1;
                    var offset = DateUtils.daysBetween(start, series.start);
                    var blockWidth = (size * cellWidth) - 3;
                    var blockMarginLeft = (offset * cellWidth) + 1;
                    var blockClasses = "ganttview-block";
                    if (series.status_color) {
                        blockClasses += (" bgcolor" + series.status_color);
                    }
                    var blockHtml = "<div class='" + blockClasses
                        + "' data-id='" + series.id
                        + "' title='" + series.name
                        + "' style='width:" + blockWidth + 'px;' + "margin-left:" + blockMarginLeft + 'px;' + "'>";

                    // add progress to block
                    if (series.progress) {
                        var progressHtml = "<div class='ganttview-block-progress' "
                            + "style='width:" + series.progress + '%' + "'></div>";
                        blockHtml += progressHtml;
                    }
                    // add blockText to block
                    var blockTextHtml = "<div class='ganttview-block-text'>";
                    if (series.status_name) {
                        var statusHtml = "<span class='state'>" + '[' + series.status_name + ']' + "</span>";
                        blockTextHtml += statusHtml;
                    }
                    blockTextHtml += "<span class='txt'>" + series.name + "</span>";
                    blockTextHtml += "</div>";
                    blockHtml += blockTextHtml;

                    var block = jQuery(blockHtml);
                    addBlockData(block, data[i], series);

                    jQuery(rows[rowIdx]).append(leftBookmarkHtml + rightBookmarkHtml);
                    jQuery(rows[rowIdx]).append(block);
                    rowIdx++;
                });
            });
        }

        function addBlockData(block, data, series) {
            // This allows custom attributes to be added to the series data objects
            // and makes them available to the 'data' argument of click, resize, and drag handlers
            var blockData = {id: data.id, name: data.name};
            jQuery.extend(blockData, series);
            block.data("block-data", blockData);
        }

        function applyLastClass(div) {
            jQuery("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", div).addClass("last");
            jQuery("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", div).addClass("last");
            jQuery("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", div).addClass("last");
        }

        return {
            render: render
        };
    }

    var Behavior = function (div, opts) {

        function apply() {

            if (opts.behavior.clickable) {
                bindBlockClick(div, opts.behavior.onClick);
            }

            if (opts.behavior.resizable) {
                bindBlockResize(div, opts.cellWidth, opts.start, opts.behavior.onResize);
            }

            if (opts.behavior.draggable) {
                bindBlockDrag(div, opts.cellWidth, opts.start, opts.behavior.onDrag);
            }
        }

        function bindBlockClick(div, callback) {
            jQuery(div).on("click", function () {
                if (callback) {
                    callback(jQuery(this).data("block-data"));
                }
            });
        }

        function bindBlockResize(div, cellWidth, startDate, callback) {
            jQuery(div).resizable({
                grid: cellWidth,
                handles: opts.behavior.resizableDirection,//"e,w",
                //containment: "parent",
                stop: function (event, ui) {
                    var block = jQuery(this);
                    updateAndExecuteCallback(div, block, cellWidth, startDate, callback, ui);
                }
            });
        }

        function bindBlockDrag(div, cellWidth, startDate, callback) {
            jQuery(div).draggable({
                axis: "x",
                //containment: "div.ganttview-grid",
                grid: [cellWidth, cellWidth],
                stop: function (event, ui) {
                    var block = jQuery(this);
                    updateAndExecuteCallback(div, block, cellWidth, startDate, callback, ui);
                }
            });
        }

        function updateAndExecuteCallback(div, block, cellWidth, startDate, callback, ui) {
            var originalWidth = ui.originalSize ? ui.originalSize.width : block.css('width');
            var originalMarginLeft = block.css('margin-left');
            updateDataAndPosition(div, block, cellWidth, startDate);
            if (callback) {
                callback(block.data("block-data"))
                    .fail($.proxy(function (originalWidth, originalMarginLeft) {
                        $(this).css({
                            'width': originalWidth,
                            'margin-left': originalMarginLeft
                        });
                    }, block, originalWidth, originalMarginLeft));
            }
        }

        function updateDataAndPosition(div, block, cellWidth, startDate) {
            var container = jQuery("div.ganttview-slide-container");
            var scroll = container.scrollLeft();
            var offset = block.offset().left - container.offset().left + scroll;

            // Set new start date
            var daysFromStart = Math.round(offset / cellWidth);
            var newStart = startDate.clone().addDays(daysFromStart);
            block.data("block-data").start = newStart;

            // Set new end date
            var width = block.outerWidth();
            var numberOfDays = Math.round(width / cellWidth) - 1;
            block.data("block-data").end = newStart.clone().addDays(numberOfDays);

            // Remove top and left properties to avoid incorrect block positioning,
            // set position to relative to keep blocks relative to scrollbar when scrolling
            block.css({
                "top": "",
                "left": "",
                "position": "relative",
                "margin-left": offset + 'px'
            });
        }

        return {
            apply: apply
        };
    }

    var DateUtils = {

        daysBetween: function (start, end) {
            if (!start || !end) {
                return 0;
            }
            start = Date.parse(start);
            end = Date.parse(end);
            if (start.getYear() == 1901 || end.getYear() == 8099) {
                return 0;
            }
            var count = 0, date = start.clone();
            while (date.compareTo(end) == -1) {
                count = count + 1;
                date.addDays(1);
            }
            return count;
        },

        isWeekend: function (date) {
            return date.getDay() % 6 == 0;
        },

        isToday: function (date) {
            var today = new Date();
            return date.toDateString() == today.toDateString();
        },

        isSaturday: function (date) {
            return date.getDay() === 6;
        },

        isSunday: function (date) {
            return date.getDay() === 0;
        },

        isLastOfMonth: function (month, day) {
            return month[month.length - 1] == month[day];
        },

        getBoundaryDatesFromData: function (data, minDays) {
            var startEnd = DateUtils.getMinMaxDateFromData(data);
            var minStart = startEnd[0];
            var maxEnd = startEnd[1];
            // Insure that the width of the chart is at least the slide width to avoid empty
            // whitespace to the right of the grid
            if (DateUtils.daysBetween(minStart, maxEnd) < minDays) {
                maxEnd = minStart.clone().addDays(minDays);
            }
            return [minStart, maxEnd];
        },
        getMinMaxDateFromData: function (data) {
            var minStart = new Date();
            var maxEnd = new Date();

            jQuery.each(data, function (i, datum) {
                jQuery.each(datum.series, function (j, series) {
                    var startDate = series.start;
                    var endDate = series.end;
                    if (startDate == null || endDate == null) {
                        return true;
                    }

                    var start = Date.parse(startDate);
                    var end = Date.parse(endDate)
                    if (i == 0 && j == 0) {
                        minStart = start;
                        maxEnd = end;
                    }
                    if (minStart.compareTo(start) == 1) {
                        minStart = start;
                    }
                    if (maxEnd.compareTo(end) == -1) {
                        maxEnd = end;
                    }
                });
            });

            return [minStart, maxEnd];
        }

    };

})(jQuery);