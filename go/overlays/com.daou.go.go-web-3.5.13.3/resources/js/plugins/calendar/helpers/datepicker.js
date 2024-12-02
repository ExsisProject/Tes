(function() {

    define([
        "libraries/go-periodpicker"
    ], 

    function(
        PeriodPicker
    ) {
        
        /**
         * @deprecated
         * DatepickerHelper를 전역에서 사용하기 위해 libs 폴더로 이동 후 PeriodPicker로 이름 변경함
         * 이 파일은 호환성을 위해 남겨두며, 향후 삭제 예정
         */
        return PeriodPicker;
    });

}).call(this);