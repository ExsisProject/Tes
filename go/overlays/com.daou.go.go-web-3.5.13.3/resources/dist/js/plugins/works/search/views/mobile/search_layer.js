(function(){define(function(require){var e=require("jquery"),t=require("backbone"),n=require("i18n!nls/commons"),r=require("i18n!works/nls/works"),i=require("i18n!admin/nls/admin"),s=require("hgn!works/search/templates/mobile/search_layer"),o=require("works/search/views/mobile/search_result"),u=require("views/mobile/m_search_header"),a=require("works/collections/applet_simples");require("GO.util");var f=null,l={"\uc804\uccb4":n["\uc804\uccb4"],"\uac80\uc0c9":n["\uac80\uc0c9"],"\uac80\uc0c9 \uc870\uac74":n["\uac80\uc0c9 \uc870\uac74"],"\ub4f1\ub85d\uc790":r["\ub4f1\ub85d\uc790"],"\ud14d\uc2a4\ud2b8":r["\ud14d\uc2a4\ud2b8"],"\ud65c\ub3d9\uae30\ub85d":r["\ud65c\ub3d9\uae30\ub85d"],"\ubcf8\ubb38":n["\ubcf8\ubb38"],"\ub313\uae00":n["\ub313\uae00"],"\ucca8\ubd80\ud30c\uc77c":n["\ucca8\ubd80\ud30c\uc77c"],"\ucca8\ubd80\ud30c\uc77c\uba85":n["\ucca8\ubd80\ud30c\uc77c\uba85"],"\uc571\uba85":r["\uc571\uba85"],"\ucd08\uae30\ud654":i["\ucd08\uae30\ud654"],"\uac80\uc0c9\uc5b4":n["\uac80\uc0c9\uc5b4"],"\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694":n["\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694."],"\uc9c1\uc811\uc785\ub825":i["\uc9c1\uc811\uc785\ub825"],"\uac80\uc0c9\ud560\uc571\uba85\uc785\ub825":r["\uc571 \uba85\uc744 \uc785\ub825\ud558\uc138\uc694."]},c=Hogan.compile('<option value="{{data.id}}">{{data.name}}</option>'),h=t.View.extend({el:"#goSearch",events:{"vclick #searchInit":"_detailSearchInit","vclick a[data-search]":"_simpleSearch","keyup #detailSearchWrap input":"_detailSearch","change #appType":"_toggleAppType"},initialize:function(e){this.$el.off(),this.appList=new a},render:function(){return this.$el.html(s({lang:l})),this._renderSearchHeader(),this._renderAppList(),this.el},_renderSearchHeader:function(){var e=this;u.render({enterSimpleSearchCallback:function(t){e._simpleSearch(t)}})},_renderAppList:function(){this.appList.fetch({success:function(t){t.each(function(t){e("#appList").append(c.render({data:t.toJSON()}))})}})},_detailSearchInit:function(t){t.preventDefault(),e("#detailSearchWrap input[type=search], #detailSearchWrap input[type=checkbox]").prop("checked",!1).val(""),e("#detailSearchWrap select").prop("selectedIndex",0)},_detailSearch:function(t){if(t.keyCode!=13)return;var n=e.trim(this.$("#authorName").val()),r=e.trim(this.$("#keyword").val()),i=[{data:n,id:"authorName"},{data:r,id:"keyword"}],s=this.$("#appType").val()=="directInput",u=s?e.trim(this.$("#appName").val()):"";if(this.$("#appType").val()=="directInput"&&u==""){alert(l["\uac80\uc0c9\ud560\uc571\uba85\uc785\ub825"]);return}if(GO.util.isAllEmptySearchText(i)||r==""){alert(l["\uac80\uc0c9 \ud0a4\uc6cc\ub4dc\ub97c \uc785\ub825\ud558\uc138\uc694"]);return}if(!GO.util.isValidForSearchTextWithCheckbox("keyword"))return;if(!GO.util.isValidSearchTextForDetail(i))return;var a={offset:"20",page:"0",appletId:this.$("#appList option:selected").val(),keyword:r,authorName:e.trim(this.$("#authorName").val()),content:this.$('input[name="text"]').is(":checked"),comments:this.$('input[name="comment"]').is(":checked"),attachFileNames:this.$('input[name="attach"]').is(":checked"),activityContents:this.$('input[name="activity"]').is(":checked"),attachFileContents:this.$('input[name="attach"]').is(":checked"),appletName:u},f={};Object.keys(a).forEach(function(e){a[e]!==""&&(f[e]=a[e])}),o.render(f)},_simpleSearch:function(t){t.preventDefault();var n=e.trim(e("#commonSearchInput").val());if(!GO.util.isValidSearchText(n))return;var r={keyword:n,content:!0,page:0,offset:15};o.render(r)},_toggleAppType:function(t){var n=e(t.currentTarget).val();n=="directInput"?(this.$("#appList").hide(),this.$("#appName").show()):(this.$("#appList").show(),this.$("#appName").hide())}});return{render:function(e){return f=new h(e),f.render()}}})}).call(this);