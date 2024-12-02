define('contact/views/side/components/tree_menu', function(require) {

    var BaseBoardTreeMenuView = require('board/components/board_tree/views/base_board_tree_menu');
    var NodeTpl = require('text!contact/templates/tree_menu.html');
    var CompanyTreeNode = require('contact/collections/company_group');
    var MobileNodeTpl = require('text!contact/templates/mobile/m_tree_menu.html');
    var GO = require('app');

    var TreeMenuView = BaseBoardTreeMenuView.extend({
        template: NodeTpl,

        initialize: function(options){
            this.useNew  = options.useNew != undefined ? options.useNew : true;
            this.useOpen  = options.useOpen != undefined ? options.useOpen : true;
            BaseBoardTreeMenuView.prototype.initialize.apply(this, arguments);
            this.localStorageKey = options.localStorageKey;
            this.isMobile = _.isUndefined(options.isMobile) ? false : options.isMobile;

            if(this.isMobile){
                this.template = MobileNodeTpl;
            }

            this.boardTreeNodes = CompanyTreeNode.init().set(options.nodes);
        },

        /**
         * @Override
         * 템플릿 변수 반환
         */
        getTemplateVars: function(treeNode, options) {
            var self = this;
            var storedCatetory = self.getStoredCategoryIsOpen(GO.session("loginId") + treeNode.id + treeNode.getName() +  this.localStorageKey);
            this.isOpen = _.isUndefined(storedCatetory) ? false : true;
            return  _.extend({
                "parentId" : treeNode._getParentId(),
                "nodeId": treeNode.id,
                "nodeType": 'FOLDER',	// 가상의 타입을 준다.
                "nodeValue": treeNode.getName(),
                "isAccessible" : this.isDeleted ? false : (treeNode.isReadable() ? treeNode.isReadable() : false),
                "iconType": 'folder',
                "hasChild" : treeNode.hasChild(),
                "close" : !this.isOpen,
                "managable": false,
                "isWritable" : treeNode.isWritable()
            }, options || {});
        },

        getStoredCategoryIsOpen: function(storeKey) {
            var savedCate = GO.util.store.get(storeKey);

            if(_.isUndefined(savedCate)){
                savedCate = false;
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
                this.$el.append($currentNode);
            }, this);

            GO.EventEmitter.trigger('common', 'layout:refreshSideScroll');
        },

        /**
         * @Override
         */
        renderChildView: function(treeNode) {
            var childView = new this.constructor({
                "nodes": this.boardTreeNodes,
                "parentId": treeNode.id,
                "menuId": this.menuId,
                "useNew" : this.useNew,
                "useOpen" : this.useOpen,
                "isMobile" : this.isMobile,
                "localStorageKey" : this.localStorageKey
            });
            childView.render();
            return childView;
        }

    });

    return TreeMenuView;
});