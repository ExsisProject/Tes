define("board/components/board_tree/views/m_board_tree_menu",function(require){var e=require("app"),t=require("board/models/board_tree_node"),n=require("board/components/board_tree/views/base_board_tree_menu"),r=require("text!board/components/board_tree/templates/m_board_tree_menu.html"),i=n.extend({template:r,events:{"vclick a.node-value":"_clickAnchorNodeValueHandler"},getTemplateVars:function(e,t){var r=n.prototype.getTemplateVars.apply(this,arguments);if(e.isBoardNode()||e.isCompanyShareNode())r.nodeId=e.getBoardId();return r},getLinkUrl:function(e){var t="#";if(e.isBoardNode()||e.isCompanyShareNode())t="board/"+e.getBoardId();return t},_clickAnchorNodeValueHandler:function(n){var r=$(n.currentTarget),i=r.closest("li"),s=i.data("type"),o=r.attr("href").replace(e.config("root"),"");n.preventDefault(),n.stopImmediatePropagation();switch(s){case t.NODETYPE_COMPANY_SHARE:case t.NODETYPE_BOARD:e.router.navigate(o,{trigger:!0,pushState:!0});break;case t.NODETYPE_FOLDER:this.toggleNode(i),e.EventEmitter.trigger("common","layout:refreshSideScroll");break;case t.NODETYPE_SEPERATOR:default:}return!1}});return i});