define("works/collections/periods",function(require){var e=require("backbone"),t=require("app");return e.Collection.extend({initialize:function(e){this.options=e||{},this.appletId=e.appletId},url:function(){return t.contextRoot+"api/works/applet/"+this.appletId+"/calendarview/periods"},getIds:function(){return _.map(this.models,function(e){return e.id})}})});