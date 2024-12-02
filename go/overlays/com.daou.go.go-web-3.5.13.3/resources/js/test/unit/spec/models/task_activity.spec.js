define([
    "task/models/task_activity",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	TaskActivity
) {
	describe("taskActivity!", function() {
		
		it("url. taskActivity URL. 아이디가 있는 경우", function() {
			var activity = new TaskActivity({
				id : 1,
				taskId : 2
			});
			
			expect(activity.url()).toBe("/api/task/2/activity/1");
		});
		
		
		it("url. taskActivity URL. 아이디가 없는 경우", function() {
			var activity = new TaskActivity({
				taskId : 2
			});
			
			expect(activity.url()).toBe("/api/task/2/activity");
		});
		
		
		it("setTaskId. activity 의 taskId 설정", function() {
			var activity = new TaskActivity({
				id : 1
			});
			
			activity.setTaskId(2);
			
			expect(activity.taskId).toBe(2);
		});
		
		
		it("commentPresent. activity에 comment가 있는가. 코멘트가 있는 경우", function() {
			var activity = new TaskActivity({
				id : 1,
				commentCount : 1
			});
			
			expect(activity.get("commentCount")).toBe(1);
			expect(activity.commentPresent()).toBe(true);
		});
		
		
		it("commentPresent. activity에 comment가 있는가. 코멘트가 없는 경우", function() {
			var activity = new TaskActivity({
				id : 1
			});
			
			expect(activity.get("commentCount")).toBe(0);
			expect(activity.commentPresent()).toBe(false);
		});
		
		
		it("createdAt. taskActivity의 생성일 포맷", function() {
			var date = new Date();
			var activity = new TaskActivity({
				id : 1,
				createdAt : date
			});
			
			expect(activity.createdAt()).toBe(GO.util.basicDate3(date));
		});
		
		
		it("isModify. 수정된 활동기록인가. 수정되지 않은 활동기록", function() {
			var date = new Date();
			var activity = new TaskActivity({
				id : 1,
				createdAt : date,
				updatedAt : date
			});
			
			expect(activity.isModify()).toBe(false);
		});
		
		
		it("isModify. 수정된 활동기록인가. 수정된 활동기록", function() {
			var date = new Date();
			var activity = new TaskActivity({
				id : 1,
				createdAt : "2014-02-22T13:46:17",
				updatedAt : date
			});
			
			expect(activity.isModify()).toBe(true);
		});
		
		
		it("modifyTime. 수정시간 가져오기. 수정되지 않은 활동기록", function() {
			var date = new Date();
			var activity = new TaskActivity({
				id : 1,
				createdAt : date,
				updatedAt : date
			});
			
			expect(activity.modifyTime()).toBe(date);
		});
		
		
		it("modifyTime. 수정시간 가져오기. 수정된 활동기록", function() {
			var date = new Date();
			var activity = new TaskActivity({
				id : 1,
				createdAt : "2014-02-22T13:46:17",
				updatedAt : date
			});
			
			expect(activity.modifyTime()).toBe(date);
		});
		
		
		it("hasAttach. 첨부파일이 있는가. 첨부파일이 있는 활동기록", function() {
			var attaches = [ {
			      "id" : 11,
			      "createdAt" : "2014-03-04T16:00:15",
			      "updatedAt" : "2014-03-04T16:00:15",
			      "name" : "teamoffice1.png",
			      "extention" : "png",
			      "size" : 126331,
			      "thumbLarge" : "/thumb/attach/large/11-126331",
			      "thumbMid" : "/thumb/attach/mid/11-126331",
			      "thumbSmall" : "/thumb/attach/small/11-126331",
			      "preview" : true,
			      "download" : true,
			      "encrypt" : "d164aa7641a648b8c4ae4b42034123ee"
			    } ];
			
			var activity = new TaskActivity({
				id : 1,
				attaches : attaches
			});
			
			expect(activity.hasAttach()).toBe(true);
		});
		
		
		it("hasAttach. 첨부파일이 있는가. 첨부파일이 없는 활동기록", function() {
			var attaches = [];
			
			var activity = new TaskActivity({
				id : 1,
				attaches : attaches
			});
			
			expect(activity.hasAttach()).toBe(false);
		});
		
		
		it("hasMobileContent. 모바일function. 내용을 가지고 있는가.", function() {
			var activity = new TaskActivity({
				id : 1,
				content : "<p>활동기록1</p>"
			});
			
			expect(activity.hasMobileContent()).toBe(true);
		});
		
		
		it("hasMobileContent. 모바일function. 내용이 없는 경우.", function() {
			var activity = new TaskActivity({
				id : 1,
				content : ""
			});
			
			expect(activity.hasMobileContent()).toBe(false);
		});
		
		
		it("hasMoreComment. 댓글이 더 있는가.", function() {
			var activity = new TaskActivity({
			    "id" : 2460,
			    "createdAt" : "2014-08-20T15:30:10",
			    "updatedAt" : "2014-08-20T15:30:10",
			    "writer" : {
			      "id" : 1165,
			      "name" : "정해운",
			      "email" : "hwjung@daou.co.kr",
			      "position" : "연구원",
			      "thumbnail" : "/thumb/user/small/21613-29318",
			      "status" : "ONLINE"
			    },
			    "content" : "<p>활동기록1</p><p>&nbsp;</p><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #cccccc; border-left:0; border-bottom:0;\" class=\"__se_tbl\"><tbody>\n<tr><td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;<b>​ㅁㄴㅇㅁㄴㅇ</b></p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;<u>​ㅁㄴㅇㅁㄴㅇ</u></p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;<i>​ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</i></p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;<strike>​ㅁㄴㅇㅁㄴㅇㅁㄴㅇ</strike></p></td>\n</tr>\n<tr><td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n</tr>\n<tr><td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n</tr>\n<tr><td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n<td style=\"border:1px solid #cccccc; border-top:0; border-right:0; background-color:#ffffff\" width=\"170\"><p>&nbsp;</p></td>\n</tr>\n</tbody>\n</table>",
			    "attaches" : [ ],
			    "comments" : [ {
			      "id" : 12993,
			      "createdAt" : "2014-08-20T15:37:39",
			      "updatedAt" : "2014-08-20T15:37:39",
			      "ownerId" : 2460,
			      "message" : "댓글4",
			      "writer" : {
			        "id" : 1165,
			        "name" : "정해운",
			        "email" : "hwjung@daou.co.kr",
			        "position" : "연구원",
			        "thumbnail" : "/thumb/user/small/21613-29318",
			        "status" : "ONLINE"
			      },
			      "thread" : 12993,
			      "attaches" : [ ],
			      "replyCount" : 0,
			      "actions" : {
			        "updatable" : true,
			        "removable" : true,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      },
			      "writerId" : 1165
			    }, {
			      "id" : 12994,
			      "createdAt" : "2014-08-20T15:37:42",
			      "updatedAt" : "2014-08-20T15:37:42",
			      "ownerId" : 2460,
			      "message" : "댓글5",
			      "writer" : {
			        "id" : 1165,
			        "name" : "정해운",
			        "email" : "hwjung@daou.co.kr",
			        "position" : "연구원",
			        "thumbnail" : "/thumb/user/small/21613-29318",
			        "status" : "ONLINE"
			      },
			      "thread" : 12994,
			      "attaches" : [ ],
			      "replyCount" : 0,
			      "actions" : {
			        "updatable" : true,
			        "removable" : true,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      },
			      "writerId" : 1165
			    }, {
			      "id" : 12995,
			      "createdAt" : "2014-08-20T15:37:45",
			      "updatedAt" : "2014-08-20T15:37:45",
			      "ownerId" : 2460,
			      "message" : "댓글6",
			      "writer" : {
			        "id" : 1165,
			        "name" : "정해운",
			        "email" : "hwjung@daou.co.kr",
			        "position" : "연구원",
			        "thumbnail" : "/thumb/user/small/21613-29318",
			        "status" : "ONLINE"
			      },
			      "thread" : 12995,
			      "attaches" : [ ],
			      "replyCount" : 0,
			      "actions" : {
			        "updatable" : true,
			        "removable" : true,
			        "writable" : false,
			        "managable" : false,
			        "readable" : false
			      },
			      "writerId" : 1165
			    } ],
			    "commentCount" : 6
			  });
			
			expect(activity.hasMoreComment()).toBe(true);
		});
	});
});