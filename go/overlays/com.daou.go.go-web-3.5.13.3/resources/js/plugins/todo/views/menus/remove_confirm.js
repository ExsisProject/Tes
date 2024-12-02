define("todo/views/menus/remove_confirm", [
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/remove_confirm_menu",
    
    "i18n!todo/nls/todo",
    "i18n!nls/commons"
],
function(
    HistoryMenu,
    
    renderRemoveConfirmMenu, 
    
    TodoLang,
    CommonLang
) {

    var RemoveConfirmMenuView,
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    RemoveConfirmMenuView = HistoriableMenuView.extend({
        id: 'remove-confirm-menu',
        className: 'content',

        name: 'remove-confirm-menu',
        title: CommonLang["삭제"],

        template: renderRemoveConfirmMenu,

        subject: '',
        description: '',
        afterClick: function() {},

        events: {
            "click .btn-remove": "_callAfterClick",
            "click .btn-cancel": "_cancel"
        },

        initialize: function(options) {
            options = options || {};
            this.subject = options.subject || CommonLang["삭제하시겠습니까?"];
            this.description = options.description || TodoLang["카드 삭제 확인 메시지"];
            this.buttonText = options.buttonText || CommonLang["삭제"],
            this.afterClick = options.afterClick || function() {};

            HistoriableMenuView.prototype.initialize.call(this, options);
        },

        render: function() {
            this.$el.empty().append(this.template({
                "subject": this.subject,
                "description": this.description,
                "remove": this.buttonText,
                "cancel": CommonLang["취소"]
            }));
        },

        _callAfterClick: function(e) {
            e.preventDefault();
            this.afterClick.call(this, e);
        },

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    });

    return RemoveConfirmMenuView;
});
