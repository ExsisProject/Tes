define("works/personal_list_manager/views/personal_list_manager",function(require){var e=require("i18n!nls/commons"),t=require("i18n!works/nls/works"),n={"\uae30\ubcf8\ud615":t["\uae30\ubcf8\ud615"],"\ubaa9\ub85d \ud654\uba74 \uad00\ub9ac":t["\ubaa9\ub85d \ud654\uba74 \uad00\ub9ac"],"\ubaa9\ub85d \uc800\uc7a5":t["\ubaa9\ub85d \uc800\uc7a5"],"\uc0c8 \ubaa9\ub85d \uc800\uc7a5":t["\uc0c8 \ubaa9\ub85d \uc800\uc7a5"],"\uc0ad\uc81c":e["\uc0ad\uc81c"],"\ubaa9\ub85d\uc73c\ub85c \uc774\ub3d9":t["\ubaa9\ub85d\uc73c\ub85c \uc774\ub3d9"],"\ubaa9\ub85d \uc800\uc7a5 \uc124\uba85":t["\ubaa9\ub85d \uc800\uc7a5 \uc124\uba85"],"\uc0c8 \ubaa9\ub85d":t["\uc0c8 \ubaa9\ub85d"],"\ubaa9\ub85d \uc0ad\uc81c":t["\ubaa9\ub85d \uc0ad\uc81c"],"\ucc28\ud2b8":t["\ucc28\ud2b8"],"\ucc28\ud2b8 \uc124\uba85":t["\ucc28\ud2b8 \uc124\uba85"],"\ucc28\ud2b8 \ucd94\uac00":t["\ucc28\ud2b8 \ucd94\uac00"],"\ucc28\ud2b8 \uc124\uc815 \uc124\uba851":t["\ucc28\ud2b8 \uc124\uc815 \uc124\uba851"],"\ucc28\ud2b8 \uc124\uc815 \uc124\uba852":t["\ucc28\ud2b8 \uc124\uc815 \uc124\uba852"]},r=require("works/components/list_manager/models/list_setting"),i=require("works/components/chart/models/chart_setting"),s=require("works/personal_list_manager/collections/personal_list_settings"),o=require("works/components/chart/collections/chart_settings"),u=require("works/components/list_manager/collections/list_columns"),a=require("works/collections/fields"),f=require("works/views/app/base_applet"),l=require("works/components/list_manager/views/list_setting"),c=require("works/components/chart/views/chart_setting"),h=require("hgn!works/personal_list_manager/templates/personal_list_manager");return f.extend({events:{'click [data-el-type="save"]':"_onClickSave",'click [data-el-type="saveAs"]':"_onClickSaveAs",'click [data-el-type="delete"]':"_onClickDelete",'click [data-el-type="navigateList"]':"_onClickNavigateList","change [data-setting-type]":"_onChangeSetting","click [el-add-chart]":"_onClickAddChart"},initialize:function(e){f.prototype.initialize.apply(this,arguments),this.settingId=e.settingId||0,this.setting=new r({},{appletId:this.appletId}),this.settings=new s([],{appletId:this.appletId}),this.settings.fetch(),this.listenTo(this.settings,"sync",this._onSyncSettings),this.baseSetting=new r({},{appletId:this.appletId}),this.baseSetting.fetch(),this.charts=new o,$.when(this.settings.deferred,this.baseSetting.deferred).then($.proxy(function(){this._initSetting()},this)),this.fields=new a([],{appletId:this.appletId,includeProperty:!0,type:"accessible",includeDocNoAndProcess:!0}),this.fields.fetch(),this.columns=new u,this.$el.addClass("set_works"),this.filters.on("changeFilter.filters",this._onChangeFilter,this)},render:function(){return $.when(f.prototype.render.apply(this,arguments),this.settings.deferred,this.baseSetting.deferred,this.fields.deferred,this.charts.deferred).then($.proxy(function(){this.$el.html(h({lang:n,isPrivate:!0})),this._renderContent()},this)),this},_renderContent:function(){this._initData(),this._renderCharts(),this._renderColumns(),this._renderSelect(),this._toggleButtons(),this._initChartSortable()},_initData:function(){this.charts.reset([]),this.charts.setChartsWithSeq(this.setting.get("charts")),this.charts.mergeFromFields(this.fields),this.chartFields=this.fields.getChartFields(),this.numberFields=this.fields.getNumberFields()},_renderCharts:function(){this.$("[el-charts]").find("li").not("#addChartButton").remove(),this.charts.each(function(e){this._renderChart(e)},this)},_renderChart:function(e){var t=new c({appletId:this.appletId,chartFields:this.chartFields,numberFields:this.numberFields,model:e});this.$("#addChartButton").before(t.render().el)},_renderColumns:function(){this.listSettingView=new l({className:"app_list_sort",isPrivate:!0,columns:this.columns,fields:this.fields,setting:this.setting}),this.$("[data-el-private-list_setting]").html(this.listSettingView.render().el)},_renderSelect:function(){var e=this.$("[data-el-setting-list-wrapper]");e.empty(),e.append('<select data-setting-type><option value="0">'+n["\uae30\ubcf8\ud615"]+"</option></select>");var t=e.find("select");this.settings.each(function(e){t.append('<option value="'+e.get("id")+'">'+e.get("name")+"</option>")},this),t.val(this.settingId)},_toggleButtons:function(){var e=!!parseInt(this.settingId);this.$('[data-el-type="save"]').toggle(e),this.$('[data-el-type="delete"]').toggle(e)},_initChartSortable:function(){this.$("ul[el-charts]").sortable({items:"> li:not(#addChartButton)",tolerance:"pointer",cursor:"move",placeholder:{element:function(){return"<li><div class='column_create'><div class='wrap_works_info'></div></div></li>"},update:function(){return}},stop:$.proxy(function(e,t){var n=t.item.index(),r=t.item.attr("data-chart-cid");this.charts.reorder(r,n)},this)}),this.$("ul[el-charts]").find("li:not(#addChartButton)").css("cursor","move")},_showPopup:function(t,r){var i=$.goPopup({header:n["\ubaa9\ub85d \uc800\uc7a5"],pclass:"layer_normal new_layer layer_works_new new_wide",contents:'<p class="desc">'+n["\ubaa9\ub85d \uc800\uc7a5 \uc124\uba85"]+"</p>"+'<div class="form_type">'+'<input class="input w_max" type="text" value="'+r.name+'">'+"</div>",buttons:[{btext:e["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:$.proxy(function(){var n=i.find("input"),s=n.val();if(s.length>64||s.length<1)return $.goError(GO.i18n(e["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:1,arg2:64}),n,!1,!0),!1;r.name=s,t.call(this,r),i.close()},this)},{btext:e["\ucde8\uc18c"],btype:"normal"}]});i.css("width",""),i.find(".btn_layer_x").hide()},_save:function(t){this.listSettingView.getSetting();var n=this.setting.toJSON(),i=this.baseSetting.get("columns")[this.baseSetting.get("titleColumnIndex")],s=i?i.fieldCid:null,o=_.map(n.columns,function(e){return e.fieldCid});n.titleColumnIndex=_.indexOf(o,s),n.charts=this.charts.toJSON();var u=new r(_.extend({appletId:this.appletId,view:n},t),{appletId:this.appletId,type:"personal"});u.save({},{success:$.proxy(function(t){$.goMessage(e["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),this.settings.fetch({success:$.proxy(function(){this.settingId=t.id,this._changeSetting()},this)})},this)})},_delete:function(){this.setting.destroy({success:$.proxy(function(){$.goMessage(e["\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),this.settingId="0",this._changeSetting(),this.settings.fetch()},this)})},_onClickSave:function(){var e=this.settings.get(this.settingId).get("name"),t={id:this.setting.id,name:e};this._save(t)},_onClickSaveAs:function(){this._showPopup(this._save,{name:n["\uc0c8 \ubaa9\ub85d"]})},_onClickDelete:function(){$.goConfirm(e["\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],"",$.proxy(this._delete,this))},_onClickNavigateList:function(){GO.router.navigate("works/applet/"+this.appletId+"/home",!0)},_onChangeFilter:function(){GO.router.navigate("works/applet/"+this.appletId+"/home",!0)},_onChangeSetting:function(e){this.settingId=$(e.currentTarget).val(),this._changeSetting()},_changeSetting:function(){GO.util.store.set(GO.session("id")+"-"+this.appletId+"-works-list-setting",this.settingId),this._initSetting(),this._renderContent();var e=parseInt(this.settingId)?"/"+this.settingId:"";GO.router.navigate("works/applet/"+this.appletId+"/settings/listview/personal"+e,{replace:!0})},_onSyncSettings:function(){this._renderSelect()},_initSetting:function(){var e=parseInt(this.settingId),t=e?this.settings.get(e):null;t?(this.setting.set(_.extend(t.get("view"),{id:e})),this.setting.setType("personal")):(this.setting.set(this.baseSetting.toJSON()),this.setting.setType("base"))},_onClickAddChart:function(){var e=this.chartFields.length?{fieldCid:this.chartFields.at(0).get("cid")}:{},t=new i(e);this.charts.push(t),this._renderChart(t)}})});