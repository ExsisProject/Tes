(function(){define(function(require){var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("i18n!nls/commons"),i=require("i18n!admin/nls/admin"),s=require("i18n!docs/nls/docs"),o=require("hgn!docs/search/templates/mobile/search_layer"),u=require("views/mobile/m_search_header"),a=require("docs/search/views/mobile/search_result"),f=require("docs/collections/doc_folder_infos");require("GO.util");var l=null,c={"\uac80\uc0c9 \uc870\uac74":r["\uac80\uc0c9 \uc870\uac74"],"\uc804\uccb4":r["\uc804\uccb4"],"\uac80\uc0c9":r["\uac80\uc0c9"],"\ub4f1\ub85d\uc790":s["\ub4f1\ub85d\uc790"],"\uc81c\ubaa9":s["\uc81c\ubaa9"],"\ubb38\uc11c\ud568":s["\ubb38\uc11c\ud568"],"\ub0b4\uc6a9":r["\ub0b4\uc6a9"],"\ucca8\ubd80\ud30c\uc77c":r["\ucca8\ubd80\ud30c\uc77c"],"\ucd08\uae30\ud654":i["\ucd08\uae30\ud654"],"\uac80\uc0c9\uc5b4":r["\uac80\uc0c9\uc5b4"],"\ud558\uc704 \ubb38\uc11c\ud568 \ud3ec\ud568":s["\ud558\uc704 \ubb38\uc11c\ud568 \ud3ec\ud568"],"\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694":r["\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694."],"\uc804\uccb4\ubb38\uc11c\ud568":s["\uc804\uccb4\ubb38\uc11c\ud568"]},h=Hogan.compile('<option value="{{data.id}}">{{data.parentPathName}}</option>'),p=t.View.extend({el:"#goSearch",events:{"vclick #searchInit":"_detailSearchInit","vclick a[data-search]":"_simpleSearch","keyup #detailSearchWrap input":"_detailSearch"},initialize:function(e){this.$el.off(),this.packageName=e.packageName,this.docFolderList=new f},render:function(){return this.$el.html(o({lang:c})),this._renderSearchHeader(),this._renderDocList(),this.el},_renderSearchHeader:function(){var e=this;u.render({enterSimpleSearchCallback:function(t){e._simpleSearch(t)}})},_renderDocList:function(){this.docFolderList.comparator="parentPathName",this.docFolderList.fetch({success:function(e){e.each(function(e){this.$("#folderId").append(h.render({data:e.toJSON()}))})}})},_detailSearchInit:function(t){t.preventDefault(),e("#detailSearchWrap input").prop("checked",!1).val(""),e("#detailSearchWrap select").prop("selectedIndex",0)},_detailSearch:function(t){if(t.keyCode!=13)return;var r=e.trim(e("#creatorName").val()),i=e.trim(e("#keyword").val()),s=n.util.shortDate(new Date),o=n.util.toISO8601("1970/01/01"),u=n.util.searchEndDate(s),f=this.$('input[name="title"]').is(":checked"),l=this.$('input[name="content"]').is(":checked"),h=this.$('input[name="attachFile"]').is(":checked"),p=this.$('input[name="includeType"]').is(":checked"),d=[{data:r,id:"creatorName"},{data:i,id:"keyword"}];if(n.util.isAllEmptySearchText(d)){alert(c["\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694"]);return}if(!n.util.isValidForSearchTextWithCheckbox("keyword"))return;if(!n.util.isValidSearchTextForDetail(d))return;var v={stype:"detail",keyword:i,page:0,offset:15,fromDate:o,toDate:u,creatorName:r,title:f?i:"",content:l?i:"",attachFileNames:h?i:"",attachFileContents:h?i:"",docNum:"",docsYear:"",docsYearValue:"",includeType:p?"include":"none",folderId:this.$("#folderId option:selected").val(),folderPathName:this.$("#folderId option:selected").text()};a.render(v)},_simpleSearch:function(t){t.preventDefault();var r=e(t.currentTarget),i=e.trim(e("#commonSearchInput").val());if(!n.util.isValidSearchText(i))return;var s=r.attr("data-search")||"all",o={page:0,offset:15};s=="all"?(o.stype="simple",o.keyword=i):(o.stype="detail",o.keyword=i,o[s]=i,o.includeType="none"),a.render(o)}});return{render:function(e){return l=new p(e),l.render()}}})}).call(this);