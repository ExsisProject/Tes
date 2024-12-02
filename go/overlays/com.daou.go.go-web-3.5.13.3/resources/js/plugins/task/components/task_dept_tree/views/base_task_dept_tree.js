define('task/components/task_dept_tree/views/base_task_dept_tree', function(require) {

    var Backbone = require('backbone');
    var Hogan = require('hogan');

    var BaseTaskTreeView = Backbone.View.extend({
        tagName: 'ul',
        template: '',

        initialize: function(options) {
            var opts = options || {};
            this.lastId = opts.lastId,
            this.parentId = opts.parentId;
            this.deptId = opts.deptId;
            this.taskTreeNodes = opts.nodes;
        },

        render: function() {

            this.$el.addClass('task-tree-nodes');

            _.each(this.taskTreeNodes, function(node) {
                var $currentNode = this.createNodeElement(node);

                if(node.children.length > 0) {
                    var childView = this.renderChildView(node, this.lastId);

                    $currentNode.append(childView.el);

                    if(this.isClosedNode(node.id)) {
                        this.foldNode($currentNode);
                    }
                }

                this.$el.append($currentNode);
            }, this);

        },

        /**
         * 개별 노드 렌더링(Override 가능하도록 별도로 구성)
         */
        renderChildView: function(deptNode, lastId) {
            var childView = new this.constructor({"nodes": this.deptNode.get("children"),
                "parentId": deptNode.get("data").parentId,
                "lastId" : lastId,
                "deptId" : deptNode.get("data").id});
            childView.render();
            return childView
        },

        createNodeElement: function(deptNode, options) {
            return $(this._renderTemplate(this.getTemplateVars(deptNode, options)));
        },

        /**
         * 템플릿 변수 반환
         * 상속받은 객체에서 오버라이드할 수 있도록 구성
         */
        getTemplateVars: function(deptNode, options) {
            return _.extend({
                "deptId": deptNode.data.id,
                "name": deptNode.data.name,
                "parentId": deptNode.data.parentId,
                "isLastNode" : (deptNode.data.id == this.lastId) ? true : false,
                "isClosedNode": (deptNode.children.length <= 0 ),
                "hasChildren": (deptNode.data.childrenCount > 0),
            }, options || {});
        },
        /**
         * 노드가 닫힌 상태인지 여부 반환
         */
        isClosedNode: function(deptNode) {
            return false;
        },

        /**
         * 노드 접기(하위 노드를
         */
        foldNode: function($node) {
            // 하위 뷰에서 구현
        },

        /**
         * 노드 열기
         */
        unfoldNode: function($node) {
            // 하위 뷰에서 구현
        },

        _renderTemplate: function() {
            var compiled = Hogan.compile(_.result(this, 'template'));
            return compiled.render.apply(compiled, arguments);
        }
    });

    return BaseTaskTreeView;

});