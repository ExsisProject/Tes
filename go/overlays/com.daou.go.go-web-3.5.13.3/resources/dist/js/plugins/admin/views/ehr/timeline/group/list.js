define("admin/views/ehr/timeline/group/list",function(require){var e=require("backbone"),t=require("hgn!admin/templates/ehr/timeline/group/list"),n=require("i18n!nls/commons"),r=require("i18n!admin/nls/admin"),i=require("i18n!timeline/nls/timeline"),n=require("i18n!nls/commons"),s=e.View.extend({events:{"click tr.group_item":"selectedEvent"},initialize:function(){this.colleciton=this.options.collection},render:function(){this.$el.html(t({collection:this.colleciton.models,AdminLang:r,TimelineLang:i}))},selectedEvent:function(e){var t=$(e.currentTarget),n=t.data("origingroupid");this.selectGroup(n)},selectGroup:function(e){this.trigger("selected",e),this.$el.find("tr").removeClass("on"),this.$el.find("tr[data-origingroupId="+e+"]").addClass("on")},sortable:function(){this.$el.find("tbody").removeClass().sortable({opacity:"1",delay:100,cursor:"move",items:"tr",containment:".admin_content",hoverClass:"ui-state-hover",placeholder:"ui-sortable-placeholder",start:function(e,t){t.placeholder.html(t.helper.html()),t.placeholder.find("td").css("padding","5px 10px")}})},saveSortOrder:function(){var t=this,r=this.$el.find("tbody"),i=r.find("tr").map(function(e,t){return $(t).data("id")}).get();this.model=new e.Model,this.model.url=GO.contextRoot+"ad/api/timeline/group/sortorder",this.model.set({ids:i},{silent:!0}),this.model.save({},{type:"PUT",success:function(){$.goMessage(n["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),t.trigger("save")}})}});return s});