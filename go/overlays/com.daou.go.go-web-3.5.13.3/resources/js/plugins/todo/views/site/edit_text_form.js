define("todo/views/site/edit_text_form", [
    "backbone", 
    
    "hgn!todo/templates/card_add_form",
    
    "i18n!nls/commons", 
    "libs/go-utils",
    
    "mousetrap"
], 

function(
    Backbone,
    
    renderCardAddForm, 
    CommonLang, 
    CommonUtil,
    
    Mousetrap
) {
    var EditTextFormView, 
        StoreUtil = CommonUtil.store, 
        FORM_NAME = 'form_edit_text', 
        STORE_KEY_PREFIX = 'go.todo.' + GO.session('id');

    EditTextFormView = Backbone.View.extend({
        className: 'create_form', 

        template: renderCardAddForm, 
        name: 'edit-text-form', 
        textareaRows: 0,
        textareaHeight: 0,
        textareaMaxHeight: 0,
        autoExpand: false,
        removable: false,

        templateVariables: {},

        events: {
            "click .btn-submit": "_confirm", 
            "click .btn-cancel": "_cancel",
            "click .btn-remove": "_destroy",
            "keyup textarea" : "_resizeTextarea"
        }, 

        initialize: function(options) {
            options = options || {};
            this.content = options.content || StoreUtil.get(STORE_KEY_PREFIX + '.' + this.name) || '';
            this.afterConfirm = options.afterConfirm || function() {};
            this.afterCancel = options.afterCancel || function() {};
            this.afterRemove = options.afterRemove || function() {};
            this.enterNewLine = options.enterNewLine || false;
            this.autoExpand = options.autoExpand || false;
            this.removable = options.removable || false;

            this.textareaRows = options.textareaRows || 0; // 0 : 높이 지정안함
            this.textareaHeight = options.textareaHeight || 0; // 0 : 높이 지정안함.
            this.textareaMaxHeight = options.textareaMaxHeight || 0; // 0 : 높이 지정안함.

            this.templateVariables = $.extend(true, {}, options.templateVariables || {}, {
                "form_name": FORM_NAME,
                "content": this.content,
                "textareaRows": this.textareaRows,
                "removable": this.removable,
                "label": {
                    "save": CommonLang["저장"],
                    "cancel": CommonLang["취소"],
                    "remove": CommonLang["삭제"]
                }
            });

            this.render();
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            bindShortcutKeyEvents.call(this);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            Mousetrap.reset();
        },

        render: function() {
            this.$el.empty().append(this.template(this.templateVariables));

            setTextareaHeight.call(this);
            bindClearEditFormEvent.call(this);

            this.$el.find('textarea').focus();
        }, 

        remove: function() {
            $(document).off('go.todo.cleareditform');
            Backbone.View.prototype.remove.apply(this, arguments);
        }, 

        getValue: function() {
            return CommonUtil.stripIllegalTags(this.$el.find('textarea').val());
        }, 

        confirm: function() {
            removeTempSaved.call(this);
            this.remove();
            this.afterConfirm.apply(this, arguments);
        }, 

        cancel: function() {
            removeTempSaved.call(this);
            this.remove();
            this.afterCancel.apply(this, arguments);
        },

        destroy: function() {
            removeTempSaved.call(this);
            this.remove();
            this.afterRemove.apply(this, arguments);
        },

        close: function() {
            tempSave.call(this);
            this.remove();
            this.afterCancel.apply(this, arguments);
        }, 

        afterCancel: function() {}, 
        afterConfirm: function() {}, 

        _confirm: function(e) {
            e.preventDefault();
            this.confirm();
        }, 

        _cancel: function(e) {
            e.preventDefault();
            this.cancel();
        },
        
        _keyPress : function(e) {
            if(e.keyCode !== 13) return;

            if(!this.enterNewLine) {
                e.preventDefault();
                this._confirm(e);
            }
        }, 

        _resizeTextarea: function(e) {
        	console.log(e);
            if(e.keyCode !== 13) return;

            if(this.autoExpand) {
                expandTextarea(e.currentTarget);
            }
        },

        _destroy: function(e) {
            e.preventDefault();
            this.destroy();
        }
    });

    function bindShortcutKeyEvents() {
        var self = this;
        Mousetrap.bind(['enter'], function(e) {
            var $target = $(e.target);

            if(!$target.is('textarea.mousetrap')) {
                return true;
            }

            if(!self.enterNewLine) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    // internet explorer
                    e.returnValue = false;
                }

                self._confirm(e);
            }
        });
    }

    function setTextareaHeight() {
        var $textarea = this.$el.find('textarea');

        if(this.textareaMaxHeight > 0) {
            $textarea.css('max-height', this.textareaMaxHeight);
        }

        if(this.textareaHeight > 0) {
            $textarea.height(this.textareaHeight);
        }
    }

    function expandTextarea(el) {
        var cH = el.clientHeight, 
            sH = el.scrollHeight, 
            delta = Math.abs($(el).outerHeight() - $(el).innerHeight()) || 0;

        if (sH > cH) {
            $(el).height(sH + delta);
        }
    }

    function bindClearEditFormEvent() {
        setTimeout(_.bind(function() {
            var self = this;
            $(document).on('go.todo.cleareditform', function(e) {
                var $relatedTarget = $(e.relatedTarget);

                if($relatedTarget.closest(self.$el).length > 0) return;

                if(self.$el.is(':visible')) {
                    self.close();
                }
            });
        }, this), 300);
    }

    function tempSave() {
        StoreUtil.set(STORE_KEY_PREFIX + '.' + this.name, this.getValue(), {"type": 'session'});
    }

    function removeTempSaved() {
        StoreUtil.set(STORE_KEY_PREFIX + '.' + this.name, null, {"type": 'session'});
    }
    
    return EditTextFormView;
});