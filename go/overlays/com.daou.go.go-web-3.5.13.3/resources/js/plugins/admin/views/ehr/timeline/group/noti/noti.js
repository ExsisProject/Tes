define("admin/views/ehr/timeline/group/noti/noti", function(require) {
    var Backbone = require("backbone");
    var NotiItemView = require("admin/views/ehr/timeline/group/noti/noti_item");
    var Tmpl = require("hgn!admin/templates/ehr/timeline/group/noti/noti");
    var AdminLang = require("i18n!admin/nls/admin");
    var _ = require("underscore");
    var CommonLang = require("i18n!nls/commons");
    var GO = require("app");

    var Noti = Backbone.View.extend({

        MAX_ITEM_COUNT : 3,
        tagName : "tr",
        events : {

        },

        initialize : function() {
            var self = this;

            this.type = this.options.type;
            this.title = this.options.title;
            this.timeSetting = this.options.timeSetting;
            this.description = this.options.description;
            this.collection = this.options.collection;

            if(_.isUndefined(this.collection) || _.isEmpty(this.collection)) {
                this.notiItems = [this.makeNotiItemView()];
            } else {
                this.notiItems = _.chain(this.collection).map(function(data){
                    return self.makeNotiItemView(data);
                }).value();
            }
        },

        render : function() {
            this.$el.html(Tmpl({
                type : this.type,
                title : this.title,
                isOn : _.isEmpty(this.collection) ? false : this.collection[0].enable
            }));

            _.each(this.notiItems, _.bind(function(itemView){
                this.$el.find("#noti_list").append(itemView.$el);
                itemView.render();
            }, this));
        },

        makeNotiItemView : function(data) {
            var itemView =  new NotiItemView({
                timeSetting: this.timeSetting,
                description: this.description,
                data : data
            });

            itemView.on({
                "addNoti" : _.bind(this.addNoti, this),
                "removeNoti" : _.bind(this.removeNoti, this)
            });

            return itemView;
        },

        addNoti : function(item) {
            if(this.notiItems.length >= this.MAX_ITEM_COUNT) {
                $.goError(GO.i18n(CommonLang['최대 {{arg1}}개 까지 설정할 수 있습니다.'], {"arg1": this.MAX_ITEM_COUNT}));
                throw new Error(GO.i18n(CommonLang['최대 {{arg1}}개 까지 설정할 수 있습니다.'], {"arg1": this.MAX_ITEM_COUNT}));
            }

            var itemView = this.makeNotiItemView();
            $(item.$el).after(itemView.$el);
            itemView.render(true);
            this.notiItems.splice(this.notiItems.indexOf(item) + 1, 0, itemView);
        },

        removeNoti : function(item) {
            if(this.notiItems.length < 2){
                $.goError(AdminLang["최소 1개는 존재해야 합니다."]);
                throw new Error(AdminLang["최소 1개는 존재해야 합니다."]);
            }
            this.notiItems = _.without(this.notiItems, item);
        },

        getData : function(){
            var self = this;
            return _.chain(this.notiItems)
                .map(function(item){
                    return item.timeSetting.useMinuteType ? minuteTypeData(item) : hourTypeDate(item);
                }).value()

            function minuteTypeData(item) {
                return {
                    notiType : self.type,
                    enable : self.$el.find("#"+self.type).is(":checked"),
                    minute : item.getDate()
                }
            }
            function hourTypeDate(item) {
                return {
                    notiType : self.type,
                    enable : self.$el.find("#"+self.type).is(":checked"),
                    limitWorkingHour : item.getDate()
                }
            }
        }
    });

    return Noti;
});
