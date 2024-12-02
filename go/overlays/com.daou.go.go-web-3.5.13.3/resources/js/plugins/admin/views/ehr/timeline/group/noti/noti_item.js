define("admin/views/ehr/timeline/group/noti/noti_item", function(require){
    var Backbone = require("backbone");
    var Tmpl = require("hgn!admin/templates/ehr/timeline/group/noti/noti_item");
    var AdminLang = require("i18n!admin/nls/admin");
    var TimeLineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var GO = require("app");
    var _ = require("underscore");
    require("jquery.go-popup");

    var TIME_RANGE = {
        MINUTE : _.range(10, 125, 10),
        HOUR : _.range(1, 13, 1),
    };

    var NotiItem = Backbone.View.extend({
        tagName : "span",
        className : "vertical_wrap",
        default : {
            data : {minute : "10"}
        },
        events : {
            "click #add_noti" : "addNoti",
            "click #remove_noti" : "removeNoti"
        },

        initialize : function() {
            this.timeSetting = this.options.timeSetting ? this.options.timeSetting : { use : false };
            this.timeSetting.timeRange = TIME_RANGE[this.timeSetting.type] ? TIME_RANGE[this.timeSetting.type] : TIME_RANGE.MINUTE;
            this.timeSetting.useMinuteType = this.timeSetting.type != 'MINUTE' ? false : true;
            this.timeSetting.afterType = this.timeSetting.afterType ? this.timeSetting.afterType : false;
            this.description = this.options.description;
            this.data = _.extend({}, this.default.data, this.options.data);
        },

        render : function() {
            var self = this;
            this.$el.html(Tmpl({
                type : this.type,
                CommonLang : CommonLang,
                AdminLang : AdminLang,
                description : this.description,
                TimeLineLang : TimeLineLang,
                timeSetting : this.timeSetting,
                isSelected : function() {
                    var notiTime = self.timeSetting && self.timeSetting.type == 'HOUR' ? self.data.limitWorkingHour : self.data.minute;
                    return notiTime == this;
                }
            }));
        },

        addNoti : function() {
            this.trigger("addNoti", this);
        },

        removeNoti : function() {
            this.trigger("removeNoti", this);
            this.remove();
        },

        getDate : function() {
            return this.timeSetting.use ? this.$el.find("#notiTime").val() : null;
        }
    });

    return NotiItem;
});
