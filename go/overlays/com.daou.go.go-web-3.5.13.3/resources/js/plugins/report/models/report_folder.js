define([
    "backbone",
    "i18n!report/nls/report",
    "i18n!admin/nls/admin"
],

function(
        Backbone,
        ReportLang,
        AdminLang
        ) {
    var ReportFolder = Backbone.Model.extend({
        urlRoot : GO.contextRoot+"api/report/folder",
        isOpen : function(){
            return this.get("publicOption") === "OPEN";
        },
        isReporterOpen : function(){
            return this.get("publicOption") === "CLOSED";
        },
        isPrivate : function(){
            return this.get("publicOption") === "PRIVATE";
        },
        isMemberWrite : function(){
            var flag = false;
            
            $.each(this.get("reporter").nodes,function(idx, data){
                if(data.nodeType == "department"){
                    flag = true;
                    return false;
                }
            });
            
            return flag;
        },
        isDescendantWrite : function(){
            var flag = false;
            
            $.each(this.get("reporter").nodes,function(idx, data){
                if(data.nodeType == "subdepartment"){
                    flag = true;
                    return false;
                }
            });
            
            return flag;
        },
        isSpecifiedWrite : function(){
            return !(this.isMemberWrite() || this.isDescendantWrite());
        },
        isPeriodic : function(){
            return this.get("type") === "PERIODIC";
        },
        isOccasional : function(){
            return this.get("type") === "OCCASIONAL";
        },
        reportersNameTag : function(){
            return setNameTag(this, "reporter");
        },
        referrersNameTag : function(){
            return setNameTag(this, "referrer");
        },
        adminsNameTag : function(){
            return setNameTag(this, "admin");
        },
        isActive : function(){
            return this.get("status") == "ACTIVE";
        },
        isInactive : function(){
            return this.get("status") == "INACTIVE";
        },
        
        reporterNames : function(){
            if(this.get("reporter").nodes.length != 0 ){
                var names = [];
            $.each(this.get("reporter").nodes, function(index, data){
                    var name = data.nodeValue;
                
                    if(data.nodeType =="subdepartment"){
                        name += " (" + ReportLang["하위 부서원 포함"] +" ) ";
                    }
                    names.push(name);
                });
                return names.join(", ");
            }else{
                return ReportLang["없음"];
            }
        },
        referrerNames : function(){
            if(this.get("referrer").nodes.length != 0 ){
                var names = [];
                $.each(this.get("referrer").nodes, function(index, data){
                	if(data.nodeType == "subdepartment"){
                		names.push(data.nodeValue + " (" + AdminLang["하위 부서 포함"] + ")");
                	}else{
                		names.push(data.nodeValue);
                	}
                })
                return names.join(", ");
            }else{
                return ReportLang["없음"];
            }
        },
        adminNames : function(){
            if(this.get("admin").length != 0){
                var names = [];
                $.each(this.get("admin").nodes, function(index, data){
                    names.push(data.nodeValue);
                })
                return names.join(", ");
            }else{
                return ReportLang["없음"];
            }
        },
        recurrenceJSON : function(){
            
        }
    }, {
        get: function(id) {
            var instance = new ReportFolder();
            
            instance.set({"id" :  id}, {silent:true});
            instance.fetch({async : false});
            return instance;
        },
        init : function(){
            var instance = new ReportFolder(),
                sessionUser = GO.session();
            
            instance.set({
                id : null,
                name : "",
                description : "",
                publicOption : "OPEN",
                reporter : {
                   nodes : [
                       {
                        nodeId : "",
                        nodeType : "department"
                       }
                   ]
                },
                form : {
                    content : ""
                },
                referrer : {
                    nodes : []
                },
                admin :
                   {
                     nodes : [
                              {
                               nodeId : sessionUser.id,
                               nodeType : "user",
                               nodeValue : sessionUser.name + " " + sessionUser.position 
                              }
                          ]
                    }
                ,
                recurrence : {
                    "FREQ" : "DAILY",
                    "INTERVAL" : 1,
                    "BYDAY" : "",
                    "BYMONTHDAY" : "",
                    "BYSETPOS" : ""
                },
                type  : "PERIODIC",
                formFlag : false
            });
            return instance;
        }
    }); 
    return ReportFolder;
    
    function setNameTag(reportModel , type){
        var nameTags = [];
            data = "";
        $.each(reportModel.get(type).nodes, function(){
            nameTags.push(
                {
                    id : this.nodeId,
                    title : this.nodeValue,
                    options : {
                        removable : true
                    }
                }
            );
        });
        return nameTags;
    }
});