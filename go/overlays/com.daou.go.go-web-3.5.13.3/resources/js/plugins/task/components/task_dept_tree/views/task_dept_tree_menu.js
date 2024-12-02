define('task/components/task_dept_tree/views/task_dept_tree_menu', function(require) {
    var GO = require('app');

    var BaseTaskTreeMenuView = require('task/components/task_dept_tree/views/base_task_dept_tree_menu');
    var taskNodeTpl = require('text!task/components/task_dept_tree/templates/task_dept_tree_menu.html');
    var DepartmentsDescendantTree = require('models/dept_descendants_tree');
    require('jquery');
    require('jquery.go-popup');

    var TaskTreeMenuView = BaseTaskTreeMenuView.extend({
        template: taskNodeTpl,

        events: {
            "click .open": "_onClickToggleNode",
            "click .close": "_onClickToggleNode",
        },

        /**
         * @Override
         * 템플릿 변수 반환
         */
        getTemplateVars: function(taskTreeNode, options) {
            var tplVars = BaseTaskTreeMenuView.prototype.getTemplateVars.apply(this, arguments);

            tplVars.nodeId = taskTreeNode.data.id;
            return tplVars
        },


        /**
         * 노드 접기/펼치기 버튼 클릭 이벤트 핸들러
         */
        _onClickToggleNode: function(e) {
            var $target = $(e.currentTarget);

            var $node = $target.closest('li');
            var isOpened = $target.hasClass("close") ? true : false;

            e.stopImmediatePropagation();
            this.toggleNode($node);

            if (!isOpened) {
                //데이터 패치 및
                //하위 목록를 가지고 있지 않다면
                if($node.has("ul").length <= 0){
                    var deptDescendantTree = new DepartmentsDescendantTree({deptId : $node.data("id")});
                    deptDescendantTree.fetch({async: false});

                    var treeMenuView = new this.constructor({
                        "nodes": deptDescendantTree.get("children"),
                        "deptId": deptDescendantTree.get("data").id,
                        "parentId" : deptDescendantTree.get("data").parentId
                    });

                    //받아온 부서 목록을 상위 목록에 연결
                    var self = this;
                    _.each(this.taskTreeNodes, function(parentNode){
                        if(parentNode.data.id == deptDescendantTree.get("data").id){
                            parentNode.children = deptDescendantTree.toJSON().children;
                        }
                    }, this);

                    treeMenuView.render();
                    $node.append(treeMenuView.el);

                }
            }
        }
    });

    return TaskTreeMenuView;
});