define("docs/views/docs_detail_body",function(require){require("go-fancybox");var e=require("app"),t=require("hogan"),n=require("backbone"),r=require("hgn!docs/templates/docs_detail_body"),i=require("docs/models/docs_doc_item"),s=require("docs/views/docs_attaches"),o=require("i18n!approval/nls/approval"),u=require("i18n!nls/commons"),a=require("i18n!docs/nls/docs"),f=n.Collection.extend({model:i,initialize:function(e){this.docsId=e.docsId},url:function(){return e.contextRoot+"api/docs/"+this.docsId+"/versions"}}),l=t.compile('<li><span class="bar"></span><span class="ic ic_ver"></span><span class="bar_ver {{#current}}current{{/current}}">{{version}}</span><a class="txt" data-id="{{docsId}}" id="docsReason">&nbsp;{{reason}}</a><div class="sub_info"><span class="member"><img src="{{thumbnail}}" alt="{{creatorName}} {{creatorPosition}}" title="{{creatorName}} {{creatorPosition}}"><span class="txt">&nbsp;{{creatorName}} {{creatorPosition}}</span></span><span class="date">&nbsp;{{completeDate}}</span></div></li>'),c={"\uc790\uc138\ud788":u["\uc790\uc138\ud788"],"\ub2eb\uae30":u["\ub2eb\uae30"],"\uc5f4\uae30":u["\uc5f4\uae30"],"\ub4f1\ub85d\uc790":a["\ub4f1\ub85d\uc790"],"\ubcf4\uc874\uc5f0\ud55c":a["\ubcf4\uc874\uc5f0\ud55c"],"\ub4f1\ub85d\uc77c":u["\ub4f1\ub85d\uc77c"],"\ubb38\uc11c\uc0c1\ud0dc":a["\ubb38\uc11c\uc0c1\ud0dc"],"\uc2b9\uc778\ub300\uae30":a["\uc2b9\uc778\ub300\uae30"],"\ubcc0\uacbd\uc0ac\uc720":a["\ubcc0\uacbd \uc0ac\uc720"],"\ubc18\ub824":a["\ubc18\ub824"],"\ubb38\uc11c\ubc84\uc804":a["\ubb38\uc11c\ubc84\uc804"],"\ubb38\uc11c\ubc88\ud638":a["\ubb38\uc11c\ubc88\ud638"],"\uc0c1\uc138\ub0b4\uc6a9":a["\uc0c1\uc138\ub0b4\uc6a9"],"\ucca8\ubd80\ud30c\uc77c":u["\ucca8\ubd80\ud30c\uc77c"],"\ubc84\uc804":a["\ubc84\uc804"]},h=n.View.extend({events:{"click [data-action='docsInfoArrow']":"toggleDocsInfo","click [data-action='docsContentArrow']":"toggleDocsContent","click [data-action='docsReasonArrow']":"toggleDocsReason","click [data-action='docsAttachArrow']":"toggleDocsAttach","click [data-action='docsVersionArrow']":"toggleDocsVersion"},initialize:function(e){this.options=e,this.docsModel=this.options.docsModel,this.useDocNum=this.options.useDocNum,this.isPrint=this.options.isPrint,this.changeDocsContent=this.options.changeDocsContent,this.isNeedState=this.docsModel.isNeedState(),this.isAppendVersion=!1},render:function(){return this.$el.html(r({lang:c,docsModel:this.docsModel.toJSON(),preserveYear:this.makePreserveYear(),completeDate:this.docsModel.getCompleteDate(),needState:this.docsModel.isNeedState(),wait:this.docsModel.getDocsStatus()=="APPROVEWAITING",reject:this.docsModel.getDocsStatus()=="REJECT",version:this.makeVersion(),attachSize:this.docsModel.getAttaches().length,versionSize:this.docsModel.getDocsCount(),useDocNum:this.useDocNum,isPrint:this.isPrint,files:this.isPrint?this.docsModel.getFiles():null,images:this.isPrint?this.docsModel.getImages():null,isChangeDocsContent:this.changeDocsContent})),!this.docsModel.isNeedState()&&!this.isPrint&&this.changeDocsContent&&this._renderVersions(),this},_renderVersions:function(){var t=this;this.versions=new f({docsId:this.docsModel.id}),this.versions.fetch({statusCode:{400:function(){e.util.error("404",{msgCode:"400-common"})},403:function(){e.util.error("403",{msgCode:"400-common"})},404:function(){e.util.error("404",{msgCode:"400-common"})},500:function(){e.util.error("500")}},success:function(e){e.each(function(e){var n=l.render({current:t.docsModel.id==e.id,version:t.makeVersion(e.getVersion()),docsId:e.id,reason:e.getReason(),thumbnail:e.getThumbnail(),creatorName:e.getCreatorName(),creatorPosition:e.getCreatorPosition(),completeDate:e.getCompleteDate()});this.$("#versionWrap").append(n)}),t.isAppendVersion=!0}})},renderAttachView:function(){this.docsModel.getAttaches().length>0&&(s.render({el:"#attaches"+this.docsModel.id,attaches:this.docsModel.getAttaches(),docsId:this.docsModel.id}),s.resize(this.$el),$(".fancybox-thumbs").goFancybox())},makePreserveYear:function(){return this.docsModel.getDocsYear()==0?o["\uc601\uad6c"]:this.docsModel.getDocsYear()+o["\ub144"]},makeVersion:function(e){return e||(e=this.docsModel.getVersion()),"VER "+e},toggleEl:function(e,t){var n=$(e.currentTarget),r="";n.hasClass("ic")||(n=n.siblings(".ic"));var r=n.attr("class");r.indexOf("close")!=-1?(n.removeClass("ic_arrow_close").addClass("ic_arrow_open"),n.attr("title",u["\uc5f4\uae30"]),t.hide()):(n.removeClass("ic_arrow_open").addClass("ic_arrow_close"),n.attr("title",u["\ub2eb\uae30"]),t.show(),this.isAppendVersion||!this.docsModel.isNeedState()&&!this.isPrint&&this._renderVersions())},toggleDocsInfo:function(e){this.toggleEl(e,$("#docsInfoLayout"))},toggleDocsContent:function(e){this.toggleEl(e,$("#docsContentLayout"))},toggleDocsReason:function(e){this.toggleEl(e,$("#docsReasonLayout"))},toggleDocsAttach:function(e){this.toggleEl(e,$("#docsAttachLayout"))},toggleDocsVersion:function(e){this.toggleEl(e,$("#docsVersionLayout"))}});return h});