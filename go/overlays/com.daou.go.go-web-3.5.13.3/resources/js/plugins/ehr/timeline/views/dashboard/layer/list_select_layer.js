define("timeline/views/dashboard/layer/list_select_layer", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/layer/list_select_layer");

    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");
    var App = require('app');

    require("jquery.go-popup");

    var TimelineDashboard = Backbone.View.extend({

        tagName: 'tbody',
        events: {
            "click #sync_btn": "sync",
        },
        initialize: function (opt) {
            this.confirmCb = opt.confirmCb;
            this.parent = opt.parent;
        },
        render: function () {

            this.popup = $.goPopup({
                pclass :'layer_normal attend_statistic_filter',
                width:'600px',
                modal:false,
                closeIconVisible : true,
                header:'목록관리',
                draggable : true,
                contents: '',
                buttons :[
                    { btype:'confirm', btext:'확인',    callback: $.proxy(function() {
                        this.saveItems();
                        }, this) },
                    { btype:'close', btext:'취소' }, ]
            });
            this.popup.reoffset();

            this.popup.find('.content').empty().append('<table class="form_type go_form_basic"></table>');

            this.popup.find('table').append(this.$el);

            this.renderContent();
            this.moveCenter();
            this.retouchCheck();
            return this;
        },
        moveCenter:function(){
            var wSize = $(window).height();
            var pSize = $('#gpopupLayer').height();
            var top = (wSize - pSize) /2 ;
            $('#gpopupLayer').css('top', top +'px');
        },
        retouchCheck:function(){
            var lists = this.getLists();

            this.$el.find('input[type=checkbox]').attr('checked', false);
            _.forEach(this.$el.find('input[type=checkbox]'), function(ck){
                var id = $(ck).attr('id');
                if(_.contains(lists, id)){
                   $(ck).attr('checked', true);
                }
            });
        },
        renderContent:function(){
            this.$el.html(Tmpl({
                TimelineLang:TimelineLang,
                CommonLang:CommonLang,
            }));
        },
        saveItems:function(){
            var lists = [];
            _.forEach(this.$el.find('input[type=checkbox]'), function(ck){
                if( !!$(ck).attr('checked')){
                    lists[lists.length]  = $(ck).attr('id');
                }
            });
            this._saveCookie(lists)
            this.confirmCb(this.parent);
            return lists;
        },
        getLists:function(){
            var json= this._getCookie();
            return json ? JSON.parse(json) : this.getDefaultCkList();
        },
        _getCookie: function () {
            var companyId = App.session().companyId;
            return $.cookie('company_timeline_stat_' + companyId);
        },
        _saveCookie: function (list) {
            var jsonVal = JSON.stringify(list);
            var option = {path: '/'};
            var companyId = App.session().companyId;
            $.cookie('company_timeline_stat_' + companyId, jsonVal, option);
        },
        getDefaultCkList:function(){
           return ['tardy', 'absence', 'missingClockIn', 'missingClockOut', 'vacation', 'unAuthDevice'] ;
        },

    });

    return TimelineDashboard;

});