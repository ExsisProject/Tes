define("timeline/views/dashboard/timeline_dashboard_list", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/timeline_dashboard_list");

    var App = require('app');
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");

    var RuleSync = require("timeline/views/dashboard/list/rule_sync");
    var ListRow = require("timeline/views/dashboard/list/list_row");
    var PaginationView = require("views/pagination");

    var ListSelectLayer = require("timeline/views/dashboard/layer/list_select_layer");

    var SearchFilter = require("timeline/views/dashboard/list/search_filter");

    var TimelineDashboard = Backbone.View.extend({
        events: {
            "click [data-profile]": "showProfile",
            "click .tb_paging":"offsetChanged",
            "click .sortable":"changedSort",
            "click .download":"download",
            "click #view_item_manage":"manageViewItem"
        },
        initialize: function (opt) {
            this.baseDate = opt.baseDate;
            this.requiredRuleUpdate = opt.requiredRuleUpdate;
            this.refreshCb = opt.refreshCb;
            this.parent = opt.parent;
            this.deptId = opt.deptId;

        },
        ruleSynced:function(self){
            self.refreshCb(self.parent);
        },
        listChangeCb:function(self){
            self.render();
        },
        render: function () {


            this.layer = new ListSelectLayer( {confirmCb:this.listChangeCb, parent:this});


            this.page = 0;
            this.offset = this._getCookie() ? JSON.parse(this._getCookie()).offset: 10;
            this.opt = {baseDate:moment(this.baseDate).format('YYYY-MM-DD'), deptId :this.deptId, offset:this.offset, page:this.page};

            this.searchFilter = new SearchFilter({
                cb: this.filterChanged,
                data: this.opt,
                self: this,
                baseDate: this.baseDate,
                deptId:this.deptId,
            });

            this.viewList = this.layer.getLists();

            this.$el.html(Tmpl({
                TimelineLang: TimelineLang,
                CommonLang: CommonLang,
                requiredRuleUpdate: this.requiredRuleUpdate,
                viewClockIn :_.contains(this.viewList, 'clockIn'),
                viewClockOut :_.contains(this.viewList, 'clockOut'),
                viewAbsence:_.contains(this.viewList, 'absence'),
                viewTardy:_.contains(this.viewList, 'tardy'),
                viewEarly:_.contains(this.viewList, 'early'),
                viewVacation:_.contains(this.viewList, 'vacation'),
                viewUnAuthDevice:_.contains(this.viewList, 'unAuthDevice'),
                viewAutoClockOut:_.contains(this.viewList, 'autoClockOut'),
                viewExtensionWorkingTime:_.contains(this.viewList, 'extensionWorkingTime'),
                viewNightWorkingTime:_.contains(this.viewList, 'nightWorkingTime'),
                viewHolyDayWorkingTime:_.contains(this.viewList, 'holyDayWorkingTime'),
                viewEtcStatus:_.contains(this.viewList, 'etcStatus'),
            }));


            this.$el.find('.wrap_filter').prepend(this.searchFilter.$el);

           this.$el.find('.tb_paging').find('option[value=' + this.offset +']').attr('selected', 'true')


            if (this.requiredRuleUpdate) {
                this.ruleSync = new RuleSync(this.baseDate, this.viewList, this.ruleSynced, this);
                this.$el.find('#tb_list').append(this.ruleSync.$el);
                this.ruleSync.render();
            } else {
                this.listRow = new ListRow( {
                    baseDate:this.baseDate,
                    deptId :this.deptId,
                    renderCb:this.listRenderCb,
                    self:this,
                    viewList:this.viewList,
                    opt:this.opt
                });
                this.$el.find('#tb_list').append(this.listRow.$el);
                this.listRow.render();

                this.pageRender();

            }

            this.searchFilter.render();
            return this;
        },
        listRenderCb:function(list, self){
           var total = list.total;
            if(total < 1){
                self.$el.find('#length_wrap').hide();
            }else{
                self.$el.find('#length_wrap').show();
            }
            self.$el.find('#docsLength').text(total);
        },
        pageRender:function(){

            this.pageView = new PaginationView({pageInfo: this.listRow.lists.pageInfo(), useBottomButton: true});
            this.$el.find('#tool_footer').empty().append(this.pageView.$el);
            this.pageView.render();
            this.pageView.bind('paging', this.selectPage, this);
        },
        selectPage:function(page){
           this.page = page;
           this.filterChanged(this.opt, this);
        },
        refresh:function(){
            this.listRow.changeParam(this.opt);
            this.pageRender();
        },
        changedSort:function(e){
            var target = $(e.target).parents('.sortable');
            var nextClass = $(target).hasClass('sorting') || $(target).hasClass('sorting_desc')  ? 'sorting_asc' : 'sorting_desc';
            this.$el.find('.sortable').removeClass('sorting sorting_asc sorting_desc').addClass('sorting');
            $(target).removeClass('sorting').addClass(nextClass);

            this.direction = nextClass.replace('sorting_', '');
            this.property = $(target).attr('value');

            this.filterChanged(this.opt, this);
        },
        offsetChanged:function(e){
            var target = $(e.target);
            this.offset = $(target).val();
            this._saveCookie({offset:this.offset});
            this.page =0 ;

            this.filterChanged(this.opt, this);
        },
        filterChanged: function (opt, self) {
            self.opt = opt;
            self.opt.page = self.page;
            self.opt.offset = self.offset;
            self.opt.direction= self.direction;
            self.opt.property= self.property;
            self.opt.deptId = self.deptId;
            self.opt.baseDate =  moment(self.baseDate).format("YYYY-MM-DD"),

            self.refresh();
        },
        manageViewItem:function(){
            this.layer.render();
        },
        viewItemChange:function(items, self){
           self.viewItems = items;
        },
        download : function(){
            window.location.href = this.listRow.lists.excelUrl();
        },
        _getCookie: function () {
            var companyId = App.session().companyId;
            return $.cookie('company_timeline_offset' + companyId);
        },
        _saveCookie: function (val) {
            var jsonVal = JSON.stringify(val);
            var option = {path: '/'};
            var companyId = App.session().companyId;
            return $.cookie('company_timeline_offset' + companyId, jsonVal, option);
        },
    });

    return TimelineDashboard;

});