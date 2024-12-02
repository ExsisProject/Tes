define(function (require) {
    var Backbone = require("backbone");
    var TreeView = require("admin/views/contact/company_tree");
    var FormView = require("admin/views/contact/company_form");

    var ContactCompany = Backbone.View.extend({
        className : "content_tb",

        events: {},

        initialize: function (options) {
            this.treeView = new TreeView({isAdmin : options.isAdmin, isSiteAdmin : options.isSiteAdmin});
            this.detailView = new FormView({isAdmin : options.isAdmin, isSiteAdmin : options.isSiteAdmin});

            this.treeView
            .on({
            	"company_tree.empty" : $.proxy(empty, this),
                "company_form.refresh" : $.proxy(refresh, this),
                "company_tree.detail" : $.proxy(render, this)
            });

            this.detailView.on({
                "company_form.refresh" : $.proxy(refresh, this)
            });
            
            function empty() {
        	   this.detailView.renderEmpty();
            }
            
            function refresh(){
               this.render();
               this.detailView.renderEmpty();
            }

            function render(contactId){
                this.detailView.render(contactId);
            }
        },

        render: function () {
            this.$el.append(this.treeView.el);
            this.$el.append(this.detailView.el);
            this.treeView.render();
            this.detailView.render();

            return this;
        }
    });

    return ContactCompany;
});