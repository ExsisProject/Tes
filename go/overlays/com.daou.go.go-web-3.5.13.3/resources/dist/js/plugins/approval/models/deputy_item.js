define(["underscore","backbone","i18n!approval/nls/approval"],function(e,t,n){var r=t.Model.extend({initialize:function(){},toJSON:function(){},getId:function(){return this.attributes.id},getStartAt:function(){return GO.util.shortDate(this.attributes.startAt)},getEndAt:function(){return GO.util.shortDate(this.attributes.endAt)},getTitle:function(){return this.attributes.title},getUseFlag:function(){return this.attributes.useFlag?n["\uc0ac\uc6a9"]:n["\ubbf8\uc0ac\uc6a9"]},getDeputyUserId:function(){return this.attributes.deputyUserId},getDeputyUserName:function(){return this.attributes.deputyUserName},getDeputyUserPosition:function(){return this.attributes.deputyUserPosition},getDeputyUserDeptName:function(){return this.attributes.deputyUserDeptName},getAbsenceContent:function(){return this.attributes.absenceContent},getShowUrl:function(){return"/approval/document/"+this.attributes.documentId}});return r});