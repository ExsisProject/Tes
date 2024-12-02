(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "hgn!admin/templates/app_admin_config",
        "hgn!admin/templates/app_admin_list",
        "jquery.go-orgslide",
        "jquery.go-popup",
        "jquery.go-sdk"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        itemTmpl,
        listTmpl
    ) {
        
        var AppAdminListView =  App.BaseView.extend({
            
            id: "administrator",
            className: "container",
            tagName: "div",
            title: null,
            
            initialize : function(options) {
            	this.options = options || {};
                this.title = this.options.title;
                this.unbindEvent();
                this.bindEvent();
            },
            
            unbindEvent : function() {
                this.$el.off("click", ".ic_del");
            },
            
            bindEvent : function() {
                this.$el.on("click", ".ic_del", $.proxy(this.removeAdmin, this));
            },
            
            render : function() {
                this.$el.empty().append(this._renderContainer());
                this.$el.find('ul.name_tag').prepend(this._renderNameTags());
                return this.$el;
            },
            
            _renderContainer: function() {
                return listTmpl({
                    lang: {
                        label_admin_option: this.title,
                        label_admin_label: adminLang["운영자"],
                        label_admin_add: adminLang["운영자 추가"],
                    }
                });
            },
            
            _renderNameTags: function() {
                var htmls = [];
                $('li:not(#administratorCreate)', this.$el).remove();
                _.each(this.collection.models, function(model) {
                    htmls.push(itemTmpl({
                        model: model.toJSON(),
                        lang: {
                            label_delete: commonLang["삭제"]
                        }
                    }));
                }, this);
                return htmls.join("\n");
            },
            
            addAdmin: function(data) {
            	
                if (this.collection.isExist(data)) {
                    $.goAlert(adminLang["이미 운영자로 지정"]);
                    return;
                }
                this.collection.addAdmin(data);
                this.render();
            },
            
            removeAdmin: function(e) {
                var targetUserId = $(e.target).parent().parent().attr("data-userId");
                this.collection.removeAdmin(targetUserId);
                this.render();
            }
        });
        
        return AppAdminListView;
    });
}).call(this);