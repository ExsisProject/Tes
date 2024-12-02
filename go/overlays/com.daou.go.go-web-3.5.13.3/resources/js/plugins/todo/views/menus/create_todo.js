define("todo/views/menus/create_todo", [
    "app", 
    
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/create_todo_menu",
    "text!todo/templates/partials/_input_board_title.html",
    "text!todo/templates/partials/_select_public_option.html",
    "text!todo/templates/partials/_confirm_button.html",
    
    "todo/models/todo",
    "todo/libs/util",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons",
    
    "jquery.go-validation",
    "jquery.go-popup"
], 

function(
    GO, 
    
    HistoryMenu, 
    
    renderCreateTodoMenu, 
    inputBoardTitleTpl,
    selectPublicOptionTpl, 
    confirmButtonTpl, 
    
    TodoModel, 
    TodoUtil, 
    
    TodoLang, 
    CommonLang
) {

    var CreateTodoMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView, 
        SELECTORS = {
            "public_option_status": '.public-option-status', 
            "public_option_select": '.public-option-select', 
            "option_public": ".option-public", 
            "option_private": ".option-private", 
            "icon_public_status": '.icon-public-status', 
            "public_status_text": '.public-status-text'
        };

    CreateTodoMenuView = HistoriableMenuView.extend({
        id: 'create-todo-menu', 
        className: 'content layer_new_board', 

        name: 'create-todo-menu', 
        // TODO: 다국어 처리
        title: TodoLang["새보드 만들기"], 
        template: renderCreateTodoMenu, 

        myTodoList: null, 

        events: {
            "click .btn-modify": "_modifyPublicOption", 
            "click .option-private": "_setPrivateOption", 
            "click .option-public": "_setPublicOption", 
            "click .btn-confirm": "_confirm", 
            "click .btn-cancel": "_cancel", 
            "submit form": "_confirm"
        }, 

        initialize: function(options) {
            options = options || {};

            if(!this.model) {
                this.model = new TodoModel();
            }

            if(options.myTodoList) {
                this.myTodoList = options.myTodoList;
            }

            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            this.$el.empty()
                .append(this.template({
                    "private?": this.model.isPrivate(), 
                    "public_option_hide?": true, 
                    "label": {
                        "name": CommonLang["이름"], 
                        "input_title_value": TodoLang["새보드 만들기"], 
                        "private": CommonLang["비공개"], 
                        "public": CommonLang["공개"], 
                        "confirm": CommonLang["확인"], 
                        "cancel": CommonLang["취소"], 
                        "modify": CommonLang["변경하기"]
                    }, 
                    "msg": {
                        "about_private": TodoLang["보드 비공개 안내메시지"], 
                        "about_public": TodoLang["보드 공개 안내메시지"]
                    }
                }, {
                    "_input_board_title": inputBoardTitleTpl, 
                    "_select_public_option": selectPublicOptionTpl, 
                    "_confirm_button": confirmButtonTpl, 
                }));

            initPublicOption.call(this);
        }, 

        _modifyPublicOption: function(e) {
            this.$el.find(SELECTORS.public_option_status).hide();
            this.$el.find(SELECTORS.public_option_select).show();
        }, 

        _setPrivateOption: function(e) {
            e.preventDefault();

            setPrivateOption.call(this);
            this.model.setPrivate();
        }, 

        _setPublicOption: function(e) {
            e.preventDefault();

            setPublicOption.call(this);
            this.model.setPublic();
        }, 

        _confirm: function(e) {
            var title = this.$el.find('input[name=title]').val(), 
                self = this;
            
            if(!$.goValidation.isCheckLength(1, 1000, title)){
                $.goMessage( GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 1, arg2 : 1000}));
                self.$el.find('input[name=title]').focus();
                return false;
            }

            e.preventDefault();
            TodoUtil.promiseModelSave(this.model, {"title": title}).then(function(newModel) {
                if(self.myTodoList) {
                    self.myTodoList.add(newModel);
                }
                
                self.close();
                GO.router.navigate('todo/' + newModel.id, {"trigger": true, "pushState": true});
            });
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    }, {
        SELECTORS: SELECTORS
    });

    function setPrivateOption() {
        this.$el.find(SELECTORS.icon_public_status).removeClass('ic_public').addClass('ic_private');
        // TODO: 다국어 처리
        this.$el.find(SELECTORS.public_status_text).text(CommonLang["비공개"]);
        this.$el.find('.public-option-select a').removeClass('select');
        this.$el.find(SELECTORS.option_private).addClass('select');
    }

    function setPublicOption() {
        this.$el.find(SELECTORS.icon_public_status).removeClass('ic_private').addClass('ic_public');
        this.$el.find(SELECTORS.public_status_text).text(CommonLang["공개"]);
        this.$el.find('.public-option-select a').removeClass('select');
        this.$el.find(SELECTORS.option_public).addClass('select');
    }

    function initPublicOption() {
        var func = this.model.isPublic() ? setPublicOption : setPrivateOption;
        return func.call(this);
    }

    return CreateTodoMenuView;
});