define(["backbone"],function(e){var t=e.Model.extend({url:"/api/approval/usersetting/userconfig",getDefaultPhoto:function(){return"resources/images/stamp_approved.png"}});return t});