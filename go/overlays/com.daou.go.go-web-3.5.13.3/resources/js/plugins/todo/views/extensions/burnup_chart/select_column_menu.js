define("todo/views/extensions/burnup_chart/select_column_menu", [
    "backbone",
    
    "todo/views/extensions/burnup_chart/column_store",
    
    "hgn!todo/templates/column_select_menu",
    
    "todo/constants",
    
    "i18n!nls/commons", 
    "i18n!todo/nls/todo"
],

function(
    Backbone,
    
    ColumnStore,
    
    renderColumnSelectMenu,
    
    Constants, 
    
    CommonLang, 
    TodoLang
) {
    var SelectColumnMenuView,
        ELEMENT_ID = 'select-column-menu';

    SelectColumnMenuView = Backbone.View.extend({
        id: ELEMENT_ID,
        className: 'array_option',
        template: renderColumnSelectMenu,

        events: {
            "click input[type=checkbox]": "_onChecked", 
            "click .close-btn": "_close"
        },

        initialize: function(options) {
            this.options = options || {};
            this.$el.data('instance', this);
        },

        render: function() {
            this.$el.append(this.template({
                "columns": this.model.get('categories'), 
                "label": {
                	"all": CommonLang["전체"], 
                	"addColumn": TodoLang["칼럼 추가"], 
                	"close": CommonLang["닫기"]
                }
            }));
            initSelectedColumns.call(this);
            bindClearMenuEvent.call(this);
        },

        // @Override
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            // layer 메뉴는 그 순간에 단 하나만 존재하므로, clearmenu 이벤트 전체를 off 시켜도 상관없음...
            $(document).off('go.todo.clearmenu');
        },

        check: function(id) {
            var $target = this.$el.find('#col-id-' + id);

            if($target.length > 0) {
                $target.prop('checked', true);
                ColumnStore.add(this.model.id, parseInt(id));
            }
        },

        uncheck: function(id) {
            var $target = this.$el.find('#col-id-' + id);

            if($target.length > 0) {
                $target.prop('checked', false);
                ColumnStore.remove(this.model.id, parseInt(id));
            }
        },

        _onChecked: function(e) {
            var $target = $(e.currentTarget),
                isChecked = $target.prop('checked');

            if(isChecked) {
                ColumnStore.add(this.model.id, parseInt($target.val()));
            } else {
                ColumnStore.remove(this.model.id, parseInt($target.val()));
            }

            if(this.options.onClicked) {
                this.options.onClicked($target);
            }
        }, 
        
        _close: function(e) {
        	e.preventDefault();
        	this.remove();
        }
    }, {
        attachTo: function($target, options) {
            var instance,
                offset = $target.offset();

            this.clear();
            instance = new SelectColumnMenuView(options || {});
            $('body').append(instance.el);
            instance.$el.css({"position": 'absolute', "left": offset.left, "top": offset.top + $target.outerHeight()});
            instance.render();

            return instance;
        },

        clear: function() {
            if($('#' + ELEMENT_ID).data('instance')) {
                $('#' + ELEMENT_ID).data('instance').remove();
            }
        },

        toggle: function($target, options) {
            if($('#' + ELEMENT_ID).length > 0 && $('#' + ELEMENT_ID).data('instance')) {
                $('#' + ELEMENT_ID).data('instance').remove();
            } else {
                this.attachTo($target, options);
            }
        }
    });

    // privates
    function initSelectedColumns() {
        var selectedCols = ColumnStore.get(this.model.id);
        this.$el.find('input:checkbox[name=id]').each(function(i, el) {
            var $el = $(el);

            if(_.indexOf(selectedCols, parseInt($el.val())) > -1) {
                $el.prop('checked', true);
            }
        })
    }

    function bindClearMenuEvent() {
        setTimeout(_.bind(function() {
            var self = this;
            $(document).on('go.todo.clearmenu', function(e) {
                var $relatedTarget = $(e.relatedTarget)

                if($relatedTarget.closest(self.$el).length > 0) return;

                if(self.$el.is(':visible')) {
                    self.remove();
                }
            });
        }, this), 300);
    }

    return SelectColumnMenuView;
});
