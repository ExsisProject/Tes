define([
    "task/models/task",
    "task/models/task_folder",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	Task,
	TaskFolder
) {
	describe("task (include taskFolder!)", function() {
	
		it("id. 업무 등록시 TaskModel 에는 ID가 없다.", function() {
			var task = new Task();
	
			expect(task.id).toBe(null);
		});
		
		
		it("id. 업무 수정시 TaskModel 에는 ID가 있다.", function() {
			var task = new Task({id : "1"});
			
			expect(task.id).not.toBe(null);
		});
		
		
		it("url. ID가 있는 TaskModel URL 확인.", function() {
			var task = new Task({id : "1"});
			
			expect(task.url()).toBe("/api/task/1");
		});
		
		
		it("url. ID가 없는 TaskModel URL 확인.", function() {
			var task = new Task();
			
			expect(task.url()).toBe("/api/task");
		});
		
		
		it("isDelay. dueDate가 없으면 지연 업무가 아니다.", function() {
			var task = new Task({id : "1"});
			
			expect(task.isDelay()).toBe(false);
		});
		
		
		it("isDelay. 기한일이 현 시간보다 미래이면 지연 업무가 아니다.", function() {
			var task = new Task({
				id : "1",
				status : {
					end : false
				}
			});
			var date = new Date();
			
			date.setDate(date.getDate() + 1);
			task.set("dueDate", date);
			
			expect(task.isDelay()).toBe(false);
		});
		
		
		it("isDelay. 기한일이 현 시간보다 과거이면 지연 업무이다.", function() {
			var task = new Task({
				id : "1",
				status : {
					end : false
				}
			});
			
			var date = new Date();
			
			date.setDate(date.getDate() - 1);
			task.set("dueDate", date);
			
			expect(task.isDelay()).toBe(true);
		});
		
		
		it("isDelay. 기한일이 현 시간보다 미래이고, 종료된 업무이면 지연 업무가 아니다.", function() {
			var task = new Task({
				id : "1",
				status : {
					end : true
				}
			});
			var date = new Date();
			
			date.setDate(date.getDate() + 1);
			task.set("dueDate", date);
			
			expect(task.isDelay()).toBe(false);
		});
		
		
		it("isDelay. 기한일이 현 시간보다 과거지만, 종료된 업무이면 지연 업무가 아니다.", function() {
			var task = new Task({
				id : "1",
				status : {
					end : true
				}
			});
			
			var date = new Date();
			
			date.setDate(date.getDate() - 1);
			task.set("dueDate", date);
			
			expect(task.isDelay()).toBe(false);
		});
		
		
		it("hasActivity. 업무가 활동기록을 1개 이상 가지고 있다.", function() {
			var task = new Task({
				id : "1",
				activityCount : 1
			});
			
			expect(task.hasActivity()).toBe(true);
		});
		
		
		it("hasActivity. 업무가 활동기록을 가지고 있지 않다.", function() {
			var task = new Task({
				id : "1",
				activityCount : 0
			});
			
			expect(task.hasActivity()).toBe(false);
		});
		
		
		it("hasDueDate. 업무가 기한을 가지고 있다.", function() {
			var task = new Task({
				id : "1"
			});
			
			task.set("dueDate", new Date());
			
			expect(task.hasDueDate()).toBe(true);
		});
		
		
		it("hasDueDate. 업무가 기한을 가지고 있지 않다.", function() {
			var task = new Task({
				id : "1"
			});
			
			expect(task.hasDueDate()).toBe(false);
		});
		
		
		it("getShortDueDate. 업무의 기한이 util의 shortDate 형태로 출력된다.", function() {
			var date = new Date();
			var task = new Task({
				id : "1",
				dueDate : date
			});
			
			expect(task.getShortDueDate()).toBe(GO.util.shortDate(date));
		});
		
		
		it("getShortDueDate. 업무의 기한이 없으면 공백이 반환된다.", function() {
			var task = new Task({
				id : "1"
			});
			
			expect(task.getShortDueDate()).toBe("");
		});
		
		
		it("getDueDate. 업무의 기한이 util의 basicDate2 형태로 출력된다.", function() {
			var date = new Date();
			var task = new Task({
				id : "1",
				dueDate : date
			});
			
			expect(task.getDueDate()).toBe(GO.util.basicDate2(date));
		});
		
		
		it("getDueDate. 업무의 기한이 없으면 공백이 반환된다.", function() {
			var task = new Task({
				id : "1"
			});
			
			expect(task.getDueDate()).toBe("");
		});
		
		
		it("firstAssignee. 담당자가 한명인 경우 해당 담당자가 반환된다.", function() {
			var assignees = [ {
		      "id" : 1,
		      "name" : "진범동1",
		      "email" : "test1@daou.co.kr",
		      "position" : "부회장",
		      "thumbnail" : "/resources/images/photo_profile_small.jpg",
		      "status" : "ONLINE"
		    }];
			var task = new Task({
				id : "1",
				assignees : assignees
			});
			
			expect(task.firstAssignee()).toBe(assignees[0]);
		});
		
		
		it("firstAssignee. 담당자가 여러명인 경우 해당 첫번째 담당자가 반환된다.", function() {
			var assignees = [ {
			      "id" : 1,
			      "name" : "진범동1",
			      "email" : "test1@daou.co.kr",
			      "position" : "부회장",
			      "thumbnail" : "/resources/images/photo_profile_small.jpg",
			      "status" : "ONLINE"
		    }, {
			      "id" : 2,
			      "name" : "진범동2",
			      "email" : "test2@daou.co.kr",
			      "position" : "부장",
			      "thumbnail" : "/resources/images/photo_profile_small.jpg",
			      "status" : "ONLINE"
			    }];
			var task = new Task({
				id : "1",
				assignees : assignees
			});
			
			expect(task.firstAssignee()).toBe(assignees[0]);
		});
		
		
		it("firstAssignee. 담당자가 없는 경우 undefined가 반환된다.", function() {
			var task = new Task({
				id : "1",
				assignees : []
			});
			
			expect(task.firstAssignee()).toBe(undefined);
		});
		
		
		it("assigneeLabel. 담당자가 없는 경우 '-' 이 반환된다.", function() {
			var task = new Task({
				id : "1",
				assignees : []
			});
			
			expect(task.assigneeLabel()).toBe("-");
		});
		
		
		it("assigneeLabel. 담당자가 한명인 경우 담당자의 '이름 직급' 이 반환된다.", function() {
			var task = new Task({
				id : "1",
				assignees : [ {
				      "id" : 1,
				      "name" : "진범동1",
				      "email" : "test1@daou.co.kr",
				      "position" : "부회장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
			    }]
			});
			
			expect(task.assigneeLabel()).toBe("진범동1 부회장");
		});
		
		
		it("assigneeLabel. 담당자가 여러명인 경우 담당자의 '이름 외 x명' 이 반환된다.", function() {
			var task = new Task({
				id : "1",
				assignees : [ {
				      "id" : 1,
				      "name" : "진범동1",
				      "email" : "test1@daou.co.kr",
				      "position" : "부회장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
			    }, {
				      "id" : 2,
				      "name" : "진범동2",
				      "email" : "test2@daou.co.kr",
				      "position" : "부장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
				    }]
			});
			
			expect(task.assigneeLabel("외", "명")).toBe("진범동1 외 1명");
		});
		
		
		it("creatorLabel. 등록자 라벨가져오기. 이름 + 직급(직급이 있는경우만) 형태의 string 이 반환된다.", function() {
			var task = new Task({
				"creator" : {
					"id" : 1165,
					"name" : "정해운",
					"email" : "hwjung@daou.co.kr",
					"position" : "연구원",
					"thumbnail" : "/thumb/user/small/21613-29318",
					"status" : "ONLINE"
			    }
			});
			
			expect(task.creatorLabel()).toBe("정해운 연구원");
		});
		
		
		it("getEditableAttribute. 업무 등록시 필드 작성 권한 check", function() {
			$.ajaxMock.register('/api/task/attribute/writable/1', {
			    responseText:{
			    	  "data": [
			    	           "NAME",
			    	           "DUEDATE",
			    	           "TAG",
			    	           "FIELD",
			    	           "CONTENT",
			    	           "ASSIGNEE",
			    	           "REFERER",
			    	           "APPROVER"
			    	         ],
			    	         "message": "OK",
			    	         "code": "200",
			    	         "__go_checksum__": true
			    	       },
			    statusCode: 200,
			    status:'OK',
			    type: 'GET'
			});
			
			var task = new Task({
				issueType : {
				      "id" : 1,
				      "name" : "일반업무",
				      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
				      "approver" : false,
				      "fields" : [ ]
				    }
			});
			
			var auth = {
				APPROVER: true,
				ASSIGNEE: true,
				CONTENT: true,
				DUEDATE: true,
				FIELD: true,
				NAME: true,
				PRIVATETASK: false,
				REFERER: true,
				TAG: true	
			};
			
			var editableAttribute = null;
			task.getEditableAttribute().done(function(resp) {
				editableAttribute = resp;
			});
		
			expect(editableAttribute.PRIVATETASK).toEqual(false);
			expect(editableAttribute.PRIVATETASK).toEqual(auth.PRIVATETASK);
		});
		
		
		it("getEditableAttribute. 업무 등록시 필드 작성 권한. issueTypeID 이 없는 경우 default editable 반환", function() {
			var task = new Task({
				issueType : {
					"name" : "일반업무",
					"description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
					"approver" : false,
					"fields" : [ ]
				}
			});
			
			var auth = {
					APPROVER: true,
					ASSIGNEE: true,
					CONTENT: true,
					DUEDATE: true,
					FIELD: true,
					NAME: true,
					PRIVATETASK: true,
					REFERER: true,
					TAG: true	
			};
			
			var editableAttribute = null;
			task.getEditableAttribute().done(function(resp) {
				editableAttribute = resp;
			});
			
			expect(editableAttribute.PRIVATETASK).toBe(true);
			expect(editableAttribute.PRIVATETASK).toBe(auth.PRIVATETASK);
		});
		
		
		it("getEditableAttribute. 업무 수정시 필드 작성 권한 check", function() {
			$.ajaxMock.register('/api/task/1/attribute/editable', {
				responseText:{
					"data": [
					         "NAME",
					         "DUEDATE",
					         "TAG",
					         "FIELD",
					         "CONTENT",
					         "ASSIGNEE",
					         "PRIVATETASK",
					         "APPROVER"
					         ],
					         "message": "OK",
					         "code": "200",
					         "__go_checksum__": true
				},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var task = new Task({
				id : "1"
			});
			
			var auth = {
					APPROVER: true,
					ASSIGNEE: true,
					CONTENT: true,
					DUEDATE: true,
					FIELD: true,
					NAME: true,
					PRIVATETASK: true,
					REFERER: false,
					TAG: true	
			};
			
			var editableAttribute = null;
			task.getEditableAttribute().done(function(resp) {
				editableAttribute = resp;
			});
			
			expect(editableAttribute.REFERER).toBe(false);
			expect(editableAttribute.REFERER).toBe(auth.REFERER);
		});
		
		
		it("getAction. 업무의 action 목록", function() {
			$.ajaxMock.register('/api/task/1/action', {
				responseText:{
					  "data" : [ {
						    "id" : 1,
						    "name" : "업무시작"
						  } ],
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var task = new Task({
				id : "1"
			});
			var action = [ {
			    "id" : 1,
			    "name" : "업무시작"
			  } ];
			
			var actions = null;
			task.getAction().done(function(resp) {
				actions = resp;
			});
	
			expect(actions.length).toBe(action.length);
			expect(actions[0].name).toBe(action[0].name);
		});
		
		
		it("hasAction", function() {
			$.ajaxMock.register('/api/task/1/action', {
				responseText:{
					  "data" : [ {
						    "id" : 1,
						    "name" : "업무시작"
						  } ],
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var task = new Task({
				id : "1"
			});
			var action = [ {
			    "id" : 1,
			    "name" : "업무시작"
			  } ];
			
			var actions = null;
			task.getAction().done(function(resp) {
				actions = resp;
			});
	
			expect(task.hasAction()).toBe(true);
		});
		
		
		it("getUpdatedAt. 모델의 ID가 없으므로 null이 반환된다", function() {
			var task = new Task();
			
			expect(task.getUpdatedAt()).toBe(null);
		});
		

		it("getUpdatedAt. 모델의 ID가 있으므로 현재 시간이 반환된다", function() {
			var task = new Task({
				id : "1"
			});
			var updatedAt = new Date(task.getUpdatedAt());
			var date = new Date();

			expect(updatedAt.getFullYear()).toBe(date.getFullYear());
			expect(updatedAt.getMonth()).toBe(date.getMonth());
			expect(updatedAt.getDate()).toBe(date.getDate());
			expect(updatedAt.getHours()).toBe(date.getHours());
			expect(updatedAt.getMinutes()).toBe(date.getMinutes());
		});

		
		it("getTagLabel. 업데이트 시간을 생성한다. 모델의 ID가 있으므로 현재 시간이 반환된다", function() {
			var task = new Task({
				id : "1",
				tags : [1, 2, 3]
			});
			
			expect(task.getTagLabel()).toBe("1, 2, 3");
		});
		
		
		it("isReadable. 열람이 가능한 업무", function() {
			var task = new Task({
				id : "1",
				actions : {
					readable : true
				}
			});
			
			expect(task.isReadable()).toBe(true);
		});
		
		
		it("isReadable. 열람이 불가능한 업무", function() {
			var task = new Task({
				id : "1",
				actions : {
					readable : false
				}
			});
			
			expect(task.isReadable()).toBe(false);
		});
		
		
		it("getFiles. attach 들의 icon 과 fileSize String 변환 확인", function() {
			var attaches = [ {
			      "id" : 1,
			      "createdAt" : "2014-02-21T13:27:39",
			      "updatedAt" : "2014-02-21T13:27:39",
			      "name" : "팀오피스 서버 구동.docx",
			      "extention" : "docx",
			      "size" : 26407,
			      "preview" : true,
			      "download" : true,
			      "encrypt" : "7fbde11da3b9a408d5e790f3a3281fc1"
			    }, {
			      "id" : 2,
			      "createdAt" : "2014-02-21T13:27:39",
			      "updatedAt" : "2014-02-21T13:27:39",
			      "name" : "팀오피스 서비스 장비 접근.docx",
			      "extention" : "docx",
			      "size" : 424055,
			      "preview" : true,
			      "download" : true,
			      "encrypt" : "483d938edffbf58678cf620882d498d3"
			    }, {
			      "id" : 3,
			      "createdAt" : "2014-02-21T13:29:29",
			      "updatedAt" : "2014-02-21T13:29:29",
			      "name" : "팀오피스 모바일-1.jpg",
			      "extention" : "jpg",
			      "size" : 77379,
			      "thumbLarge" : "/thumb/attach/large/3-77379",
			      "thumbMid" : "/thumb/attach/mid/3-77379",
			      "thumbSmall" : "/thumb/attach/small/3-77379",
			      "preview" : true,
			      "download" : true,
			      "encrypt" : "27013d5477e9a62ef399eef5b21c7090"
			    }, {
			      "id" : 4,
			      "createdAt" : "2014-02-21T13:29:29",
			      "updatedAt" : "2014-02-21T13:29:29",
			      "name" : "팀오피스 모바일-2.jpg",
			      "extention" : "jpg",
			      "size" : 23694,
			      "thumbLarge" : "/thumb/attach/large/4-23694",
			      "thumbMid" : "/thumb/attach/mid/4-23694",
			      "thumbSmall" : "/thumb/attach/small/4-23694",
			      "preview" : true,
			      "download" : true,
			      "encrypt" : "38f00d0a8ff2837bfbf6fb1304e2ddf8"
			    } ];
			
			var task = new Task({
				id : "1",
				attaches : attaches
			});
			
			expect(task.getFiles().length).toBe(2);
			expect(task.getImages().length).toBe(2);
			expect(task.getFiles()[0].icon).toBe("ic_docx");
			expect(task.getFiles()[0].fileSizeString).toBe("25.79KB");
			expect(task.getImages()[0].icon).toBe("ic_jpg");
			expect(task.getImages()[0].fileSizeString).toBe("75.57KB");
		});
	});
});