define(function(require){var e=require("backbone"),t=require("i18n!nls/commons"),n=require("hgn!components/comment/templates/comment_content"),r=require("hgn!components/comment/templates/comment_print"),i={comment:t["\ub313\uae00"]},s=e.View.extend({initialize:function(e){this.isReply=e.isReply,this.writable=e.writable,this.popupPrint=e.popupPrint||!1},render:function(){var e;return this.popupPrint?e=r:e=n,this.$el.html(e({lang:i,data:this.model.toJSON(),createdAt:GO.util.snsDate(this.model.get("createdAt")),hasAttach:this.model.hasAttach(),hasEmoticon:this.model.hasEmoticon(),emoticonPath:this.model.getEmoticonPath(),isReply:this.isReply&&this.model.id==this.model.get("thread"),content:GO.util.textToHtmlWithHyperLink(this.model.get("message")),writable:this.writable,position:this.model.get("writer").position||this.model.get("writer").positionName,thumbnail:this.model.get("writer").thumbnail||this.model.get("writer").thumbSmall})),this}});return s});