define("works/components/report/models/card_model", function(require) {
    var BaseModel = require('models/base_model');
    var worksLang = require("i18n!works/nls/works");

    return BaseModel.extend({
        initialize : function(options) {
            BaseModel.prototype.initialize.call(this);
            this.modelName = "card_setting";

            this.appletId = options.appletId;
            this.cid = options.cid;
            this.title = options.title;
            this.color = options.color;
            this.betweenDay = options.betweenDay;
            this.method = options.method;
            this.aggRangeOption = options.aggRangeOption;
            this.compareRangeOption = options.compareRangeOption;
            this.aggStartDate = options.aggStartDate;
            this.aggEndDate = options.aggEndDate;
            this.isEndDateToday = options.isEndDateToday;
            this.compareStartDate = options.compareStartDate;
            this.compareEndDate = options.compareEndDate;
            this.q = options.q ? options.q : '';
        },

        url: function() {
            return GO.contextRoot + "api/works/applet/" + this.appletId + "/card?" + this.getUrlParam();
        },

        getUrlParam: function(){
            return $.param(this.getParam());
        },

        getParam: function(){
            return {
                cid: this.get('cid'),
                title: this.get('title'),
                color: this.get('color'),
                betweenDay: this.get('betweenDay'),
                method: this.get('method'),
                aggRangeOption: this.get('aggRangeOption'),
                compareRangeOption: this.get('compareRangeOption'),
                aggStartDate: this.get('aggStartDate'),
                aggEndDate: this.get('aggEndDate'),
                isEndDateToday: this.get('isEndDateToday'),
                compareStartDate: this.get('compareStartDate'),
                compareEndDate: this.get('compareEndDate'),
                q: this.get('q')
            }
        },

        getValues: function() {
            var values = {};
            console.log(this);
            return values;
        },

        isInvalidTitle : function() {
            var isInvalid = false;
            var title = this.get("title");
            if (title.length < 1 || title.length > 20) {
                isInvalid = true;
            }

            return isInvalid;
        },

        getAggDate: function () {
            if ('ALL' != this.get('aggRangeOption')) {
                return this.get('aggDate');
            }

            return worksLang[this.get('aggDate')];
        },

        setQueryString : function(queryString) {
            this.set('q', queryString);
        },
    });
});