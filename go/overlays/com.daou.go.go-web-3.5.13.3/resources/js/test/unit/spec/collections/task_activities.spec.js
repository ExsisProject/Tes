define([
    "task/collections/task_activities",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	TaskActivities
) {
	describe("taskActivities!", function() {
		it("taskId. activity의 parent 인 Task 의 ID 확인", function() {
			var activities = new TaskActivities({
				taskId : 1
			});
			
			expect(activities.taskId).toBe(1);
		});
		
		it("URL. activities의 GET URL 확인", function() {
			var activities = new TaskActivities({
				taskId : 1
			});
			
			expect(activities.url()).toBe("/api/task/1/activity");
		});
	});
});