define("works/models/applet_doc_refer",function(require){var e=require("works/models/applet_doc");return e.extend({initialize:function(t,n){e.prototype.initialize.apply(this,arguments),this.appletId=n.appletId,this.reqAppletId=n.reqAppletId},urlRoot:function(){return GO.config("contextRoot")+"api/works/applets/"+this.reqAppletId+"/producer/"+this.appletId+"/doc"}})});