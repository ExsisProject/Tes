define(function(require) {
    var commonLang = require('i18n!nls/commons');
    var TaskDetailView = require('task/views/task_detail');
    return TaskDetailView.extend({
        render: function() {
            TaskDetailView.prototype.render.call(this);
            this.$('section.combine_search').remove();
            this.$('#goToListBtn').remove();
        },

        deleteTask : function() {
            this.task.destroy({
                success: function() {
                    $.goMessage(commonLang["삭제되었습니다."]);
                    window.close();
                }
            });
        }
    });
});