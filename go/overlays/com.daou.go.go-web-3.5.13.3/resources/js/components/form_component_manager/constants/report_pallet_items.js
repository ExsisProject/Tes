define('components/form_component_manager/constants/report_pallet_items', function(require) {
    var COMPONENTS = require('components/form_component_manager/constants/components');
    return {
        base: [
            COMPONENTS['텍스트'],
            COMPONENTS['멀티텍스트'],
            COMPONENTS['편집기'],
            COMPONENTS['숫자'],
            COMPONENTS['통화'],
            COMPONENTS['단일선택'],
            COMPONENTS['체크박스'],
            COMPONENTS['날짜'],
            COMPONENTS['기간'],
            COMPONENTS['시간']
        ],
        auto: [
            COMPONENTS['이름 및 직위'],
            COMPONENTS['이름'],
            COMPONENTS['직위(보고)'],
            COMPONENTS['사번(보고)'],
            COMPONENTS['소속부서'],
            COMPONENTS['오늘날짜']
        ]
    };
});
