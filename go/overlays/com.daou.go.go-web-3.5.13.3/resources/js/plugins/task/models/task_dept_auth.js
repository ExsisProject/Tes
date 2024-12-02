define('task/models/task_dept_auth', function(require) {
    // dependency
    var Backbone = require('backbone');
    var GO = require('app');
    var when = require('when');


    /**
     * 조직도별 업무현황 노출여부.
     *
     */
    var TaskDeptAuth = Backbone.Model.extend({
        url: function() {
            return GO.config('contextRoot') + 'api/task/checkviewer';
        }
    });


    return TaskDeptAuth;
});