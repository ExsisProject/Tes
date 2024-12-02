define("admin/views/ehr/timeline/group/list", function(require){
    var Backbone = require("backbone");
    var Tmpl = require("hgn!admin/templates/ehr/timeline/group/list");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require('i18n!nls/commons');

    var ListView = Backbone.View.extend({
        events : {
            "click tr.group_item" : "selectedEvent"
        },

        initialize : function() {
            this.colleciton = this.options.collection;
        },

        render : function () {
            this.$el.html(Tmpl({
                collection : this.colleciton.models,
                AdminLang : AdminLang,
                TimelineLang : TimelineLang
            }));
        },

        selectedEvent : function(e){
            var $el = $(e.currentTarget);
            var originGroupId = $el.data("origingroupid");
            this.selectGroup(originGroupId);
        },

        selectGroup : function(originGroupId) {
            this.trigger("selected", originGroupId);
            this.$el.find("tr").removeClass("on");
            this.$el.find("tr[data-origingroupId=" + originGroupId +"]").addClass("on");
        },

        sortable : function() {
            this.$el.find('tbody').removeClass().sortable({
                opacity : '1',
                delay: 100,
                cursor : "move",
                items : "tr",
                containment : '.admin_content',
                hoverClass: "ui-state-hover",
                placeholder : 'ui-sortable-placeholder',
                start : function (event, ui) {
                    ui.placeholder.html(ui.helper.html());
                    ui.placeholder.find('td').css('padding','5px 10px');
                }
            });
        },

        saveSortOrder : function() {
            var self = this;
            var sortableBody = this.$el.find('tbody');
            var sortIds = sortableBody.find('tr').map(function(k,v) {
                return $(v).data('id');
            }).get();
            this.model = new Backbone.Model();
            this.model.url = GO.contextRoot + "ad/api/timeline/group/sortorder";
            this.model.set({ ids : sortIds }, { silent : true });
            this.model.save({}, {
                type:'PUT',
                success: function() {
                    $.goMessage(CommonLang["저장되었습니다."]);
                    self.trigger("save");
                }
            });
        }
    });

    return ListView;
});