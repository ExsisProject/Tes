(function(){define(function(require){var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("text!task/templates/mobile/search_result.html"),i=require("text!task/templates/mobile/search_result_unit.html"),s=require("views/mobile/m_search_common_result"),o=require("i18n!nls/commons");require("GO.util");var u=null,a={"\uac80\uc0c9\uacb0\uacfc\uc5c6\uc74c":o["\uac80\uc0c9\uacb0\uacfc\uc5c6\uc74c"],"\uac80\uc0c9\uacb0\uacfc":o["\uac80\uc0c9\uacb0\uacfc"]},f=t.Collection.extend({model:t.Model.extend(),url:function(){return"/api/search/task"}}),l=t.View.extend({el:"#searchResultWrap",events:{"vclick a[data-id]":"_getContent"},initialize:function(e){console.log(e);var t=this;this.options=e,this.lastPage=!1,this.$el.off(),this.collection=new f,s.set({collection:this.collection,searchOptions:this.options,renderListFunc:function(e){t._renderContents(e)},renderListMoreFunc:function(e){t._moreList(e)}})},render:function(){return s.fetch(),this.el},_renderContents:function(){var t=this.collection;this.$el.html(Hogan.compile(r).render({lang:a,data:t.toJSON(),resultCount:t.page.total},{partial:i})),e("#detailSearchToggle").removeClass("on"),this._showResultWrap()},_moreList:function(e){var t=e.toJSON();this.$el.find("ul:first").append(Hogan.compile(i).render({lang:a,data:t}))},_showResultWrap:function(){e("#simpleSearchWrap").hide(),e("#searchResultWrap").show()},_getContent:function(t){t.preventDefault();var r=e(t.currentTarget);n.router.navigate("task/"+r.attr("data-id")+"/detail",!0)}});return{render:function(e){return u=new l(e),u.render()}}})}).call(this);