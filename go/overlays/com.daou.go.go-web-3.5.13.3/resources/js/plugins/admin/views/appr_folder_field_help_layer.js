define([
    "jquery",
    "underscore",
    "backbone",
    "app",

    "hgn!admin/templates/appr_folder_field_help_layer",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin"
],
function(
    $,
    _,
    Backbone,
    GO,

    ApprFolderFieldHelpLayerTpl,
    commonLang,
    approvalLang,
    adminLang
) {


    var ApprFolderFieldHelpLayerView = Backbone.View.extend({
    	
        initialize: function(options) {
            this.$el = options.el;
        },

        render: function() {
            this.$el.html(ApprFolderFieldHelpLayerTpl(approvalLang));
            return this.$el;
        }

    });

    return ApprFolderFieldHelpLayerView;
});