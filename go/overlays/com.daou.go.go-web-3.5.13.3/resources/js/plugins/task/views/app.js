(function() {
	define([
			"backbone",
            'when',
			
			"i18n!task/nls/task",
	        "task/views/home",
            'task/views/task_calendar',

            'task/models/task_dept_auth',
            'models/dept_root'
	], 
	function(
			Backbone,
            when,
			
			taskLang,
	        TaskHomeView,
            TaskCalendarView,

            TaskDeptAuth,
            DeptRootModel
	) {
		var TaskAppView = GO.BaseView.extend({
			render : function(isForce) {
                if (isForce) {
                    this._renderHome();
                } else {
                    var taskDeptAuth = new TaskDeptAuth();
                    taskDeptAuth.fetch({ // side content 분리형 구조로 인하여 일단 중복 호출하도록 한다.
                        success: $.proxy(function(model) {
                            // TODO checkviewer 권한 수정되면 같이 변영.
                            if (model.get('true')) {
                                this._renderCalendar();
                            } else {
                                this._renderHome();
                            }
                        }, this)
                    });
                }

                return this;
			},

            _renderHome: function() {
                var homeView = new TaskHomeView();
                homeView.dataFetch().done(function() {
                    $("#content").append(homeView.render().el).addClass("go_renew");
                    homeView.renderTodos();
                });
            },

            _renderCalendar: function() {
                this._getDeptId().then($.proxy(function(deptId) {
                    var taskCalendarView = new TaskCalendarView({
                        deptId: deptId
                    });
                    this.$el.html(taskCalendarView.render().el);
                }, this));
            },

            _getDeptId: function() {
                return when.promise(function(resolve) {
                    var deptId = GO.util.store.get("deptTreeId");
                    if (!deptId) {
                        this.deptRoot = new DeptRootModel();
                        this.deptRoot.fetch({
                            success: function(dept) {
                                resolve(dept.id);
                            }
                        });
                    } else {
                        resolve(deptId);
                    }
                });
            }
		});
		
		return TaskAppView;
	});
})();