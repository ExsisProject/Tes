;(function () {
    define([
            "jquery",
            "backbone",
            "app",

            "hgn!asset/templates/asset_weekly",
            "hgn!asset/templates/weekly",

            "asset/collections/asset_admin",
            "asset/models/asset_item",
            "asset/collections/asset_weekly",
            "asset/views/rental_reserv_create",

            "i18n!nls/commons",
            "i18n!asset/nls/asset",

            "jquery.ui"
        ],
        function (
            $,
            Backbone,
            App,
			
            TplWrapLayout,
            TplWeekLayout,
			
            AssetReserveAttributes,
            AssetItemModel,
            assetWeeklyCol,
            createView,
			
            commonLang,
            assetLang
        ) {

            var session = GO.session();
            var lang = {
                'asset_detail': assetLang['상세정보'],
                'asset_detail_view': assetLang['자세히 보기'],
                'asset_close': commonLang['닫기'],
                'code': assetLang['코드'],
                'name': assetLang['이름'],
                'no_reservation': assetLang['지난 시간은 예약할 수 없습니다.'],
                'confirm': commonLang['확인'],
                'cancel': commonLang['취소'],
                'reservation': assetLang['예약'],
                'prev': commonLang['이전'],
                'next': commonLang['다음']
            };

            var AssetWeekly = Backbone.View.extend({
                manage: false,
                initialize: function (options) {
                    this.options = options || {};
                    this.dragging = false;
                    this.availableDate = {};
                    $("#content").css('padding-bottom', '0px');
                },

                events: {
                    "click a[data-btntype='infoClose']": "closeInfoLayer",
                    'click ul.calendar_tag span.btn_wrap span.ic_classic': "setInfoExpander",
                    'click #weekCal table td.past': "alertReservation",
                    'click div.schedule_time': "reservationStatus",
                    'click span[data-btntype="moveWeek"]': "moveWeek",
                    'click #weekTermDate': "showMiniCal",
                    'mouseup #timeWrap': "mouseUp",
                    'mouseup div.schedule_time': "mouseUp",
                    'mousedown #weekCal table td.future, #weekCal table td.today': "mouseDown"
                },

                render: function () {

                    this.assetId = this.options.assetId;
                    this.itemId = this.options.itemId;
                    this.type = this.options.type;
                    this.fromDate = this.options.fromDate;

                    var _this = this;
                    var assetItemInfoCol = this.getAssetItemInfo(this.assetId);

                    assetItemInfoCol.on("reset", function (collection, response) {
                        var Tpl = TplWrapLayout({
                            dataset: collection.toJSON(),
                            lang: lang
                        });
                        _this.$el.html(Tpl);
                        _this.setAssetData();
                        _this.initDatePicker();
                    });
                    $(window).on("resize", this.setWeekBodyHeight);
                },

                mouseDown: function (e) {
                    var _this = this;
                    var target = $(e.currentTarget);

                    e.preventDefault();
                    $(this).css('cursor', 's-resize');

                    this.selectDate = moment(target.attr('data-date')).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                    var x = e.clientX;
                    var y = e.clientY;
                    var width = target.width();
                    this.reservationArray = [];
                    var selectMarkup = $(document.elementFromPoint(x, y));
                    if (!selectMarkup.hasClass('schedule_wrap')) {
                        return;
                    }

                    //이미 예약되어 있는 항목들
                    $('td[data-date="' + this.selectDate + '"] div.schedule_time').each(function () {
                        _this.reservationArray.push($(this).position().top);
                    });

                    $('#timeWrap').css('z-index', '10001');
                    this.selectStartTime = $(document.elementFromPoint(x, y)).attr('data-time');

                    $("#dragBar").css({
                        "top": $(document.elementFromPoint(x, y)).position().top - 1,
                        "left": target.position().left + 1,
                        "width": width,
                        "display": '',
                        "height": '28px'
                    });

                    var eTime = this.increaseMinute(this.selectStartTime, 30);
                    $("#dragBar").attr('data-date', this.selectDate).attr('data-starttime', this.selectStartTime).attr('data-endtime', eTime);
                    $("#dragBar span").text(this.selectStartTime + " ~ " + eTime);
                    this.$el.on('mouseover', '#timeWrap div.timeline', $.proxy(this.mouseHover, this));
                },
                mouseHover: function (e) {
                    this.dragging = true;
                    var x = e.clientX;
                    var y = e.clientY;
                    var firstTop = parseInt($("#dragBar").css('top'));
                    var currentTop = parseInt($(document.elementFromPoint(x, y)).position().top);
                    var remainder = (currentTop - firstTop) % 30;
                    var quotient = (currentTop - firstTop) / 30;
                    var height = 30;

                    if (remainder > 0) {
                        height = height * (quotient + 1);
                    } else {
                        height = height * quotient;
                    }
                    var draw = true;
                    $.each(this.reservationArray, function (m, n) {
                        //드래그시 이미 예약되어 있는 항목위로 지나가면 그리지 않음
                        if (n > firstTop && n < (firstTop + parseInt(height))) {
                            draw = false;
                            return false;
                        }
                    });

                    if (draw) {
                        $("#dragBar").css({
                            "height": height
                        });
                        var selectCnt = Math.floor(quotient + 1);
                        var eTime = this.increaseMinute(this.selectStartTime, selectCnt * 30);

                        // GO-16900 예약 0 ~ 24시까지 선택 불가능
                        if (eTime == "00:00") {
                            eTime = "23:59";
                        }
                        // END

                        $("#dragBar").attr('data-endtime', eTime);
                        $("#dragBar span").text(this.selectStartTime + " ~ " + eTime);
                    }

                },
                _isTurnOnRecurrenceOption: function () {
                    return this.model.attributes.useRecurrence && this.model.attributes.useLoopRecurrence;
                },
                mouseUp: function (e) {
                    if (!this.dragging) {
                        return;
                    }
                    var _this = this;
                    var target = $(e.currentTarget);
                    this.selectEndTime = target.attr('data-time');
                    $('#timeWrap').css('z-index', '');
                    this.$el.off('mouseover', '#timeWrap div.timeline');

                    var $dragBar = $('#dragBar');

                    var selectStartTime = $dragBar.attr('data-starttime');
                    var selectEndTime = $dragBar.attr('data-endtime');
                    var selectDate = $dragBar.attr('data-date');
                    var convertStartTime = GO.util.toISO8601(GO.util.toMoment(selectDate + " " + selectStartTime, "YYYY-MM-DD HH:mm"));
                    var convertEndTime = GO.util.toISO8601(GO.util.toMoment(selectDate + " " + selectEndTime, "YYYY-MM-DD HH:mm"));

                    if (GO.util.dateDiff(convertStartTime, convertEndTime) < 0) {
                        $('#timeWrap').css('z-index', '');
                        $dragBar.hide();
                        return;
                    }

                    if (moment(convertStartTime).isBefore(moment().startOf('day'))) {
                        $('#timeWrap').css('z-index', '');
                        $dragBar.hide();
                        $.goSlideMessage(lang.no_reservation, 'caution');
                        return;
                    }

                    var buttons = [];
                    if (this._isTurnOnRecurrenceOption()) {
                        buttons.push({
                            btext: assetLang['예약상세 등록'],
                            btype: "confirm",
                            autoclose: false,
                            callback: $.proxy(function () {
                                var startDate = GO.util.toISO8601(GO.util.toMoment($('#startDate').val()));
                                var params = [];
                                params.push("?useAnonym=" + $('#useAnonym').is(':checked'));
                                params.push("allDay=" + $("#allday").is(":checked"));
                                params.push("userId=" + $('#userId').attr('data-userid'));
                                params.push("userName=" + $('#userName').text());
                                params = params.join("&");
                                App.router.navigate(
                                    'asset/' + this.assetId +
                                    '/item/' + this.itemId +
                                    '/create/reservation/' + startDate + "/" + $('#startTime').val() + "/" + $('#endTime').val() + params, true);
                            }, this)
                        });
                    }
                    buttons.push({
                        btext: lang.confirm,
                        btype: "confirm", //초록 버튼
                        autoclose: false,
                        callback: function () {
                            view.reservCreate(true).done($.proxy(function () {
                                var fromDate = GO.util.toISO8601(GO.util.toMoment(selectDate));
                                _this.renderWeeklyCal(fromDate);
                                popup.close();
                            }, this));
                        }
                    })
                    buttons.push({
                        btext: lang.cancel,
                        btype: 'normal'
                    });
                    var popup = $.goPopup({
                        header: lang.reservation,
                        width: 685,
                        top: '40%',
                        pclass: "layer_normal layer_temporary_save",
                        contents: '',
                        modal: true,
                        buttons: buttons,
                        closeCallback: function () {
                            _this.dragging = false;
                            _this.dragBarHide();
                        }
                    });

                    var view = new createView({
                        el: $('#gpopupLayer div.content'),
                        assetId: this.assetId,
                        itemId: this.itemId,
                        type: 'reservation',
                        selectDate: selectDate,
                        selectTime: selectStartTime,
                        endTime: selectEndTime,
                        status: 'create',
                        isPopup: true
                    });
                    view.render().then(function () {
                        popup.reoffset();
                    });
                    _this.dragging = false;
                },
                dragBarHide: function () {
                    var $dragBar = $('#dragBar');
                    $dragBar.hide().css('height', '22px').find('span').text('');
                },
                showMiniCal: function () {
                    $("#weekCalendarHiddenInput").trigger('focus');
                },
                alertReservation: function () {
                    $.goSlideMessage(lang.no_reservation, 'caution');
                },
                moveWeek: function (e) {
                    var target = $(e.currentTarget);
                    this.renderWeeklyCal(target.attr('data-date'));
                },
                reservationStatus: function (e) {
                    e.stopPropagation();
                    var target = $(e.currentTarget);
                    App.router.navigate('asset/' + this.assetId + '/item/' + this.itemId + '/status/reservation/' + target.attr('data-id'), true);

                },
                setInfoExpander: function (e) {
                    var btnExpander = $(e.currentTarget);
                    var detailInfo = this.$el.find('div.layer_slide');
                    if (btnExpander.hasClass('ic_open')) {
                        btnExpander.removeClass('ic_open').addClass('ic_close').attr('title', commonLang['닫기']);
                        detailInfo.show();
                    } else {
                        btnExpander.removeClass('ic_close').addClass('ic_open').attr('title', assetLang['자세히 보기']);
                        detailInfo.hide();
                    }
                },
                closeInfoLayer: function (e) {
                    var target = $(e.currentTarget);
                    target.parent().hide();
                    $('ul.calendar_tag span.ic_classic').removeClass('ic_close').addClass('ic_open').attr('title', assetLang['자세히 보기']);
                },
                getAssetItemInfo: function (assetId) {
                    //해당 자산의 변동 attribute 종류 가져오기
                    var col = AssetReserveAttributes.getCollection({assetId: this.assetId, type: 'info'});
                    return col;
                },
                renderInfoData: function (model) {
                    // 상단에 정보 표기
                    var name = model.get('name');
                    $('#code').text(model.get('code'));
                    $('#name').text(name);
                    $('#itemName').text(name);
                    $.each(model.get('properties'), function (k, v) {
                        $('#calendar-tag-base li[data-id="' + v.attributeId + '"]').find('strong').text(v.content);
                    });
                },
                setAssetData: function () {
                    //자산 특정 아이템의 정보(code,name,properties 등)
                    this.model = new AssetItemModel();
                    this.model.clear();
                    this.model.set({assetId: this.assetId, itemId: this.itemId}, {silent: true});
                    this.model.fetch({async: false});
                    this.renderInfoData(this.model);
                    this.renderWeeklyCal(this.fromDate);
                },
                renderWeeklyCal: function (fromDate) {
                    //주간 달력 그리기
                    var _this = this,
                        selectDate;
                    if (fromDate) {
                        selectDate = fromDate;
                    } else {
                        selectDate = GO.util.now();
                    }

                    var fromDate = GO.util.toISO8601(selectDate);
                    //주간 달력 정보 가져오기
				var weeklyCol = assetWeeklyCol.getCollection({assetId : this.assetId, itemId : this.itemId, fromDate : fromDate});
                    weeklyCol.on("reset", function (collection, response) {
                        var colJSON = collection.toJSON();

                        var tmpl = _this.makeWeeklyTemplete({
                            collection: colJSON
                        });

                        _this.$el.find('#weekCal').html(tmpl);
                        _this.$("div.week_body_wrap").css("overflow-y", "auto");

                        var sdate = moment(colJSON[0].startDay, "YYYY-MM-DD").clone().startOf('days');
                        var edate = moment(colJSON[0].endDay, "YYYY-MM-DD").clone().startOf('days');

                        var startDay = GO.util.formatDatetime(sdate, null, "YYYY.MM.DD");
                        var endDay = GO.util.formatDatetime(edate, null, "YYYY.MM.DD");
                        var parseWeekTermDate = startDay + " ~ " + endDay;
                        $('#timeWrap div:last-child').addClass('last');

                        /*상단 날짜 및 이전,다음*/
                        $("#weekTermDate").text(parseWeekTermDate);
                        $("#prevWeek").attr("data-date", GO.util.calDate(sdate, 'days', -1));
                        $("#nextWeek").attr("data-date", GO.util.calDate(edate, 'days', 1));

                        //주간 현황 그리기
                        _this.renderReservationData(collection.toJSON());
                        _this.setWeekBodyHeight();

                        //현재시간 타임라인 그리기
                        _this.currentTimeLine();

                    });

                },
                currentTimeLine: function () {
                    var timeInfo = GO.util.formatDatetime(GO.util.now(), null, "HH:mm").split(':');
                    var timeTopInfo = $('#weekWrap div.time[data-time="' + timeInfo[0] + ':00"]').position().top + parseInt(timeInfo[1]);
                    var timeLine = '<div id="current-timeline" class="real_time" style="top: ' + timeTopInfo + 'px; left: 0px"></div>';
                    $('#weekWrap div.time_wrap').append(timeLine);
                },
                setWeekBodyHeight: function () {
                    var timeTotalHeight = $('#timeWrap div').length * 30;
                    var aboveWeekBody = $(".content_top").outerHeight() + $(".calendar_tool_bar").outerHeight(true) + $(".tb_week_header").outerHeight();
                    aboveWeekBody += (GO.session('theme') === 'THEME_CLASSIC') ? $(".go_header_advanced").height() : 0;
                    var weekBodyHeight = $(window).height() - aboveWeekBody;
                    if (timeTotalHeight < weekBodyHeight) {
                        weekBodyHeight = timeTotalHeight;
                    }
                    $('#weekBodyWrap').css('height', weekBodyHeight);
                    $('#weekBody').css('height', weekBodyHeight);
                    $('#weekBody div.schedule_wrap').css('height', timeTotalHeight);
                    $('#weekBodyWrap').disableSelection();
                },
                renderReservationData: function (collection) {
                    var self = this,
                        col = collection[0].daily;

                    var heightCorrection = 150; //높이값 보정(클래식,어드밴스드에 따라 다르다.)
                    if (GO.session()['theme'] == 'THEME_CLASSIC') {
                        heightCorrection = 192;
                    }

                    _.each(col, function (v, k) {
                        if (v.reservations) {
                            _.each(v.reservations, function (n, m) {
                                n.startTime = GO.util.toISO8601(n.startTime);
                                n.endTime = GO.util.toISO8601(n.endTime);
                                var weekDay = GO.util.getDay(GO.util.toISO8601(n.startTime));  //요일계산

                                // 동일 날짜인 경우
                                var currentOffsetTop;
                                var currentStartTime = GO.util.formatDatetime(n.startTime, null, "HH:mm");  //예약 시작 시간, 높이값구하기위해
                                var displayStartTime = currentStartTime;
                                var currentEndTime = GO.util.formatDatetime(n.endTime, null, "HH:mm");	// 예약 종료 시간
                                var displayEndTime = currentEndTime;
                                var minuteReVise = 0;
                                var checkMinute = GO.util.formatDatetime(n.startTime, null, "mm");

                                if (parseInt(checkMinute) < 30) {
                                    currentStartTime = GO.util.formatDatetime(n.startTime, null, "HH:00");
                                    minuteReVise = parseInt(checkMinute);
                                } else if (parseInt(checkMinute) < 60) {
                                    currentStartTime = GO.util.formatDatetime(n.startTime, null, "HH:30");
                                    minuteReVise = parseInt(checkMinute) - 30;
                                }

                                var changeStartTime = GO.util.toISO8601(n.startTime);
                                try {
                                    var startPoint = $('#weekBody').find('div[data-time="' + currentStartTime + '"]');
                                    if (startPoint.length === 0) return; // 예약 가능 시간을 벗어난 경우 그리지 않도록 함.
                                    currentOffsetTop = startPoint.offset().top - heightCorrection + minuteReVise;  //179를 뺀다.
                                } catch (e) {
                                    return true;
                                }

                                var cellHeightCnt = GO.util.dateDiff(changeStartTime, GO.util.toISO8601(n.endTime)) / 1000 / 60 / 30;
                                var cellHeight = cellHeightCnt * 30;

                                var type = "bgcolor_group";
                                // 예약이 나인지 아닌지 구별해서 bgcolor17(나) / bgcolor_group(다른이) 로 넣는다.
                                if (n.user.id == GO.session('id')) {
                                    type = "bgcolor17";
                                }

                                var properties = "";
                                $.each(n.properties, function (i, item) {
                                    properties += GO.util.escapeToLtGt(item.content);
                                    if (n.properties.length != i + 1) {
                                        properties += ",\n";
                                    }
                                });
                                var content = displayStartTime + ' ~ ' + displayEndTime + '\n' + getReserveUserName(n) + '\n' + properties;
                                var title_prefix = n.otherCompanyReservation ? n.user.companyName + ' ' || '' : '';
                                var title_content = title_prefix + content;
                                var tmpl = '<div class="schedule_time ' + type + '" data-id="' + n.id + '" style="z-index:10003;top: ' + currentOffsetTop + 'px; left: 0; width: 100%; height:' + cellHeight + 'px" title="' + title_content + '">' +
                                    '<p class="head"><span class="time">' + displayStartTime + ' ~ ' + displayEndTime + '</span></p>' +
                                    '<p class="content">' + getReserveUserName(n) + '<br/>' + properties + '</p>' +
                                    '<div class="resize"></div>' +
                                    '</div>';
                                $('#weekBody').find('td[data-week="' + weekDay + '"] div.schedule_wrap').append(tmpl);


                                // 타임존에 따르는 날짜 변경시 UI 처리
                                var startDate = GO.util.formatDatetime(n.startTime, null, "YYYY-MM-DD");
                                var endDate = GO.util.formatDatetime(n.endTime, null, "YYYY-MM-DD");
                                if (startDate != endDate) {
                                    weekDay = GO.util.getDay(GO.util.toISO8601(n.endTime));
                                    var midNightDate = GO.util.toISO8601(GO.util.getMidNightTime(n.endTime));
                                    var midNightTime = GO.util.formatDatetime(midNightDate, null, "HH:mm");

                                    try {
                                        currentOffsetTop = $('#weekBody').find('div[data-time="' + midNightTime + '"]').offset().top - heightCorrection + minuteReVise;  //179를 뺀다.
                                    } catch (e) {
                                        return true;
                                    }

                                    var cellHeightCnt = GO.util.dateDiff(midNightDate, GO.util.toISO8601(n.endTime)) / 1000 / 60 / 30;
                                    var cellHeight = cellHeightCnt * 30;

                                    var tmpl = '<div class="schedule_time ' + type + '" data-id="' + n.id + '" style="z-index:10003;top: ' + currentOffsetTop + 'px; left: 0; width: 100%; height:' + cellHeight + 'px">' +
                                        '<p class="head"><span class="time">' + displayStartTime + ' ~ ' + displayEndTime + '</span></p>' +
                                        '<p class="content" title="' + getReserveUserName(n) + '">' + getReserveUserName(n) + '</p>' +
                                        '<div class="resize"></div>' +
                                        '</div>';
                                    $('#weekBody').find('td[data-week="' + weekDay + '"] div.schedule_wrap').append(tmpl);
                                }
                            }, this);
                        }
                    }, this);

                    function getReserveUserName(reserveData) {
                        var userName = '';
                        if (!reserveData) {
                            return userName;
                        }

                        if (!!reserveData.useAnonym) {
                            return userName;
                        }

                        if (reserveData.user) {
                            userName = reserveData.user.name;
                        }

                        return userName;
                    }
                },
                makeWeeklyTemplete: function (opt) {
                    var collection = opt.collection;
                    var availabilityDate = collection[0].availabilityDate;
                    var ableDays = availabilityDate.ableDays.split('');

                    var startTimeCon = availabilityDate.startTime.substr(0, 2) + ":" + availabilityDate.startTime.substr(2, 2);
                    var endTimeCon = availabilityDate.endTime.substr(0, 2) + ":" + availabilityDate.endTime.substr(2, 2);

                    if (endTimeCon == "24:00") {
                        endTimeCon = "23:59";
                    }

                    var start = GO.util.toISO8601(GO.util.formatDatetime(GO.util.now(), null, "YYYY-MM-DD" + " " + startTimeCon, "YYYY-MM-DD HH:mm"));
                    var end = GO.util.toISO8601(GO.util.formatDatetime(GO.util.now(), null, "YYYY-MM-DD" + " " + endTimeCon, "YYYY-MM-DD HH:mm"));

                    this.availableDate = {
                        "startTimeCon": startTimeCon,
                        "endTimeCon": endTimeCon
                    };

                    var timelineArray = [];

                    var parseTimeLine = function () {
                        var plusDay = start;
                        for (var i = 0; i < 48; i++) {

                            // GO-16900 예약 0 ~ 24시까지 선택 불가능
                            var startDate = GO.util.toMoment(plusDay);
                            var endPlustMinute = 30;
                            if (startDate.hour() == 23 && startDate.minute() == 30) {
                                endPlustMinute = 29;
                            }

                            timelineArray.push('<div class="timeline" data-time="' + GO.util.formatDatetime(plusDay, null, "HH:mm") + '" data-endtime="' + GO.util.formatDatetime(GO.util.calDate(plusDay, 'minutes', endPlustMinute), null, "HH:mm") + '"></div>');
                            // END

                            plusDay = GO.util.calDate(plusDay, 'minutes', 30);

                            if (GO.util.dateDiff(plusDay, end) <= 0) {
                                break;
                            }
                        }
                        return timelineArray.join('');
                    };

                    var timeThArray = [];
                    var parseTimeTh = function () {
                        var plusTime = start;
                        for (var i = 0; i < 24; i++) {
                            timeThArray.push('<div class="time" data-time="' + GO.util.formatDatetime(plusTime, null, "HH:mm") +
                                '">' + GO.util.formatDatetime(plusTime, null, "HH") + '</div>');
                            plusTime = GO.util.calDate(plusTime, 'hours', 1);
                            if (GO.util.dateDiff(plusTime, end) <= 0) {
                                break;
                            }
                        }
                        return timeThArray.join('');
                    };


                    var weekColCnt = function () {
                        var cnt = 0;
                        $.each(ableDays, function (k, v) {
                            if (v == "1") {
                                cnt++;
                            }
                        });
                        return cnt;
                    };

                    var parseWeek = function () {
                        return GO.util.formatDatetime(GO.util.toMoment(this.day), null, "MM.DD(ddd)");
                    };

                    var parseWeekDay = function () {
                        return GO.util.getDay(GO.util.toISO8601(this.day));
                    };

                    var dateMask = function () {
                        var isBeforeToday = GO.util.isBeforeToday(this.day);
                        var classStr = 'future';
                        if (GO.util.isBeforeToday(this.day)) {
                            classStr = 'past';
                        } else if (GO.util.isToday(this.day)) {
                            classStr = 'today';
                        }
                        return classStr;
                    };

                    var selectDaily = function () {
                        var selectDays = [];
                        $.each(this.daily, function (k, v) {
                            if (ableDays[k] == "1") {
                                v.day = moment(v.day, "YYYY-MM-DD").clone().startOf('days');
                                selectDays.push(v);
                            }
                        });
                        return selectDays;
                    };

                    var tpl = TplWeekLayout({
                        dataset: collection,
                        parseWeek: parseWeek,
                        parseWeekDay: parseWeekDay,
                        dateMask: dateMask,
                        selectDaily: selectDaily,
                        weekColCnt: weekColCnt,
                        parseTimeLine: parseTimeLine,
                        parseTimeTh: parseTimeTh,
                        lang: lang
                    });
                    return tpl;

                },
                increaseMinute: function (startTime, min) {
                    var sTime = GO.util.toMoment(this.selectDate + " " + startTime, "YYYY-MM-DD HH:mm");
                    var result = GO.util.formatDatetime(GO.util.calDate(sTime, 'minutes', min), null, "HH:mm");
                    return result;
                },

                initDatePicker: function () {

                    var _this = this;
                    var weekCalendarHiddenInput = $("#weekCalendarHiddenInput");
                    $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
                    weekCalendarHiddenInput.datepicker({
                        defaultDate: "+1w",
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                        onSelect: function (selectedDate) {
                            _this.renderWeeklyCal(selectedDate);
                        }
                    });
                },
                moveCompanyBoardTab: function (e) {
                    var targetEl = $(e.currentTarget);
                    var dataType = targetEl.attr('data-type');
                    if (targetEl.hasClass('active')) {
                        return;
                    } else {
                        targetEl.siblings('li').removeClass('active');
                        targetEl.addClass('active');
                        if (dataType == 'assetGuidance') {
                            adminGuidance.render({assetId: this.assetId});
                        } else if (dataType == 'assetInfo') {
                            adminInfo.render({assetId: this.assetId});
                        } else if (dataType == 'assetManage') {
                            adminManage.render({assetId: this.assetId});
                        } else {
                            adminPurpose.render({assetId: this.assetId});
                        }
                    }
                }
            });

            return AssetWeekly;
        });
}).call(this);
