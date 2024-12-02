define('sms/views/home', function(require) {
	var App = require('app');
	var GridView = require("grid");
	
	var commonLang = require("i18n!nls/commons");
	var smsLang = require("i18n!sms/nls/sms");
	
	var BaseSmsView = require("sms/views/base_sms");
	var homeTmpl = require("hgn!sms/templates/home");
	
	var smsInfos = require("sms/collections/sms_infos");
	
	var lang = {
		"SMS" : commonLang["SMS"]
	}
	
	/**
	 * 문자발송 홈 메인 뷰
	 */
	var HomeView = BaseSmsView.extend({
		
		events : {
			"click a[data-type=sms]" : "goSmsDetail",
		},
			
		initialize : function(options) {
			
			BaseSmsView.prototype.initialize.apply(this, arguments);
			this.smsInfos = new smsInfos([],{
        		type : "user"
        	});
        	this.smsInfos.setDuration();
		},
		
		render : function() {
			
			BaseSmsView.prototype.render.apply(this, arguments)
			
			this.$el.html(homeTmpl({
			}));
        	this._renderDataTables();
			
			return this;
			
		},
		
		_renderDataTables : function() {
			var self = this;
        	this.gridView = new GridView({
    			el : "#smsListWapper",
    			collection : this.smsInfos,
    			tableClass : "type_normal tb_message_list",
    			checkbox : false,
    			usePeriod : true,
    			useToolbar : true,
    			columns : [{
    				name : "sendDate",
    				className : "date",
    				label : smsLang["발송일"],
    				sortable : true,
    				render : function(model) {
			    		return GO.util.basicDate3(model.get("sendDate"));
    				} 
    			}, {
    				name : "subject",
    				className : "subject sorting_disabled",
    				label : commonLang["제목"],
    				render : function(model) {
    					var subject = model.get("subject") ? model.get("subject") : commonLang["제목없음"];
						var element = 
		    				'<a data-move data-type="sms" data-id="' + model.id + '">' +
                            '<span class="txt">' + subject + '</span>' +
		    				'</a>';
						return element;
    				}
				},  {
    				name : "count",
    				className : "num sorting_disabled",
    				label : smsLang["총 요청 건수"],
    				render : function(model) {
			    		return model.get("count");
    				}
				}, {
    				name : "doneCount",
    				className : "num sorting_disabled",
    				label : smsLang["성공"],
    				render : function(model) {
			    		return model.get("doneCount");
    				}
				}, {
    				name : "errorCount",
    				className : "num sorting_disabled",
    				label : smsLang["실패"],
    				render : function(model) {
			    		return model.get("errorCount");
    				}
				}, {
    				name : "status",
    				className : "type sorting_disabled",
    				label : smsLang["현황"],
    				render : function(model) {
			    		var doneCount = model.get("doneCount"),
			    			errorCount = model.get("errorCount"),
			    			total = model.get("count");
			    		if(total > doneCount + errorCount){
			    			return smsLang["발송중"];
			    		}else{
			    			return smsLang["발송 완료"];
			    		}
    				}
				}, {
    				name : "messageType",
    				className : "type",
    				label : smsLang["분류"],
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
    			},
    			searchOptions : [{
        		   value : "subject",
        		   label : commonLang["제목"]
        	   },{
        		   value : "content",
        		   label : commonLang["내용"]
        	   }]
    		});
        	this.gridView.render();
    		this.smsInfos.fetch();
		},
		
		goSmsDetail : function(e) {
			var smsMessageId = e.currentTarget.getAttribute("data-id");
			App.router.navigate("sms/" + smsMessageId + "/detail", true);
		}		
	});
	
	return HomeView;
});