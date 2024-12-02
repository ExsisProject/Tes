/***
 * 전자문서 결재관리 권한이 있는 유저들의 권한 종류(read, writemo, remove)를 포함하는 정보. ApprMasterModel.java
 */

define([
        "backbone",
        "app"
    ],
    
    function(
        Backbone,
        GO
    ) {
        var ApprMasterAuthModel = Backbone.Model.extend({
            defaults : {
            	read : false,
            	write : false,
            	remove : false
            },
            initialize : function(options){
            	if(!_.isUndefined(options.docId)){
                	this.docId =  options.docId;
            	}
            },
            url : function(){
            	return GO.contextRoot + "api/approval/auth/docmanage/" + this.get('docId');
            },
            
            authRead : function(){
            	return this.get('read')
            },
            
            authWrite : function(){
            	return this.get('write')
            },
            
            authRemove : function(){
            	return this.get('remove')
            }

        });
    
        return ApprMasterAuthModel;
    }
);