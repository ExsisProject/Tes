define("contact/views/tab_book/components/type_manager",function(require){var e=require("amplify"),t=require("models/profile_card"),n=require("i18n!contact/nls/contact"),r=require("i18n!nls/commons"),i=require("app"),s={private_contact:n["\uac1c\uc778 \uc8fc\uc18c\ub85d"],public_contact:n["\uc804\uc0ac \uc8fc\uc18c\ub85d"],dept_contact:n["\ubd80\uc11c \uc8fc\uc18c\ub85d"],organization:n["\uc870\uc9c1\ub3c4"],search:r["\uac80\uc0c9"],user:r["\uc0ac\uc6a9\uc790"]},o=function(e){this.localStorageKey=e.localStorageKey,this.tabMenus=[],this.tabMenus.push({type:"USER",name:s.private_contact}),this.hasDepartment()&&this.tabMenus.push({type:"DEPARTMENT",name:s.dept_contact}),this.hasCompanyGroups()&&this.tabMenus.push({type:"COMPANY",name:s.public_contact}),i.session("useOrgAccess")===!1?this.tabMenus.push({type:"USERSEARCH",name:s.user+s.search}):this.tabMenus.push({type:"ORG",name:s.organization})};return o.prototype.hasDepartment=function(){return t.get(i.session().id).hasDepartment()},o.prototype.hasCompanyGroups=function(){var e=!1;return $.ajax({type:"GET",async:!1,dataType:"json",url:i.contextRoot+"api/contact/company/group/exist",success:function(t){t.data&&(e=!0)},error:function(e){$.goError(e.responseJSON.message)}}),e},o.prototype.getMenus=function(){return this.tabMenus},o.prototype.getType=function(){function n(){return _.isUndefined(t)||_.isEmpty(_.findWhere(this.tabMenus,{type:t}))}var t=e.store(this.localStorageKey);return n.call(this)&&(t="USER"),t},o.prototype.saveType=function(t){e.store(this.localStorageKey,t,{type:null})},o});