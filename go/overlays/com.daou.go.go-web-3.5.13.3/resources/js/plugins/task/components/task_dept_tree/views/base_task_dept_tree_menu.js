define('task/components/task_dept_tree/views/base_task_dept_tree_menu', function(require) {
    var GO = require('app');
    var BaseTaskTreeView = require('task/components/task_dept_tree/views/base_task_dept_tree');

    var BaseTaskTreeMenuView = BaseTaskTreeView.extend({
        /**
         * 부서 고유 ID
         */
        deptId: null,

        /**
         * store 키
         */
        storeKey: null,

        initialize: function(options) {
            var opts = options || {};
            BaseTaskTreeView.prototype.initialize.apply(this, arguments);

            this.deptId = null;
            if(opts.hasOwnProperty('deptId')) {
                this.setDeptId(opts.deptId);
            }
        },

        /**
         * @Override
         */
        renderChildView: function(deptModel, lastId) {
            var childView = new this.constructor({
                "lastId" : lastId,
                "nodes": deptModel.children,
                "parentId": deptModel.data.parentId,
                "deptId": deptModel.data.id
            });
            childView.render();
            return childView
        },

        setDeptId: function(deptId) {
            this.deptId = deptId;
        },

        getDeptId: function() {
            return this.deptId;
        },

        /**
         * @Override
         * 노드가 닫힌 상태인지 여부 반환
         */
        isClosedNode: function(deptId) {
            var closedNodes = this._getStoredClosedNodes();
            return _.indexOf(closedNodes, deptId) > -1;
        },

        /**
         * @Override
         * 노드 접기
         */
        foldNode: function($node) {
            var nodeId = $node.data('id');

            // 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
            $node.find('.task-tree-nodes:first').hide();
            $node.find('.close:first').removeClass('close').addClass('open');
            this._addClosedNode(parseInt(nodeId));
        },

        /**
         * @Override
         * 노드 열기
         */
        unfoldNode: function($node) {
            var nodeId = $node.data('id');

            // 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
            $node.find('.task-tree-nodes:first').show();
            $node.find('.open:first').removeClass('open').addClass('close');
            this._removeClosedNode(parseInt(nodeId));
        },

        toggleNode: function($node) {
            var nodeId = parseInt($node.data('id'));

            if(this.isClosedNode(nodeId)) {
                this.unfoldNode($node);
            } else {
                this.foldNode($node);
            }
        },

        /**
         * 닫힌상태 노드저장소에 노드(id) 추가
         */
        _addClosedNode: function(nodeId) {
            var closedNodes = this._getStoredClosedNodes();
            if(_.indexOf(closedNodes, parseInt(nodeId)) < 0) {
                closedNodes.push(nodeId);
                this._storeNodeClosedState(closedNodes);
            }
        },

        /**
         * 닫힌상태 노드저장소에 노드(id) 삭제
         */
        _removeClosedNode: function(nodeId) {
            var closedNodes = this._getStoredClosedNodes();
            var index = _.indexOf(closedNodes, parseInt(nodeId));
            if(index > -1) {
                closedNodes.splice(index, 1);
                this._storeNodeClosedState(closedNodes);
            }
        },

        /**
         * 로컬 스토리지의 접힘 상태 키 반환
         */
        _getStoreKey: function() {
            if(this.deptId === null) {
                return;
            }

            return GO.session('loginId') + '.task.side.' + this.deptId + '.closedNodes';
        },

        _getStoredClosedNodes: function() {
            var stored = GO.util.store.get(this._getStoreKey());

            if(!this.getDeptId() || !stored) {
                return [];
            }

            if(!_.isArray(stored)) {
                stored = [stored];
            }

            return stored;
        },

        _storeNodeClosedState: function(closedNodes) {
            var storeKey = this._getStoreKey();
            if(storeKey) {
                GO.util.store.set(storeKey, closedNodes);
            }
        }
    });

    return BaseTaskTreeMenuView;
});