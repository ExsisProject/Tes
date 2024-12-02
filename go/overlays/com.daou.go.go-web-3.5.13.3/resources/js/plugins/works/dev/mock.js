define(function(require) {
    
	require("jquery.mockjax");
	
	/**
	 * 필터 관리 UI - 필터 목록
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/filters",
		responseText : [{
			id : 1,
			appletId : 1,
			name : "필터1"
		}, {
			id : 2,
			appletId : 1,
			name : "필터2"
		}]
	});
	
	/**
	 * 필터 관리 UI - 필드 목록 - fields
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/fields",
		responseText : [{
				cid : "c1",
				label : "텍스트",
				fieldType : "text"
			}, {
				cid : "c2",
				label : "멀티선택",
				fieldType : "listbox", // 구 select
				options : [{
					value : 10,
					displayText : "멀티선택-1"
				}, {
					value : 20,
					displayText : "멀티선택-2"
				}, {
					value : 30,
					displayText : "멀티선택-3"
				}, {
					value : 40,
					displayText : "멀티선택-4"
				}]
			}, {
				cid : "c3",
				label : "타임",
				fieldType : "time"
			}, {
				cid : "c4",
				label : "데이트타임",
				fieldType : "datetime"
			}, {
				cid : "c5",
				label : "데이트",
				fieldType : "date"
			}, {
				cid : "c6",
				label : "넘버",
				fieldType : "number"
			}, {
				cid : "c7",
				label : "멀티 텍스트",
				fieldType : "textarea"
			}, {
				cid : "c8",
				label : "에디터",
				fieldType : "editor"
			}, {
				cid : "c9",
				label : "단일선택",
				fieldType : "radio",
				options : [{
					value : 10,
					displayText : "단일선택-1"
				}, {
					value : 20,
					displayText : "단일선택-2"
				}, {
					value : 30,
					displayText : "단일선택-3"
				}, {
					value : 40,
					displayText : "단일선택-4"
				}]
			}, {
				cid : "c10",
				label : "체크박스",
				fieldType : "checkbox",
				options : [{
					value : 10,
					displayText : "체크박스-1"
				}, {
					value : 20,
					displayText : "체크박스-2"
				}, {
					value : 30,
					displayText : "체크박스-3"
				}, {
					value : 40,
					displayText : "체크박스-4"
				}]
			}, {
				cid : "c11",
				label : "드롭박스",
				fieldType : "select",
				options : [{
					value : 10,
					displayText : "드롭박스-1"
				}, {
					value : 20,
					displayText : "드롭박스-2"
				}, {
					value : 30,
					displayText : "드롭박스-3"
				}, {
					value : 40,
					displayText : "드롭박스-4"
				}]
			}, {
				cid : "c12",
				label : "파일첨부",
				fieldType : "file"
			}, {
				cid : "c13",
				label : "사용자선택",
				fieldType : "org",
				options : []
			}, {
				cid : "c14",
				label : "공백",
				fieldType : "blank"
			}, {
				cid : "c15",
				label : "라인",
				fieldType : "hr"
			}, {
				cid : "c16",
				label : "라벨",
				fieldType : "label"
			}, {
				cid : "c17",
				label : "섹션",
				fieldType : "column"
			}, {
				cid : "c21",
				label : "멀티플-텍스트",
				multiple : true,
				fieldType : "text"
			}, {
				cid : "c23",
				label : "멀티플-타임",
				multiple : true,
				fieldType : "time"
			}, {
				cid : "c24",
				label : "멀티플-데이트타임",
				multiple : true,
				fieldType : "datetime"
			}, {
				cid : "c25",
				label : "멀티플-데이트",
				multiple : true,
				fieldType : "date"
			}, {
				cid : "c26",
				label : "멀티플-넘버",
				multiple : true,
				fieldType : "number"
			}, {
				cid : "c31",
				label : "멀티플-드롭박스",
				multiple : true,
				fieldType : "select",
				options : [{
					value : 10,
					displayText : "드롭박스-1"
				}, {
					value : 20,
					displayText : "드롭박스-2"
				}, {
					value : 30,
					displayText : "드롭박스-3"
				}, {
					value : 40,
					displayText : "드롭박스-4"
				}]
			}, {
				cid : "create_date",
				label : "등록일",
				fieldType : "create_date"
			}, {
				cid : "creator",
				label : "등록자",
				fieldType : "creator"
			}, {
				cid : "update_date",
				label : "수정일",
				fieldType : "update_date"
			}, {
				cid : "updater",
				label : "변경자",
				fieldType : "updater"
			}, {
				cid : "status",
				label : "상태",
				fieldType : "status"
			}]
	});
	
	/**
	 * 필터 관리 UI - 필터1 상세
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/filters/1",
		responseText : {
			id : 1,
			appletId : 1,
			name : "필터1",
			searchKeyword : "",
			conditions : [{
				id : 1,
				fieldCid : "c1",
				conditionType : "TEXT",
				values : {
					text : "텍스트value"
				}
			}, {
				id : 2,
				fieldCid : "c2",
				conditionType : "SELECT",
				values : {
					values : [10, 20, 30]
				}
			}, {
				id : 3,
				fieldCid : "c3",
				conditionType : "TIME",
				values : {
					fromTime : "12:34",
					toTime : "23:45"
				}
			}, {
				id : 4,
				fieldCid : "c4",
				conditionType : "DATETIME",
				values : {
					fromDateTime : new Date((new Date()).setDate((new Date()).getDate() - 10)),
					toDateTime : new Date((new Date()).setDate((new Date()).getDate() + 10))
				}
			}, {
				id : 5,
				fieldCid : "c5",
				conditionType : "DATE",
				values : {
					fromDate : "20150101",
					toDate : "20151231"
				}
			}, {
				id : 6,
				fieldCid : "c6",
				conditionType : "NUMBER",
				values : {
					minValue : "123456",
					maxValue : "234567"
				}
			}, {
				id : 7,
				fieldCid : "c7",
				conditionType : "TEXT",
				values : {
					text : "멀티텍스트value"
				}
			}, {
				id : 8,
				fieldCid : "c8",
				conditionType : "TEXT",
				values : {
					text : "에디터value"
				}
			}, {
				id : 9,
				fieldCid : "c9",
				conditionType : "SELECT",
				values : {
					values : [20, 30, 40]
				}
			}, {
				id : 10,
				fieldCid : "c10",
				conditionType : "SELECT",
				values : {
					values : [10, 30, 40]
				}
			}, {
				id : 11,
				fieldCid : "c11",
				conditionType : "SELECT",
				values : {
					values : [10, 20, 40]
				}
			}, {
				id : 12,
				fieldCid : "c12",
				conditionType : "TEXT",
				values : {
					text : "파일value"
				}
			}, {
				id : 13,
				fieldCid : "c13",
				conditionType : "SELECT",
				values : {
					values : [10, 20, 40] // simpleUserModel 이 내려올 수 있다.
				}
			}, {
				id : 14,
				fieldCid : "c21",
				conditionType : "TEXT",
				values : {
					text : "멀티플-텍스트value"
				}
			}, {
				id : 15,
				fieldCid : "c23",
				conditionType : "TIME",
				values : {
					fromTime : "12:34",
					toTime : "23:45"
				}
			}, {
				id : 16,
				fieldCid : "c24",
				conditionType : "DATETIME",
				values : {
					fromDateTime : new Date((new Date()).setDate((new Date()).getDate() - 10)),
					toDateTime : new Date((new Date()).setDate((new Date()).getDate() + 10))
				}
			}, {
				id : 17,
				fieldCid : "c25",
				conditionType : "DATE",
				values : {
					fromDate : "20150101",
					toDate : "20151231"
				}
			}, {
				id : 18,
				fieldCid : "c26",
				conditionType : "NUMER",
				values : {
					minValue : "123456",
					maxValue : "234567"
				}
			}, {
				id : 19,
				fieldCid : "c31",
				conditionType : "SELECT",
				values : {
					values : [10, 30, 40]
				}
			}]
		}
	});
	
	/**
	 * 필터 관리 UI - 필터2 상세
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/filters/2",
		responseText : {
			id : 2,
			appletId : 1,
			name : "필터2",
			searchKeyword : "",
			conditions : [{
				id : 21,
				fieldCid : "c1",
				conditionType : "TEXT",
				values : {
					text : "필터컴포넌트2"
				}
			}, {
				id : 22,
				fieldCid : "c2",
				conditionType : "SELECT",
				values : {
					values : [20, 30, 40]
				}
			}, {
				id : 23,
				fieldCid : "c3",
				conditionType : "TIME",
				values : {
					fromTime : "12:35",
					toTime : "23:46"
				}
			}, {
				id : 24,
				fieldCid : "c4",
				conditionType : "RELATIVE_DATETIME",
				values : {
					fromValue : 2,
					toValue : 3,
					fromUnit : "now",
					toUnit : "day"
				}
			}, {
				id : 25,
				fieldCid : "c5",
				conditionType : "RELATIVE_DATE",
				values : {
					fromValue : 2,
					toValue : 3,
					fromUnit : "month",
					toUnit : "day"
				}
			}, {
				id : 26,
				fieldCid : "c6",
				conditionType : "NUMBER",
				values : {
					minValue : "2345678",
					maxValue : "3456789"
				}
			}, {
				id : 27,
				fieldCid : "c7",
				conditionType : "TEXT",
				values : {
					text : "멀티텍스트value"
				}
			}, {
				id : 28,
				fieldCid : "c8",
				conditionType : "TEXT",
				values : {
					text : "에디터value"
				}
			}, {
				id : 29,
				fieldCid : "c9",
				conditionType : "SELECT",
				values : {
					values : [10, 30, 40]
				}
			}, {
				id : 30,
				fieldCid : "c10",
				conditionType : "SELECT",
				values : {
					values : [10, 20, 30]
				}
			}, {
				id : 31,
				fieldCid : "c11",
				conditionType : "SELECT",
				values : {
					values : [10, 20, 40]
				}
			}, {
				id : 32,
				fieldCid : "c12",
				conditionType : "TEXT",
				values : {
					text : "파일value"
				}
			}, {
				id : 33,
				fieldCid : "c13",
				conditionType : "SELECT",
				values : {
					values : [10, 20, 40]
				}
			}, {
				id : 34,
				fieldCid : "c21",
				conditionType : "TEXT",
				values : {
					text : "멀티플-텍스트value"
				}
			}, {
				id : 35,
				fieldCid : "c23",
				conditionType : "TIME",
				values : {
					fromTime : "12:34",
					toTime : "23:45"
				}
			}, {
				id : 36,
				fieldCid : "c24",
				conditionType : "RELATIVE_DATETIME",
				values : {
					fromValue : 2,
					toValue : 3,
					fromUnit : "month",
					toUnit : "day"
				}
			}, {
				id : 37,
				fieldCid : "c25",
				conditionType : "RELATIVE_DATE",
				values : {
					fromValue : 2,
					toValue : 3,
					fromUnit : "month",
					toUnit : "day"
				}
			}, {
				id : 38,
				fieldCid : "c26",
				conditionType : "NUMBER",
				values : {
					minValue : "123456",
					maxValue : "234567"
				}
			}, {
				id : 39,
				fieldCid : "c31",
				conditionType : "SELECT",
				values : {
					values : [10, 30, 40]
				}
			}]
		}
	});
	
	/**
	 * 목록 관리 UI - 목록 설정 조회
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/listview",
		responseText : {
			id : 1,
			showDescription : true,
			charts : [{
				id : 1,
				title : "차트1",
				fieldCid : "c1",
				periodOption : "ALL"
			}/*, {	
				id : 2,
				title : "차트2",
				fieldCid : "c2",
				periodOption : "ABSTRACT",
				fromDate : new Date((new Date()).setDate((new Date()).getDate() - 10)),
				toDate : new Date((new Date()).setDate((new Date()).getDate() + 10))
			}, {	
				id : 3,
				title : "차트3",
				fieldCid : "c3",
				periodOption : "RELATIVE",
				fromValue : 2,
				toValue : 3,
				fromUnit : "month",
				toUnit : "day"
			}*/],
			columns : [{
				id : 1,
				fieldCid : "c1",
				columnName : "텍스트!"
			}, {
				id : 2,
				fieldCid : "c2",
				columnName : "멀티선택@"
			}, {
				id : 3,
				fieldCid : "c3",
				columnName : "타임#"
			}, {
				id : 4,
				fieldCid : "c4",
				columnName : "데이트타임$"
			}, {
				id : 5,
				fieldCid : "c5",
				columnName : "데이트%"
			}, {
				id : 6,
				fieldCid : "c6",
				columnName : "넘버^"
			}, {
				id : 7,
				fieldCid : "c9",
				columnName : "단일선택&"
			}, {
				id : 8,
				fieldCid : "c10",
				columnName : "체크박스*"
			}, {
				id : 9,
				fieldCid : "c11",
				columnName : "드롭박스("
			}, {
				id : 10,
				fieldCid : "c13",
				columnName : "유저!)"
			}, {
				id : 11,
				fieldCid : "create_date",
				columnName : "등록일!!"
			}, {
				id : 12,
				fieldCid : "creator",
				columnName : "등록자!@"
			}, {
				id : 13,
				fieldCid : "update_date",
				columnName : "수정일!#"
			}, {
				id : 14,
				fieldCid : "updater",
				columnName : "변경자!$"
			}, {
				id : 15,
				fieldCid : "status",
				columnName : "상태!%"
			}],
			titleColumnIndex : 4,
			sortColumnIndex : 1,
			sortDirection : "DESC"
		}
	});
	
	/**
	 * 앱 홈 - 문서 검색
	 */
	var AppletDocModel = function() { 
		function getSelectFieldValues(length) {
			length = length || Math.floor(Math.random() * 10); // 0 ~ 9 개의 값을 가질 수 있다.
			var values = [];
			for (var int = 0; int < length; int++) {
				var value = (Math.floor(Math.random() * 10) + 1 ) * 10; // 10 ~ 100 의 value 를 갖는다. 
				values.push(value);
			}
			
			return values;
		}
		
		return {
			id : 1,
			appletId : 1,
			values : {
				"c1" : "텍스트" + (Math.floor(Math.random() * 100) + 1),
				"c2" : _.union(getSelectFieldValues()), // 멀티 선택
				"c3" : "타임" + (Math.floor(Math.random() * 100) + 1),
				"c4" : "데이트타임" + (Math.floor(Math.random() * 100) + 1),
				"c5" : "데이트" + (Math.floor(Math.random() * 100) + 1),
				"c6" : "넘버" + (Math.floor(Math.random() * 100) + 1),
				"c9" : _.union(getSelectFieldValues(1)), // 단일 선택
				"c10" : _.union(getSelectFieldValues()), // 체크박스
				"c11" : _.union(getSelectFieldValues(1)), // 드롭박스
				"c13" : _.union(getSelectFieldValues(1)), // 사용자
				"create_date" : "등록일" + (Math.floor(Math.random() * 100) + 1),
				"creator" : "등록자" + (Math.floor(Math.random() * 100) + 1),
				"update_date" : "수정일" + (Math.floor(Math.random() * 100) + 1),
				"updater" : "변경자" + (Math.floor(Math.random() * 100) + 1),
				"status" : "상태" + (Math.floor(Math.random() * 100) + 1)
			},
			createdAt : new Date(),
			updatedAt : new Date(),
			createdBy : {
				"id" : 4,
				"name" : "윤여진1",
				"email" : "test3@daou.co.kr",
				"position" : "차장",
				"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
			},
			updatedBy : {
				"id" : 4,
				"name" : "윤여진1",
				"email" : "test3@daou.co.kr",
				"position" : "차장",
				"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
			}
		};
	};
	var AppletDocModels = [];
	var collectionSize = 20;
	
	for (var int = 0; int < collectionSize; int++) {
		var model = new AppletDocModel();
		model.id = int + 1;
		AppletDocModels.push(model);
	}
	
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/docs",
		responseText : {
			data : AppletDocModels,
			"page" : {
			    "page" : 0,
			    "offset" : 20,
			    "total" : 21,
			    "sort" : [ {
			      "direction" : "DESC",
			      "property" : "finishedAt",
			      "ignoreCase" : false,
			      "nullHandling" : "NATIVE",
			      "ascending" : false
			    } ],
			    "lastPage" : false,
			}
		}
	});
	
	var AppletDocModels = [];
	var collectionSize = 1;
	for (var int = 0; int < collectionSize; int++) {
		var model = new AppletDocModel();
		model.id = int + 1;
		AppletDocModels.push(model);
	}
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/docs?page=1&offset=20",
		responseText : {
			data : AppletDocModels,
			"page" : {
			    "page" : 1,
			    "offset" : 20,
			    "total" : 21,
			    "sort" : [ {
			      "direction" : "DESC",
			      "property" : "finishedAt",
			      "ignoreCase" : false,
			      "nullHandling" : "NATIVE",
			      "ascending" : false
			    } ],
			    "lastPage" : false,
			}
		}
	});
	
	/**
	 * 필터 삭제
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/filters/1",
		type : "DELETE",
		responseText : {
			code : "200"
		}
	});
	
	/**
	 * 필터 저장
	 */
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/1/filters",
		type : "POST",
		responseText : {
			code : "200"
		}
	});
	
	$.mockjax({
		url: GO.contextRoot + 'api/works/applets/10/integration',
		responseText: {
			id: 10,
			producers: [{
				producer: {id:1, name: 'App1'},
				producerFieldCid: 'create_date',
				consumer: {id:11, name: 'App11'},
				consuerFieldCid: 'create_date',
				privileges: ['SHOW_LIST'],
				createdBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				createdAt: new Date(),
				updatedBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				updatedAt: new Date()
			}, {
				producer: {id:2, name: 'App2'},
				producerFieldCid: 'update_date',
				consumer: {id:12, name: 'App12'},
				consuerFieldCid: 'update_date',
				privileges: ['SHOW_DOC'],
				createdBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				createdAt: new Date(),
				updatedBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				updatedAt: new Date()
			}],
			consumers: [{
				producer: {id:3, name: 'App3'},
				producerFieldCid: 'create_date',
				consumer: {id:13, name: 'App13'},
				consumerFieldCid: 'create_date',
				privileges: ['SHOW_LIST'],
				createdBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				createdAt: new Date(),
				updatedBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				updatedAt: new Date()
			}, {
				producer: {id:4, name: 'App4'},
				producerFieldCid: 'update_date',
				consumer: {id:14, name: 'App14'},
				consumerFieldCid: 'update_date',
				privileges: ['SHOW_DOC'],
				createdBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				createdAt: new Date(),
				updatedBy: {
					"id" : 4,
					"name" : "윤여진1",
					"email" : "test3@daou.co.kr",
					"position" : "차장",
					"thumbnail" : "/go/resources/images/photo_profile_small.jpg"
				},
				updatedAt: new Date()
			}]
		}
	});
	
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/10/doc/1/consumers",
		responseText: [{
			applet: {
				id: 10,
				name: 'App1',
				admins: [],
				desc: 'description',
				showDescription: true,
				thumbSmall: '',
				iconUrl: '',
				useProcess: true,
				privateOption: 'OPEN'
			},
			accessable: true,
			count: 7,
			fieldCid: 'update_date'
		}, {
			applet: {
				id: 11,
				name: 'App2',
				admins: [],
				desc: 'description',
				showDescription: true,
				thumbSmall: '',
				iconUrl: '',
				useProcess: true,
				privateOption: 'OPEN'
			},
			accessable: true,
			count: 7,
			fieldCid: 'update_date'
		}] 
	});
	
	$.mockjax({
		url : GO.contextRoot + "api/works/applets/10/form",
		responseText: {
			appletId: 10,
			id: 10,
			data: {
				type: 'canvas',
				cid: 'cxx1',
				multiple: false,
				components: [{
					cid: "_zzv3du17w",
					components: [],
					multiple: false,
					properties: {
						label: '제목',
						hideLabel: false,
						guide: ''
					},
					type: 'text',
					valueType: 'STEXT'
				}, {
					cid: "_zzv3du17s",
					components: [],
					multiple: false,
					properties: {
						label: '연동',
						hideLabel: false,
						guide: '',
						selectedDisplayFields: ['_zzv3du17w', '_zi5k4oa1v']
					},
					type: 'applet_docs',
					valueType: 'APPLETDOCS'
				}]
			}
		}
	});
});