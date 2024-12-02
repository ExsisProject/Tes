define([
    "task/models/task_department_folder",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	TaskDeptFolder
) {
	describe("taskDepartmentFolder!", function() {
		it("isEmptyfolder. 빈폴더 인가. 빈폴더인 경우", function() {
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : []
			});
			
			expect(deptFolder.isEmptyfolder()).toBe(true);
		});
		
		
		var folder = {
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
		    };
		
		it("url. taskDepartmentFolder URL", function() {
			var deptFolder = new TaskDeptFolder({
				deptId : 1,
				folders : []
			});
			
			expect(deptFolder.url()).toBe("/api/task/folder/dept/1");
		});
		
		
		it("isEmptyfolder. 빈폴더 인가. 빈폴더가 아닌경우", function() {
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : [folder]
			});
			
			expect(deptFolder.isEmptyfolder()).toBe(false);
		});
		
		
		it("getFolders. 폴더만 가져오기. 폴더와 구분선이 있는 경우", function() {
			var folders = [folder, {
			      "id" : 2,
			      "name" : "구분선",
			      "separator" : true
			    } ];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getFolders().length).toBe(1);
			expect(deptFolder.getFolders()[0]).toBe(folders[0]);
		});
		
		
		it("getFolders. 폴더만 가져오기. 폴더만 있는 경우", function() {
			var folders = [folder];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getFolders().length).toBe(1);
			expect(deptFolder.getFolders()[0]).toBe(folders[0]);
		});
		
		
		it("getFolders. 폴더만 가져오기. 구분선만 있는 경우", function() {
			var folders = [{
			      "id" : 2,
			      "name" : "구분선",
			      "separator" : true
			    } ];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getFolders().length).toBe(0);
		});
		
		
		it("getFolders. 폴더만 가져오기. 폴더와 구분선이 없는 경우", function() {
			var folders = [];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getFolders().length).toBe(0);
		});
		
		
		it("getSeparators. 구분선만 가져오기. 폴더와 구분선이 없는 경우", function() {
			var folders = [];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getSeparators().length).toBe(0);
		});
		
		
		it("getSeparators. 구분선만 가져오기. 폴더만 있는 경우", function() {
			var folders = [folder];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getSeparators().length).toBe(0);
		});
		
		
		it("getSeparators. 구분선만 가져오기. 구분선만 있는 경우", function() {
			var folders = [{
			      "id" : 2,
			      "name" : "구분선",
			      "separator" : true
			    }  ];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getSeparators().length).toBe(1);
			expect(deptFolder.getSeparators()[0]).toBe(folders[0]);
		});
		
		
		it("getSeparators. 구분선만 가져오기. 폴더와 구분선이 같이 있는 경우", function() {
			var folders = [folder, {
			      "id" : 2,
			      "name" : "구분선",
			      "separator" : true
			    }  ];
			var deptFolder = new TaskDeptFolder({
				id : 1,
				folders : folders
			});
			
			expect(deptFolder.getSeparators().length).toBe(1);
			expect(deptFolder.getSeparators()[0]).toBe(folders[1]);
		});
	});
});