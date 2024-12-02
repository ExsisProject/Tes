define([
    "jquery",
    "backbone",     
    "app",
    
    "sms/collections/sms_repnumbers",
    
    "hgn!admin/templates/sms_repnumber",
    
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
    
    smsRepNumbers,
    
    SmsRepnumberTmpl,
    
    commonLang,
    smsLang,
    adminLang,
    
    GridView
    
) {
    var tmplVal = {
    };
    var SmsRepnumberList = Backbone.View.extend({
    	accessUserView: null,
		exceptionUserView: null,
		el : '#layoutContent',
        initialize : function() {
        	this.smsRepNumbers = new smsRepNumbers([],{
        		type : "company"
        	});
        },
        
        events : {
        },
        render : function() {
        	this.$el.html(SmsRepnumberTmpl({
			}));
        	this._renderDataTables();
        },
        _renderDataTables : function() {
        	var self = this;
        	this.gridView = new GridView({
    			el : "#smsListWapper",
    			collection : this.smsRepNumbers,
    			tableClass : "chart size",
    			checkbox : true,
    			usePeriod : false,
    			useToolbar : true,
    			isAdmin : true,
    			useBottomButton : false,
    			buttons : [{
					render : function() {
						return '<span class="btn_tool " data-button>'  + adminLang["신규 추가"] +'</span>';
					},
					onClick : function() {
						App.router.navigate("sms/repnumber/create", true);
					}
    			},{
					render : function() {
						return '<span class="btn_tool txt_caution" data-button>' + commonLang["삭제"] + '</span>';
					},
					onClick : function() {
						var ids = _.map($("input[type=checkbox][data-id]:checked"), function(input) {
							return $(input).attr("data-id");
						})
			    		if (ids.length == 0) {
			    			$.goMessage(commonLang["선택된 항목이 없습니다."])
			    			return false;
			    		}
			    		
			    		var str = "";
			    		_.each($("input[type=checkbox][data-id]:checked"), function(repnum) {
			    			str = str + "id=" + $(repnum).attr("data-id") + "&";
			    		});
			    		$.goPopup({
							title : commonLang["삭제"],
							message : adminLang["삭제경고"],
							buttons : [{
								btype : "confirm",
								btext : commonLang["확인"],
								callback : function() {
									$.ajax({
						    			type : "DELETE",
						    			dataType : "json",
						    			url : GO.contextRoot + "ad/api/sms/repnumber?" + str ,
						    			success : function(resp) {
						    				$.goMessage(commonLang["삭제되었습니다."]);
						    				self.gridView.collection.fetch();
						    			},
						    			error : function(resp) {
					            			$.goError(resp.responseJSON.message);
					            		}
						    		});
								}
							}, {
								btext : commonLang["취소"],
								callback : function() {
								}
							}]
						});
					}
    			}],
    			columns : [{
    				name : "name",
    				className : "name_L",
    				label : smsLang["대표번호 이름"],
    				sortable : true,
    				render : function(model) {
			    		return model.get("name");
    				} 
    			}, {
    				name : "repNumber",
    				className : "number",
    				label : smsLang["발신번호"],
    				sortable : true,
    				render : function(model) {
    					return model.get("repNumber");
    				}
				}, {
    				name : "status",
    				className : "state sorting_disabled",
    				label : adminLang['사용여부'],
    				sortable : false,
    				render : function(model) {
    					var status = model.get("status");
						if(status == "NORMAL") {
		    	    		return adminLang["정상"]
		    	    	} else {
		    	    		return adminLang["숨김"];
		    	    	}
    				}
                }, {
    				name : "settting",
    				className : "sorting_disabled",
    				label : adminLang["설정"],
    				sortable : false,
    				render : function(model) {
			    		return '<span class="btn_s" data-id="' + model.get("id") + '">' + adminLang["설정"] + '</span>';
    				}
				}],
    			drawCallback : function(collection) {
    				$(".toolbar_top").removeClass("tool_bar");
    				self.$el.find(this.el + ' tr>td span.btn_s').css('cursor', 'pointer').click(function(e) {
                        var url = "sms/repnumber/" + $(e.currentTarget).attr("data-id");
                        
                        GO.router.navigate(url, {trigger: true});
                    });
    			},
	           searchOptions : [{
        		   value : "name",
        		   label : smsLang["대표번호 이름"]
        	   }, {
        		   value : "repNumber",
        		   label : smsLang['발신번호']
        	   }]
    		});
        	this.gridView.render();
    		this.smsRepNumbers.fetch();
        }
		
	});
	
	return SmsRepnumberList;
});