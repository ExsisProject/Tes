define(function(require){var e=require("backbone"),t=require("app"),n=require("board/models/board_tree_node"),r=e.Model.extend({getBoards:function(){return this.get("boards")||[]},getBoardTreeNodes:function(){return new n.Collection(this.getBoards())},hasBoards:function(){return this.getBoards().length>0},getWritableBoards:function(){return _.filter(this.getBoards(),function(e){return e.actions&&e.actions.writable===!0})||[]},hasWritableBoards:function(){return this.getWritableBoards().length>0},hasClosedBoards:function(){return this.get("hasClosedBoard")===!0}}),i=e.Collection.extend({hasBoards:function(){var e=!1;return this.each(function(t){t.hasBoards()&&(e=!0)}),e},hasWritableBoards:function(){var e=!1;return this.each(function(t){t.hasWritableBoards()&&(e=!0)}),e},hasClosedBoards:function(){var e=!1;return this.each(function(t){t.hasClosedBoards()&&(e=!0)}),e}});return{Model:r,Collection:i}});