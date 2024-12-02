define("timeline/views/company_stat/stat_filter", function (require) {

    var GO = require("app");
    var Backbone = require("backbone");
    var Tpl = require("hgn!timeline/templates/company_stat/stat_filter");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

    var Filter = Backbone.View.extend({
        className: "table_search table_search_ehr",

        events: {
            "change #filter_type": "filterTypeChange",
            "click #search": "search",
            "keyup #text_field" : "enterSearch"
        },

        initialize: function (param) {
            this.options = param.options;
            this.range = param.range;
            this.filterType = this.options ? this.options.filterType : 'none';
        },

        render: function () {
            this.$el.html(Tpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
                filterType:this.filterType,
                timeFilter:this.isTimeFilter(),
                textFilter:this.isTextFilter(),
                useFilter:this.isUseFilter(),
                isCompany:this.range == 'COMPANY',
                isDept:this.range == 'DEPARTMENT',
            }));

            if (this.options){
                this.$el.find("#filter_type").val(this.filterType)
                this.$el.find("#time_filter_type").val(this.options.timeFilterType)
                this.$el.find("#filter_hour").val(this.options.filterHour)
                this.$el.find("#text_field").val(this.options.textField)
                this.options = null;
            }

            this.$el.find("#filter_type").val(this.filterType);

            return this;
        },
        isUseFilter:function(){
            return this.filterType && this.filterType != 'none';
        },
        isTimeFilter:function(){
            return this.filterType == 'totalTime';
        },
        isTextFilter:function(){
            return this.filterType == 'departmentName' || this.filterType == 'userName' || this.filterType == 'groupName';
        },
        filterTypeChange: function (type) {
            var selectedValue = $(type.currentTarget).val();
            this.filterType = selectedValue;
            if(this.filterType == 'none'){
                this.search();
            }

            this.render();
        },
        getSearchQuery:function(){
            if ( this.isTextFilter()){
                return  $.param( {'_key_':this.$el.find("#text_field").val()}).replace('_key_', this.filterType);
            }
            else if ( this.isTimeFilter()){
                return this.$el.find("#time_filter_type").val() + "=" + this.$el.find("#filter_hour").val();
            }
            else{
                return '';
            }
        },
        search:function(){
            var options = {
                filterType:this.filterType,
                textField:this.$el.find("#text_field").val(),
                filterHour:this.$el.find("#filter_hour").val(),
                timeFilterType:this.$el.find("#time_filter_type").val(),
                query:this.getSearchQuery()}
            this.trigger('statFiltering', options);
        },

        enterSearch:function(e){
            if (e.keyCode == 13) {
                this.search();
            }
        }
    });

    return Filter;

});