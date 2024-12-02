define([
    "admin/models/task_type",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	TaskType
) {
	describe("taskType!", function() {
		var template = {
			    "id" : 8,
			    "createdAt" : "2014-03-05T19:00:15",
			    "updatedAt" : "2014-03-10T13:59:33",
			    "name" : "영업 진행관리",
			    "description" : "온라인컨택 ▶ 제안방문 ▶ 검토중 ▶ 계약/홀딩/수주실패 ▶ 구축 개발 ▶ 완료",
			    "approver" : false,
			    "appliedFolders" : 0,
			    "taskStatuses" : [ {
			      "id" : 27,
			      "name" : "온라인컨택",
			      "start" : true,
			      "end" : false,
			      "doing" : false,
			      "count" : 0
			    }, {
			      "id" : 28,
			      "name" : "제안방문",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    }, {
			      "id" : 29,
			      "name" : "검토중",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    }, {
			      "id" : 30,
			      "name" : "계약진행",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    }, {
			      "id" : 31,
			      "name" : "홀딩",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    }, {
			      "id" : 32,
			      "name" : "수주실패",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    }, {
			      "id" : 33,
			      "name" : "구축개발",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    }, {
			      "id" : 34,
			      "name" : "완료",
			      "start" : false,
			      "end" : false,
			      "doing" : true,
			      "count" : 0
			    } ],
			    "status" : "HIDDEN",
			    "addPushes" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			    "editPrivileges" : [ {
			      "attribute" : "ASSIGNEE",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "APPROVER",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "TAG",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "REFERER",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "NAME",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "PRIVATETASK",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "FIELD",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "DUEDATE",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "CONTENT",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    } ],
			    "editPushes" : [ {
			      "attribute" : "APPROVER",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "NAME",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "CONTENT",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "TAG",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "FIELD",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "PRIVATETASK",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "ASSIGNEE",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "REFERER",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "attribute" : "DUEDATE",
			      "roles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    } ],
			    "transitions" : [ {
			      "id" : 39,
			      "beforeStatus" : "완료",
			      "nextStatus" : "구축개발",
			      "actionName" : "취소",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 40,
			      "beforeStatus" : "구축개발",
			      "nextStatus" : "완료",
			      "actionName" : "개발완료",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 41,
			      "beforeStatus" : "온라인컨택",
			      "nextStatus" : "제안방문",
			      "actionName" : "방문",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 42,
			      "beforeStatus" : "제안방문",
			      "nextStatus" : "온라인컨택",
			      "actionName" : "방문취소",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 43,
			      "beforeStatus" : "제안방문",
			      "nextStatus" : "검토중",
			      "actionName" : "검토단계 진행",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 44,
			      "beforeStatus" : "검토중",
			      "nextStatus" : "계약진행",
			      "actionName" : "수주완료",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 45,
			      "beforeStatus" : "검토중",
			      "nextStatus" : "홀딩",
			      "actionName" : "홀딩",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 46,
			      "beforeStatus" : "검토중",
			      "nextStatus" : "수주실패",
			      "actionName" : "수주실패",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 47,
			      "beforeStatus" : "수주실패",
			      "nextStatus" : "검토중",
			      "actionName" : "재검토",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 48,
			      "beforeStatus" : "수주실패",
			      "nextStatus" : "계약진행",
			      "actionName" : "재검토",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    }, {
			      "id" : 49,
			      "beforeStatus" : "계약진행",
			      "nextStatus" : "구축개발",
			      "actionName" : "개발진행",
			      "actionRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ],
			      "pushRoles" : [ "REGISTRANT", "ADMIN", "ASSIGNEE" ]
			    } ]
			  };
		$.ajaxMock.register('/api/task/attribute/writable/1', {
		    responseText : template,
		    statusCode: 200,
		    status:'OK',
		    type: 'GET'
		});
		
		it("URL. taskType ID가 있는 경우 URL 확인", function() {
			var taskType = new TaskType({
				id : 1
			});
			
			expect(taskType.url()).toBe("/ad/api/task/type/1");
		});
		
		
		it("URL. taskType ID가 없는 경우 URL 확인", function() {
			var taskType = new TaskType({
				id : null
			});
			
			expect(taskType.url()).toBe("/ad/api/task/type");
		});
		
		
		it("defaults. TaskTypeModel 초기값 확인", function() {
			var taskType = new TaskType({id : 1});
			var wait = {
				"name" : "대기",
		        "start" : false,
		        "end" : false,
		        "doing" : false
		    };
			var ing = {
		        "name" : "진행",
		        "start" : false,
	  	        "end" : false,
		        "doing" : false
		    };
			var complete = {
				"name" : "완료",
				"start" : false,
				"end" : true,
				"doing" : false
		    };
			
			expect(taskType.get("name")).toBe("");
			expect(taskType.get("description")).toBe("");
			expect(taskType.get("approver")).toBe(false);
			expect(taskType.get("appliedFolders")).toBe(0);
			expect(taskType.get("taskStatuses").length).toBe(3);
			expect(taskType.get("taskStatuses")[0]).toEqual(wait);
			expect(taskType.get("taskStatuses")[1]).toEqual(ing);
			expect(taskType.get("taskStatuses")[2]).toEqual(complete);
			expect(taskType.get("addPushes").length).toBe(0);
			expect(taskType.get("editPrivileges").length).toBe(0);
			expect(taskType.get("editPushes").length).toBe(0);
			expect(taskType.get("transitions").length).toBe(0);
			expect(taskType.get("status")).toBe("HIDDEN");
		});
		
		
		it("statusLabel. taskType 상태 레이블 확인", function() {
			var taskType = new TaskType(template);
			
			expect(taskType.statusLabel()).toBe("온라인컨택-제안방문-검토중-계약진행-홀딩-수주실패-구축개발-완료");
		});
		
		
		it("isShow. taskType status 가 SHOW 이면 true 반환, HIDDEN 이면 false 반환.", function() {
			var taskType = new TaskType(template);
			
			expect(taskType.isShow()).toBe(false);
		});
		
		
		it("editable. 해당 상태를 사용하고 있는 폴더가 있으면 false 반환", function() {
			var taskType = new TaskType(template);
			
			expect(taskType.editable()).toBe(true);
		});
		
		
		it("auths. 기한, 담당자, etc에 대한 수정 권한과 수정후 알림 대상 체크", function() {
			var taskType = new TaskType(template);
			
			expect(taskType.auths("Privileges")[0].attribute).toBe("ASSIGNEE");
			expect(taskType.auths("Privileges")[0].roles[0]).toBe("REGISTRANT");
			expect(taskType.auths("Privileges")[0].roles[1]).toBe("ADMIN");
			expect(taskType.auths("Privileges")[0].roles[2]).toBe("ASSIGNEE");
		});
	});
});