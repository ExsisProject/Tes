define("works/views/mobile/doc_detail/consumer_item",function(require){var e=require("i18n!works/nls/works"),t={"\uac74\uc758 \uc5f0\ub3d9\ub41c \ub370\uc774\ud130\uac00 \uc788\uc2b5\ub2c8\ub2e4":e["\uac74\uc758 \uc5f0\ub3d9\ub41c \ub370\uc774\ud130\uac00 \uc788\uc2b5\ub2c8\ub2e4"],"\ud604\uc7ac \uc5f0\ub3d9\ub41c \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4":e["\ud604\uc7ac \uc5f0\ub3d9\ub41c \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"]},n=require("when"),r=require("works/collections/docs"),i=require("works/collections/fields"),s=require("works/components/list_manager/models/list_setting"),o=require("works/components/doc_list/views/doc_list"),u=require("hgn!works/templates/mobile/doc_detail/consumer_item"),a=require("hgn!works/templates/mobile/doc_detail/consumer_doc_list"),f=require("hgn!works/templates/mobile/doc_detail/consumer_doc_list_item");return Backbone.View.extend({events:{"click a.btn_more":"clickedMoreItems","click a.tit":"clickedDocumentItem","vclick a[data-value]":"_paging","vclick .btn_ic_arrow":"_toggleFold"},initialize:function(e){this.docId=e.docId,this.appletId=this.model.get("applet").id,this.docs=new r([],{appletId:this.appletId,pageSize:5}),this.docs.queryString=this._getQueryString(),this.fields=new i([],{appletId:this.appletId,includeProperty:!0,type:"producers"}),this.setting=new s({},{appletId:this.appletId}),this.fieldsOfIntegrationApplet={}},render:function(){var e=u({lang:t,model:this.model.toJSON(),hasData:this.model.get("count")>0,appletId:this.appletId});this.$el.html(e);if(this.model.get("accessable")){var r=this;n.all([this.docs.fetch(),this.fields.fetch(),this.setting.fetch()]).then(function(){r.fields.getFieldsOfIntegrationApplet().done(function(e){r.fieldsOfIntegrationApplet=e,r._renderList()})})}return this},_renderList:function(){var e=this._parseCollection(this.docs),n=this.docs.pageInfo(),r=a({lang:t,hasPage:n.pageSize<n.total,appletId:this.appletId,page:_.extend(this.docs.pageInfo(),this.docs.mobilePageInfo())});this.$("#consumerDocumentList_"+this.appletId).html(r),_.each(e,function(e){var t=f({document:e});this.$("#consumerDocumentListItem_"+this.appletId).append(t)},this)},_paging:function(e){var t=$(e.currentTarget),n=t.attr("data-type"),r=this.docs.pageInfo();if(n==="prev"&&!r.prev)return;if(n==="next"&&!r.next)return;var i=this,s=t.attr("data-value");this.docs.setPageNo(this.docs.pageInfo().pageNo+parseInt(s)),this.docs.fetch({success:function(){i._setCurrentPage(),i._renderList()}})},_setCurrentPage:function(){var e=_.extend(this.docs.pageInfo(),this.docs.mobilePageInfo());this.$("#listCurrent").text(e.firstIndex),this.$("#listMax").text(e.lastIndex),this.$("#listTotal").text(" / "+e.total)},_toggleFold:function(e){var t=$(e.currentTarget);t.parents(".appInterlock_header").toggleClass("on"),t.find(".ic_v2").toggleClass("ic_arrow_open").toggleClass("ic_arrow_close"),this.$("#consumerDocumentList_"+this.appletId).toggle()},_gatColumnClass:function(e,t){return t?"tit_word_break":e.isMultiValueType()?"item_wrap":e.isNumberValueType()?"amount":""},_parseCollection:function(e){var t=_.clone(e),n=this.fields.getColumnFields(),r=this.columnFields?(new i(this.columnFields)).models:this.setting.getColumns(n);return _.map(t.models,function(e){var t=_.map(r,function(t,n){var r=n===this.setting.get("titleColumnIndex");return{visible:!0,label:t.get("columnName")||t.get("label"),data:this.getColumnData(e,t,r,!0)}},this),n=t[this.setting.get("titleColumnIndex")]||{};return n.visible=!1,{id:e.id,columns:t,titleText:_.isEmpty(n.data)?"-":n.data}},this)},_getUserLabel:function(e){var t=e.position?" "+e.position:"";return e.name+t},clickedMoreItems:function(e){_.each(this.moreCollection,function(e){var t=f({document:e});this.$("#consumerDocumentListItem_"+this.appletId).append(t)},this),this.moreCollection=[],$(e.currentTarget).remove()},clickedDocumentItem:function(e){var t=$(e.currentTarget).attr("value");GO.router.navigate("works/applet/"+this.appletId+"/doc/"+t,!0)},_getQueryString:function(){return _.map(this.model.get("fieldCids"),function(e){return e+".id:("+this.docId+")"},this).join(" OR ")},getColumnData:o.prototype.getColumnData,getProperties:o.prototype.getProperties})});