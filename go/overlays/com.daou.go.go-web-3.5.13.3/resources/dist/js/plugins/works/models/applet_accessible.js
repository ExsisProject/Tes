define("works/models/applet_accessible",function(require){var e=require("backbone"),t=require("app"),n=e.Model.extend({url:function(){return t.config("contextRoot")+"api/works/applets/hasaccessible"}});return n});