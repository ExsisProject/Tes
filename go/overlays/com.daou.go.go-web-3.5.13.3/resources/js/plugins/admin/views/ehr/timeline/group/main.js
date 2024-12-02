define("admin/views/ehr/timeline/group/main", function(require){
    var Tmpl = require("hgn!admin/templates/ehr/timeline/group/main");
    var ListView = require("admin/views/ehr/timeline/group/list");
    var DetailView = require("admin/views/ehr/timeline/group/detail");
    var Backbone = require("backbone");
    var GroupCollection = require("admin/collections/ehr/timeline/group");
    var TimelineExtModel = require("admin/models/ehr/timeline/ext_config");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!admin/nls/admin");
    var lang = {
        "근무 그룹 설정" : AdminLang["근무 그룹 설정"],
        "신규추가" : AdminLang["신규추가"],
        "순서바꾸기" : CommonLang["순서바꾸기"],
        "순서바꾸기 완료" : CommonLang["순서바꾸기 완료"]
    }

    var Main = Backbone.View.extend({
        events : {
            "click #add_group" : "addGroup",
            "click #sort" : "sort",
            "click #sort_confirm" : "saveSortOrder"
        },

        initialize : function() {
            this.groupCollection = new GroupCollection();
            this.extModel = new TimelineExtModel();
            this.selectedOriginGroupId = null;
            GO.EventEmitter.on('timeline', 'changed:groups', this.render, this);
        },

        render : function () {
            this.$el.html(Tmpl({
                lang : lang
            }));

            var groupDeferred = this.groupCollection.fetch();
            var extDeferred = this.extModel.fetch();

            $.when(groupDeferred, extDeferred)
                .then(_.bind(function(){
                    this.renderContent();
                    var selectedOriginGroupId = this.selectedOriginGroupId == null ? this.groupCollection.at(0).get("originGroupId") : this.selectedOriginGroupId;
                    this.listView.selectGroup(selectedOriginGroupId);
                }, this));
        },

        renderContent : function(){
            this.listView = new ListView({collection : this.groupCollection});
            this.$el.find("#group_list").html(this.listView.el);
            this.listView.render();

            this.listView.on("save", _.bind(function(){
                this.render();
            }, this));

            this.listView.on("selected", $.proxy(function(selectedOriginGroupId){
                var selectedModel = this.groupCollection.findWhere({"originGroupId" : selectedOriginGroupId});
                this.renderDetail(selectedModel);
            }, this));
        },

        renderDetail : function(model) {
            this.detailView = new DetailView({model : model, extModel : this.extModel});
            this.$el.find("#group_detail").html(this.detailView.el);
            this.detailView.render();

            this.detailView.on("change", _.bind(function(selectedOriginGroupId){
                this.selectedOriginGroupId = selectedOriginGroupId;
                this.groupCollection.fetch({reset : true});
            }, this));

            this.detailView.on("deleted", _.bind(function(){
                this.selectedOriginGroupId = null;
                this.groupCollection.fetch({reset : true});
            }, this));
        },

        addGroup : function(){
            this.renderDetail(null);
        },

        sort : function(){
            this.$el.find("span.before_sort").hide();
            this.$el.find("span.after_sort").show();
            this.listView.sortable();
        },

        saveSortOrder : function() {
            this.listView.saveSortOrder();
        }
    });

    return Main;
});
