/**
 * 조직도 검색 detailView
 */
;define(function (require) {
    var Backbone = require("backbone");

    var GroupTpl = require("hgn!contact/templates/tab_book/connector_search");
    var OrgDetailView = require("contact/views/tab_book/detail/org");

    // 조직도
    var SearchContactView = Backbone.View.extend({
        type : "USERSEARCH",

        initialize: function (options) {
            this.detailView = new OrgDetailView({type: this.type, mode : options.mode});
        },

        render: function () {
            this.$el.html(GroupTpl());
            var $contactWrap = this.$el.find("#contactWrap");

            $contactWrap.append(this.detailView.el);

            this.detailView.render();
        },

        getSelectedGroup : function(){
            return this.detailView.getSelectedGroup();
        },

        getSelectedUsers : function(){
            return this.detailView.getSelectedUsers();
        }
    });

    return SearchContactView;
});