define([
    "task/models/task_folder",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	TaskFolder
) {
	describe("taskFolder!", function() {
		it("defaults. 폴더 생성 초기값 확인.", function() {
			var taskFolder = new TaskFolder();
			
			expect(taskFolder.id).toBe(null);
			expect(taskFolder.get("name")).toBe("");
			expect(taskFolder.get("types").length).toBe(0);
			expect(taskFolder.get("fields").length).toBe(0);
			expect(taskFolder.get("createdAt")).toBe(null);
			expect(taskFolder.get("updatedAt")).toBe(null);
			expect(taskFolder.get("description")).toBe("");
			expect(taskFolder.get("share").departmentShares.length).toBe(0);
			expect(taskFolder.get("share").domainCodeShares.length).toBe(0);
		});
		
		
		it("id. 폴더 등록시 TaskFolderModel 에는 ID가 없다.", function() {
			var taskFolder = new TaskFolder();

			expect(taskFolder.id).toBe(null);
		});
		
		
		it("id. 폴더 수정시 TaskFolderModel 에는 ID가 있다.", function() {
			var taskFolder = new TaskFolder({id : "1"});
			
			expect(taskFolder.id).not.toBe(null);
		});
		
		
		it("url. 아이디가 없는 폴더 기본 URL.", function() {
			var taskFolder = new TaskFolder();
			
			expect(taskFolder.url()).toBe("/api/task/folder");
			
		});
		
		
		it("url. 아이디가 있는 폴더 기본 URL.", function() {
			var taskFolder = new TaskFolder({id : "1"});
			
			expect(taskFolder.url()).toBe("/api/task/folder/1");
		});
		
		
		it("getDepartment. 폴더의 부서정보 가져오기.", function() {
			$.ajaxMock.register('/api/department/profile/7', {
				responseText:{
					  "data" : {
						    "id" : 7,
						    "name" : "메일팀",
						    "code" : "106",
						    "email" : "dept7@daou.co.kr",
						    "emailId" : "dept7",
						    "memberCount" : 8,
						    "childrenCount" : 1,
						    "parentId" : 3,
						    "parentCode" : "102",
						    "sortOrder" : 0,
						    "depth" : 0,
						    "deletedDept" : false,
						    "masterUserId" : 2,
						    "masterName" : "진범동1",
						    "master" : {
						      "id" : 2,
						      "name" : "진범동1",
						      "email" : "test1@daou.co.kr",
						      "position" : "부회장",
						      "thumbnail" : "/resources/images/photo_profile_small.jpg",
						      "status" : "ONLINE"
						    },
						    "moderators" : [ ],
						    "ancestors" : [ "S/W사업팀" ],
						    "masterPosition" : "부회장"
						  },
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var department = {
				    "id" : 7,
				    "name" : "메일팀",
				    "code" : "106",
				    "email" : "dept7@daou.co.kr",
				    "emailId" : "dept7",
				    "memberCount" : 8,
				    "childrenCount" : 1,
				    "parentId" : 3,
				    "parentCode" : "102",
				    "sortOrder" : 0,
				    "depth" : 0,
				    "deletedDept" : false,
				    "masterUserId" : 2,
				    "masterName" : "진범동1",
				    "master" : {
				      "id" : 2,
				      "name" : "진범동1",
				      "email" : "test1@daou.co.kr",
				      "position" : "부회장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
				    },
				    "moderators" : [ ],
				    "ancestors" : [ "S/W사업팀" ],
				    "masterPosition" : "부회장"
				  }; 
			
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7
			});
			
			var getDepartment = null; 
			taskFolder.getDepartment().done(function(resp) {
				getDepartment = resp.data;
			});
			
			expect(getDepartment).toEqual(department);
		});
		
		
		it("adminLabel. 폴더의 운영자 라벨 반환", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				admins : [ {
				      "id" : 2,
				      "name" : "진범동1",
				      "email" : "test1@daou.co.kr",
				      "position" : "부회장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
				    }, {
				      "id" : 5,
				      "name" : "윤여진2",
				      "email" : "test4@daou.co.kr",
				      "position" : "과장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
				    } ]
			});
			
			expect(taskFolder.adminLabel()).toBe("진범동1 부회장, 윤여진2 과장");
		});
		
		
		it("adminLabel. 폴더의 운영자 minify 라벨 반환. 운영자가 여러명인 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				admins : [ {
				      "id" : 2,
				      "name" : "진범동1",
				      "email" : "test1@daou.co.kr",
				      "position" : "부회장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
				    }, {
				      "id" : 5,
				      "name" : "윤여진2",
				      "email" : "test4@daou.co.kr",
				      "position" : "과장",
				      "thumbnail" : "/resources/images/photo_profile_small.jpg",
				      "status" : "ONLINE"
				    } ]
			});
			
			expect(taskFolder.minAdminLabel("외", "명")).toBe("진범동1 부회장 외 1명");
		});
		
		
		it("adminLabel. 폴더의 운영자 minify 라벨 반환. 운영자가 한명인 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				admins : [ {
					"id" : 2,
					"name" : "진범동1",
					"email" : "test1@daou.co.kr",
					"position" : "부회장",
					"thumbnail" : "/resources/images/photo_profile_small.jpg",
					"status" : "ONLINE"
				}]
			});
			
			expect(taskFolder.minAdminLabel("외", "명")).toBe("진범동1 부회장");
		});
		
		
		it("adminLabel. 폴더의 운영자 minify 라벨 반환. 운영자가 없는 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				admins : []
			});
			
			expect(taskFolder.minAdminLabel("외", "명")).toBe(undefined);
		});
		
		
		it("hasAdmin. 폴더의 운영자가 있는 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				admins : [{
					"id" : 2,
					"name" : "진범동1",
					"email" : "test1@daou.co.kr",
					"position" : "부회장",
					"thumbnail" : "/resources/images/photo_profile_small.jpg",
					"status" : "ONLINE"
				}]
			});
			
			expect(taskFolder.hasAdmin()).toBe(true);
		});
		
		
		it("hasAdmin. 폴더의 운영자가 없는 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				admins : []
			});
			
			expect(taskFolder.hasAdmin()).toBe(false);
		});
		
		
		it("findIssueType. 폴더의 유형이 하나인경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.findIssueType()).toBe(types[0]);
			expect(taskFolder.findIssueType(2)).toBe(types[0]);
		});
		
		
		it("findIssueType. 폴더의 유형이 두개인경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }, {
			      "id" : 2,
			      "name" : "요청업무",
			      "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.findIssueType(1)).toBe(types[0]);
			expect(taskFolder.findIssueType(2)).toBe(types[1]);
		});
		
		
		it("findIssueType. 인자가 잘못된 값인 경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.findIssueType(undefined)).toBe(types[0]);
		});
		
		
		it("getCurrentTypeFields. 인자가 잘못된 값인 경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.getCurrentTypeFields(undefined)).toBe(null);
		});
		
		
		it("getCurrentTypeFields. 찾는 유형이 없는 경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.getCurrentTypeFields(3).length).toBe(0);
		});
		
		
		it("getCurrentTypeFields. 정상적으로 유형의 필드가 반환된다", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : ["가", "나", "다"]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.getCurrentTypeFields(1).length).toBe(3);
			expect(taskFolder.getCurrentTypeFields(1)[0]).toBe("가");
			expect(taskFolder.getCurrentTypeFields(1)[1]).toBe("나");
			expect(taskFolder.getCurrentTypeFields(1)[2]).toBe("다");
		});
		
		
		it("getMovableFolders. 폴더가 두개인 경우. 현재 폴더가 아닌 폴더만 반환", function() {
			$.ajaxMock.register('/api/task/folder/dept/7', {
				responseText:{
					  "data" : {
						    "id" : 7,
						    "name" : "메일팀",
						    "managable" : true,
						    "shared" : false,
						    "deleted" : false,
						    "folders" : [ {
						      "id" : 1,
						      "createdAt" : "2014-02-25T16:44:15",
						      "updatedAt" : "2014-02-25T16:44:15",
						      "deptId" : 7,
						      "departmentName" : "메일팀",
						      "name" : "일반 폴더",
						      "privateTask" : false,
						      "types" : [ {
						        "id" : 1,
						        "name" : "일반업무",
						        "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
						        "approver" : false,
						        "fields" : [ ]
						      } ],
						      "taskCount" : 1,
						      "taskCreatedAt" : "2014-02-26T12:38:57",
						      "admins" : [ {
						        "id" : 2,
						        "name" : "진범동1",
						        "email" : "test1@daou.co.kr",
						        "position" : "부회장",
						        "thumbnail" : "/resources/images/photo_profile_small.jpg",
						        "status" : "ONLINE"
						      } ],
						      "share" : {
						        "id" : 1,
						        "nodes" : [ {
						          "id" : 1,
						          "nodeId" : 7,
						          "nodeType" : "department",
						          "nodeValue" : "메일팀",
						          "members" : [ ]
						        } ]
						      },
						      "attachSize" : 0,
						      "actions" : {
						        "updatable" : false,
						        "removable" : false,
						        "writable" : false,
						        "managable" : true,
						        "readable" : false
						      }
						    }, {
						      "id" : 2,
						      "createdAt" : "2014-03-04T09:44:28",
						      "updatedAt" : "2014-03-04T09:44:28",
						      "deptId" : 7,
						      "departmentName" : "메일팀",
						      "name" : "요청 폴더",
						      "privateTask" : false,
						      "types" : [ {
						        "id" : 2,
						        "name" : "요청업무",
						        "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
						        "approver" : false,
						        "fields" : [ ]
						      } ],
						      "taskCount" : 0,
						      "admins" : [ {
						        "id" : 2,
						        "name" : "진범동1",
						        "email" : "test1@daou.co.kr",
						        "position" : "부회장",
						        "thumbnail" : "/resources/images/photo_profile_small.jpg",
						        "status" : "ONLINE"
						      } ],
						      "share" : {
						        "id" : 2,
						        "nodes" : [ {
						          "id" : 2,
						          "nodeId" : 7,
						          "nodeType" : "department",
						          "nodeValue" : "메일팀",
						          "members" : [ ]
						        } ]
						      },
						      "attachSize" : 0,
						      "actions" : {
						        "updatable" : false,
						        "removable" : false,
						        "writable" : false,
						        "managable" : true,
						        "readable" : false
						      }
						    } ]
						  },
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7
			});
			
			var movableFolders = [ {
			      "id" : 2,
			      "createdAt" : "2014-03-04T09:44:28",
			      "updatedAt" : "2014-03-04T09:44:28",
			      "deptId" : 7,
			      "departmentName" : "메일팀",
			      "name" : "요청 폴더",
			      "privateTask" : false,
			      "types" : [ {
			        "id" : 2,
			        "name" : "요청업무",
			        "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
			        "approver" : false,
			        "fields" : [ ]
			      } ],
			      "taskCount" : 0,
			      "admins" : [ {
			        "id" : 2,
			        "name" : "진범동1",
			        "email" : "test1@daou.co.kr",
			        "position" : "부회장",
			        "thumbnail" : "/resources/images/photo_profile_small.jpg",
			        "status" : "ONLINE"
			      } ],
			      "share" : {
			        "id" : 2,
			        "nodes" : [ {
			          "id" : 2,
			          "nodeId" : 7,
			          "nodeType" : "department",
			          "nodeValue" : "메일팀",
			          "members" : [ ]
			        } ]
			      },
			      "attachSize" : 0,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : true,
			        "readable" : false
			      }
			    } ];
			
			var getMovableFolders = null;
			taskFolder.getMovableFolders().done(function(resp) {
				getMovableFolders = resp;
			});
			
			expect(getMovableFolders).toEqual(movableFolders);
		});
		
		
		it("getMovableFolders. 폴더가 한개인 경우. 빈 배열 반환", function() {
			$.ajaxMock.register('/api/task/folder/dept/7', {
				responseText:{
					"data" : {
						"id" : 7,
						"name" : "메일팀",
						"managable" : true,
						"shared" : false,
						"deleted" : false,
						"folders" : [ {
							"id" : 1,
							"createdAt" : "2014-02-25T16:44:15",
							"updatedAt" : "2014-02-25T16:44:15",
							"deptId" : 7,
							"departmentName" : "메일팀",
							"name" : "일반 폴더",
							"privateTask" : false,
							"types" : [ {
								"id" : 1,
								"name" : "일반업무",
								"description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
								"approver" : false,
								"fields" : [ ]
							} ],
							"taskCount" : 1,
							"taskCreatedAt" : "2014-02-26T12:38:57",
							"admins" : [ {
								"id" : 2,
								"name" : "진범동1",
								"email" : "test1@daou.co.kr",
								"position" : "부회장",
								"thumbnail" : "/resources/images/photo_profile_small.jpg",
								"status" : "ONLINE"
							} ],
							"share" : {
								"id" : 1,
								"nodes" : [ {
									"id" : 1,
									"nodeId" : 7,
									"nodeType" : "department",
									"nodeValue" : "메일팀",
									"members" : [ ]
								} ]
							},
							"attachSize" : 0,
							"actions" : {
								"updatable" : false,
								"removable" : false,
								"writable" : false,
								"managable" : true,
								"readable" : false
							}
						} ]
					},
					"message" : "OK",
					"code" : "200",
					"__go_checksum__" : true
				},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7
			});
			
			var getMovableFolders = null;
			taskFolder.getMovableFolders().done(function(resp) {
				getMovableFolders = resp;
			});
			
			expect(getMovableFolders).toEqual([]);
		});
		
		
		it("getDepartmentShareIds. 부서 공유 아이디. 부서 공유인 경우 공유된 팀의 아이디가 반환된다. 자신의 팀은 제외 ", function() {
			var share = {
		      "id" : 5,
		      "nodes" : [ {
		        "id" : 4,
		        "nodeId" : 6,
		        "nodeType" : "department",
		        "nodeValue" : "캘린더팀",
		        "members" : [ ]
		      }, {
		        "id" : 3,
		        "nodeId" : 7,
		        "nodeType" : "department",
		        "nodeValue" : "메일팀",
		        "members" : [ ]
		      } ]
		    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShareIds()).toEqual([6]);
		});
		
		
		it("getDepartmentShareIds. 부서 공유 아이디. 하위 부서 공유인 경우 공유된 팀의 아이디가 반환된다. 자신의 팀은 제외", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShareIds()).toEqual([9]);
		});
		
		
		it("getDepartmentShareIds. 부서 공유 아이디. 전사 공유인 경우 빈 배열이 반환된다", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShareIds().length).toBe(0);
		});
		
		
		it("getDepartmentShareIds. 부서 공유 아이디. 특정 도메인 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 13,
				        "nodeId" : 2,
				        "nodeType" : "position",
				        "nodeValue" : "부회장",
				        "members" : [ ]
				      }, {
				        "id" : 12,
				        "nodeId" : 1,
				        "nodeType" : "position",
				        "nodeValue" : "회장",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShareIds().length).toBe(0);
		});
		
		
		it("getDomainCodeShareIds. 도메인 공유 아이디. 도메인 공유인 경우 도메인들의 아이디가 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShareIds().length).toBe(2);
			expect(taskFolder.getDomainCodeShareIds()[0]).toBe(2);
			expect(taskFolder.getDomainCodeShareIds()[1]).toBe(1);
		});
		
		
		it("getDomainCodeShareIds. 도메인 공유 아이디. 전사 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShareIds().length).toBe(0);
		});
		
		
		it("getDomainCodeShareIds. 도메인 공유 아이디. 특정 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShareIds().length).toBe(0);
		});
		
		
		it("getDomainCodeShareIds. 도메인 공유 아이디. 하위 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShareIds().length).toBe(0);
		});
		
		
		it("getDepartmentShares. 부서 공유. 특정 부서 공유인 경우 공유된 부서들이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShares().length).toBe(2);
			expect(taskFolder.getDepartmentShares()[0]).toBe(share.nodes[0]);
			expect(taskFolder.getDepartmentShares()[1]).toBe(share.nodes[1]);
		});
		
		
		it("getDepartmentShares. 부서 공유. 하위 부서 공유인 경우 공유된 하위 부서들이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShares().length).toBe(2);
			expect(taskFolder.getDepartmentShares()[0]).toBe(share.nodes[0]);
			expect(taskFolder.getDepartmentShares()[1]).toBe(share.nodes[1]);
		});
		
		
		it("getDepartmentShares. 부서 공유. 전사 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShares().length).toBe(0);
		});
		
		
		it("getDepartmentShares. 부서 공유. 도메인 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDepartmentShares().length).toBe(0);
		});
		
		
		it("getSubDepartmentShares. 하위 부서 공유. 전사 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getSubDepartmentShares().length).toBe(0);
		});
		
		
		it("getSubDepartmentShares. 하위 부서 공유. 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getSubDepartmentShares().length).toBe(0);
		});
		
		
		it("getSubDepartmentShares. 하위 부서 공유. 하위 부서 공유인 경우 하위 부서들이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getSubDepartmentShares().length).toBe(2);
			expect(taskFolder.getSubDepartmentShares()[0]).toBe(share.nodes[0]);
			expect(taskFolder.getSubDepartmentShares()[1]).toBe(share.nodes[1]);
		});
		
		
		it("getSubDepartmentShares. 하위 부서 공유. 도메인 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getSubDepartmentShares().length).toBe(0);
		});
		
		
		it("getDomainCodeShares. 도메인 공유. 도메인 공유인 경우 도메인들이 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShares().length).toBe(2);
			expect(taskFolder.getDomainCodeShares()[0]).toBe(share.nodes[0]);
			expect(taskFolder.getDomainCodeShares()[1]).toBe(share.nodes[1]);
		});
		
		
		it("getDomainCodeShares. 도메인 공유. 전사 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShares().length).toBe(0);
		});
		
		
		it("getDomainCodeShares. 도메인 공유. 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShares().length).toBe(0);
		});
		
		
		it("getDomainCodeShares. 도메인 공유. 하위 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getDomainCodeShares().length).toBe(0);
		});
		
		
		it("getCompanyShare. 전사 공유. 하위 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 10,
						"nodeId" : 7,
						"nodeType" : "subdepartment",
						"nodeValue" : "메일팀",
						"members" : [ ]
					}, {
						"id" : 9,
						"nodeId" : 9,
						"nodeType" : "subdepartment",
						"nodeValue" : "주소록팀",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getCompanyShare().length).toBe(0);
		});
		
		
		it("getCompanyShare. 전사 공유. 부서 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getCompanyShare().length).toBe(0);
		});
		
		
		it("getCompanyShare. 전사 공유. 전사 공유인 경우 전사 공유 정보가 반환된다.", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getCompanyShare().length).toBe(1);
			expect(taskFolder.getCompanyShare()[0]).toBe(share.nodes[0]);
		});
		
		
		it("getCompanyShare. 전사 공유. 도메인 공유인 경우 빈 배열이 반환된다.", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.getCompanyShare().length).toBe(0);
		});
		
		
		it("isNews. 가장 최근에 등록된 업무가 1일 이내에 등록된 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				taskCreatedAt : new Date()
			});
			
			expect(taskFolder.isNews()).toEqual(true);
		});
		
		
		it("isNews. 가장 최근에 등록된 업무가 1일 전에 등록된 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				taskCreatedAt : "2014-02-22T13:46:17"
			});
			
			expect(taskFolder.isNews()).toBe(false);
		});
		
		
		it("isNews. 폴더에 새로 등록된 업무가 없는경우", function() {
			var taskFolder = new TaskFolder({
				id : "1"
			});
			
			expect(taskFolder.isNews()).toBe(false);
		});
		
		
		it("isPrivate. 접근 제한 폴더인가. 도메인 공유인 경우", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isPrivate()).toBe(true);
		});
		
		
		it("isPrivate. 접근 제한 폴더인가. 전사 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isPrivate()).toBe(false);
		});
		
		
		it("isPrivate. 접근 제한 폴더인가. 부서 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isPrivate()).toBe(false);
		});
		
		
		it("isPrivate. 접근 제한 폴더인가. 하위 부서 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isPrivate()).toBe(false);
		});
		
		
		it("isPrivate. 접근 제한 폴더인가. 특정 멤버 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : []
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ {
				            "id" : 2,
				            "name" : "진범동1",
				            "email" : "test1@daou.co.kr",
				            "position" : "부회장",
				            "thumbnail" : "/resources/images/photo_profile_small.jpg",
				            "status" : "ONLINE"
				          }, {
				            "id" : 10,
				            "name" : "최경영1",
				            "email" : "test9@daou.co.kr",
				            "position" : "회장",
				            "thumbnail" : "/resources/images/photo_profile_small.jpg",
				            "status" : "ONLINE"
				          } ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isPrivate()).toBe(true);
		});
		
		
		it("isShare. 공유 폴더인가. 부서공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isShare()).toBe(true);
		});
		
		
		it("isShare. 공유 폴더인가. 하위 부서공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isShare()).toBe(true);
		});
		
		
		it("isShare. 공유 폴더인가. 전사 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isShare()).toBe(false);
		});
		
		
		it("isShare. 공유 폴더인가. 도메인 공유인 경우", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isShare()).toBe(false);
		});
		
		
		it("isSubDepartmentShare. 하위부서 공유 인가. 부서 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 4,
				        "nodeId" : 6,
				        "nodeType" : "department",
				        "nodeValue" : "캘린더팀",
				        "members" : [ ]
				      }, {
				        "id" : 3,
				        "nodeId" : 7,
				        "nodeType" : "department",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isSubDepartmentShare()).toBe(false);
		});
		
		
		it("isSubDepartmentShare. 하위부서 공유 인가. 하위 부서 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 10,
				        "nodeId" : 7,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "메일팀",
				        "members" : [ ]
				      }, {
				        "id" : 9,
				        "nodeId" : 9,
				        "nodeType" : "subdepartment",
				        "nodeValue" : "주소록팀",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isSubDepartmentShare()).toBe(true);
		});
		
		
		it("isSubDepartmentShare. 하위부서 공유 인가. 전사 공유인 경우", function() {
			var share = {
				      "id" : 5,
				      "nodes" : [ {
				        "id" : 11,
				        "nodeId" : 1,
				        "nodeType" : "company",
				        "nodeValue" : "daou",
				        "members" : [ ]
				      } ]
				    };
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isSubDepartmentShare()).toBe(false);
		});
		
		
		it("isSubDepartmentShare. 하위부서 공유 인가. 도메인 공유인 경우", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
				};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isSubDepartmentShare()).toBe(false);
		});
		
		
		it("isDepartmentShare. 부서 공유 인가. 부서 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 4,
						"nodeId" : 6,
						"nodeType" : "department",
						"nodeValue" : "캘린더팀",
						"members" : [ ]
					  }, {
						"id" : 3,
						"nodeId" : 7,
						"nodeType" : "department",
						"nodeValue" : "메일팀",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDepartmentShare()).toBe(true);
		});
		
		
		it("isDepartmentShare. 부서 공유 인가. 하위 부서 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 10,
						"nodeId" : 7,
						"nodeType" : "subdepartment",
						"nodeValue" : "메일팀",
						"members" : [ ]
					  }, {
						"id" : 9,
						"nodeId" : 9,
						"nodeType" : "subdepartment",
						"nodeValue" : "주소록팀",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDepartmentShare()).toBe(true);
		});
		
		
		it("isDepartmentShare. 부서 공유 인가. 전사 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 11,
						"nodeId" : 1,
						"nodeType" : "company",
						"nodeValue" : "daou",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDepartmentShare()).toBe(false);
		});
		
		
		it("isDepartmentShare. 부서 공유 인가. 도메인 공유인 경우", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
				};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDepartmentShare()).toBe(false);
		});
		
		
		it("isCompanyShare. 전사 공유 인가. 부서 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 4,
						"nodeId" : 6,
						"nodeType" : "department",
						"nodeValue" : "캘린더팀",
						"members" : [ ]
					  }, {
						"id" : 3,
						"nodeId" : 7,
						"nodeType" : "department",
						"nodeValue" : "메일팀",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isCompanyShare()).toBe(false);
		});
		
		
		it("isCompanyShare. 전사 공유 인가. 하위 부서 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 10,
						"nodeId" : 7,
						"nodeType" : "subdepartment",
						"nodeValue" : "메일팀",
						"members" : [ ]
					  }, {
						"id" : 9,
						"nodeId" : 9,
						"nodeType" : "subdepartment",
						"nodeValue" : "주소록팀",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isCompanyShare()).toBe(false);
		});
		
		
		it("isCompanyShare. 전사 공유 인가. 전사 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 11,
						"nodeId" : 1,
						"nodeType" : "company",
						"nodeValue" : "daou",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isCompanyShare()).toBe(true);
		});
		
		
		it("isCompanyShare. 전사 공유 인가. 도메인 공유인 경우", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
				};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isCompanyShare()).toBe(true);
		});
		
		
		it("isDomainCodeShare. 도메인 공유 인가. 부서 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 4,
						"nodeId" : 6,
						"nodeType" : "department",
						"nodeValue" : "캘린더팀",
						"members" : [ ]
					  }, {
						"id" : 3,
						"nodeId" : 7,
						"nodeType" : "department",
						"nodeValue" : "메일팀",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDomainCodeShare()).toBe(false);
		});
		
		
		it("isDomainCodeShare. 도메인 공유 인가. 하위 부서 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 10,
						"nodeId" : 7,
						"nodeType" : "subdepartment",
						"nodeValue" : "메일팀",
						"members" : [ ]
					  }, {
						"id" : 9,
						"nodeId" : 9,
						"nodeType" : "subdepartment",
						"nodeValue" : "주소록팀",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDomainCodeShare()).toBe(false);
		});
		
		
		it("isDomainCodeShare. 도메인 공유 인가. 전사 공유인 경우", function() {
			var share = {
					  "id" : 5,
					  "nodes" : [ {
						"id" : 11,
						"nodeId" : 1,
						"nodeType" : "company",
						"nodeValue" : "daou",
						"members" : [ ]
					  } ]
					};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDomainCodeShare()).toBe(false);
		});
		
		
		it("isDomainCodeShare. 도메인 공유 인가. 도메인 공유인 경우", function() {
			var share = {
					"id" : 5,
					"nodes" : [ {
						"id" : 13,
						"nodeId" : 2,
						"nodeType" : "position",
						"nodeValue" : "부회장",
						"members" : [ ]
					}, {
						"id" : 12,
						"nodeId" : 1,
						"nodeType" : "position",
						"nodeValue" : "회장",
						"members" : [ ]
					} ]
			};
			var taskFolder = new TaskFolder({
				id : "1",
				deptId : 7,
				share : share
			});
			
			expect(taskFolder.isDomainCodeShare()).toBe(true);
		});
		
		
		it("isMultiType. 다중 유형인가. 유형이 여러개인 경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }, {
			      "id" : 2,
			      "name" : "요청업무",
			      "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.isMultiType()).toBe(true);
		});
		
		
		it("isMultiType. 다중 유형인가. 유형이 하나인 경우", function() {
			var types = [{
				"id" : 1,
				"name" : "일반업무",
				"description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
				"approver" : false,
				"fields" : [ ]
			}];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.isMultiType()).toBe(false);
		});
		
		
		it("getIssueTypes. 유형 가져오기. 유형이 하나인 경우", function() {
			var types = [{
				"id" : 1,
				"name" : "일반업무",
				"description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
				"approver" : false,
				"fields" : [ ]
			}];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.getIssueTypes().length).toBe(1);
			expect(taskFolder.getIssueTypes()[0]).toBe(types[0]);
		});
		
		
		it("getIssueTypes. 유형 가져오기. 유형이 여러개인 경우", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }, {
			      "id" : 2,
			      "name" : "요청업무",
			      "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.getIssueTypes().length).toBe(2);
			expect(taskFolder.getIssueTypes()[0]).toBe(types[0]);
			expect(taskFolder.getIssueTypes()[1]).toBe(types[1]);
		});
		
		
		it("defaultType. 유형 가져오기. 유형이 없는 경우", function() {
			var taskFolder = new TaskFolder({
				id : "1",
				types : []
			});
			
			expect(taskFolder.getIssueTypes().length).toBe(0);
		});
		
		
		it("defaultType. 기본 유형. 폴더 등록시", function() {
			var taskFolder = new TaskFolder({});
			
			expect(taskFolder.defaultType().id).toBe(undefined);
		});
		
		
		it("defaultType. 기본 유형. 폴더 수정시", function() {
			var types = [{
			      "id" : 1,
			      "name" : "일반업무",
			      "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }, {
			      "id" : 2,
			      "name" : "요청업무",
			      "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
			      "approver" : false,
			      "fields" : [ ]
			    }];
			var taskFolder = new TaskFolder({
				id : "1",
				types : types
			});
			
			expect(taskFolder.defaultType()).toBe(types[0]);
		});
		
		
		it("getPredefinedField. 미리 정의된 필드 가져오기", function() {
			$.ajaxMock.register('/api/task/field/predefined', {
				responseText:{
					  "data" : [ {
						    "id" : 1,
						    "name" : "중요도",
						    "required" : true,
						    "type" : "SELECT",
						    "defaultValue" : "상",
						    "options" : [ "상", "중", "하" ]
						  }, {
						    "id" : 2,
						    "name" : "긴급",
						    "required" : false,
						    "type" : "BOOLEAN",
						    "defaultValue" : "true",
						    "options" : [ ]
						  }, {
						    "id" : 3,
						    "name" : "특이사항",
						    "required" : false,
						    "type" : "TEXT",
						    "options" : [ ]
						  } ],
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var fields = [ {
						    "id" : 1,
						    "name" : "중요도",
						    "required" : true,
						    "type" : "SELECT",
						    "defaultValue" : "상",
						    "options" : [ "상", "중", "하" ]
						  }, {
						    "id" : 2,
						    "name" : "긴급",
						    "required" : false,
						    "type" : "BOOLEAN",
						    "defaultValue" : true,
						    "options" : [ ]
						  }, {
						    "id" : 3,
						    "name" : "특이사항",
						    "required" : false,
						    "type" : "TEXT",
						    "options" : [ ]
						  } ];
			
			var taskFolder = new TaskFolder({
				id : "1"
			});
			
			var predefinedField = null; 
			taskFolder.getPredefinedField().done(function(resp) {
				predefinedField = resp;
			}); 
			
			expect(predefinedField[0].id).toEqual(fields[0].id);
			expect(predefinedField[1].name).toEqual(fields[1].name);
			expect(predefinedField[2].type).toEqual(fields[2].type);
			expect(_.find(predefinedField, function(field) {
				return field.type == "BOOLEAN";
			}).defaultValue).toBe(true);
		});
		
		
		it("getTaskType. 업무 유형 목록 가져오기", function() {
			$.ajaxMock.register('/api/task/type', {
				responseText:{
					  "data" : [ {
						    "id" : 1,
						    "name" : "일반업무",
						    "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
						    "approver" : false,
						    "fields" : [ ]
						  }, {
						    "id" : 2,
						    "name" : "요청업무",
						    "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
						    "approver" : false,
						    "fields" : [ ]
						  } ],
						  "message" : "OK",
						  "code" : "200",
						  "__go_checksum__" : true
						},
				statusCode: 200,
				status:'OK',
				type: 'GET'
			});
			
			var types = [ {
			    "id" : 1,
			    "name" : "일반업무",
			    "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			    "isApprover" : false,
			    "checked" : true
			  }, {
			    "id" : 2,
			    "name" : "요청업무",
			    "description" : "부서내 또는 타부서와 협업하는 일이 많을 때 사용하는 유형입니다. 요청자가 업무를 요청하면 폴더 운영자가 업무의 담당자를 지정하고 업무가 처리되면 요청자가 최종 확인 후, 업무를 종료하는 형태입니다.",
			    "isApprover" : false,
			    "checked" : false
			  } ];
			
			var taskFolder = new TaskFolder({
				id : "1"
			});
			
			var getTaskTypes = null;
			taskFolder.getTaskType().done(function(resp) {
				getTaskTypes = resp;
			});
			
			expect(getTaskTypes[0].id).toEqual(types[0].id);
			expect(getTaskTypes[1].id).toEqual(types[1].id);
		});
		
		
		it("getRequiredFields. 필수 항목. 필수항목이 있는 경우", function() {
			var fields = [ {
			      "id" : 7,
			      "name" : "중요도",
			      "required" : true,
			      "type" : "SELECT",
			      "defaultValue" : "상",
			      "options" : [ "상", "중", "하" ]
			    }, {
			      "id" : 8,
			      "name" : "긴급",
			      "required" : false,
			      "type" : "BOOLEAN",
			      "defaultValue" : "true",
			      "options" : [ ]
			    }, {
			      "id" : 9,
			      "name" : "특이사항",
			      "required" : false,
			      "type" : "TEXT",
			      "options" : [ ]
			    } ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getRequiredFields().length).toBe(1);
			expect(taskFolder.getRequiredFields()[0].id).toBe(7);
		});
		
		
		it("getRequiredFields. 필수 항목. 필수항목이 없는 경우", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : false,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : false,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : false,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getRequiredFields().length).toBe(0);
		});
		
		
		it("getRequiredSelectFields. 선택형 필수 항목이 있는경우", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : true,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : true,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : true,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getRequiredSelectFields().length).toBe(1);
			expect(taskFolder.getRequiredSelectFields()[0].id).toBe(7);
		});
		
		
		it("getRequiredSelectFields. 선택형 필수 항목이 없는경우", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : false,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : false,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : false,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getRequiredSelectFields().length).toBe(0);
		});
		
		
		
		it("getRequiredTextFields. 텍스트형 필수 항목이 있는경우", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : true,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : true,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : true,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getRequiredTextFields().length).toBe(1);
			expect(taskFolder.getRequiredTextFields()[0].id).toBe(9);
		});
		
		
		it("getRequiredTextFields. 텍스트형 필수 항목이 없는경우", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : false,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : false,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : false,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getRequiredTextFields().length).toBe(0);
		});
		
		
		it("getTextFields. 텍스트형 필드를 가져온다.", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : false,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : false,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : false,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields 
			});
			
			expect(taskFolder.getTextFields().length).toBe(1);
		});
		
		
		it("fieldParser. 확인형의 defaultValue 는 string Boolean 값이므로 변환을 해줘야 한다", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : false,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : false,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : false,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1"
			});
			
			expect(taskFolder.fieldParser(fields)[1].defaultValue).toBe(true);
		});
		
		
		it("parsedFields. 확인형의 defaultValue 는 string Boolean 값이므로 변환을 해줘야 한다", function() {
			var fields = [ {
				"id" : 7,
				"name" : "중요도",
				"required" : false,
				"type" : "SELECT",
				"defaultValue" : "상",
				"options" : [ "상", "중", "하" ]
			}, {
				"id" : 8,
				"name" : "긴급",
				"required" : false,
				"type" : "BOOLEAN",
				"defaultValue" : "true",
				"options" : [ ]
			}, {
				"id" : 9,
				"name" : "특이사항",
				"required" : false,
				"type" : "TEXT",
				"options" : [ ]
			} ];
			var taskFolder = new TaskFolder({
				id : "1",
				fields : fields
			});
			
			expect(taskFolder.parsedFields()[1].defaultValue).toBe(true);
		});
	});
});