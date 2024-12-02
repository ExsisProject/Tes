define('works/constants/value_type', function (require) {
    /**
     * 컴포넌트 Value Type 관리
     *
     * AppletField 도메인 객체의 ValueType enum 객체 참고
     */

    var STEXT = 'STEXT';
    var STEXTS = 'STEXTS';
    var TEXT = 'TEXT';
    var CONTENT = 'CONTENT';
    var NUMBER = 'NUMBER';
    var DATE = 'DATE';
    var TIME = 'TIME';
    var DATETIME = 'DATETIME';
    var SELECT = 'SELECT';
    var SELECTS = 'SELECTS';
    var FILES = 'FILES';
    var USER = 'USER';
    var USERS = 'USERS';
    var DEPTS = 'DEPTS';
    var APPLETDOCS = 'APPLETDOCS';

    /**
     * 조건 추가시 즉시 검색이 되야 하는 타입들
     */
    var INSTANT_SEARCH_TYPES = [
        NUMBER, DATE, TIME, DATETIME
    ];

    var MULTI_VALUED_TYPES = [
        STEXTS, SELECTS, FILES, USERS, DEPTS, APPLETDOCS
    ];

    var MASKABLE_TYPES = [
        STEXT, NUMBER, APPLETDOCS
    ];

    return {
        "STEXT": STEXT,
        "STEXTS": STEXTS,
        "TEXT": TEXT,
        "CONTENT": CONTENT,
        NUMBER: NUMBER,
        DATE: DATE,
        TIME: TIME,
        DATETIME: DATETIME,
        "SELECT": SELECT,
        "SELECTS": SELECTS,
        "FILES": FILES,
        "USER": USER,
        "USERS": USERS,
        "DEPTS": DEPTS,
        "APPLETDOCS": APPLETDOCS,

        // 백엔드에는 없지만 특수한 value type들
        // 필드 매핑에 사용되는 value type. 연결된 필드의 value type을 따라간다.
        "MAPPED": "MAPPED",

        INSTANT_SEARCH_TYPES: INSTANT_SEARCH_TYPES,
        MULTI_VALUED_TYPES: MULTI_VALUED_TYPES,
        MASKABLE_TYPES: MASKABLE_TYPES
    };
});