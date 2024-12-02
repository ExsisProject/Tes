define("timeline/views/mobile/company_stat/stat_filter", function (require) {

    var GO = require("app");
    var Backbone = require("backbone");
    
    var Tmpl = require("hgn!timeline/templates/mobile/company_stat/stat_filter");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

    var Filter = Backbone.View.extend({

    	bindEvent : function(){
        	var self = this;
        	$("#filter_type").change(function(e){ self.filterTypeChange(e); });
        	$("#search").click(function(e){ self.search(e); });
        	$("#text_field").keyup(function(e){ self.searchEnter(e); })
        },
        unbindEvent : function(){
        	$("#filter_type").unbind("change");
        	$("#search").unbind("click");
        	$("#text_field").unbind("keyup");
        },

        initialize : function (param) {
            this.options = param.options;
            this.range = param.range;
            this.filterType = this.options ? this.options.filterType : 'userName';
        },

        render : function () {
        	var self = this;
        	this.unbindEvent();
            $("#filter_parent").html(Tmpl({
                TimelineLang : TimelineLang,
                CommonLang : CommonLang,
                filterType : this.filterType,
                isCompany : this.range == 'COMPANY',
                isDept : this.range == 'DEPARTMENT'
            }, this));

            if (this.options){
                $("#filter_type").val(this.filterType)
                $("#text_field").val(this.options.textField)
                this.options = null;
            }

            $("#filter_type").val(this.filterType);
            this.bindEvent();
        },
        filterTypeChange : function (type) {
            var selectedValue = $(type.currentTarget).val();
            this.filterType = selectedValue;
            if(this.filterType == 'none'){
                this.search();
            }

            this.render();
        },
        getSearchQuery : function() {
           return this.filterType + '='  + $("#text_field").val();
        },
        search : function() {
            var options = {
                filterType:this.filterType,
                textField:$("#text_field").val(),
                query:this.getSearchQuery()
            }
            this.trigger('statFiltering', options);
        },
        searchEnter : function(e) {
        	if(e.keyCode == 13) this.search();
            return false;
        }
    });

    return Filter;

});