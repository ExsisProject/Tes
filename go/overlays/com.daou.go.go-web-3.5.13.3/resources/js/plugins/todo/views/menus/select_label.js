define("todo/views/menus/select_label", [
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/select_label_menu",
    
    "todo/views/menus/edit_label", 
    "i18n!todo/nls/todo", 
    "i18n!nls/commons"
], 

function(
    HistoryMenu, 
    
    renderSelectLabelMenu, 
    
    EditLabelMenuView, 
    TodoLang, 
    CommonLang
) {

    var SelectLabelMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    SelectLabelMenuView = HistoriableMenuView.extend({
        id: 'select-label-menu', 
        className: 'content', 

        name: 'select-label-menu', 
        title: TodoLang["라벨"], 
        template: renderSelectLabelMenu, 

        todoModel: null, 

        events: {
            "click .ui-label": "_toggleSelectLabel", 
            "click .btn-modify-labelname": "_callEditLabelMenu"
        }, 

        initialize: function(options) {
            options = options || {};
            this.todoModel = options.todoModel;            
            HistoriableMenuView.prototype.initialize.call(this, options);
            this.todoModel.on('change:labels', this.render, this);
        }, 

        render: function() {
            this.$el.empty()
                .append(this.template({
                    "labels": this.todoModel.get('labels'), 
                    "label": {
                        "modify_name": TodoLang["라벨이름 변경"]
                    }
                }));
            this.setMenuClass('layer_label');
            initSelectedLabel.call(this);
        }, 

        _toggleSelectLabel: function(e) {
            var $label = $(e.currentTarget), 
                targetLabelId = $label.data('labelid'), 
                curLabels = this.model.get('labels'), 
                fn = $label.hasClass('select') ? 'removeLabel' : 'addLabel';

            e.preventDefault();
            this.model[fn].call(this.model, targetLabelId).then(function(updated) {
                toggleLabelSelected($label);
            });
        }, 

        _callEditLabelMenu: function(e) {
            var nextView;

            e.preventDefault();
            nextView = new EditLabelMenuView({
            	"model": this.todoModel
        	});
            this.forward(nextView);
        }
    });

    function initSelectedLabel() {
        var self = this, 
            curLabels = this.model.get('labels');

        this.$el.find('.ui-label').each(function(i, labelEl) {
            var labelId = $(labelEl).data('labelid'), 
                searched = self.model.hasLabel(labelId);

            if(searched) {
                $(labelEl).addClass('select');
            }
        });
    }

    function toggleLabelSelected($label) {
        if($label.hasClass('select')) {
            $label.removeClass('select');
        } else {
            $label.addClass('select');
        }
    }

    return SelectLabelMenuView;

    // TODO: 테스트 코드 작성
});