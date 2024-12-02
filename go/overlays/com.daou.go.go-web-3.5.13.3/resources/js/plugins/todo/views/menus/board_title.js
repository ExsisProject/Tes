define("todo/views/menus/board_title", [
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/board_title_menu",
    "text!todo/templates/partials/_input_board_title.html",
    "text!todo/templates/partials/_confirm_button.html",
    
    "todo/models/todo",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons",
    
    "app",
    "jquery.go-validation",
    "jquery.go-popup"
], 

function(
    HistoryMenu, 
    
    renderBoardTitleMenu, 
    boardTitleTpl, 
    confirmButtonTpl, 
    
    TodoModel, 
    
    TodoLang, 
    CommonLang,
    
    App
) {

    var BoardTitleMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    BoardTitleMenuView = HistoriableMenuView.extend({
        id: 'board-title-menu', 
        className: 'content', 

        name: 'board-title-menu', 
        // TODO: 다국어 처리
        title: TodoLang["보드이름 변경"], 
        template: renderBoardTitleMenu, 

        afterSave: function() {}, 

        events: {
            "click .btn-confirm": "_confirm", 
            "click .btn-cancel": "_cancel", 
            "submit form": "_confirm"
        }, 

        initialize: function(options) {
            options = options || {};

            if(!this.model) {
                this.model = new TodoModel();
            }

            this.afterSave = options.afterSave || function() {};
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            console.log(boardTitleTpl);
            this.$el.empty()
                .append(this.template({
                    "label": {
                        "name": CommonLang["이름"], 
                        "input_title_value": GO.util.unescapeHtml(this.model.get('title')), 
                        "confirm": CommonLang["확인"], 
                        "cancel": CommonLang["취소"]
                    }
                }, {
                    "_input_board_title": boardTitleTpl, 
                    "_confirm_button": confirmButtonTpl
                }));
            this.setMenuClass('layer_new_board');
        }, 

        _confirm: function(e) {
            var title = this.$el.find('input[name=title]').val(), 
                self = this;
            
            if(!$.goValidation.isCheckLength(1, 1000, title)){
            	$.goMessage( App.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 1, arg2 : 1000}));
            	$('input[name=title]').focus();
			    return false;
            }

            e.preventDefault();
            
            this.model.updateTitle(title).then(function(updatedModel) {
                self.close();
                self.afterSave.call(self, updatedModel);
            });
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    });

    return BoardTitleMenuView;

    // TODO: 테스트 코드 작성
});