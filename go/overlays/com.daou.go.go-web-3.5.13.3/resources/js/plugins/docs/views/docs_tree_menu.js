define('docs/views/docs_tree_menu', function(require) {

    var BaseBoardTreeMenuView = require('board/components/board_tree/views/base_board_tree_menu');
    var docsNodeTpl = require('text!docs/templates/docs_tree_menu.html');
    var GO = require('app');

    var DocsTreeMenuView = BaseBoardTreeMenuView.extend({
        template: docsNodeTpl,

        initialize: function(options){
            this.useNew  = options.useNew != undefined ? options.useNew : true;
            this.useOpen  = options.useOpen != undefined ? options.useOpen : true;
            BaseBoardTreeMenuView.prototype.initialize.apply(this, arguments);
        },

        /**
         * @Override
         * 템플릿 변수 반환
         */
        getTemplateVars: function(docsTreeNode, options) {
            var self = this;
            this.isOpen = self.getStoredCategoryIsOpen(GO.session("loginId") + docsTreeNode.id + docsTreeNode.getName() +  '-docs-folder-toggle');
            return  _.extend({
                "parentId" : docsTreeNode._getParentId(),
                "nodeId": docsTreeNode.id,
                "nodeType": 'FOLDER',	// 가상의 타입을 준다.
                "nodeValue": docsTreeNode.getName(),
                "isHidden" : docsTreeNode.attributes.state ? docsTreeNode.attributes.state == "HIDDEN" : true,
                "isDeleted" : docsTreeNode.attributes.state ? docsTreeNode.attributes.state != "NORMAL" : true,
                "isAccessible" : this.isDeleted ? false : (docsTreeNode.isReadable() ? docsTreeNode.isReadable() : false),
                "iconType": 'folder',
                "hasChild" : this.boardTreeNodes.hasChildren(docsTreeNode.id),
                "close" : self.useOpen ? this.isOpen : true,
                "isNew" : self.isNew(docsTreeNode.get("lastDocsCompleteDate")),
                "managable": false,
                "isWritable" : docsTreeNode.isWritable()
            }, options || {});
        },

        getStoredCategoryIsOpen: function(storeKey) {
            var savedCate = GO.util.store.get(storeKey);

            if(_.isUndefined(savedCate)){
                savedCate = true;
            }

            return savedCate;
        },

        isNew : function(date) {
            if(this.useNew){
                return date ? GO.util.isCurrentDate(date, 1) : false;
            }
            return false;
        },

        render: function() {
            this.$el.addClass('docs-tree-nodes');

            _.each(this.boardTreeNodes.getNodes(this.parentId), function(node) {
                var boardTreeNode = this.boardTreeNodes.get(node.id);
                var $currentNode = this.createNodeElement(boardTreeNode);

                if(this.boardTreeNodes.hasChildren(boardTreeNode.id)) {
                    var childView = this.renderChildView(boardTreeNode);
                    $currentNode.append(childView.el);
                    if(this.useOpen && !this.isOpen){
                        childView.$el.hide();
                    }
                }
                this.$el.append($currentNode);
            }, this);
            GO.EventEmitter.trigger('common', 'layout:refreshSideScroll');
        },

        /**
         * @Override
         */
        renderChildView: function(boardTreeNode) {
            var childView = new this.constructor({
                "nodes": this.boardTreeNodes,
                "parentId": boardTreeNode.id,
                "menuId": this.menuId,
                "useNew" : this.useNew,
                "useOpen" : this.useOpen
            });
            childView.render();
            return childView;
        }

    });

    return DocsTreeMenuView;
});