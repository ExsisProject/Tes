(function(){define(["backbone","community/models/boards"],function(e,t){var n=e.Collection.extend({model:t,url:function(){return"/api/community/"+this.communityId+"/board/myhome"}});return n})}).call(this);