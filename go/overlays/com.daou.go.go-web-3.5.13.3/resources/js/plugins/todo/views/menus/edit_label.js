define("todo/views/menus/edit_label", [
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/edit_label_menu",
    "text!todo/templates/partials/_confirm_button.html",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 

function(
    HistoryMenu, 
    
    renderEditLabelMenu, 
    confirmButtonTpl, 
    
    TodoLang, 
    CommonLang
) {

    var EditLabelMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    EditLabelMenuView = HistoriableMenuView.extend({
        id: 'edit-label-menu', 
        className: 'content', 

        name: 'edit-label-menu', 
        title: TodoLang["라벨이름 변경"], 
        template: renderEditLabelMenu, 

        events: {
            "click .btn-confirm": "_save", 
            "click .btn-cancel": "_cancel"
        }, 

        initialize: function(options) {
        	this.before = options.before;
            options = options || {};
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            this.$el.empty()
                .append(this.template({
                    "labels": this.model.get('labels'), 
                    "label": {
                        "confirm": CommonLang["저장"], 
                        "cancel": CommonLang["취소"]
                    }
                }, {
                    "_confirm_button" : confirmButtonTpl
                }));
            this.setMenuClass('layer_label');
        }, 

        _save: function(e) {
            var labelList = [], 
                self = this,
                validation = true;

            e.preventDefault();
            this.$el.find('.input-labelname').each(function(i, input) {
                var labelId = $(input).data('labelid'), 
                    title = $(input).val();

                if (!$.goValidation.isCheckLength(0, 255, title)) {
    				$.goSlideMessage(GO.i18n(CommonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'],{"arg1" : "255"}), 'caution');
    				validation = false;
    			}else{
    				labelList.push({"id": labelId, "title": title});
    			}
            });

            if(validation){
            	this.model.updateLabels(labelList).then(function(todoModel) {
            		self.back();
            	}).otherwise(function(err) {
            		console.log(err.stack);
            	});
            }
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.back();
        }
    });

    return EditLabelMenuView;

    // TODO: 테스트 코드 작성
});