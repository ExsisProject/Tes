define("works/models/workflow_manager",function(require){var e=require("backbone"),t=require("app"),n=require("when"),r=e.Model.extend({url:function(){return t.config("contextRoot")+"api/works/applets/"+this.get("id")+"/process"},defaults:{useProcess:!1,statuses:[],transitions:[]}});return r});