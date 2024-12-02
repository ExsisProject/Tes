define('admin/views/auth/admin_auth_list', function(require) {

    var AdminAuthListTmpl = require('hgn!admin/templates/auth/admin_auth_list');
    var AdminAuthEditPopupTmpl = require('hgn!admin/templates/auth/admin_auth_group_edit_popup');
    var AdminAuthGroupCollection = require('admin/collections/auth/admin_auth_groups');
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    return Backbone.View.extend({

        el : '#adminAuthList',

        events : {
            'click .auth_group' : 'onGroupClicked',
            'click #group_add_btn' : 'onAddBtnClicked',
            'click #group_mod_btn' : 'onModBtnClicked',
            'click #group_del_btn' : 'onDelBtnClicked'
        },

        initialize : function(options) {
            this.authGroupCollection = new AdminAuthGroupCollection();
            this.authGroupCollection.fetch({ async : false });

            this.authGroupCollection.each(function (model) {
                if (options.activeAuthGroup) {
                    model.active = options.activeAuthGroup.id == model.id;
                } else {
                    model.active = model.isDefaultGroup();
                }
            });
        },

        render : function() {
            var self = this;
            this.$el.html(AdminAuthListTmpl({
                groups : this.authGroupCollection.models,
                adminLang : AdminLang,
                commonLang : CommonLang
            }));
        },

        onGroupClicked : function(e) {
            $.goOrgSlide.close();
            this.activeGroup($(e.currentTarget));
            this.$el.trigger('renderAuthGroup', this.getCheckedGroupModel());
        },

        activeGroup : function(groupEl) {
            this.$el.find('#group_list .auth_group.active').removeClass('active');
            groupEl.addClass('active');
        },

        onAddBtnClicked : function() {
            var _self = this;
            var checkedGroupModel = this.getCheckedGroupModel();
            var callback = function() {
                var name = $('#authNameInput').val();
                GO.util.preloader(this.authGroupCollection.addGroup(name)
                    .done(function() {
                        _self.render();
                        _self.activeGroup($('.auth_group[data-id="' + checkedGroupModel.id +'"]'));
                    })
                );
            };

            $.goPopup({
                title : AdminLang["선택한 권한 추가"],
                modal : true,
                contents : AdminAuthEditPopupTmpl({ adminLang : AdminLang }),
                buttons : [{
                    btype : 'confirm',
                    btext: CommonLang["저장"],
                    callback: $.proxy(callback, this)
                }, {
                    btype : 'close', btext: CommonLang["취소"]
                }]
            });
        },

        onModBtnClicked : function(e) {
            var _self = this;
            var checkedGroupModel = this.getCheckedGroupModel();

            var callback = function() {
                var name = $('#authNameInput').val();
                GO.util.preloader(
                    this.authGroupCollection.modifyGroup(checkedGroupModel.id, name)
                    .done(function() {
                        _self.render();
                        _self.activeGroup($('.auth_group[data-id="' + checkedGroupModel.id +'"]'));
                        _self.$el.trigger('renderAuthGroup', checkedGroupModel);
                    })
                );
            };

            $.goPopup({
                title : AdminLang["선택한 권한 수정"],
                modal : true,
                contents : AdminAuthEditPopupTmpl({ adminLang : AdminLang, name : checkedGroupModel.get('name') }),
                buttons : [{
                    btype : 'confirm',
                    btext: CommonLang["저장"],
                    callback: $.proxy(callback, this)
                }, {
                    btype : 'close', btext: CommonLang["취소"]
                }]
            });
        },

        onDelBtnClicked : function() {
            var callback = function() {
                var _self = this;
                var model = this.getCheckedGroupModel();
                GO.util.preloader(
                    model.destroy()
                    .done(function() {
                        _self.render();
                        _self.$el.trigger('renderAuthGroup');
                    })
                );
            };

            $.goPopup({
                title : AdminLang["선택한 권한 삭제 알림"],
                modal : true,
                buttons : [{
                    btype : 'confirm',
                    btext: CommonLang["삭제"],
                    callback: $.proxy(callback, this)
                }, {
                    btype : 'close', btext: CommonLang["취소"]
                }]
            });
        },

        getCheckedGroupModel : function() {
            var groupEl = this.$el.find('#group_list .auth_group.active');
            var isDefault = groupEl.hasClass('default_group');
            var id = groupEl.data('id');

            if (isDefault) {
                return this.authGroupCollection.getDefaultAuthGroup();
            }
            return this.authGroupCollection.getById(id);
        },
    });

});