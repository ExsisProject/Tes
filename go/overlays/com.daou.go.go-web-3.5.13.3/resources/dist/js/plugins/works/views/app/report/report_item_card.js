define("works/views/app/report/report_item_card",function(require){var e=require("works/views/app/report/report_item"),t=require("works/components/report/models/card_model"),n=require("works/components/report/view/card_setting"),r=require("works/components/report/view/card_preview"),i=require("works/views/app/report/works_report_filter"),s=require("works/components/filter/models/filter_condition"),o=require("works/components/filter/collections/filter_conditions"),u=require("i18n!works/nls/works");return e.extend({initialize:function(n){e.prototype.initialize.call(this,n),this.appletId=n.appletId,this.type="card",this.fields=n.fields,this.chartFields=this.fields.getChartFields(),this.contentWrap=$(n.contentWrap),this.cardModel=new t({appletId:this.appletId,cid:n.cid?n.cid:this.chartFields.at(0).get("cid"),title:n.title?n.title:u["\uc0c8 \uce74\ub4dc"],color:n.color?n.color:1,method:n.method?n.method:this._getDefaultMethod(),aggRangeOption:n.aggRangeOption?n.aggRangeOption:"ALL",compareRangeOption:n.compareRangeOption?n.compareRangeOption:"DONE",aggStartDate:n.aggStartDate,aggEndDate:n.aggEndDate,isEndDateToday:n.isEndDateToday?!0:!1,compareStartDate:n.compareStartDate,compareEndDate:n.compareEndDate}),this.conditions=new o},render:function(){this._setTableView()},_setTableView:function(){if(!this._isValidComponent()){this.previewRender(!0);return}$.when(this.cardModel.fetch()).then($.proxy(function(){this.previewRender()},this))},previewRender:function(e){this.preview=new r({model:this.cardModel,selectField:this.getFieldByCid(this.cardModel.get("cid"))}),this.contentWrap.empty(),this.contentWrap.append(this.preview.render(e).el),this.autoResize()},getSettingTmpl:function(){return this.settingView=new n({appletId:this.appletId,fields:this.fields,model:this.cardModel}),this.settingView.render().el},reload_filter:function(){return this.conditions=this.filterView._getConditions(),this.cardModel.setQueryString(this.filterView._getFilterQuery()),this._setTableView(),!0},getFilterTmpl:function(){var e=_.map(this.conditions.toJSON(),function(e){return e.fieldCid}),t=this.fields.clone();return _.each(t.toArray(),function(n){if("create_date"===n.get("cid")){t.remove(n);return}n.set("isUsed",e.includes(n.get("cid")))}),this.filterView=new i({conditions:this.conditions.clone(),fields:t}),this.filterView.render().el},reload_setting:function(){return this.settingView.isValid()?(this.settingView.save(),this.render(),!0):!1},getFieldByCid:function(e){return _.find(this.chartFields.toJSON(),function(t){return t.cid==e})},autoResize:function(){var e=this.contentWrap,t=e.children(),n=e.height(),r=t.height(),i=(n-r)/2;i<0&&(i=0),t.css("margin-top",i)},_getDefaultMethod:function(){var e=this.chartFields.at(0);return"NUMBER"===e.get("fieldType").toUpperCase()?"SUM":"COUNT"},_isValidComponent:function(){var e=this.chartFields.findByCid(this.cardModel.get("cid"));return e?!0:!1},toJSON:function(){return{cardModel:this.cardModel.toJSON(),conditions:this.conditions.toJSON(),type:this.type}},toObject:function(e){this.cardModel=new t(e.data.cardModel),this.cardModel.appletId=this.appletId,this.conditions=new o;var n=this;_.forEach(e.data.conditions,function(e){n.conditions.push(new s(e))})}})});