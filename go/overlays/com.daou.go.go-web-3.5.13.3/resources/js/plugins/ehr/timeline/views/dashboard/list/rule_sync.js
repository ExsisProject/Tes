define("timeline/views/dashboard/list/rule_sync", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/list/rule_sync");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");

    var DashboardModel= require("timeline/models/dashboard/dashboard_summary");

    var TimelineDashboard = Backbone.View.extend({

        tagName: 'tbody',
        events: {
            "click #sync_btn": "sync",
        },
        initialize: function (date, list, syncCb, parent) {
            this.baseDate = date;
            this.viewList = list;
            this.colCnt = 5
                + (_.contains(this.viewList, 'absence') ? 1 : 0 )
                + (_.contains(this.viewList, 'vacation') ? 1 : 0 )
                + (_.contains(this.viewList, 'unAuthDevice') ? 1 : 0 )
                + (_.contains(this.viewList, 'extensionWorkingTime') ? 1 : 0 )
                + (_.contains(this.viewList, 'nightWorkingTime') ? 1 : 0 )
                + (_.contains(this.viewList, 'holyDayWorkingTime') ? 1 : 0 )
                + (_.contains(this.viewList, 'etcStatus') ? 1 : 0 );

            this.syncCb = syncCb;
            this.parent = parent;

        },
        render: function () {
            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                colCnt:this.colCnt
            }));
            return this;
        },
        sync:function(){
            var self = this;
            this.makeProcessLoader();
            $.ajax({
                type: "POST",
                url: GO.contextRoot + "api/ehr/timeline/company/sync",
                data: JSON.stringify({"day":moment(this.baseDate).format("YYYY-MM-DD")}),
                dataType: 'json',
                contentType: 'application/json',
                success: function (resp) {
                    self.removeProcessLoader();
                    self.syncCb(self.parent);
                },error:function(err){
                    self.removeProcessLoader();
                }
            });
        },
        makeProcessLoader:function() {
            this.removeProcessLoader();
            $("body").append('<div id="popOverlay" class="overlay" data-layer><div class="processing"></div></div>');
        },
        removeProcessLoader:function() {
            $("#popOverlay").remove();
        },

    });

    return TimelineDashboard;

});