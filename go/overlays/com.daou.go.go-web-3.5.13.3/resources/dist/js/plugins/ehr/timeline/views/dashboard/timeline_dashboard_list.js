define("timeline/views/dashboard/timeline_dashboard_list",function(require){var e=require("backbone"),t=require("hgn!timeline/templates/dashboard/timeline_dashboard_list"),n=require("app"),r=require("i18n!timeline/nls/timeline"),i=require("i18n!nls/commons"),s=require("underscore"),o=require("timeline/views/dashboard/list/rule_sync"),u=require("timeline/views/dashboard/list/list_row"),a=require("views/pagination"),f=require("timeline/views/dashboard/layer/list_select_layer"),l=require("timeline/views/dashboard/list/search_filter"),c=e.View.extend({events:{"click [data-profile]":"showProfile","click .tb_paging":"offsetChanged","click .sortable":"changedSort","click .download":"download","click #view_item_manage":"manageViewItem"},initialize:function(e){this.baseDate=e.baseDate,this.requiredRuleUpdate=e.requiredRuleUpdate,this.refreshCb=e.refreshCb,this.parent=e.parent,this.deptId=e.deptId},ruleSynced:function(e){e.refreshCb(e.parent)},listChangeCb:function(e){e.render()},render:function(){return this.layer=new f({confirmCb:this.listChangeCb,parent:this}),this.page=0,this.offset=this._getCookie()?JSON.parse(this._getCookie()).offset:10,this.opt={baseDate:moment(this.baseDate).format("YYYY-MM-DD"),deptId:this.deptId,offset:this.offset,page:this.page},this.searchFilter=new l({cb:this.filterChanged,data:this.opt,self:this,baseDate:this.baseDate,deptId:this.deptId}),this.viewList=this.layer.getLists(),this.$el.html(t({TimelineLang:r,CommonLang:i,requiredRuleUpdate:this.requiredRuleUpdate,viewClockIn:s.contains(this.viewList,"clockIn"),viewClockOut:s.contains(this.viewList,"clockOut"),viewAbsence:s.contains(this.viewList,"absence"),viewTardy:s.contains(this.viewList,"tardy"),viewEarly:s.contains(this.viewList,"early"),viewVacation:s.contains(this.viewList,"vacation"),viewUnAuthDevice:s.contains(this.viewList,"unAuthDevice"),viewAutoClockOut:s.contains(this.viewList,"autoClockOut"),viewExtensionWorkingTime:s.contains(this.viewList,"extensionWorkingTime"),viewNightWorkingTime:s.contains(this.viewList,"nightWorkingTime"),viewHolyDayWorkingTime:s.contains(this.viewList,"holyDayWorkingTime"),viewEtcStatus:s.contains(this.viewList,"etcStatus")})),this.$el.find(".wrap_filter").prepend(this.searchFilter.$el),this.$el.find(".tb_paging").find("option[value="+this.offset+"]").attr("selected","true"),this.requiredRuleUpdate?(this.ruleSync=new o(this.baseDate,this.viewList,this.ruleSynced,this),this.$el.find("#tb_list").append(this.ruleSync.$el),this.ruleSync.render()):(this.listRow=new u({baseDate:this.baseDate,deptId:this.deptId,renderCb:this.listRenderCb,self:this,viewList:this.viewList,opt:this.opt}),this.$el.find("#tb_list").append(this.listRow.$el),this.listRow.render(),this.pageRender()),this.searchFilter.render(),this},listRenderCb:function(e,t){var n=e.total;n<1?t.$el.find("#length_wrap").hide():t.$el.find("#length_wrap").show(),t.$el.find("#docsLength").text(n)},pageRender:function(){this.pageView=new a({pageInfo:this.listRow.lists.pageInfo(),useBottomButton:!0}),this.$el.find("#tool_footer").empty().append(this.pageView.$el),this.pageView.render(),this.pageView.bind("paging",this.selectPage,this)},selectPage:function(e){this.page=e,this.filterChanged(this.opt,this)},refresh:function(){this.listRow.changeParam(this.opt),this.pageRender()},changedSort:function(e){var t=$(e.target).parents(".sortable"),n=$(t).hasClass("sorting")||$(t).hasClass("sorting_desc")?"sorting_asc":"sorting_desc";this.$el.find(".sortable").removeClass("sorting sorting_asc sorting_desc").addClass("sorting"),$(t).removeClass("sorting").addClass(n),this.direction=n.replace("sorting_",""),this.property=$(t).attr("value"),this.filterChanged(this.opt,this)},offsetChanged:function(e){var t=$(e.target);this.offset=$(t).val(),this._saveCookie({offset:this.offset}),this.page=0,this.filterChanged(this.opt,this)},filterChanged:function(e,t){t.opt=e,t.opt.page=t.page,t.opt.offset=t.offset,t.opt.direction=t.direction,t.opt.property=t.property,t.opt.deptId=t.deptId,t.opt.baseDate=moment(t.baseDate).format("YYYY-MM-DD"),t.refresh()},manageViewItem:function(){this.layer.render()},viewItemChange:function(e,t){t.viewItems=e},download:function(){window.location.href=this.listRow.lists.excelUrl()},_getCookie:function(){var e=n.session().companyId;return $.cookie("company_timeline_offset"+e)},_saveCookie:function(e){var t=JSON.stringify(e),r={path:"/"},i=n.session().companyId;return $.cookie("company_timeline_offset"+i,t,r)}});return c});