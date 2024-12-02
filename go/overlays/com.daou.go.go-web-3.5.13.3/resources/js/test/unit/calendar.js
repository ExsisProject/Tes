(function($) {
    module('Calbean.EventMatrix(월별 이벤트 엔진) 테스트');

    test("10/27(토) 18:00 ~ 10/27(토) 23:00, 시간 지정 일정 테스트", function() {
        // Given
        // 기준일자 : 2012-10-19, 금요일
        var basedate = new Date(2012, 9, 19), 
            evt = bonegirl("my-event-2");

        // When
        var matrix = new Calbean.EventMatrix({ date: basedate, events: [evt]});

        // Then
        var expected = { axisX: 3, axisY: 6 }, 
            resultEvent = matrix.getCell(expected.axisX, expected.axisY).events[0];

        equal(resultEvent.id, evt.id, "(3,6) 셀에 이벤트가 위치해 있어야 한다.");
    })

    test("9/29(토) ~ 10/1(월), 이전달 시작, 3일 종일 일정 테스트", function() {
        // Given
        // 기준일자 : 2012-10-19, 금요일
        var basedate = new Date(2012, 9, 19), 
            evt = bonegirl("public-event-1");

        // When
        var calbean = new Calbean.EventMatrix({ date: basedate, events: [evt]});

        // Then
        var resultEvent = calbean.getFirstCell().events[0], 
            exptedColspan = 2;
        equal(resultEvent.id, evt.id, "현재 월 이전에 시작된 일정은 시작셀에 위치해야 한다.");
        equal(resultEvent.colspan, exptedColspan, "colspan 값은 시작셀로부터 다시 계산되어야 한다.");
    });

    test("10/19(금) 18:00 ~ 10/20(토) 12:00, 2일간 걸친 일정 테스트", function() {
        // Given
        // 기준일자 : 2012-10-19, 금요일
        var basedate = new Date(2012, 9, 19), 
            evt = bonegirl("public-event-4");

        // When
        var calbean = new Calbean.EventMatrix({ date: basedate, events: [evt]});

        // Then
        var expected = { startX: 2, startY: 5, endX: 2, endY: 6 }, 
            result = {
                prev: calbean.getCell(expected.startX, expected.startY - 1),
                start: calbean.getCell(expected.startX, expected.startY), 
                end: calbean.getCell(expected.endX, expected.endY), 
                next: calbean.getCell(expected.endX + 1, 0)
            }

        equal(result.start.events[0].id, evt.id, "시작셀에 올바른 이벤트 정보가 들어 있어야 한다.");
        equal(result.prev.events.length, 0, "이벤트가 시작셀부터 시작해 있어야 한다.");
        equal(result.start.events[0].colspan, 2, "colspan 값이 올바르게 계산되어야 한다.");
        equal(result.start.events[0].render, true, "범위일정의 같은 행의 첫째날은 렌더링되어야 한다.");
        equal(result.end.events[0].id, evt.id, "이벤트가 종료일에 위치해 있어야 한다.");
        equal(result.end.events[0].render, false, "범위일정의 같은 행의 첫째날을 제외하고 렌더링되어서는 안된다.");
        equal(result.next.events.length, 0, "이벤트가 종료셀에서 끝나야 한다.");
    })

    test("10/27(토) ~ 11/4(월), 다음달 종료, 9일 종일 일정 테스트", function() {
        // Given
        // 기준일자 : 2012-10-19, 금요일
        var basedate = new Date(2012, 9, 19), 
            evt = bonegirl("my-event-1");

        // When
        var calbean = new Calbean.EventMatrix({ date: basedate, events: [evt]});

        // Then
        var startCell = calbean.getCell(3, 6),          // 10/27
            endCell = calbean.getLastCell(),            // 11/01
            prevCell = calbean.getCell(3, 5),           // 10/26
            secondStartCell = calbean.getCell(4, 0);    // 10/28
            
        equal(prevCell.events.length, 0, "이벤트가 시작셀부터 시작해 있어야 한다.");
        equal(startCell.events[0].id, evt.id, "시작셀에 올바른 이벤트 정보가 들어 있어야 한다.");
        equal(startCell.events[0].colspan, undefined, "토요일 시작셀에는 colspan 값이 없어야 한다.");
        equal(startCell.events[0].total_rows, 3, "범위 일정의 총 로우수가 올바르게 계산되어야 한다.");
        equal(startCell.events[0].current_row, 1, "범위 일정의 현재 로우수가 올바르게 계산되어야 한다.");
        equal(startCell.events[0].render, true, "시작셀의 render 값은 true 여야 한다.");
        equal(endCell.events[0].id, evt.id, "이벤트가 종료일에 위치해 있어야 한다.");
        equal(endCell.events[0].current_row, 2, "종료 일정의 현재 로우수가 올바르게 계산되어야 한다.");
        equal(secondStartCell.events[0].colspan, 7, "colspan 값이 올바르게 계산되어야 한다.");
    });

    test("9/29(일) ~ 10/1(월), 추석 연휴, 공휴일 테스트", function() {
        // Given
        // 기준일자 : 2012-10-19, 금요일
        var basedate = new Date(2012, 9, 19), 
            evt = bonegirl("holiday-event-1");

        // When
        var calbean = new Calbean.EventMatrix({ date: basedate, events: [evt]});

        // Then
        var expectedCell = calbean.getFirstCell();
        equal(expectedCell.flags[0].id, evt.id, "기념일 큐에 저장되어야 한다.");
        equal(expectedCell.events.length, 0, "이벤트 큐에는 저장되어서는 안된다.");
    });


    module('$.fn.calbean() 생성 테스트', {
        setup: function() {
            return $("#qunit-fixture").empty().append('<div class="content_page"></div>');
        }
    });

    test("id 부여 테스트", function() {
        var $target;
        $target = $("#qunit-fixture > .content_page");
        $target.calbean();
        ok($target.attr("id"), "id 값이 없으면 id를 생성해야 한다.");
    });

    test("class 부여 테스트", function() {
        // Given
        var $target = $("#qunit-fixture > .content_page");

        // When
        $target.calbean();

        // Then
        ok($target.hasClass("calbean_calendar_view"), ".calbean_calendar_view 클래스를 가져야 한다.");
    });


    module('$.fn.calbean() - 달력 렌더링 테스트')

    test("월보기 기본 렌더링 테스트", function() {
        // Given
        var $target = $("#qunit-fixture");

        // When
        var calbean = $target.calbean({date: new Date(2012, 9, 19), type: "monthly"});

        // Then
        ok($target.hasClass("calendar_month"), ".calendar_month 클래스를 가져야 한다.");
        equal($target.find(".type_normal").length > 0, true, "달력 월보기 테이블이 출력되어야 한다.");
        equal($target.find(".week_schedule").length, 5, "5개의 div.week_schedule가 출력되어야 한다.");
        equal($target.find("table.bg_row").length, 5, "5개의 table.bg_row가 출력되어야 한다.");
        equal($target.find("table.schedule_row").length, 5, "5개의 table.schedule_row 출력되어야 한다.");
    });

    test("월보기 오늘 날짜 표시 테스트", function() {
        // Given
        var $target = $("#qunit-fixture");

        // When
        var calbean = $target.calbean({date: new Date(), type: "monthly"});
        
        // Then
        equal(parseInt($($($target.find("th.today")[0]).find('span.day')).text()), (new Date()).getDate(), "오늘 날짜에 .today 클래스가 추가되어야 한다.");
    });

    test("월보기 - 일요일/토요일 표시 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture");

        // When
        var calbean = $target.calbean({date: basedate, type: "monthly"});

        // Then
        var expectedHeader = $target.find('.tb_month_header')[0], 
            expectedHeaderTr = $(expectedHeader).find('tr')[0],
            expectedHeaderSun = $(expectedHeaderTr).find('th')[0], 
            expectedHeaderSat = $(expectedHeaderTr).find('th')[6], 
            expectedBody = $target.find('.month_body'), 
            expectedBodyRow = $(expectedBody).find('.schedule_row')[1], 
            expectedBodyTr = $(expectedBodyRow).find('tr')[0], 
            expectedBodySun = $(expectedBodyTr).find('th')[0], 
            expectedBodySat = $(expectedBodyTr).find('th')[6];

        ok($(expectedHeaderSun).hasClass("sun"), "달력 헤더의 일요일에 sun 클래스를 가져야 한다.");
        ok($(expectedHeaderSat).hasClass("sat"), "달력 헤더의 토요일에 sat 클래스를 가져야 한다.");
        ok($(expectedBodySun).hasClass("sun"), "일요일은 sun 클래스를 가져야 한다.");
        ok($(expectedBodySat).hasClass("sat"), "토요일은 sat 클래스를 가져야 한다.");
    });

    test("월보기 - 이전/다음달 표시 테스트", function(){
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture");

        // When
        var calbean = $target.calbean({date: basedate, type: "monthly"});

        // Then
        var expectedBody = $target.find('.month_body'), 
            expectedFirstRow = $(expectedBody).find('.schedule_row').first(), 
            expectedFirstTr = $(expectedFirstRow).find('tr')[0], 
            // 9/30 일요일
            expectedFirstSun = $(expectedFirstTr).find('th')[0], 
            expectedLastRow = $(expectedBody).find('.schedule_row').last(), 
            expectedLastTr = $(expectedLastRow).find('tr')[0], 
            // 11/1 목요일
            expectedLastTur = $(expectedLastTr).find('th')[4];

        ok($(expectedFirstSun).hasClass("before"), "이전달 셀은 before 클래스를 가지고 있어야 한다.");
        ok($(expectedLastTur).hasClass("next"), "다음달 셀은 next 클래스를 가지고 있어야 한다.");
    });

    test("주간 일정 - 기본 렌더링 테스트", function() {
        // Given
        var $target = $("#qunit-fixture"), 
            now = moment();

        // When
        var calbean = $target.calbean({type: "weekly"});

        // Then
        var header = $target.find("table.tb_week_header"), 
            thead = $(header).find('thead'), 
            thOfThead = $(thead).find('th'), 
            tbody = $(header).find('tbody'), 
            trOfTbody = $(tbody).find('tr'), 
            rangeEventBody = $(trOfTbody[0]).find('td'), 
            rangeEventLabel = $(trOfTbody[0]).find('th'), 
            timelineBody = $target.find('.tb_week_body'),
            trOfTimeline = $(timelineBody).find('tr'), 
            timelineBg = trOfTimeline[0], 
            timelineCols = trOfTimeline[1], 
            tdOftimelineBg = $(timelineBg).find('td'), 
            timeWrap = $(timelineCols).find('th > div.time_wrap'), 
            scheduleCols = $(timelineCols).find('td'), 
            timeDiv = $(timeWrap).find('div.time');

        ok($target.hasClass("calendar_week"), ".calendar_week 클래스를 가져야 한다.");
        equal(header.length > 0, true, "타임라인 헤더가 표시되어야 한다.");
        equal(thOfThead.length, 8, "일자 표시 부분에 8개의 th가 표시되어야 한다.");
        equal($(thOfThead[0]).text(), "일", "일자 칼럼의 첫번째 부분은 라벨이 표시되어야 한다.");
        equal(trOfTbody.length, 1, "일정이 없더라도 한개의 행이 기본 생성되어야 한다.");
        equal(rangeEventBody.length, 7, "종일일정 부분에 7개의 일정 컬럼이 생성되어야 한다.");
        equal(rangeEventLabel.length, 1, "종일일정 부분에 라벨 컬럼이 생성되어야 한다.");
        equal($(rangeEventLabel[0]).text(), "종일일정", "종일일정 부분에 [종일일정]라벨이 생성되어야 한다.");
        equal($(timelineBg).find('th').length, 1, "타임라인 그리드에 th가 1개 생성되어야 한다.");
        equal($(tdOftimelineBg).attr('colspan'), 7, "타임라인 그리드 배경을 위 한 td에 colspan 값이 올바르게 표현되어야 한다.");
        equal($target.find('div.timeline_wrap > div.timeline').length, 24, "24개의 타임라인 그리드가 생성되어야 한다.");
        equal(timeDiv.length, 24, "24개의 시간표시 라벨이 생성되어야 한다.");
        equal($($(timeDiv[0]).find('span')[0]).text(), "오전", "오전 12시에는 오전이라는 접두어가 생성되어야 한다.");
        equal($($(timeDiv[12]).find('span')[0]).text(), "오후", "오후 12시에는 오후이라는 접두어가 생성되어야 한다.");
        equal(scheduleCols.length, 7, "7개의 일자별 컬럼이 생성되어야 한다.");
        ok($(scheduleCols[now.day()]).hasClass("today"), "오늘 날짜에는 today 클래스가 있어야 한다.");
    });

    test("일간 일정 - 기본 렌더링 테스트", function() {
        // Given
        var $target = $("#qunit-fixture"), 
            now = moment();

        // When
        var calbean = $target.calbean({type: "daily"});

        // Then
        var header = $target.find("table.tb_week_header"), 
            thead = $(header).find('thead');

        ok($target.hasClass("calendar_week"), ".calendar_week 클래스를 가져야 한다.");
        equal(header.length > 0, true, "타임라인 헤더가 표시되어야 한다.");
    });


    module('$.fn.calbean() 월별 보기 테스트');

    test("10/27(토) 18:00 ~ 10/27(토) 23:00, 시간 지정 일정 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture"), 
            evt = bonegirl("my-event-2"), 
            attendeeNames = [];

        for(var _i in evt.attendees) attendeeNames.push(evt.attendees[_i].name);

        // When
        $target.calbean({date: basedate, type: "monthly", events: [evt]});

        // Then
        var expectedBody = $target.find('.month_body'), 
            expectedRow = $(expectedBody).find('.schedule_row')[3], 
            expectedTr = $(expectedRow).find('tr')[1], 
            expectedTd = $(expectedTr).find('td')[6];
            
        ok($(expectedTd).find('a.schedule').length > 0, "이벤트가 지정될 셀에 렌더링 되어야 한다.");
        ok($($(expectedTd).find('div')[0]).hasClass('schedule_time'), "이벤트가 schedule_time 클래스를 가져야 한다.");
        ok($($(expectedTd).find('div')[0]).hasClass('txtcolor' + evt.color), "캘린더 색상코드가 반영되어야 한다.");
        ok($($(expectedTd).find('a.schedule')[0]).attr('title').indexOf(evt.summary) > -1, "이벤트 요약정보가 <A> 엘리먼트의 title 속성에 올바르게 들어있어야 한다.");
        ok($($(expectedTd).find('a.schedule')[0]).attr('title').indexOf(attendeeNames.join(',')) > -1, "이벤트 참석자정보가 <A> 엘리먼트의 title 속성에 올바르게 들어있어야 한다.");
        equal($($(expectedTd).find('a.schedule')[0]).attr('data-id'), evt.id, "이벤트 id가 <A> 엘리먼트의 data-id 속성에 올바르게 들어있어야 한다.");
        equal($($(expectedTd).find('span.time')).text(), moment(evt.startTime).format("HH:mm"), "시간 정보가 올바르게 들어있어야 한다.");
        equal($($(expectedTd).find('span').last()).text(), evt.summary, "이벤트 요약정보가 올바르게 표현되어야 한다.");
    });

    test("10/24(수), 종일 일정 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23),
            $target = $("#qunit-fixture"), 
            evt = bonegirl("my-event-3"),
            attendeeNames = [];

        for(var _i in evt.attendees) attendeeNames.push(evt.attendees[_i].name);

        // When
        $target.calbean({date: basedate, type: "monthly", events: [evt]});

        // Then
        var expectedBody = $target.find('.month_body')[3], 
            expectedRow = $(expectedBody).find('.schedule_row')[0], 
            expectedTr = $(expectedRow).find('tr')[1], 
            expectedTd = $(expectedTr).find('td')[3];

        ok($(expectedTd).find('a.schedule').length > 0, "이벤트가 지정될 셀에 렌더링 되어야 한다.");
        ok($($(expectedTd).find('div')[0]).hasClass('schedule_day'), "이벤트가 schedule_day 클래스를 가져야 한다.");
        ok($($(expectedTd).find('div')[0]).hasClass('bgcolor' + evt.color), "캘린더 색상코드가 반영되어야 한다.");
        ok($($(expectedTd).find('a.schedule')[0]).attr('title').indexOf(evt.summary) > -1, "이벤트 요약정보가 <A> 엘리먼트의 title 속성에 올바르게 들어있어야 한다.");
        ok($($(expectedTd).find('a.schedule')[0]).attr('title').indexOf(attendeeNames.join(",")) > -1, "이벤트 참석자 정보가 <A> 엘리먼트의 title 속성에 올바르게 들어있어야 한다.");
        equal($($(expectedTd).find('a.schedule')[0]).attr('data-id'), evt.id, "이벤트 id가 <A> 엘리먼트의 data-id 속성에 올바르게 들어있어야 한다.");
        equal($($(expectedTd).find('span')[0]).text(), evt.summary, "이벤트 요약정보가 올바르게 표현되어야 한다.");
    });

    test("10/19(금) 18:00 ~ 10/20(토) 12:00, 2일간 걸친 일정 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23),
            $target = $("#qunit-fixture"), 
            evt = bonegirl("public-event-4");

        // When
        $target.calbean({date: basedate, type: "monthly", events: [evt]});

        // Then
        var expectedBody = $target.find('.month_body')[2], 
            expectedRow = $(expectedBody).find('.schedule_row')[0], 
            expectedTr = $(expectedRow).find('tr')[1], 
            expectedStart = $(expectedTr).find('td')[5], 
            expectedEnd = $(expectedTr).find('td')[6];

        ok($(expectedStart).find('a.schedule').length > 0, "시작일에 이벤트가 렌더링 되어야 한다.");
        equal($(expectedStart).attr('colspan'), "2", "시작셀의 colspan값이 2가 되어야 한다.");
        equal($(expectedTr).find('td').length, 6, "6개의 셀을 가지고 있어야 한다.");
    });

    test("9/29(일) ~ 10/1(월), 추석 연휴, 공휴일 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture"), 
            holidayEvent = bonegirl("holiday-event-1");

        // When
        $target.calbean({date: basedate, type: "monthly", events: [holidayEvent]});

        // Then 
        var expectedBody = $target.find('.month_body')[0], 
            expectedRow = $(expectedBody).find('.schedule_row')[0], 
            expectedTr = $(expectedRow).find('tr')[0], 
            expectedSun = $(expectedTr).find('th')[0],
            expectedMon = $(expectedTr).find('th')[1];

        ok($(expectedSun).hasClass('holiday_on'), "9/30에 .holiday_on 클래스가 추가되어야 한다.");
        ok($(expectedSun).find('span.note').length > 0, "9/30에 공휴일 라벨 엘리먼트가 포함되어야 한다.");
        equal($($(expectedSun).find('span.note')).text(), holidayEvent.summary, "9/30에 추석 표시가 포함되어야 한다.");
        ok($(expectedMon).hasClass('holiday_on'), "10/1에 .holiday_on 클래스가 추가되어야 한다.");
        equal($(expectedMon).find('span.note').length > 0, false, "10/1에 공휴일 라벨 엘리먼트가 포함되어서는 안된다.");
    });    

    test("10/12(금) 09:00 ~ 10/16(화) 18:00, 2주에 걸친 일정 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture"), 
            myEvent = bonegirl("my-event-4");

        // When
        $target.calbean({date: basedate, type: "monthly", events: [myEvent]});

        // Then
        var startBody = $target.find('.month_body')[1], 
            startRow = $(startBody).find('.schedule_row')[0], 
            startTr = $(startRow).find('tr')[1], 
            startTd = $(startTr).find('td')[5], 
            firstSch = $(startTd).find('div')[0], 
            secondBody = $target.find('.month_body')[2], 
            secondRow = $(secondBody).find('.schedule_row')[0], 
            secondTr = $(secondRow).find('tr')[1], 
            secondTd = $(secondTr).find('td')[0], 
            secondSch = $(secondTd).find('div')[0];

        ok($(firstSch).hasClass("schedule_day_right"), "첫번째 주 일정바에는 div.schedule_day_right 클래스를 가지고 있어야 한다.");
        ok($(firstSch).find('div.tail_r').length > 0, "첫번째 주 일정바에는 div.tail_r 엘리먼트가 있어야 한다.");
        ok($(secondSch).hasClass("schedule_day_left"), "두번째 주 일정바에는 div.schedule_day_left 클래스를 가지고 있어야 한다.");
        ok($(secondSch).find('div.tail_l').length > 0, "두번째 주 일정바에는 div.tail_l 엘리먼트가 있어야 한다.");

    });
    
    test("10/27(토) ~ 11/4(월), 9일, 3주, 다음달 종료일 일정 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture"), 
            myEvent = bonegirl("my-event-1");

        // When
        $target.calbean({date: basedate, type: "monthly", events: [myEvent]});

        // Then
        var startBody = $target.find('.month_body')[3], 
            startRow = $(startBody).find('.schedule_row')[0], 
            startTr = $(startRow).find('tr')[1], 
            startTd = $(startTr).find('td')[6], 
            firstSch = $(startTd).find('div')[0], 
            secondBody = $target.find('.month_body')[4], 
            secondRow = $(secondBody).find('.schedule_row')[0], 
            secondTr = $(secondRow).find('tr')[1], 
            secondTd = $(secondTr).find('td')[0], 
            secondSch = $(secondTd).find('div')[0];

        ok($(firstSch).hasClass("schedule_day_right"), "첫번째 주의 일정바에는 .schedule_day_right 클래스를 가지고 있어야 한다.");
        ok($(firstSch).find('div.tail_r').length > 0, "첫번째 주 일정바에는 div.tail_r 엘리먼트가 있어야 한다.");
        ok($(secondSch).hasClass("schedule_day_left"), "마지막 주의 일정바에는 .schedule_day_left 클래스를 가지고 있어야 한다.");
        ok($(secondSch).hasClass("schedule_day_right"), "마지막 주의 일정바에는 .schedule_day_right 클래스를 가지고 있어야 한다.");
        ok($(secondSch).find('div.tail_l').length > 0, "마지막 주 일정바에는 div.tail_l 엘리먼트가 있어야 한다.");
        ok($(secondSch).find('div.tail_r').length > 0, "마지막 주 일정바에는 div.tail_r 엘리먼트가 있어야 한다.");
    });


    module('$.fn.calbean() 주간 보기 테스트');

    test("10/24(수), 종일 일정 표시 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            event1 = bonegirl("my-event-3"), 
            event2 = bonegirl("my-event-3", {
                id: "9", 
                summary: "홍콩 여행", 
                startTime: "2012-10-24T00:00:00.000+09:00", 
                endTime: "2012-10-28T00:00:00.000+09:00"
            }), 
            event3 = bonegirl("my-event-3", {
                id: "10", 
                summary: "불꽃 축제", 
                startTime: "2012-10-19T00:00:00.000+09:00", 
                endTime: "2012-10-22T00:00:00.000+09:00"
            });

        // When
        $target.calbean({date: basedate, type: "weekly", events: [event3, event1, event2]});

        // Then
        var weekHeaderWrap = $target.find('table.tb_week_header'), 
            TRs = $(weekHeaderWrap).find('tbody > tr.row'), 
            TD1 = $(TRs[0]).find('td'), 
            TD2 = $(TRs[0]).find('td'), 
            TD3 = $(TRs[1]).find('td'), 
            firstCell = $(TD1[0]).find('div.schedule_day'), 
            firstAnchor = firstCell.find('a.schedule')[0], 
            secondCell = $(TD2[3]).find('div.schedule_day'), 
            secondAnchor = secondCell.find('a.schedule')[0], 
            thirdCell = $(TD3[3]).find('div.schedule_day'), 
            thirdAnchor = secondCell.find('a.schedule')[0];
        
        ok(TRs.length > 0, "종일일정이 부분생성되어야 한다.");
        equal(firstCell.length, 1, "종일일정 div 가 생성되어야 한다.");
        ok($(firstAnchor).attr('title').indexOf(event3.summary) > -1, "event1의 summary 정보가 a.schedule의 title 속성에 표시되어야 한다.");
        equal($($(firstAnchor).find('span')[0]).text(), event3.summary, "event3의 summary 정보가 출력되어야 한다.");
        equal($(TD3[3]).attr('colspan'), '4', "event2는 4개의 td가 병합되어야 한다.");
        ok($(firstCell).hasClass('schedule_day_left'), "event3은 .schedule_day_left 클래스를 가지고 있어야 한다.");
        ok($(firstCell).find('div.tail_l').length > 0, "event3은 div.tail_l 엘리먼트를 자식으로 가지고 있어야 한다.")
        ok($(thirdCell).hasClass('schedule_day_right'), "event2는 .schedule_day_right 클래스를 가지고 있어야 한다.");
        ok($(thirdCell).find('div.tail_r').length > 0, "event2는 div.tail_r 엘리먼트를 자식으로 가지고 있어야 한다.");
    });

    test("10/27(토) 18:00 ~ 10/27(토) 23:00, 시간 지정 기본 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture"), 
            myEvent = bonegirl("my-event-2");

        // When
        $target.calbean({date: basedate, type: "weekly", events: [myEvent]});

        // Then
        var weekBodyWrap = $target.find('div.week_body_wrap'), 
            colsTr = $(weekBodyWrap[0]).find('tr.cols')[0], 
            dateCols = $(colsTr).find('td'), 
            expectedTimeline = $(dateCols[6]).find('div.schedule_wrap'), 
            scheduleDiv = $(expectedTimeline).find("div.schedule_time")[0], 
            timeSpan = $(scheduleDiv).find("p.head > span.time")[0], 
            contentPara = $(scheduleDiv).find("p.content")[0], 
            resizeDiv = $(scheduleDiv).find("div.resize");

        equal(dateCols.length, 7,"7개의 타임라인이 생성되어야 한다.");
        ok($(dateCols[6]).find('div.schedule_wrap').length > 0, "7번째 셀에 div.schedule_wrap 엘리먼트가 생성되어야 한다.");
        ok($(scheduleDiv).hasClass('bgcolor' + myEvent.color), "캘린더 색상코드가 반영되어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('top:827px') > -1, "일정 DIV의 top값이 827px이어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('left:0%') > -1, "일정 DIV의 left값이 0%이어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('width:100%') > -1, "일정 DIV의 width값이 100%이어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('height:225px') > -1, "일정 DIV의 height값이 225px이어야 한다.");
        equal($(timeSpan).text(), '18:00', '시간표시가 되어야 한다.');
        equal($(contentPara).attr('title'), myEvent.summary, 'p.content 엘리먼트의 title 속성에 일정 요약 정보가 올바르게 표시되어야 한다.');
        equal($(contentPara).text(), myEvent.summary, '일정 요약정보가 올바르게 표시되어야 한다.');
        equal(resizeDiv.length, 1, 'resize 아이콘이 표시되어야 한다.');
    });

    test("10/27(토), 겹치는 시간일정 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 23), 
            $target = $("#qunit-fixture"), 
            event1 = bonegirl("my-event-2"), 
            event2 = bonegirl("my-event-2", {
                id: "9", 
                summary: "태연이와 약속", 
                description: "큰일이야. 시간이 겹쳤어.", 
                startTime: "2012-10-27T18:30:00.000+09:00", 
                endTime: "2012-10-27T20:00:00.000+09:00"
            }), 
            event3 = bonegirl("my-event-2", {
                id: "10", 
                summary: "수지와 약속", 
                description: "우왕....", 
                startTime: "2012-10-27T19:00:00.000+09:00", 
                endTime: "2012-10-27T21:00:00.000+09:00"
            }), 
            event4 = bonegirl("my-event-2", {
                id: "11", 
                summary: "인국이와의 약속", 
                description: "얘는 꼭 초를 쳐...", 
                startTime: "2012-10-27T20:00:00.000+09:00", 
                endTime: "2012-10-27T22:00:00.000+09:00"
            }), 
            event5 = bonegirl("my-event-2", {
                id: "12", 
                summary: "동건이형 약속", 
                description: "자정되기 전에 잠시 보기", 
                startTime: "2012-10-27T23:00:00.000+09:00", 
                endTime: "2012-10-27T23:30:00.000+09:00"
            });
        // When
        $target.calbean({date: basedate, type: "weekly", events: [event1, event2, event3, event4, event5]});

        // Then
        var weekBodyWrap = $target.find('div.week_body_wrap'), 
            colsTr = $(weekBodyWrap[0]).find('tr.cols')[0], 
            dateCols = $(colsTr).find('td'), 
            expectedTimeline = $(dateCols[6]).find('div.schedule_wrap'),  
            scheduleDivs = $(expectedTimeline).find("div.schedule_time");
        
        equal(scheduleDivs.length, 5, "5개의 일정 DIV가 생성되어야 한다.");
        ok($(scheduleDivs[1]).attr('style').indexOf("left:33.3%") > -1, "event2 일정의 left 값은 33.3% 여야 한다.");
        ok($(scheduleDivs[2]).attr('style').indexOf("left:66.6%") > -1, "event3 일정의 left 값은 66.6% 여야 한다.");
        ok($(scheduleDivs[3]).attr('style').indexOf("left:33.3%") > -1, "event4 일정의 left 값은 33.3% 여야 한다.");
        ok($(scheduleDivs[4]).attr('style').indexOf("left:0%") > -1, "event5 일정의 left 값은 0% 여야 한다.");
    });

    module('$.fn.calbean() 일간 보기 테스트');

    test("10/27(토) 18:00 ~ 10/27(토) 23:00, 시간 지정 기본 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 27), 
            $target = $("#qunit-fixture"), 
            myEvent = bonegirl("my-event-2");

        // When
        $target.calbean({date: basedate, type: "daily", events: [myEvent]});

        // Then
        var weekBodyWrap = $target.find('div.week_body_wrap'), 
            colsTr = $(weekBodyWrap[0]).find('tr.cols')[0], 
            dateCols = $(colsTr).find('td'), 
            expectedTimeline = $(dateCols[0]).find('div.schedule_wrap'), 
            scheduleDiv = $(expectedTimeline).find("div.schedule_time")[0], 
            timeSpan = $(scheduleDiv).find("p.head > span.time")[0], 
            contentPara = $(scheduleDiv).find("p.content")[0], 
            resizeDiv = $(scheduleDiv).find("div.resize");

        equal(dateCols.length, 1,"1개의 타임라인이 생성되어야 한다.");
        ok($(dateCols[0]).find('div.schedule_wrap').length > 0, "div.schedule_wrap 엘리먼트가 생성되어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('top:827px') > -1, "일정 DIV의 top값이 827px이어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('left:0%') > -1, "일정 DIV의 left값이 0%이어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('width:100%') > -1, "일정 DIV의 width값이 100%이어야 한다.");
        ok($(scheduleDiv).attr('style').indexOf('height:225px') > -1, "일정 DIV의 height값이 225px이어야 한다.");
        equal($(timeSpan).text(), '18:00', '시간표시가 되어야 한다.');
        equal($(contentPara).attr('title'), myEvent.summary, 'p.content 엘리먼트의 title 속성에 일정 요약 정보가 올바르게 표시되어야 한다.');
        equal($(contentPara).text(), myEvent.summary, '일정 요약정보가 올바르게 표시되어야 한다.');
        equal(resizeDiv.length, 1, 'resize 아이콘이 표시되어야 한다.');
    });
    
    module('이벤트 bind 테스트');

    test("update:calendar-color 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            alldayEvent = bonegirl("my-event-3"), 
            timedEvent = bonegirl("my-event-2"), 
            calbean = $target.calbean({date: basedate, type: "monthly", events: [alldayEvent, timedEvent]});

        // when 
        var chagingCode = "15";
        calbean.updateCalendarColor("2", chagingCode);

        // Then
        var expectedBody = $target.find('.month_body')[3], 
            expectedRow = $(expectedBody).find('.schedule_row')[0], 
            expectedTr = $(expectedRow).find('tr')[1], 
            turTd = $(expectedTr).find('td')[3],
            satTd = $(expectedTr).find('td')[6];

        ok($($(turTd).find("div")[0]).hasClass("bgcolor" + chagingCode), "alldayEvent의 DIV 색상이 bgcolor"+chagingCode+"로 변경되어야 한다.");
        ok($($(satTd).find("div")[0]).hasClass("txtcolor" + chagingCode), "timedEvent DIV 색상이 txtcolor"+chagingCode+"로 변경되어야 한다.");
    });

    test("add:events 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            alldayEvent = bonegirl("my-event-3"), 
            timedEvent = bonegirl("my-event-2"), 
            calbean = $target.calbean({date: basedate, type: "monthly", events: [alldayEvent]});

        // When
        calbean.addEvents(timedEvent);

        // Then
        var expectedBody = $target.find('.month_body')[3], 
            expectedRow = $(expectedBody).find('.schedule_row')[0], 
            expectedTr = $(expectedRow).find('tr')[1], 
            satTd = $(expectedTr).find('td')[6];

        ok($(satTd).find('div.schedule_time').length > 0, "추가된 이벤트가 표시되어야 한다.");
    });

    test("remove:calendars 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            publicEvent = bonegirl("public-event-4"), 
            myEvent = bonegirl("my-event-3"), 
            calbean = $target.calbean({date: basedate, type: "monthly", events: [publicEvent, myEvent]});

        // When
        calbean.removeCalendars(publicEvent.calendarId);

        // Then
        var body1 = $target.find('.month_body')[2], 
            row1 = $(body1).find('.schedule_row')[0], 
            tr1 = $(row1).find('tr')[1], 
            eventDiv1 = $(tr1).find('td')[5], 
            body2 = $target.find('.month_body')[3], 
            row2 = $(body2).find('.schedule_row')[0], 
            tr2 = $(row2).find('tr')[1], 
            eventDiv2 = $(tr2).find('td')[3];

        equal($(eventDiv1).find('div').length, 0, "삭제요청된 일정이 삭제되어야 한다.");
        equal($(eventDiv2).find('div').length, 1, "삭제요청하지 않은 일정은 유지되어야 한다.");
    });

    test("change:view-type - 월별보기에서 주별보기 전환 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            calbean = $target.calbean({date: basedate, type: "monthly"});

        // When
        calbean.changeViewType('weekly');

        // Then
        var weekBody = $target.find('.tb_week_body'), 
            trCols = $(weekBody).find('.cols');
        ok($target.hasClass("calendar_week"), ".calendar_week 클래스를 가져야 한다.");
        ok(!$target.hasClass("calendar_month"), ".calendar_month 클래스는 삭제되어야 한다.");
        ok($target.find("table.tb_week_header").length > 0, "주간 보기 테이블이 출력되어야 한다.");
        equal($(trCols).find("td").length, 7, "7개의 일자별 타임라인이 출력되어야 한다.");
    });

    test("change:view-type - 월별보기에서 일별보기 전환 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            calbean = $target.calbean({date: basedate, type: "monthly"});

        // When
        calbean.changeViewType('daily');

        // Then
        var weekBody = $target.find('.tb_week_body'), 
            trCols = $(weekBody).find('.cols');

        ok($target.hasClass("calendar_week"), ".calendar_week 클래스를 가져야 한다.");
        ok($target.find("table.tb_week_header").length > 0, "일간 보기 테이블이 출력되어야 한다.");
        equal($(trCols).find("td").length, 1, "1개의 일자별 타임라인이 출력되어야 한다.");
    });       

    test("change:view-type - 주별보기에서 일별보기 전환 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            calbean = $target.calbean({date: basedate, type: "weekly"});

        // When
        calbean.changeViewType('daily');

        // Then
        var weekBody = $target.find('.tb_week_body'), 
            trCols = $(weekBody).find('.cols');
        
        ok($target.hasClass("calendar_week"), ".calendar_week 클래스를 유지해야 한다.");
        ok($target.find("table.tb_week_header").length > 0, "일간 보기 테이블이 출력되어야 한다.");
        equal($(trCols).find("td").length, 1, "1개의 일자별 타임라인이 출력되어야 한다.");
    });

    test("change:view-type - 주별보기에서 월별보기 전환 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            calbean = $target.calbean({date: basedate, type: "weekly"});

        // When
        calbean.changeViewType('monthly');

        // Then
        ok($target.find("table.tb_month_header").length > 0, "월간 보기 테이블이 출력되어야 한다.");
    });

    test("change:view-type - 일별보기에서 월별보기 전환 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            calbean = $target.calbean({date: basedate, type: "daily"});

        // When
        calbean.changeViewType('monthly');

        // Then
        ok($target.hasClass("calendar_month"), ".calendar_month 클래스를 유지해야 한다.");
        ok(!$target.hasClass("calendar_day"), ".calendar_day 클래스는 삭제되어야 한다.");
        ok($target.find("table.tb_month_header").length > 0, "월간 보기 테이블이 출력되어야 한다.");
    });

    test("change:view-type - 일별보기에서 주별보기 전환 테스트", function() {
        // Given
        var basedate = new Date(2012, 9, 24), 
            $target = $("#qunit-fixture"), 
            calbean = $target.calbean({date: basedate, type: "daily"});

        // When
        calbean.changeViewType('weekly');

        // Then
        ok($target.hasClass("calendar_week"), ".calendar_week 클래스를 유지해야 한다.");
        ok($target.find("table.tb_week_header").length > 0, "주간 보기 테이블이 출력되어야 한다.");
    });
}).call(this, jQuery);