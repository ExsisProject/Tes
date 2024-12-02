define([
    "task/collections/task_department_folders",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	DeptFolders
) {
	describe("taskDepartmentFolders!", function() {
		it("initialize. 초기 type 설정", function() {
			var deptFolders1 = new DeptFolders({
				type : "dept"
			});
			
			var deptFolders2 = new DeptFolders({
				type : "public"
			});
			
			expect(deptFolders1.type).toBe("dept");
			expect(deptFolders2.type).toBe("public");
		});
		
		
		it("url. URL 확인", function() {
			var deptFolders1 = new DeptFolders({
				type : "stop"
			});
			
			var deptFolders2 = new DeptFolders({
				type : "public"
			});
			
			expect(deptFolders1.url()).toBe("/api/task/folder/stop?size=1");
			expect(deptFolders2.url()).toBe("/api/task/folder/public");
		});
		
		
		it("getFolders. folder 목록 가져오기", function() {
			var depts = [ {
			    "id" : 24,
			    "name" : "구매팀",
			    "managable" : false,
			    "shared" : true,
			    "deleted" : false,
			    "folders" : [ {
			      "id" : 96,
			      "createdAt" : "2014-06-24T10:34:41",
			      "updatedAt" : "2014-06-24T10:39:07",
			      "deptId" : 24,
			      "departmentName" : "구매팀",
			      "name" : "외부 용역 소싱 관련",
			      "privateTask" : false,
			      "types" : [ {
			        "id" : 1,
			        "name" : "일반업무",
			        "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			        "approver" : false,
			        "fields" : [ ]
			      } ],
			      "taskCount" : 0,
			      "admins" : [ {
			        "id" : 464,
			        "name" : "황진국",
			        "email" : "jghwang@daou.co.kr",
			        "position" : "부장",
			        "thumbnail" : "/thumb/user/small/22448-114119",
			        "status" : "ONLINE"
			      } ],
			      "share" : {
			        "id" : 2009,
			        "nodes" : [ {
			          "id" : 11641,
			          "nodeId" : 4,
			          "nodeType" : "company",
			          "nodeValue" : "(주)다우기술",
			          "members" : [ ]
			        } ]
			      },
			      "attachSize" : 0,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      }
			    } ]
			  }, {
			    "id" : 61,
			    "name" : "GroupWare개발팀",
			    "managable" : true,
			    "shared" : false,
			    "deleted" : false,
			    "folders" : [ {
			      "id" : 140,
			      "createdAt" : "2014-08-20T14:58:01",
			      "updatedAt" : "2014-08-20T14:58:01",
			      "deptId" : 61,
			      "departmentName" : "GroupWare개발팀",
			      "name" : "전사 공유 폴더",
			      "privateTask" : false,
			      "types" : [ {
			        "id" : 1,
			        "name" : "일반업무",
			        "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			        "approver" : false,
			        "fields" : [ ]
			      } ],
			      "taskCount" : 0,
			      "admins" : [ {
			        "id" : 1165,
			        "name" : "정해운",
			        "email" : "hwjung@daou.co.kr",
			        "position" : "연구원",
			        "thumbnail" : "/thumb/user/small/21613-29318",
			        "status" : "ONLINE"
			      } ],
			      "share" : {
			        "id" : 2680,
			        "nodes" : [ {
			          "id" : 15123,
			          "nodeId" : 4,
			          "nodeType" : "company",
			          "nodeValue" : "(주)다우기술",
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
			  }, {
			    "id" : 59,
			    "name" : "기획팀",
			    "managable" : false,
			    "shared" : true,
			    "deleted" : false,
			    "folders" : [ {
			      "id" : 45,
			      "createdAt" : "2014-03-13T17:47:42",
			      "updatedAt" : "2014-08-06T00:53:46",
			      "deptId" : 59,
			      "departmentName" : "기획팀",
			      "name" : "Portal 개선요청",
			      "privateTask" : false,
			      "types" : [ {
			        "id" : 9,
			        "name" : "다우포탈 요청처리",
			        "description" : "⊙처리 프로세스\n -대기: 사용자가 이슈를 올리면 대기상태가 됩니다.\n -접수: 이슈가 지라에 등록되면 접수상태가 됩니다.\n -완료: 지라에 등록된 이슈가 처리되면 완료상태가 됩니다.\n\n※개선이슈는 구글 문서에 등록되면 바로 완료상태가 됩니다.",
			        "approver" : false,
			        "fields" : [ ]
			      } ],
			      "taskCount" : 111,
			      "taskCreatedAt" : "2014-08-05T17:28:20",
			      "admins" : [ {
			        "id" : 888,
			        "name" : "최세범",
			        "email" : "csb0408@daou.co.kr",
			        "position" : "주임연구원",
			        "thumbnail" : "/thumb/user/small/22782-15333",
			        "status" : "ONLINE"
			      }, {
			        "id" : 1940,
			        "name" : "신소영",
			        "email" : "ssy0746@daou.co.kr",
			        "position" : "",
			        "thumbnail" : "/thumb/user/small/22262-46643",
			        "status" : "ONLINE"
			      }, {
			        "id" : 306,
			        "name" : "박찬욱",
			        "email" : "pcwook@daou.co.kr",
			        "position" : "선임연구원",
			        "thumbnail" : "/thumb/user/small/3924-63962",
			        "status" : "ONLINE"
			      }, {
			        "id" : 945,
			        "name" : "진범동",
			        "email" : "pleaseroot@daou.co.kr",
			        "position" : "연구원",
			        "thumbnail" : "/thumb/user/small/4021-882465",
			        "status" : "ONLINE"
			      } ],
			      "share" : {
			        "id" : 1323,
			        "nodes" : [ {
			          "id" : 11416,
			          "nodeId" : 4,
			          "nodeType" : "company",
			          "nodeValue" : "(주)다우기술",
			          "members" : [ ]
			        } ]
			      },
			      "attachSize" : 9772840,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      }
			    } ]
			  }, {
			    "id" : 125,
			    "name" : "SeM팀",
			    "managable" : false,
			    "shared" : true,
			    "deleted" : false,
			    "folders" : [ {
			      "id" : 67,
			      "createdAt" : "2014-04-17T10:42:42",
			      "updatedAt" : "2014-07-24T00:45:25",
			      "deptId" : 125,
			      "departmentName" : "SeM팀",
			      "name" : "IT지원",
			      "privateTask" : false,
			      "types" : [ {
			        "id" : 1,
			        "name" : "일반업무",
			        "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			        "approver" : false,
			        "fields" : [ ]
			      } ],
			      "taskCount" : 362,
			      "taskCreatedAt" : "2014-07-28T08:27:48",
			      "admins" : [ {
			        "id" : 1888,
			        "name" : "김도현",
			        "email" : "kimdh@daou.co.kr",
			        "position" : "사원",
			        "thumbnail" : "/thumb/user/small/8847-78991",
			        "status" : "ONLINE"
			      }, {
			        "id" : 210,
			        "name" : "강대웅",
			        "email" : "dwkang@daou.co.kr",
			        "position" : "과장",
			        "thumbnail" : "/thumb/user/small/6524-5944",
			        "status" : "ONLINE"
			      }, {
			        "id" : 1912,
			        "name" : "박재승",
			        "email" : "choos77@daou.co.kr",
			        "position" : "사원",
			        "thumbnail" : "/thumb/user/small/10796-10530",
			        "status" : "ONLINE"
			      }, {
			        "id" : 386,
			        "name" : "이준",
			        "email" : "leejun7@daou.co.kr",
			        "position" : "과장",
			        "thumbnail" : "/thumb/user/small/6379-30123",
			        "status" : "ONLINE"
			      }, {
			        "id" : 380,
			        "name" : "이용진",
			        "email" : "yjlee@daou.co.kr",
			        "position" : "과장",
			        "thumbnail" : "/thumb/user/small/6530-38287",
			        "status" : "ONLINE"
			      } ],
			      "share" : {
			        "id" : 1619,
			        "nodes" : [ {
			          "id" : 14000,
			          "nodeId" : 4,
			          "nodeType" : "company",
			          "nodeValue" : "(주)다우기술",
			          "members" : [ ]
			        } ]
			      },
			      "attachSize" : 207639805,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      }
			    } ]
			  } ];
			var folders = [ {
			      "id" : 96,
			      "createdAt" : "2014-06-24T10:34:41",
			      "updatedAt" : "2014-06-24T10:39:07",
			      "deptId" : 24,
			      "departmentName" : "구매팀",
			      "name" : "외부 용역 소싱 관련",
			      "privateTask" : false,
			      "types" : [ {
			        "id" : 1,
			        "name" : "일반업무",
			        "description" : "대기 -> 진행 -> 완료 순의 상태가 변경되며, 업무 처리 담당자가 업무를 종료시키는 업무 형태입니다.",
			        "approver" : false,
			        "fields" : [ ]
			      } ],
			      "taskCount" : 0,
			      "admins" : [ {
			        "id" : 464,
			        "name" : "황진국",
			        "email" : "jghwang@daou.co.kr",
			        "position" : "부장",
			        "thumbnail" : "/thumb/user/small/22448-114119",
			        "status" : "ONLINE"
			      } ],
			      "share" : {
			        "id" : 2009,
			        "nodes" : [ {
			          "id" : 11641,
			          "nodeId" : 4,
			          "nodeType" : "company",
			          "nodeValue" : "(주)다우기술",
			          "members" : [ ]
			        } ]
			      },
			      "attachSize" : 0,
			      "actions" : {
			        "updatable" : false,
			        "removable" : false,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      }
			    } ];
			var deptFolders = new DeptFolders({
				type : "public"
			});
			
			deptFolders.set(depts);
			
			expect(deptFolders.getFolders().length).toBe([].length);
			expect(deptFolders.getFolders(24).length).toBe(folders.length);
		});
	});
});