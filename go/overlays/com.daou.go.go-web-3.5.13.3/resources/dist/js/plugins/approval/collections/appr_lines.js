(function(){define(["jquery","backbone","app","approval/models/appr_line"],function(e,t,n,r){var i=t.Collection.extend({model:r,url:function(){return GO.contextRoot+"api/approval/usersetting/apprline"}});return i})}).call(this);