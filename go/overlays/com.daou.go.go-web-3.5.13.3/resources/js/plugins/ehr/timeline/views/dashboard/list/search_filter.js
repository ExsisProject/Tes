define("timeline/views/dashboard/list/search_filter", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/list/search_filter");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");

    var TimelineDashboard = Backbone.View.extend({

        events: {
            "click input[type=checkbox]": "checkChanged",
            "click #ck_main": "toogleCkbox",
            "click .search_box": "toogleInputBox",
            "click .cancel": "hidePopup",
            "click .ic_close": "closeOpt",
            "click #startDateInput":"viewStartDate",
            "click #endDateInput":"viewEndDate",
            "click #dateConfirm":"dateConfirm",
            "click #deptConfirm":"deptConfirm",
            "click #nameConfirm":"nameConfirm",
        },
        initialize: function (opt) {
            this.cb = opt.cb;
            this.parent= opt.self;
            this.data = opt.data;
            this.baseDate = opt.baseDate;
        },
        render: function () {
            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
            }));
            var self = this;

            $('body').on('click', function(e){
                var isArrayOpt= $(e.target).parents('.array_option').length > 0 ;
                var isLayer = $(e.target).parents('.layer_a').length > 0 ;
                var isSearchBox= $(e.target).parents('.search_box').length > 0 ;
                var isDatepicker= $(e.target).parents('.ui-datepicker').length > 0 ;
                if( !isLayer && !isArrayOpt && !isSearchBox && !isDatepicker) {
                    self.hidePopup();
                }
            })

            this.initDatePicker();
            return this;
        },
        viewStartDate:function(){
            $("#startDatePicker").trigger('focus');
        },
        viewEndDate:function(){
            $("#endDatePicker").trigger('focus');
        },
        deptConfirm:function(){
            this.deptName =  this.$el.find('#dept-value').val();
            this.$el.find('#dept-filter').text(this.deptName);
            this.hidePopup();
            this.changedFilter();
        },
        nameConfirm:function(){
            this.name =  this.$el.find('#name-value').val();
            this.$el.find('#name-filter').text(this.name);
            this.hidePopup();
            this.changedFilter();
        },
        dateConfirm:function(){
            this.startDate =  this.$el.find('#start-date').val();
            this.endDate =  this.$el.find('#end-date').val();

            this.$el.find('#dateRange').text(this.startDate +' ~ ' +  this.endDate);
            this.hidePopup();
            this.changedFilter();
        },
        initDatePicker:function(){
            var self = this;
            var date = new Date(this.baseDate);

            var end= new Date(date.getFullYear(), date.getMonth() +1, 0);

            this.startDate = moment(date).format('YYYY-MM-01');
            this.endDate = moment(end).format('YYYY-MM-DD');
            this.$el.find('#dateRange').text(this.startDate +' ~ ' +  this.endDate);

            self.$el.find('#start-date').val(this.startDate);
            self.$el.find('#end-date').val(this.endDate);


            this.$el.find("#startDatePicker").datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate:this.startDate,
                maxDate:this.endDate,
                onSelect : function(selectedDate){
                    self.$el.find('#start-date').val(selectedDate);
                }
            });
            this.$el.find("#endDatePicker").datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate:this.startDate,
                maxDate:this.endDate,
                onSelect : function(selectedDate){
                    self.$el.find('#end-date').val(selectedDate);
                }
            });
        },
        checkChanged:function(){
            var self = this;
            _.forEach(this.$el.find('input[type=checkbox]'), function(ck){
                var id = $(ck).attr('id');
                var checked = $(ck).is(':checked');
                var name = id.replace('Ck', 'Opt');
                if( checked){
                    self.$el.find('#' + name).show();
                }else{
                    self.$el.find('#' + name).hide();
                }
            })
        },
        toogleCkbox:function(){
            var view = this.$el.find('.fastSearch');
            if(view.css('display') === 'none'){
                this.$el.find('.array_option').hide();
                view.show();
            }else{
                view.hide();
            }
        },
        toogleInputBox:function(e){
            var target = $(e.target);
            if(target.parents('.array_option').length > 0 ){
                return;
            }
            if( !target.hasClass('search_box')){
                target = target.parents('.search_box');
            }
            var id = target.attr('id').replace('Opt', 'Input');
            this.$el.find('.array_option').hide();
            this.$el.find('#' + id).show();

        },
        closeOpt:function(e){
            var target = $(e.target);
            target.parents('.search_box').hide();
            var id = target.parents('.search_box').attr('id');
            this.$el.find('#' + id.replace('Opt', 'Ck')).attr('checked', false);
            this.$el.find('#' + id.replace('Opt', '-filter')).text('');
            this.changedFilter();
        },
        hidePopup:function(){
            var self = this;

            setTimeout(function(){
                self.$el.find('.array_option').hide();
            }, 50);
        },
        changedFilter:function(){
            var self = this;
            var userName= undefined;
            var deptName = undefined;
            var startDate = undefined;
            var endDate = undefined;

            _.forEach(this.$el.find('input[type=checkbox]'), function(ck){
                var id = $(ck).attr('id');
                var checked = $(ck).is(':checked');
                var name = id.replace('Ck', '');
                if( checked){
                    if( name === 'name'){
                       userName = self.name;
                    }else if ( name === 'dept'){
                       deptName = self.deptName;
                    } else if( name === 'date'){
                        startDate= self.startDate;
                        endDate= self.endDate;
                    }
                }
            })

            var opt = {name:userName, deptName:deptName, startDate:startDate, endDate:endDate};

            this.cb(opt, this.parent);
        },


    });

    return TimelineDashboard;

});