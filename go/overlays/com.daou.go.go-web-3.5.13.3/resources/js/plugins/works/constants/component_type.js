define('works/constants/component_type', function (require) {
    /**
     * 컴포넌트 타입 관리
     * 컴포넌트 타입을 이곳에서 관리할려는 목적은 두가지이다. 폼빌더에서 나타나는 모든 컴포넌트는 이곳에 등록되어야 한다.
     *
     * 1. 제공되는 컴포넌트를 한눈에 보기 위한 용도
     * 2. 컴포넌트의 순서를 지정하기 위한 용도
     */
    return {
        // 기본 컴포넌트
        // 텍스트
        Text: 'text',
        // 멀티 텍스트
        Textarea: 'textarea',
        // 숫자
        Number: 'number',
        // 드롭박스
        Select: 'select',
        // 체크박스
        Checkbox: 'checkbox',
        // 단일선택
        Radio: 'radio',
        // 리스트박스
        ListBox: 'listbox',
        // 날짜
        Date: 'date',
        // 시간
        Time: 'time',
        // 날짜와시간
        Datetime: 'datetime',
        // 파일 첨부
        File: 'file',
        // 사용자 선택
        Org: 'org',
        // 부서 선택
        OrgDept: 'org_dept',
        // 테이블
        Table: 'table',

        // 특수 컴포넌트
        // 등록자
        Creator: 'creator',
        // 등록일
        CreateDate: 'create_date',
        // 변경자
        Updater: 'updater',
        // 수정일
        UpdateDate: 'update_date',

        //디자인 컴포넌트
        // 라벨
        Label: 'label',
        // 라인
        Hr: 'hr',
        // 공백
        Blank: 'blank',
        // 칼럼(다단)
        Columns: 'columns',

        // 자동 계산
        Formula: 'formula',

        // 사용자가 핸들링할 수 없는 컴포넌트
        // 캔버스
        Canvas: 'canvas',
        // 칼럼
        Column: 'column',

        // 앱 연동
        AppletDocs: 'applet_docs',
        // 필드 매핑
        FieldMapping: 'field_mapping'
    };
});
