define("works/components/app_list/views/app_list",function(require){var e=require("grid"),t=require("works/components/app_list/collections/apps"),n=require("i18n!works/nls/works"),r=require("i18n!nls/commons"),i={"\uac80\uc0c9":r["\uac80\uc0c9"],"\uc0dd\uc131\uc77c":n["\uc0dd\uc131\uc77c"],"\uc678":n["\uc678"],"\uba85":r["\uba85"],"\uc571\uba85":n["\uc571\uba85"]},s=Backbone.View.extend({gridView:null,initialize:function(e){e=e||{},this.collection=new t,this.collection.pageSize=10,this.useBottomButton=e.useBottomButton},render:function(){return this.gridView=new e({tableClass:"type_normal dataTable list_works_record",checkbox:!1,columns:this._getGridColumns(),collection:this.collection,usePageSize:!1,useTableScroll:!0,useBottomButton:this.useBottomButton,buttons:[{render:$.proxy(function(){return this._searchInputTmpl()},this)}]}),this.$el.append(this.gridView.render().el),this.collection.fetch(),this.gridView.$el.on("navigate:grid",function(e,t){$(this).find('input[data-id="'+t+'"]').prop("checked",!0)}),this.$("#keyword").focus(),this},getCheckedData:function(){var e=this.gridView.$('input[type="radio"]:checked').attr("data-id");return this.collection.get(e)},_getGridColumns:function(){var e=[{sortable:!1,render:function(e){return'<input type="radio" name="integateApps" data-id="'+e.id+'">'}},{name:"name",label:i["\uc571\uba85"],sortable:!0,render:function(e){return e.get("name")}},{name:"admins",label:n["\uc6b4\uc601\uc790"],sortable:!0,render:function(e){var t=e.get("admins"),n=t.length===0?"":t[0].name;return t.length>1&&(n+=" "+i["\uc678"]+" "+(t.length-1)+i["\uba85"]),n}},{name:"createdAt",label:i["\uc0dd\uc131\uc77c"],sortable:!0,render:function(e){return moment(e.get("createdAt")).format("YYYY-MM-DD")}}];return e},_searchInputTmpl:function(){return Hogan.compile(['<input type="txt_mini" id="searchKeyword" class="txt" />','<span class="btn_minor_s" id="searchBtn">','<span class="txt">{{lang.\uac80\uc0c9}}</span>',"</span>"].join("")).render({lang:i})}});return s});