define(function(require){function h(t,n){return e.goMessage(t),n&&n.focus(),!1}var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("hgn!contact/templates/group_manage"),i=require("contact/models/modify_group"),s=require("contact/collections/personal_group"),o=require("contact/collections/dept_group"),u=require("i18n!nls/commons"),a=require("i18n!contact/nls/contact");require("jquery.go-popup"),require("jquery.go-validation");var f={USER:a["\uac1c\uc778 \uc8fc\uc18c\ub85d"],COMPANY:a["\uc804\uc0ac \uc8fc\uc18c\ub85d"],DEPARTMENT:a["\ubd80\uc11c \uc8fc\uc18c\ub85d"],contact_group:a["\uc8fc\uc18c\ub85d \uadf8\ub8f9"],group_add:a["\uc5f0\ub77d\ucc98 \uadf8\ub8f9 \ucd94\uac00"],contact_add:a["\uc5f0\ub77d\ucc98 \uc8fc\uc18c\ub85d \ucd94\uac00"],contact_all:a["\uc804\uccb4 \uc8fc\uc18c\ub85d"],contact_manage:a["\uc8fc\uc18c\ub85d \uad00\ub9ac"],group_manage:a["\uadf8\ub8f9\uad00\ub9ac"],fold:u["\uc811\uae30"],open:u["\ud3bc\uce58\uae30"],new_contact:a["\uc0c8 \uc5f0\ub77d\ucc98"],contact:a["\uc8fc\uc18c\ub85d"],delete_contact:a["\uc8fc\uc18c\ub85d \uc0ad\uc81c"],"\ud558\uc704\uadf8\ub8f9 \uc0ad\uc81c \uc624\ub958":a["\ud558\uc704 \uadf8\ub8f9\uc774 \uc788\uc73c\uba74 \uc0ad\uc81c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"]},l={group_select:a["\uadf8\ub8f9\uc120\ud0dd"],"\uc0c8 \uc774\ub984":a["\uc0c8 \uc774\ub984"],save:u["\uc800\uc7a5"],cancel:u["\ucde8\uc18c"],groupname:a["\uc5f0\ub77d\ucc98 \uadf8\ub8f9 \uc774\ub984"],"\uc8fc\uc18c\ub85d \uc774\ub984":a["\uc8fc\uc18c\ub85d \uc774\ub984"]},c=t.View.extend({isUser:function(){return this.type=="USER"},isDept:function(){return this.type=="DEPARTMENT"},isCompany:function(){return this.type=="COMPANY"},initialize:function(e){this.type=e.type,this.model=new i(this.type),this.id=e.id;if(this.isUser())this.groups=s.getCollection().toJSON()||[];else if(this.isDept()){var t=this.options.deptId;this.groups=o.get(t).toJSON()}else this.name=e.name,this.hasChildren=e.hasChildren},render:function(){function o(e,t){return r({isCurrentGroup:function(){return e==this.id?!0:!1},data:t,lang:l,isCompanyType:this.isCompany()})}function c(e){return r({name:e,lang:l,isCompanyType:!0})}function p(){var t=d.call(this),r=e("input.txt_mini").val();if(!e.goValidation.isCheckLength(2,16,r))return h(n.i18n(u["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"16"}),e("input.txt_mini")),!1;s.save({id:t,name:r}).done(function(){GO.EventEmitter.trigger("contact","changed:sideGroups"),e.goMessage(u["\uc218\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),i.close()}).fail(function(t){var n=JSON.parse(t.responseText);e.goAlert(n.message)})}function d(){return this.isCompany()?this.id:i.find("select[name=groupName] option:selected").val()}function v(){function r(){s.set({id:t},{silent:!0}),s.destroy().done(function(t){t.code=="200"&&(GO.EventEmitter.trigger("contact","changed:sideGroups"),e.goMessage(u["\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),i.close(),n.router.navigate("contact",{trigger:!0,pushState:!0}))}).fail(function(e){})}if(this.isCompany()&&this.hasChildren){e.goError(f["\ud558\uc704\uadf8\ub8f9 \uc0ad\uc81c \uc624\ub958"]);return}var t=d.call(this);e.goCaution(f.delete_contact,u["\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],r)}if(!this.isCompany()&&!this.groups.length){e.goMessage(a["\ub4f1\ub85d\ub41c \uadf8\ub8f9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4"]);return}var t="";this.isCompany()?t=c(this.name):t=o.call(this,this.id,this.groups);var i=e.goPopup({header:a["\uadf8\ub8f9\uad00\ub9ac"],contents:t,pclass:"layer_addr_mgmt layer_normal",buttons:[{autoclose:!1,btype:"confirm",btext:a["\uadf8\ub8f9\uc774\ub984 \ubcc0\uacbd"],callback:e.proxy(p,this)},{btype:"caution",btext:a["\uadf8\ub8f9\uc0ad\uc81c"],callback:e.proxy(v,this)},{btype:"normal",btext:u["\ucde8\uc18c"],callback:function(){i.close()}}]}),s=this.model}});return c});