define("admin/views/ehr/timeline/group/noti/noti_settings", function(require) {
    var Backbone = require("backbone");
    var NotiView = require("admin/views/ehr/timeline/group/noti/noti");
    var TimeLineLang = require("i18n!timeline/nls/timeline");
    var AdminLang = require("i18n!admin/nls/admin");
    var _ = require("underscore");

    var Lang = {
        '기본 근무시간 초과(전)' : GO.i18n(TimeLineLang["기본 근무시간 초과(0)"],{arg1 : AdminLang['전']}),
        '기본 근무시간 초과(후)' : GO.i18n(TimeLineLang["기본 근무시간 초과(0)"],{arg1 : AdminLang['후']}),
        '연장 근무시간 초과(전)' : GO.i18n(TimeLineLang["연장 근무시간 초과(0)"],{arg1 : AdminLang['전']}),
        '연장 근무시간 초과(후)' : GO.i18n(TimeLineLang["연장 근무시간 초과(0)"],{arg1 : AdminLang['후']}),
    };

    var NotiSettings = Backbone.View.extend({

        initialize : function() {
            this.itemViews = [];
             var collection = this.options.collection;
            var clockInView = new NotiView({type : "CLOCKIN", title : TimeLineLang["업무시작"], timeSetting : {use : true, type : 'MINUTE', afterType : false}, collection : getDateByType(collection, "CLOCKIN")})
            this.itemViews.push(clockInView);
            var clockOutView = new NotiView({type : "CLOCKOUT", title : TimeLineLang["업무종료"], timeSetting : {use : true, type : 'MINUTE', afterType : false}, collection : getDateByType(collection, "CLOCKOUT")});
            this.itemViews.push(clockOutView);
            this.itemViews.push(new NotiView({type : "OVER_TIME_40_BEFORE", title : TimeLineLang["40시간 초과"], timeSetting : {use : false}, description : TimeLineLang["40시간 초과 알림 설명"], collection : getDateByType(collection, "OVER_TIME_40_BEFORE")}));
            this.itemViews.push(new NotiView({type : "OVER_TIME_52_BEFORE", title : TimeLineLang["52시간 초과"], timeSetting : {use : false}, description : TimeLineLang["52시간 초과 알림 설명"], collection : getDateByType(collection, "OVER_TIME_52_BEFORE")}));
            this.itemViews.push(new NotiView({type : "REST_TIME", title : TimeLineLang["휴게시간 종료"], timeSetting : {use : true, type : 'MINUTE', afterType : false}, collection : getDateByType(collection, "REST_TIME")}));

            this.itemViews.push(new NotiView({type : "OVER_TIME_MONTH_MINIMUM_BEFORE", title : Lang["기본 근무시간 초과(전)"], timeSetting : {use : true, type : 'HOUR', afterType : false}, collection : getDateByType(collection, "OVER_TIME_MONTH_MINIMUM_BEFORE")}));
            this.itemViews.push(new NotiView({type : "OVER_TIME_MONTH_MINIMUM_AFTER", title : Lang["기본 근무시간 초과(후)"], timeSetting : {use : true, type : 'HOUR', afterType : true}, collection : getDateByType(collection, "OVER_TIME_MONTH_MINIMUM_AFTER")}));
            this.itemViews.push(new NotiView({type : "OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE", title : Lang["연장 근무시간 초과(전)"], timeSetting : {use : true, type : 'HOUR', afterType : false}, collection : getDateByType(collection, "OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE")}));
            this.itemViews.push(new NotiView({type : "OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER", title : Lang["연장 근무시간 초과(후)"], timeSetting : {use : true, type : 'HOUR', afterType : true}, collection : getDateByType(collection, "OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER")}));

            this.renderNotiList(this.options.hideNotis);

            function getDateByType(collection, type){
                return _.chain(collection)
                    .filter(function(data){
                        return data.notiType == type;
                    }).value();
            }
        },

        render : function() {
            _.each(this.itemViews, _.bind(function(itemView){
                this.$el.append(itemView.$el);
                itemView.render();
            }, this));
        },

        getData : function(exclude) {
            var chain = _.chain(this.itemViews);

            if(exclude) {
                chain = chain.filter(function(view){
                    return !_.contains(exclude, view.type);
                });
            }

            return _.flatten(chain.map(function(itemView){
                return itemView.getData();
            }).value());
        },

        show : function(types) {
            _.chain(this.itemViews)
                .filter(function(view) {
                    return _.contains(types, view.type);
                })
                .map(function(view) {
                    view.$el.show();
                }).value();
        },

        hide : function(types) {
            _.chain(this.itemViews)
                .filter(function(view) {
                    return _.contains(types, view.type);
                })
                .map(function(view) {
                    view.$el.hide();
                }).value();
        },

        renderNotiList : function(types) {
            var chain = _.chain(this.itemViews);

            chain.filter(function(view) {
                return _.contains(types, view.type);
            }).map(function(view) {
                view.$el.show();
            }).value();

            chain.filter(function(view) {
                return !_.contains(types, view.type);
            }).map(function(view) {
                view.$el.hide();
            }).value();
        }


    });

    return NotiSettings;
});
