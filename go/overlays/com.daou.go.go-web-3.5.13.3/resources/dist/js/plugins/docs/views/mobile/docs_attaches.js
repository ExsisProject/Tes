define("docs/views/mobile/docs_attaches",function(require){var e=require("backbone"),t=require("docs/models/docs_doc_item"),n=require("views/mobile/header_toolbar"),r=require("docs/views/docs_attaches"),i=require("i18n!nls/commons"),s=Hogan.compile('<div class="content"><div class="box flat detail_docs"><div class="module_drop"><div class="module_drop_body" id="{{attachesId}}"></div></div></div></div>');return e.View.extend({el:"#content",initialize:function(e){this.options=e,this.docsId=this.options.docsId},dataFetch:function(){var e=$.Deferred();return this.docsModel=new t({id:this.docsId}),this.docsModel.fetch({statusCode:{400:function(){GO.util.error("404",{msgCode:"400-common"})},403:function(){GO.util.error("403",{msgCode:"400-common"})},404:function(){GO.util.error("404",{msgCode:"400-common"})},500:function(){GO.util.error("500")}}}).done(function(){e.resolve()}),e},render:function(){n.render({title:i["\ucca8\ubd80\ud30c\uc77c"],isClose:!0}),this.$el.html(s.render({attachesId:"attaches"+this.docsModel.id})),r.render({el:"#attaches"+this.docsModel.id,attaches:this.docsModel.getAttaches(),docsId:this.docsModel.id})}})});