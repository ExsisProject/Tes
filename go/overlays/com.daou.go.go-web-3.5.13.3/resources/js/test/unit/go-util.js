(function($) {
    
    module('go-util');

    test("snsDate - 올해가 아닌 경우", function() {
        // given
        var before = moment().subtract('years', 1);

        // when
        var snsDate = GO.util.snsDate(before);

        // then
        console.log(snsDate);
        var expected = GO.util.formatDatetime(before, 'ko', "YYYY-MM-DD(ddd) HH:mm");
        equal(expected, snsDate);
    });

    test("snsDate - 1분미만 이전인 경우", function() {
        // given
        var before = moment().subtract('seconds', 30);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        equal("방금 전", snsDate);
        console.log(snsDate);
    });

    test("snsDate - 1분 전인 경우", function() {
        // given
        var before = moment().subtract('minutes', 1);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        equal("1분 전", snsDate);
    });

    test("snsDate - 1분 30초 이전인 경우", function() {
        // given
        var before = moment().subtract('minutes', 1).subtract('second', 30);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        equal("1분 전", snsDate);
    });

    test("snsDate - 2분 이전인 경우", function() {
        // given
        var before = moment().subtract('minutes', 2);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        equal("2분 전", snsDate);
    });

    test("snsDate - 59분인 이전인 경우", function() {
        // given
        var before = moment().subtract('minutes', 59);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        equal("59분 전", snsDate);
    });

    test("snsDate - 1시간 이전인 경우", function() {
        // given
        var before = moment().subtract('hours', 1);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        equal("1시간 전", snsDate);
    });

    test("snsDate - 12시간 이전인 경우", function() {
        // given
        var before = moment().subtract('hours', 12);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        var expected = GO.util.formatDatetime(before, 'ko', "MM-DD HH:mm");
        equal(expected, snsDate);
    });

    test("snsDate - 24시간 이전인 경우", function() {
        // given
        var before = moment().subtract('hours', 24);

        // when
        var snsDate = GO.util.snsDate(before);
console.log(snsDate);
        // then
        var expected = GO.util.formatDatetime(before, 'ko', "MM-DD HH:mm");
        equal(expected, snsDate);
    });


}).call(this, jQuery);