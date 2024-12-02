define("timeline/views/user/change_history", function(require){

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/change_history");
    var ChangeHistorys = require("timeline/collections/change_historys");

    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var ProfileView = require("views/profile_card");
    var GO = require("app");

    var ChangeHistoryView = Backbone.View.extend({
        events : {
            "click #reload" :"reload",
            "click .photo": "showProfile"
        },

        initialize : function(options){
            this.models = new Array();
            this.options = options;
            this.logs = new ChangeHistorys(options);
        },
        changeBaseInfo:function(baseDate, userId){
            this.models = new Array();
            this.logs = new ChangeHistorys({baseDate : baseDate, userId:userId});
            this.logDataSet();
        },
        reload:function(){
            this.logs.nextPage();
            this.logDataSet();
        },
        refresh : function(){
            this.models = new Array();
            this.logs.reset();
            this.logDataSet();
        },
        logDataSet : function(){
            this.logs.fetch({async: false});
            this.lastPage = this.logs.page.lastPage;
            this.total = this.logs.page.total;

            for( var i = 0, model; model=this.logs.models[i]; i ++){
                model.attributes.date = GO.util.customDate(model.attributes.createdAt, 'MM-DD HH:mm')
                this.models[this.models.length] = model.attributes;
            }

            this.render();
        },
        showProfile : function(e) {
            e.preventDefault();
            e.stopPropagation();
            var target = e.currentTarget;
            var userId = $(target).attr("data-id");
            if (!userId) return;
            ProfileView.render(userId, target);
        },

        render : function() {
            this.$el.html(Tmpl({
                noHistoryMsg : CommonLang["변경이력이 없습니다."],
                TimelineLang : TimelineLang,
                total:this.total,
                hasNextPage:!this.lastPage,
                logs:this.models
            }));
        },
    });

    return ChangeHistoryView;
});