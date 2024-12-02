define('components/form_component_manager/constants/approval_pallet_items', function(require) {
    var COMPONENTS = require('components/form_component_manager/constants/components');
    return {
        base: [
            COMPONENTS['제목'],
            COMPONENTS['본문 내용'],
            COMPONENTS['결재선'],
            COMPONENTS['텍스트'],
            COMPONENTS['멀티텍스트'],
            COMPONENTS['편집기'],
            COMPONENTS['숫자'],
            COMPONENTS['통화'],
            COMPONENTS['단일선택'],
            COMPONENTS['드롭박스'],
            COMPONENTS['체크박스'],
            COMPONENTS['날짜'],
            COMPONENTS['시간'],
            COMPONENTS['기간'],
            COMPONENTS['사용자선택'],
            COMPONENTS['부서선택']
        ],
        auto: [
            COMPONENTS['기안자'],
            COMPONENTS['기안부서'],
            COMPONENTS['기안자이메일'],
            COMPONENTS['직위'],
            COMPONENTS['사번'],
            COMPONENTS['핸드폰번호'],
            COMPONENTS['직통전화'],
            COMPONENTS['대표번호'],
            COMPONENTS['팩스'],
            COMPONENTS['기안일'],
            COMPONENTS['완료일'],
            COMPONENTS['문서번호'],
            COMPONENTS['공개여부'],
            COMPONENTS['보안등급'],
            COMPONENTS['보존연한'],
            COMPONENTS['전사문서함'],
            COMPONENTS['첨부파일명'],
            COMPONENTS['참조자'],
            COMPONENTS['수신자']
        ],
        advanced: [
            COMPONENTS['합의 결재선'],
            COMPONENTS['수신 결재선'],
            COMPONENTS['단일선택 자동결재선'],
            COMPONENTS['드롭박스 자동결재선'],
            COMPONENTS['통화 자동결재선'],
            COMPONENTS['발신명의'],
            COMPONENTS['공문수신처'],
            COMPONENTS['레이블']
        ]
    };
});
