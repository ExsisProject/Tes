define(function(require){function c(t,n){return e.goMessage(t),n&&n.focus(),!1}var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("hgn!contact/templates/group_add"),i=require("contact/models/create_group"),s=require("i18n!nls/commons"),o=require("i18n!contact/nls/contact");require("jquery.go-popup"),require("jquery.go-validation");var u={USER:o["\uac1c\uc778 \uc8fc\uc18c\ub85d"],COMPANY:o["\uc804\uc0ac \uc8fc\uc18c\ub85d"],DEPARTMENT:o["\ubd80\uc11c \uc8fc\uc18c\ub85d"],contact_group:o["\uc8fc\uc18c\ub85d \uadf8\ub8f9"],group_add:o["\uc5f0\ub77d\ucc98 \uadf8\ub8f9 \ucd94\uac00"],contact_add:o["\uc5f0\ub77d\ucc98 \uc8fc\uc18c\ub85d \ucd94\uac00"],contact_all:o["\uc804\uccb4 \uc8fc\uc18c\ub85d"],contact_group:o["\uc8fc\uc18c\ub85d \uadf8\ub8f9"],contact_manage:o["\uc8fc\uc18c\ub85d \uad00\ub9ac"],group_manage:o["\uadf8\ub8f9\uad00\ub9ac"],fold:s["\uc811\uae30"],open:s["\ud3bc\uce58\uae30"],new_contact:o["\uc0c8 \uc5f0\ub77d\ucc98"],contact:o["\uc8fc\uc18c\ub85d"],delete_contact:o["\uc8fc\uc18c\ub85d \uc0ad\uc81c"]},a={group_select:o["\uadf8\ub8f9\uc120\ud0dd"],group_new:o["\uc0c8 \uc774\ub984"],save:s["\uc800\uc7a5"],cancel:s["\ucde8\uc18c"],groupname:o["\uc5f0\ub77d\ucc98 \uadf8\ub8f9 \uc774\ub984"],"\uc8fc\uc18c\ub85d \uc774\ub984":o["\uc8fc\uc18c\ub85d \uc774\ub984"]},f=t.View.extend({tagName:"li",className:"new",template:_.template("<p class='title'><ins class='ic'></ins><span data-event='addGroup' class='txt'><%=lang.contact_add%></span></p>"),type:"USER",events:{"click span[data-event='addGroup']":"add"},initialize:function(){this.type=_.isUndefined(this.options.type)?this.type:this.options.type,this.deptId=this.options.deptId},render:function(){var e=this.template({lang:u});this.$el.html(e)},add:function(t){var n=new l({type:this.type,deptId:this.deptId});e(t.currentTarget).parents("li.new").before(n.el),n.render()}}),l=t.View.extend({tagName:"li",className:"group ui-state-disabled",events:{"click span.group_add_done":"done","click span.group_add_cancel":"cancel"},type:"USER",initialize:function(){this.type=_.isUndefined(this.options.type)?this.type:this.options.type,this.deptId=this.options.deptId},render:function(){var e=r({lang:a});this.$el.html(e),this.$el.find("input").focus()},done:function(t){function u(e){e.code=="200"&&n.EventEmitter.trigger("contact","changed:sideGroups")}function a(t){var n=JSON.parse(t.responseText);e.goMessage(n.message)}function f(t){var r=t.val();if(!e.goValidation.isCheckLength(2,16,r))throw c(n.i18n(s["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"16"}),t),new Error;if(!e.goValidation.isValidChar(r))throw c(",#$<>;\\`'\"| "+s["\uc0ac\uc6a9\ud560 \uc218 \uc5c6\ub294 \ubb38\uc790\uc785\ub2c8\ub2e4."],t),new Error}var r=this.$el.find("input.edit");try{f(r)}catch(t){console.log(t);return}var o=new i({type:this.type});o.isDept()&&o.set("deptId",this.deptId),o.save({name:r.val()}).done(u).error(a)},cancel:function(t){e(t.currentTarget).closest("li.group").remove()}});return f});