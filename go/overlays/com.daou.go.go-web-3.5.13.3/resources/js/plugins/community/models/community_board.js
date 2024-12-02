(function() {
	define([
	    "backbone"
	],
	function(Backbone) {
	
		var DeptBoard = Backbone.Model.extend({
			url: function() {
				var url = ['/api/community', this.get('deptId'), 'board'];
				
				if(this.get('status')) url.push(this.get('status'));
				return url.join('/');
			},
			/*setDeptId : function(deptId) {
				this.deptId = deptId;
			},*/
			getDeptList : function(deptId, status) {
				this.set({ deptId : deptId, status : status} , { silent : true });
				this.fetch({data: {'offset' : '1000', 'page' : '0'}, async:false });
			},
			validate: function(attrs) {
				if(attrs.useValidate) {
					if(!attrs.name) {
						return { focus : 'name' , msg : '제목을 입력하세요.'};
					} else if (!attrs.managerIds) {
						return { msg : '운영자를 선택하세요.' };
					}
				}
			}
		}); 
	
		return DeptBoard;
	});
}).call(this);