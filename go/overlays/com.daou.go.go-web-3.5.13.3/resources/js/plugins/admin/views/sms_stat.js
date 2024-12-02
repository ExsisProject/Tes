define([
    "jquery",
    "backbone",     
    "app",
    
    "sms/collections/sms_infos",
    
    "hgn!admin/templates/sms_stat",
    
    "i18n!nls/commons",
    "i18n!sms/nls/sms",
    "i18n!admin/nls/admin",
    
    "grid",
    
    "jquery.go-popup",
    "jquery.go-sdk",
    "GO.util"
], 

function(
    $, 
    Backbone,
    App,
    
    smsInfos,
    
    SmsStatTmpl,
    
    commonLang,
    smsLang,
    adminLang,
    
    GridView
    
) {
    var tmplVal = {
    };
    var SmsStat = Backbone.View.extend({
    	accessUserView: null,
		exceptionUserView: null,
		el : '#layoutContent',
        initialize : function() {
        	this.smsInfos = new smsInfos([],{
        		type : "company"
        	});
        	this.smsInfos.setDuration();
        },
        
        events : {
        },
        render : function() {
        	this.$el.html(SmsStatTmpl({
			}));
        	this._renderDataTables();
        },
        _renderDataTables : function() {
        	var self = this;
        	this.gridView = new GridView({
    			el : "#smsListWapper",
    			collection : this.smsInfos,
    			tableClass : "chart size",
    			checkbox : false,
    			usePeriod : true,
    			useToolbar : true,
    			isAdmin : true,
    			useBottomButton : false,
    			columns : [{
    				name : "sendDate",
    				className : "date",
    				label : smsLang["발송일"],
    				sortable : true,
    				render : function(model) {
			    		return GO.util.basicDate3(model.get("sendDate"));
    				} 
    			}, {
    				name : "senderName",
    				className : "name",
    				label : smsLang["발송자"],
    				sortable : true,
    				render : function(model) {
    					var sender = model.get("sender");
						if(sender) {
		    	    		sender.position = sender.position || '';
		    	    		return sender.name + ' ' + sender.position;
		    	    	} else {
		    	    		return '-';
		    	    	}
    				}
				}, {
    				name : "senderDeptName",
    				className : "depart sorting_disabled",
    				label : adminLang['소속부서'],
    				sortable : false,
    				render : function(model) {
    					var deptName = model.get("sender").deptName;
						if(deptName) {
		    	    		return deptName;
		    	    	} else {
		    	    		return '-';
		    	    	}
    				}
                }, {
    				name : "count",
    				className : "count sorting_disabled",
    				label : smsLang["발송 건수"],
    				sortable : false,
    				render : function(model) {
			    		return model.get("count");
    				}
				}, {
    				name : "messageType",
    				className : "type",
    				label : adminLang["분류"],
    				sortable : true,
    				render : function(model) {
			    		var messageType = model.get("messageType");
			    		if(messageType){
			    			return messageType;
			    		} else {
			    			return "-";
			    		}
			    		
    				}
				}],
    			drawCallback : function(collection) {
    				$(".toolbar_top").removeClass("tool_bar");
    			},
	           searchOptions : [{
        		   value : "sender",
        		   label : smsLang["발송자"]
        	   }, {
        		   value : "deptName",
        		   label : adminLang['소속부서']
        	   }]
    		});
        	this.gridView.render();
    		this.smsInfos.fetch();
        }
		
	});
	
	return SmsStat;
});