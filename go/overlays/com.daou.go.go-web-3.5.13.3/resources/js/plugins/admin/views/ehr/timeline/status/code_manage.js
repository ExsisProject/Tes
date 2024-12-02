define("admin/views/ehr/timeline/status/code_manage", function(require) {
    var $ = require("jquery");
	var GO = require("app");
    var Backbone = require("backbone");

    var TimelineCode = require("admin/models/ehr/timeline/code");
    var TimelineExtConfig = require("admin/models/ehr/timeline/ext_config");

    var Tmpl = require("hgn!admin/templates/ehr/timeline/status/code_list");
    var TmplCodeLayer = require("hgn!admin/templates/ehr/timeline/status/code_layer");
    
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    
    require("jquery.go-popup");
    require("jquery.go-grid");
    
    var lang = {
    		label_add_code : adminLang["추가"],
    		label_code : adminLang["코드"],
    		label_code_name : adminLang["항목"],
    		label_timeline_type : adminLang["근태 유형 타입"],
			label_include_working_time : adminLang["근무시간"],
    		label_use_yn : adminLang["사용여부"],
    		label_timeline_manage : adminLang["근태 유형 등록"],
    		label_timeline_modify : adminLang["근태 유형 설정"],
    		label_empty_list : adminLang["등록된 근태관리코드가 없습니다."], 
    		label_caution_code : adminLang["근태 유형 코드는 필수입력값입니다."],
    		label_caution_name : adminLang["근태 유형 명칭은 필수입력값입니다."],
    	    label_date : adminLang['날짜'],
    	    label_time : adminLang['시간'],
    	    label_setting : adminLang['설정'],
    	    label_use : adminLang["사용"],
    	    label_unuse : adminLang["미사용"],
			label_include_y : adminLang["포함"],
			label_include_n : adminLang["포함안함"],
    	    label_use_yn_tooltip : adminLang["사용 체크시 근태 현황 화면에서 확인 및 사용이 가능합니다."],
    	    label_code_check : commonLang["코드 입력값 체크"],
    };

    
    var TimelineCodeManageList = Backbone.View.extend({

    	events : {
    		"click #btnManageControllCode #addCode" : "_addCode",
			"click span#onIncludeWorkingTime" : "_onIncludeWorkingTime",
			"click span#offIncludeWorkingTime" : "_offIncludeWorkingTime",
			"click span#onUse" : "_onUse",
			"click span#offUse" : "_offUse",
    	},

    	initialize : function(options) {
			this.timelineExtConfig = new TimelineExtConfig();
        },

        render : function() {
    		this.$el.html(Tmpl({
    			lang : lang,
    		}));
    		
    		var	extConfigPromise = this.timelineExtConfig.fetch().promise();
        	$.when(extConfigPromise).done(_.bind(function(){
        		this._renderCodeDataTables();       		
        	}, this));
        },

        _renderCodeDataTables : function() {
        	var self = this;
        	
        	this.codeDataTable = $.goGrid({
        		el : '#timelineCodeManageTable',
        		bDestory : true,
        		method : 'GET',
        		url : GO.contextRoot + 'ad/api/timeline/status/all',
        		params : {},
        		emptyMessage : "<p class='data_null'> " +
				               "<span class='ic_data_type ic_no_data'></span>" +
				               "<span class='txt'>" + lang['label_empty_list'] + "</span>" +
				               "</p>", 
				defaultSorting : [],
				pageUse : false,
				sDomUse : false,
				checkbox : false,
				sDomType : 'admin',
				columns : [
					{ mData : null, sClass: "align_c", bSortable: false, sWidth : "100px",
			        	fnRender : function(obj) {
			        		var code = obj.aData.timelineCode;
							return (code == undefined || code == '') ? '-' : code;
						}				        	
					},
					{ mData : null, sClass: "align_c", bSortable: false, sWidth : "100px",
						fnRender : function(obj) {
							var name = obj.aData.name; 
							return (name == undefined) ? '-' : name;
						}							
					},
					{ mData : null, sClass: "align_c", bSortable: false, sWidth : "100px",
						fnRender : function(obj) {
							return self._timelineWorkingTimeConverter(obj.aData.includeWorkingTime);
						}
					},
					{ mData : null, sClass: "align_c", bSortable: false, sWidth : "100px", 
						fnRender : function(obj) {
							return self._timelineUseYNConverter(obj.aData.useYN);
						}
					},
					{ mData : null, sClass: "set align_c", bSortable: false, sWidth : "60px", 
						fnRender : function(obj) {
							if (obj && obj.aData.defaultStatus) {
								return "";
							}
							var btnTags = "<span id='settingCode' class='btn_s' data-id='" + obj.aData.id + "'>" + adminLang["설정"] + "</span>";
							return btnTags;
						}
					}
				],
				fnDrawCallback : function(obj, oSettings, listParams) {
                    self.$el.find('tr>td:nth-child(5) span').click(function(e) {
                    	var id = $(e.currentTarget).data('id');
                    	self._editCode(e, id);
                    });
				}
        	});
        	
        	this.codeList = this.codeDataTable.tables.fnGetData()
        },
        
        _codeTableReload : function() {
        	this.codeDataTable.tables.reload();
        },
        
        _addCode : function(e) {
        	this._callPopupTimelineCode();
        },
        
		_editCode : function(e, id) {
			this._callPopupTimelineCode(id);
		},

		_callPopupTimelineCode : function(id) {
			var isSyncActive = this.timelineExtConfig.get('syncActive');
			this.codeList = this.codeDataTable.tables.fnGetData();
			this.editId = id;
			
			var self = this,
        		TmplCode = TmplCodeLayer({
	    			lang : lang,
	    			'isEditable' : true,
	    			'useOnOff' : true,
					'includeWorkingTimeOnOff' : true,
	    		});
        	
	    	if(id) {
	    		this.code = new TimelineCode();
	    		this.code.set("id", id);
	    		this.code.fetch({async: false});
	    		TmplCode = TmplCodeLayer({
	            	lang : lang,
                	'id' : this.code.get('id'),
                	'isEditable' : true,
	            	'isTimelineType' : (this.code.get('type') == 'date') ? true : false,
        			'timelineCode' : (this.code.get('timelineCode') == undefined) ? '' : this.code.get('timelineCode'),
					'includeWorkingTimeOnOff' : (this.code.get('includeWorkingTime') == true) ? true : false,
					'useOnOff' : (this.code.get('useYN') == true) ? true : false,
					'name' : this.code.get('name'),
					'isSyncActive' : isSyncActive,
	            });
	    	}

	    	this.codePopup = $.goPopup({
	    		pclass : 'layer_normal layer_ehr_kind',
				header : id == null ? lang.label_timeline_manage : lang.label_timeline_modify,
				modal : true,
	            width : '320px',
	            contents : TmplCode,
	            buttons : [{
	                btext : commonLang["저장"],
	                btype : "confirm",
	                autoclose : false,
	                callback : function(popupEl) {
	                	var timelineCode = popupEl.find('input#timelineCode').val(),
	                		codeName = popupEl.find('input#name').val(),
	                		useYN = popupEl.find("button#onUse").hasClass("on"),
							includeWorkingTime = popupEl.find("button#onIncludeWorkingTime").hasClass("on"),
	                		isValid = true;                	
	                	
	                	// Validation
	                	// 영문(소/대), 숫자, -, _ 만 입력 가능
	                	var regExp = /^[a-zA-Z0-9-_]*$/;
	                	if (!regExp.test(timelineCode)) {
            				$('#stateNameValidate').text(lang.label_code_check);         				
            				$("input#timelineCode").focus();
	                		return;
	                	}
            			
                    	if (codeName == "") {
                    		$('#stateNameValidate').text(lang.label_caution_name);
            				$("input#name").focus();
            				return;
                    	}                   	
            			if (!$.goValidation.isCheckLength(2, 10, codeName)) {
            				$('#stateNameValidate').text(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"10"}));
            				$("input#name").focus();
            				return;
            			}

            			if(self.codeList.length > 0) {
            				// 근태코드 중복 체크
            				$.each(self.codeList, function(i, item){
            					if(timelineCode && item.timelineCode == timelineCode){
                					if (self.editId && self.editId == item.id) {
                						return true;
                					}
            						$('#stateNameValidate').text(lang.label_code + ' : ' + adminLang['이미 추가되어 있습니다.']);
            						isValid = false;
            						return;
            					}
            				});
            				if(!isValid){
            					$("input#timelineCode").focus();
            					return;
            				}
            				// 유형명칭 중복 체크
            				$.each(self.codeList, function(i, item){
            					if(item.name == codeName){
            						if (self.editId && self.editId == item.id) {
            							return true;
            						}
            						$('#stateNameValidate').text(lang.label_code_name + ' : ' + adminLang['이미 추가되어 있습니다.']);
            						isValid = false;
            						return;
            					}
            				});
            				if(!isValid){
            					$("input#name").focus();
            					return;
            				}
            			} 

                    	if (popupEl.find('span.title').data('id')) {
	                		self.code.set('id', popupEl.find('span.title').data('id'));
	                	} else {
	                		self.code = new TimelineCode();
	                	}
	                	self.code.set('timelineCode', timelineCode);
	                	self.code.set('name', codeName);
	                	self.code.set('type', 'time');
	                	self.code.set('useYN', useYN);
	                	self.code.set('includeWorkingTime', includeWorkingTime);
	                	popupEl.close();

	                	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
	                	self.code.save({},{
	                		success : function(model, response) {
	                			self._codeTableReload();
	                			GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
	                		},
	                		error : function(model, response) {
	                			if(response && response.responseJSON && response.responseJSON.message) {
	                				$.goSlideMessage(response.responseJSON.message, 'caution');
	                			} else {
	                				$.goSlideMessage(commonLang["실패했습니다."], 'caution');
	                			}
	                			GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
	                		}
	                	});
	                }
	            },{
					btext : commonLang["취소"],
					btype : "cancel"
				}]
	        }, this);

			this._popUpLayerEventBind();
		},

		_popUpLayerEventBind : function() {
			var self = this;
			this.codePopup.off("click", "button#onIncludeWorkingTime");
			this.codePopup.off("click", "button#offIncludeWorkingTime");
			this.codePopup.off("click", "button#onUse");
			this.codePopup.off("click", "button#offUse");

			this.codePopup.on("click", "button#onIncludeWorkingTime", $.proxy(this._setOnIncludeWorkingTime, this));
			this.codePopup.on("click", "button#offIncludeWorkingTime", $.proxy(this._setOffIncludeWorkingTime, this));
			this.codePopup.on("click", "button#onUse", $.proxy(this._setOnUse, this));
			this.codePopup.on("click", "button#offUse", $.proxy(this._setOffUse, this));
		},

		_setOnIncludeWorkingTime : function(e) {
			var self = this;
			$("button#onIncludeWorkingTime").addClass("on");
			$("button#offIncludeWorkingTime").removeClass("on");
		},

		_setOffIncludeWorkingTime : function(e) {
			var self = this;
			$("button#onIncludeWorkingTime").removeClass("on");
			$("button#offIncludeWorkingTime").addClass("on");
		},

		_setOnUse : function(e) {
			var self = this;
			$("button#onUse").addClass("on");
			$("button#offUse").removeClass("on");
		},

		_setOffUse : function(e) {
			var self = this;
			$("button#onUse").removeClass("on");
			$("button#offUse").addClass("on");
		},

        _timelineTypeConverter : function(data) {
        	return (data == 'date') ? lang.label_date : lang.label_time;
        },
        
        _timelineUseYNConverter : function(data) {
        	return (data == true) ? lang.label_use : lang.label_unuse;
        },

		_timelineWorkingTimeConverter : function (data) {
			return (data == true) ? lang.label_include_y : lang.label_include_n;
		}
    });

    return TimelineCodeManageList;
});