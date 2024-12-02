define('admin/views/auth/admin_auth', function(require) {

    var AdminAuthListView = require('admin/views/auth/admin_auth_list');
    var AdminAuthGroupView = require('admin/views/auth/admin_auth_group');
    var AdminAuthLayoutTmpl = require('hgn!admin/templates/auth/admin_auth');

    return Backbone.View.extend({

        events : {
            'renderAuthGroup #adminAuthList' : 'renderAdminAuthGroup',
            'renderAdminAuthList #adminAuthList' : 'renderAdminAuthList'
        },

        initialize : function() {

        },

        render : function() {
            this.$el.html(AdminAuthLayoutTmpl());

            this.renderAdminAuthList();
            this.renderAdminAuthGroup();
        },

        renderAdminAuthList : function(e, authGroup) {
            this.adminAuthListView = new AdminAuthListView({
                activeAuthGroup : authGroup
            });
            this.adminAuthListView.render();
        },

        renderAdminAuthGroup : function(e, authGroup) {
            if (this.adminAuthGroupView) {
                this.adminAuthGroupView.remove();
            }

            authGroup = authGroup ? authGroup : this.adminAuthListView.getCheckedGroupModel();
            this.adminAuthGroupView = new AdminAuthGroupView({
                authGroup : authGroup,
                authGroupCollection : this.adminAuthListView.authGroupCollection
            });
            this.adminAuthGroupView.render();

            if (authGroup.isDefaultGroup()) {
                this.$el.find('#group_mod_btn').hide();
                this.$el.find('#group_del_btn').hide();
            } else {
                this.$el.find('#group_mod_btn').show();
                this.$el.find('#group_del_btn').show();
            }
        },

    });

});