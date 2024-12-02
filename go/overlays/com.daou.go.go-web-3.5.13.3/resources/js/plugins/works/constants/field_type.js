define("works/constants/field_type", function(require) {

	var ComponentType = require('works/constants/component_type');

	/**
	 * 주석으로 붙은 값은 valueType 이다.
	 *
	 * SELECT, DATETIME, USER 가 들어 가 있는 경우 valueType 대체가 가능한지 확인해야 한다.
	 */
	var TEXT = ComponentType.Text; // STEXT
	var TEXTAREA = ComponentType.Textarea; // TEXT
	var NUMBER = ComponentType.Number; // NUMBER
	var SELECT = ComponentType.Select; // SELECT
	var RADIO = ComponentType.Radio; // SELECT
	var CHECKBOX = ComponentType.Checkbox; // SELECTS
	var LISTBOX = ComponentType.ListBox; // SELECTS
	var DATE = ComponentType.Date; // DATE
	var TIME = ComponentType.Time; // TIME
	var DATETIME = ComponentType.Datetime; // DATETIME
	var FILE = ComponentType.File; // FILES
	var ORG = ComponentType.Org; // USERS
	var DEPT = ComponentType.OrgDept; // DEPTS
	var CREATOR = ComponentType.Creator; // USER
	var UPDATER = ComponentType.Updater; // USER
	var CREATEDATE = ComponentType.CreateDate; // DATETIMEㅣ;
	var UPDATEDATE = ComponentType.UpdateDate; // DATETIME
	var STATUS  = "status"; // valueType 으로 대체 불가 // SELECT
	var APPLETDOCS = ComponentType.AppletDocs; // APPLETDOCS // 텍스트 타입과 유사
	var FIELD_MAPPING = ComponentType.FieldMapping; // 매핑되는 필드를 따라가는듯?
	var FORMULA = ComponentType.Formula; // NUMBER // 넘버라고 봐야하나?
	var DOCNO = "docNo";	// valueType 으로 대체 불가 문서번호

	// 사용하지 않는 필드타입
	//var EDITOR = "editor";

	/**
	 * 필터에 사용 할 수 있는 필드. valueType 으로 대체 불가. (상태, 변경자, 변경일)
	 */
	var FILTER_FIELD_TYPES = [
	    TEXT, // STEXT
	    DATE, // DATE
	    TIME, // TIME
	    DATETIME, // DATETIME
	    NUMBER, // NUMBER
	    TEXTAREA, // TEXT
	    //EDITOR,
	    FILE, // FILES
	    CREATEDATE, // DATETIME
	    LISTBOX, // SELECTS
	    RADIO, // SELECT
	    SELECT, // SELECT
	    CHECKBOX, // SELECTS
	    ORG, // USERS
	    DEPT, // DEPTS
	    CREATOR, // USER
	    STATUS, // SELECT // valueType 으로 대체 불가
	    APPLETDOCS, // APPLETDOCS
		FIELD_MAPPING,
		FORMULA, // NUMBER
		DOCNO	// STEXT	// valueType 으로 대체 불가
    ];

	/**
	 * 목록에 사용 할 수 있는 필드. valueType 으로 대체 불가. (상태)
	 */
	var COLUMN_FIELD_TYPES = [
	    TEXT, // STEXT
	    DATE, // DATE
	    TIME, // TIME
	    DATETIME, // DATETIME
	    NUMBER, // NUMBER
	    LISTBOX, // SELECTS
	    RADIO, // SELECT
	    SELECT, // SELECT
	    CHECKBOX, // SELECTS
	    ORG, // USERS
	    DEPT, // DEPTS
	    CREATOR, // USER
	    UPDATER, // USER
	    CREATEDATE, // DATETIME
	    UPDATEDATE, // DATETIME
	    STATUS, // SELECT // valueType 으로 대체 불가
	    APPLETDOCS, // APPLETDOCS
		FIELD_MAPPING,
		FORMULA, // NUMBER
		DOCNO	// 문서번호
    ];
	
	/**
	 * 데이터 연동 컴포넌트에서 데이터 연결시, 검색 노출 가능한 항목
	 */
	var APPLETDOC_DISPLAY_FIELD_TYPES = [
	    TEXT, // STEXT
	    DATE, // DATE
	    TIME, // TIME
	    DATETIME, // DATETIME
	    NUMBER, // NUMBER
	    LISTBOX, // SELECTS
	    RADIO, // SELECT
	    SELECT, // SELECT
	    CHECKBOX, // SELECTS
	    ORG, // USERS
	    DEPT, // DEPTS
	    CREATOR, // USER
	    UPDATER, // USER
	    CREATEDATE, // DATETIME
	    UPDATEDATE, // DATETIME
	    STATUS, // SELECT // valueType 으로 대체 불가
	    APPLETDOCS, // APPLETDOCS
		FIELD_MAPPING,
		FORMULA // NUMBER
    ];

	/**
	 * 차트에 사용 할 수 있는 필드. valueType 으로 대체 불가. (상태, 변경자)
	 * STEXT, SELECT, SELECTS, NUMBER, DATE, TIME, DATETIME, USERS, DEPTS, USER
	 */
	var CHART_FIELD_TYPES = [
	    TEXT, // STEXT
	    RADIO, // SELECT
	    SELECT, // SELECT
        LISTBOX, // SELECTS
	    CHECKBOX, // SELECTS
	    NUMBER, // NUMBER
	    DATE, // DATE
	    TIME, // TIME
	    DATETIME, // DATETIME
	    ORG, // USERS
	    DEPT, // DEPTS
	    CREATOR, // USER
	    CREATEDATE, // DATETIME
	    STATUS, // SELECT // valueType 으로 대체 불가
	    APPLETDOCS, // APPLETDOCS
		FIELD_MAPPING,
		FORMULA // NUMBER
    ];

	/**
	 * 기본으로 정의된 필드 타입들. valueType 으로 대체 불가.
	 */
	var PREDEFINED_TYPES = [
		CREATEDATE, // DATETIME
		UPDATEDATE, // DATETIME
		CREATOR, // USER
		UPDATER // USER
	];

	/**
	 * 연동항목 매핑이 가능한 필드 타입들. valueType 으로 대체 불가. (상태)
	 * STEXT, TEXT, NUMBER, SELECT, SELECTS, DATE, TIME, DATETIME, USERS, DEPTS, USER
	 */
	var MAPPABLE_TYPES = [
		TEXT, // STEXT
		TEXTAREA, // TEXT
		NUMBER, // NUMBER
		SELECT, // SELECT
		RADIO, // SELECT
		CHECKBOX, // SELECTS
		LISTBOX, // SELECTS
		DATE, // DATE
		TIME, // TIME
		DATETIME, // DATETIME
		ORG, // USERS
		DEPT, // DEPTS
		CREATOR, // USER
		UPDATER, // USER
		CREATEDATE, // DATETIME
		UPDATEDATE, // DATETIME
		FORMULA
	];

	/**
	 * 자동계산이 가능한 필드 타입들
	 * NUMBER, DATE, TIME, DATETIME, FORMULA
	 */
	var FORMULABLE_TYPES = [
		NUMBER, 	// NUMBER
		DATE, 		// DATE
		TIME, 		// TIME
		DATETIME,  	// DATETIME
		FORMULA
	];
	
	/**
	 * value type 으로 대체 불가능한.
	 */
	var IRREPLACEABLE_IN_VALUE_TYPES = [
		CREATEDATE, // DATETIME
		UPDATEDATE, // DATETIME
		CREATOR, // USER
		UPDATER, // USER
		STATUS, // SELECT
		DOCNO	// DOCNO
	];

	var SELETABLE_TYPES = [ // 선택형 UI 필드
		CHECKBOX,
		LISTBOX,
		RADIO,
		SELECT
	];
	
    var LISTENABLE_TYPES = [
        CHECKBOX,
        LISTBOX, // SELECTS
        RADIO,
        SELECT,
		APPLETDOCS
    ];
    //
	//var MASKABLE_TYPES = [
	//	TEXT, NUMBER, APPLETDOCS, FIELD_MAPPING
	//];
	
    //var TEXT_TYPES = [
	 //   TEXT,
	 //   TEXTAREA,
	 //   EDITOR,
	 //   FILE
    //];
	
	///**
	// * 사용자를 값으로 갖는 필드 타입들
	// */
	//var USER_TYPES = [
     //   ORG, // USERS
     //   CREATOR, // USER
     //   UPDATER
	//];
	
	///**
	// * 연월일시분초
	// */
	//var FULL_DATE_TIME_FORMAT_TYPES = [
     //   DATETIME,
     //   CREATEDATE, // DATETIME
     //   UPDATEDATE
	//];
	
    ///**
	 //* 시간 관련 필드 타입들(date와 time 은 string 형태의 시간)
	 //*/
    //var DATE_TIME_TYPES = [
	 //   DATE,
	 //   TIME, // TIME
	 //   DATETIME, // DATETIME
    //    CREATEDATE, // DATETIME
    //    UPDATEDATE
    //];
	
    ///**
	 //* date가 포함된 date 관련 타입들
	 //*/
    //var INCLUDE_DATE_TYPES = [
    //    DATE,
	 //   DATETIME, // DATETIME
    //    CREATEDATE, // DATETIME
    //    UPDATEDATE
    //];
	
    ///**
	 //* 값을 여러개 가질수 있는 필드 타입들
	 //*/
    //var MULTIPLE_TYPES = [
    //    FILE,
    //    LISTBOX, // SELECTS
    //    CHECKBOX,
    //    ORG, // USERS
    //    DEPT, // DEPTS
    //    APPLETDOCS,
		//FIELD_MAPPING
    //];
	
    ///**
	 //* 조건 추가시 즉시 검색이 되야 하는 필드 타입들
	 //*/
    //var INSTANT_SEARCH_TYPES = [
    //    NUMBER, // NUMBER
    //    DATE, // DATE
    //    TIME, // TIME
    //    DATETIME, // DATETIME
    //    CREATEDATE, // DATETIME
    //    UPDATEDATE // DATETIME
    //];
	
//	/**
//	 * 정렬이 불가능한 필드 타입들.
//	 */
//	var NOT_SORTABLE_TYPES = [
////        LISTBOX, // SELECTS
////        CHECKBOX
//    ];

    //var ORG_SELECT_TYPES = [
    //    ORG, // USERS
    //    DEPT, // DEPTS
    //    CREATOR, // USER
    //    UPDATER
    //];

	return {
		TEXT : TEXT, // STEXT
		TEXTAREA: TEXTAREA, // TEXT
		//EDITOR: EDITOR,
		LISTBOX: LISTBOX, // SELECTS
		RADIO: RADIO, // SELECT
		CHECKBOX: CHECKBOX, // SELECTS
		SELECT: SELECT, // SELECT
		NUMBER: NUMBER, // NUMBER
		FILE: FILE, 
		DATE: DATE, // DATE
		TIME: TIME, // TIME
		DATETIME: DATETIME, // DATETIME
		ORG: ORG, // USERS
		DEPT: DEPT, // DEPTS
		CREATEDATE: CREATEDATE, // DATETIME
		CREATOR: CREATOR, // USER
		UPDATEDATE: UPDATEDATE, // DATETIME
		UPDATER: UPDATER, // USER
		STATUS : STATUS,
		APPLETDOCS: APPLETDOCS,
		FIELD_MAPPING: FIELD_MAPPING,
		FORMULA: FORMULA,
		DOCNO: DOCNO,
		
	    FILTER_FIELD_TYPES : FILTER_FIELD_TYPES,
	    COLUMN_FIELD_TYPES : COLUMN_FIELD_TYPES,
	    CHART_FIELD_TYPES : CHART_FIELD_TYPES,
	    PREDEFINED_TYPES : PREDEFINED_TYPES,
		MAPPABLE_TYPES: MAPPABLE_TYPES,
		IRREPLACEABLE_IN_VALUE_TYPES: IRREPLACEABLE_IN_VALUE_TYPES,
		LISTENABLE_TYPES: LISTENABLE_TYPES,
		SELETABLE_TYPES: SELETABLE_TYPES,
		FORMULABLE_TYPES: FORMULABLE_TYPES,
		APPLETDOC_DISPLAY_FIELD_TYPES: APPLETDOC_DISPLAY_FIELD_TYPES
	};
});