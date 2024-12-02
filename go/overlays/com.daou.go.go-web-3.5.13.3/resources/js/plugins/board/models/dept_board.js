define(function(require) {
	
	var Backbone = require('backbone');
	var boardLang = require('i18n!board/nls/board');

	var DeptBoard = Backbone.Model.extend({
		url: function() {
			var url = ['/api/department', this.get('deptId'), 'board'];
			
			if(this.get('status')) url.push(this.get('status'));
			return url.join('/');
		},
		getDeptList : function(deptId, status) {
			this.set({ deptId : deptId, status : status} , { silent : true });
			this.fetch({
				data: {'offset' : '1000', 'page' : '0'}, 
				async:false,
				statusCode: {
                    403: function() { GO.util.error('403', { "msgCode": "400-board"}) }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-board"}) }, 
                    500: function() { GO.util.error('500'); }
                }
			});
			
		}
	}); 

	return DeptBoard;
});