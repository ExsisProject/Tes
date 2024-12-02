define("todo/views/menus/move_column", [
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/move_column_menu",
    "text!todo/templates/partials/_confirm_button.html",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 

function(
    HistoryMenu, 
    
    renderMoveColumnMenu,
    confirmButtonTpl, 
    
    TodoLang, 
    CommonLang
) {

    var MoveColumnMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    MoveColumnMenuView = HistoriableMenuView.extend({
        id: 'move-column-menu', 
        className: 'content', 

        name: 'move-column-menu', 
        title: TodoLang["칼럼 이동"], 
        template: renderMoveColumnMenu, 

        columnView: null, 
        todoModel: null, 

        events: {
            "click .btn-confirm": "_move", 
            "click .btn-cancel": "_cancel"
        }, 

        initialize: function(options) {
            options = options || {};
            this.columnView = options.columnView;
            this.model = this.columnView.model;
            this.todoModel = this.columnView.todoModel;
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            var columns = this.todoModel.getCategories();

            _.map(columns, function(map) {
                map.disp_text = map.seq + 1;
            });

            this.$el.empty()
                .append(this.template({
                    "columns": columns, 
                    "label": {
                        "position": CommonLang["위치"], 
                        "confirm": CommonLang["이동"], 
                        "cancel": CommonLang["취소"]
                    }
                }, {
                    "_confirm_button": confirmButtonTpl
                }));
            
            this.setCurrentPosition();
            this.setMenuClass('layer_move');
        },
        
        setCurrentPosition : function() {
        	this.$el.find(".select-column-seq").val(this.model.get("seq"));
        },

        _move: function(e) {
            var self = this, 
                sortedIds = [];
                
            e.preventDefault();

            if(moveColumnElement.call(this)) {
                $('.ui-todocolumn').each(function(i, colEl) {
                    var $curColumn = $(colEl), 
                        cateId = $curColumn.data('categoryid'), 
                        columnView = $curColumn.data('view');

                    columnView.reorder(i);
                    sortedIds.push(cateId);
                });

                this.todoModel.reorderCategories(sortedIds).then(function(todoModel) {
                    self.close();
                }).otherwise(function(err) {
                    window.location.reload();
                });
            }
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    });

    function moveColumnElement() {
        var curPos = this.model.get("seq"), 
            targetPos = parseInt(this.$el.find('select[name=select_position]').val()), 
            $target = $($('.ui-todocolumn').get(targetPos)), 
            $column = this.columnView.$el, 
            actionFn;

        if(targetPos < curPos) {
            // 자신보다 하위seq로 이동
            actionFn = 'before';
        } else if(targetPos > curPos) {
            // 자신보다 상위 seq로 이동
            actionFn = 'after';
        } else {
            return false;
        }

        $target[actionFn].call($target, $column);
        return true;
    }

    return MoveColumnMenuView;

    // TODO: 테스트 코드 작성
});