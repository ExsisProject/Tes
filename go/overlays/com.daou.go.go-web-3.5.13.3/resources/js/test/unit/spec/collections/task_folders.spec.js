define([
    "task/collections/task_folders",
    
    "jquery.ajaxmock",
    "GO.util"
], function(
	TaskFolders
) {
	describe("taskFolders!)", function() {
		it("url. url 확인", function() {
			var taskFolders = new TaskFolders();
			taskFolders.setDeptId(1);
			expect(taskFolders.url()).toBe("/api/task/folder/dept/1/low");
		});
	});
});