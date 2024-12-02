define("todo/views/menus/public_option", [
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/public_option_menu",
    "text!todo/templates/partials/_select_public_option.html",
    "text!todo/templates/partials/_confirm_button.html",
    
    "todo/models/todo",
    "todo/libs/util",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 
function(
    HistoryMenu, 
    
    renderPublicOptionMenu, 
    selectPublicOptionTpl, 
    confirmButtonTpl, 
    
    TodoModel, 
    TodoUtil, 
    
    TodoLang, 
    CommonLang
) {

    var PublicOptionMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView, 
        SELECTORS = {
            "option_public": ".option-public", 
            "option_private": ".option-private"
        }, 
        PUBLIC_OPTION = {"public": 'Y', "private": 'N'};


    PublicOptionMenuView = HistoriableMenuView.extend({
        id: 'public-option-menu', 
        className: 'content', 

        name: 'public-option-menu', 
        title: TodoLang["공개범위 변경"], 

        template: renderPublicOptionMenu, 
        publicFlag: PUBLIC_OPTION.private, 

        afterSave: function() {}, 

        events: {
            "click .option-private": "_setPrivateOption", 
            "click .option-public": "_setPublicOption", 
            "click .btn-confirm": "_confirm", 
            "click .btn-cancel": "_cancel"
        }, 

        initialize: function(options) {
            options = options || {};

            if(!this.model) {
                this.model = new TodoModel();
            }
            this.publicFlag = this.model.get('publicFlag');

            this.afterSave = options.afterSave || function() {};

            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() { 
            this.$el.empty().append(this.template({
                "private?": this.model.isPrivate(), 
                "label": {
                    "private": CommonLang["비공개"], 
                    "public": CommonLang["공개"], 
                    "confirm": CommonLang["확인"], 
                    "cancel": CommonLang["취소"]
                }, 
                "msg": {
                    "about_private": TodoLang["보드 비공개 안내메시지"], 
                    "about_public": TodoLang["보드 공개 안내메시지"]
                }
            }, {
                "_select_public_option": selectPublicOptionTpl, 
                "_confirm_button": confirmButtonTpl
            }));
        }, 

        _setPrivateOption: function(e) {
            e.preventDefault();

            setPrivateOption.call(this);
            this.publicFlag = PUBLIC_OPTION.private;
//            this.model.setPrivate();
        }, 

        _setPublicOption: function(e) {
            e.preventDefault();

            setPublicOption.call(this);
            this.publicFlag = PUBLIC_OPTION.public;
        }, 

        _confirm: function(e) {
            var self = this;

            e.preventDefault();
            TodoUtil.promiseModelSave(this.model, {"publicFlag": this.publicFlag}).then(function(updatedModel) {                
                self.close();
                self.afterSave.call(self, updatedModel);
            });
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    });

    function setPrivateOption() {
        this.$el.find('.public-option-select a').removeClass('select');
        this.$el.find(SELECTORS.option_private).addClass('select');
    }

    function setPublicOption() {
        this.$el.find('.public-option-select a').removeClass('select');
        this.$el.find(SELECTORS.option_public).addClass('select');
    }

    return PublicOptionMenuView;

    // TODO: 테스트 코드 작성
});