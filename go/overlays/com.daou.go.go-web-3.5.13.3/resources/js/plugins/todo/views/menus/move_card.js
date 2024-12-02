define("todo/views/menus/move_card", [
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/move_card_menu",
    "text!todo/templates/partials/_confirm_button.html",
    
    "todo/libs/util",
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 

function(
    HistoryMenu, 
    
    renderMoveCardMenu, 
    confirmButtonTpl, 
    
    TodoUtil, 
    TodoLang, 
    CommonLang
) {

    var MoveCardMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    MoveCardMenuView = HistoriableMenuView.extend({
        id: 'move-card-menu', 
        className: 'content', 

        name: 'move-card-menu', 
        title: TodoLang["카드 이동"], 
        template: renderMoveCardMenu, 

        todoModel: null, 

        events: {
            "change select[name=select_column]": "_changeColumn", 
            "click .btn-confirm": "_move", 
            "click .btn-cancel": "_cancel"
        }, 

        initialize: function(options) {
            options = options || {};
            this.todoModel = options.todoModel;
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            this.$el.empty()
                .append(this.template({
                    "columns": this.todoModel.getCategories(), 
                    "label": {
                        "column": TodoLang["칼럼"], 
                        "position": CommonLang["위치"], 
                        "confirm": CommonLang["이동"], 
                        "cancel": CommonLang["취소"]
                    }
                }, {
                    "_confirm_button": confirmButtonTpl
                }));
            this.setMenuClass('layer_move');
            initCardPosition.call(this);
        }, 

        _changeColumn: function(e) {
            resetCardPosition.call(this);
        },

        _move: function(e) {
            var self = this, 
                sColId, sPos; 
                
            e.preventDefault();
            sColId = parseInt(this.$el.find('select[name=select_column]').val());
            sPos = parseInt(this.$el.find('select[name=select_position]').val());

            this.model.move(sColId, sPos).then(function() {
                self.model.trigger('moved', sColId, sPos);
            	GO.EventEmitter.trigger('todo', 'resize:column');
                self.close();
            });
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    });

    function initCardPosition() {
        this.$el.find('select[name=select_column]').val(this.model.get('todoCategoryId'));
        resetCardPosition.call(this);
    }

    function resetCardPosition() {
        var sColId = parseInt(this.$el.find('select[name=select_column]').val()), 
            $target = this.$el.find('select[name=select_position]'), 
            $cards = $('#column-container-' + sColId).find('.ui-todocard'), 
            cardCount = $cards.length, 
            buffer = [];
        
        // 현재 칼럼내에서 이동할 경우에는 자신의 카운터를 빼줘야 한다.
        if(sColId === this.model.get('todoCategoryId')) {
            cardCount = cardCount - 1;
        }

        $target.empty();
        if(cardCount > 0) {
            for(var i=0; i<=cardCount; i++) {
                var text = i + 1;
                buffer.push('<option value="' + i + '">' + text + '</option>');
            }
        } else {
            buffer.push('<option value="0">1</option>');
        }

        $.fn.append.apply($target, buffer);
        $target.val(TodoUtil.searchCardSeq($cards, this.model.id));
    }

    return MoveCardMenuView;

    // TODO: 테스트 코드 작성
});