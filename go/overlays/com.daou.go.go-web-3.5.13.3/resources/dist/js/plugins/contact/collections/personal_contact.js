(function(){define(function(require){var e=require("backbone"),t=require("contact/models/contact"),n=e.Collection.extend({model:t,url:function(){return"/api/contact/personal/group/"+this.groupId+"/contacts"}});return n})}).call(this);