(function(BoneGirl){

    var // 전사 일정 캘린더
        PUBLIC_CALENDAR_ID = 1, 
        PUBLIC_CALENDAR_COLOR = "1",
        // 내 캘린더 ID
        MY_CALENDAR_ID = 2, 
        MY_CALENDAR_COLOR = "2",
        // 축제/기념일 캘린더 ID
        HOLIDAY_CALENDAR_ID = 3, 
        HOLIDAY_CALENDAR_COLOR = "3",
        // 내 정보 
        ME = { id: 1, email: "me@test.com", name: "홍길동" }, 
        ATTENDEE1 = { id: 2, email: "tang9@test.com", name: "김태연" }, 
        ATTENDEE2 = { id: 3, email: "c1@test.com", name: "성시원" }, 
        ATTENDEE3 = { id: 3, email: "dogbird@test.com", name: "윤윤제" };


    BoneGirl.set("public-event-1", {
        id: "1", 
        type: "public", 
        calendarId: PUBLIC_CALENDAR_ID, 
        color: PUBLIC_CALENDAR_COLOR,
        creator: null, 
        attendees: [], 
        summary: "추석 연휴", 
        description: "추석 연휴", 
        visibility: "public", 
        location: "", 
        startTime: "2012-09-29T00:00:00.000+09:00", 
        endTime: "2012-10-01T00:00:00.000+09:00", 
        timeType: "allday", 
        recurrence: "", 
        htmlLink: ""
    });

    BoneGirl.set("holiday-event-1", {
        id: "2", 
        type: "holiday", 
        calendarId: HOLIDAY_CALENDAR_ID, 
        color: HOLIDAY_CALENDAR_COLOR, 
        creator: null, 
        attendees: [], 
        summary: "추석", 
        description: "추석", 
        visibility: "public", 
        location: "", 
        startTime: "2012-09-29T00:00:00.000+09:00", 
        endTime: "2012-10-01T00:00:00.000+09:00", 
        holidayOccurTime: "2012-09-30T00:00:00.000+09:00", 
        timeType: "allday", 
        recurrence: "",
        htmlLink: ""
    });    

    BoneGirl.set("anniversary-event-1", {
        id: "3_1", 
        type: "anniversary", 
        calendarId: HOLIDAY_CALENDAR_ID, 
        color: HOLIDAY_CALENDAR_COLOR, 
        creator: null, 
        attendees: [], 
        summary: "국군의 날", 
        description: "국군의 날", 
        visibility: "public", 
        location: "", 
        startTime: "2012-10-01T00:00:00.000+09:00", 
        endTime: "2012-10-01T00:00:00.000+09:00", 
        timeType: "allday", 
        recurrence: "", 
        htmlLink: ""
    });

    BoneGirl.set("public-event-4", {
        id: "4", 
        type: "public", 
        calendarId: PUBLIC_CALENDAR_ID, 
        creator: { id: 1, email: "test@test.com", name: "홍길동" }, 
        attendees: [], 
        summary: "[전사]야간 산행", 
        description: "꺄아~~!! 진짜 신난다~~~!!", 
        visibility: "public", 
        location: "정동진", 
        startTime: "2012-10-19T18:00:00.000+09:00", 
        endTime: "2012-10-20T12:00:00.000+09:00", 
        timeType: "timed", 
        recurrence: "", 
        htmlLink: ""
    });  

    BoneGirl.set("my-event-1", {
        id: "5", 
        type: "normal", 
        calendarId: MY_CALENDAR_ID, 
        color: PUBLIC_CALENDAR_COLOR,
        creator: ME, 
        attendees: [
            ME
        ], 
        summary: "부산 여행", 
        description: "부산 여행", 
        visibility: "private", 
        location: "부산", 
        startTime: "2012-10-27T00:00:00.000+09:00", 
        endTime: "2012-11-04T00:00:00.000+09:00", 
        timeType: "allday", 
        recurrence: "", 
        htmlLink: ""
    });

    BoneGirl.set("my-event-2", {
        id: "6", 
        type: "normal", 
        calendarId: MY_CALENDAR_ID, 
        color: MY_CALENDAR_COLOR,
        creator: ME, 
        attendees: [
            ME, ATTENDEE2
        ], 
        summary: "시원이와 약속", 
        description: "시원이와 해운대에서 보기로 함", 
        visibility: "private", 
        location: "해운대", 
        startTime: "2012-10-27T18:00:00.000+09:00", 
        endTime: "2012-10-27T23:00:00.000+09:00", 
        timeType: "timed", 
        recurrence: "", 
        htmlLink: ""
    });

    BoneGirl.set("my-event-3", {
        id: "7", 
        type: "normal", 
        calendarId: MY_CALENDAR_ID, 
        color: MY_CALENDAR_COLOR,
        creator: ME, 
        attendees: [
            ME
        ], 
        summary: "휴가", 
        description: "리프레쉬 휴가", 
        visibility: "private", 
        location: "집", 
        startTime: "2012-10-24T00:00:00.000+09:00", 
        endTime: "2012-10-24T00:00:00.000+09:00", 
        timeType: "allday", 
        recurrence: "", 
        htmlLink: ""
    });

    BoneGirl.set("my-event-4", {
        id: "8", 
        type: "normal", 
        calendarId: MY_CALENDAR_ID, 
        color: MY_CALENDAR_COLOR,
        creator: ME, 
        attendees: [
            ME
        ], 
        summary: "2주 걸친 일정", 
        description: "2주 걸친 일정 테스트", 
        visibility: "private", 
        location: "집", 
        startTime: "2012-10-12T09:00:00.000+09:00", 
        endTime: "2012-10-16T18:00:00.000+09:00", 
        timeType: "timed", 
        recurrence: "", 
        htmlLink: ""
    });

    BoneGirl.set("events-of-oct", [
        BoneGirl.get("public-event-1"), 
        BoneGirl.get("holiday-event-1"), 
        BoneGirl.get("anniversary-event-1"), 
        BoneGirl.get("my-event-4"), 
        BoneGirl.get("public-event-4"),
        BoneGirl.get("my-event-1"), 
        BoneGirl.get("my-event-2"), 
        BoneGirl.get("my-event-3")
    ]);

}).call(this, BoneGirl)