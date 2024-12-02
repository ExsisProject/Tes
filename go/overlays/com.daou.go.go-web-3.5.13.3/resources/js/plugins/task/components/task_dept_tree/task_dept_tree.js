/**
 * 업무 트리형 팩토리 객체
 *
 * 업무의 트리형 표현과 관계되는 모든 서비스를 제공하는 인터페이스 역할 수행한다.
 */
define('task/components/task_dept_tree/task_dept_tree', function(require) {

    var BaseTaskDeptsTreeView = require('task/components/task_dept_tree/views/base_task_dept_tree');
    var TaskDeptsTreeMenuView = require('task/components/task_dept_tree/views/task_dept_tree_menu');
    var renderTaskTreeMenuTpl = require('hgn!task/components/task_dept_tree/templates/task_dept_tree_menu');

    return {
        BaseTaskDeptsTreeView: BaseTaskDeptsTreeView,
        TaskDeptsTreeMenuView: TaskDeptsTreeMenuView,

        /**
         * 업무 트리의 노드 템플릿 렌더링
         */
        renderTaskDeptsTreeMenuNode: function() {
            return renderTaskTreeMenuTpl.apply(undefined, arguments);
        }
    };

});