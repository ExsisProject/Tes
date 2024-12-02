;(function() {
	define([
			"backbone",
			"hogan",

			"i18n!nls/commons",
			"i18n!task/nls/task",
	        "hgn!task/templates/field_setting",
	        "task/views/_field_option",
	], 
	function(
			Backbone,
			Hogan,
			
			commonLang,
			taskLang,
			FieldSettingTmpl,
			OptionItem
	) {
		var lang = {
				"add" : commonLang["추가"],
				"delete" : commonLang["삭제"],
				"setting" : commonLang["설정"],
				"defaultValue" : taskLang["기본값"],
				"optionName" : taskLang["항목명"],
				"type" : taskLang["타입"],
				"inputOption" : taskLang["입력옵션"],
				"require" : taskLang["업무 등록 시 필수 입력 사항"],
				"optional" : taskLang["선택사항"],
				"detail" : taskLang["세부항목"],
				"inputOptionName" : taskLang["항목명 입력"],
				"letters" : taskLang["자"],
				"addOptionName" : taskLang["항목명 추가"],
				"defaultMessage" : taskLang["기본메시지"],
				"checkState" : taskLang["체크 상태"],
				"nonChecked" : taskLang["체크하지 않음"],
				"typeDesc" : taskLang["타입은 변경할 수 없습니다."],
				"detailDesc" : taskLang["세부 항목 설명"]
				
		};
		
		
		var FieldTmpl = Hogan.compile(
			'<td class="subject">' +
				'<span class="txt">{{data.name}}</span>' +
			'</td>' +
			'<td class="type"><span class="txt">{{data.typeText}}</span></td>' +
			'<td class="essential"><span class="txt">{{data.requiredText}}</span></td>' +
			'<td class="detail">' +
			'{{#data.detail}}' +
				'{{#value}}' +
				'<span class="txt">{{value}}' +
					'{{#defaultValue}}<strong>({{lang.defaultValue}})</strong>{{/defaultValue}}' +
				'</span>' +
				'{{/value}}' +
				'{{#value}}<br>{{/value}}' +
			'{{/data.detail}}' +
			'</td>' +
			'<td class="mgmt">' +
				'<span class="wrap_btn_m"><span class="ic_setting" title="{{lang.setting}}"></span></span> ' +
				'<span class="wrap_btn_m"><span class="ic_side ic_basket_bx" title="{{lang.delete}}"></span></span>' +
			'</td>'
		);
		
		
		var FieldItemView = Backbone.View.extend({
			tagName : "tr",
			events : {
				"click span.ic_setting" : "fieldPopup",
				"click span.ic_basket_bx" : "destroy"
			},
			initialize : function(data) {
				this.dataSet = this.dataParser(data);
				this.render();
			},
			render : function() {
				this.$el.html(FieldTmpl.render({
					data : this.dataSet,
					lang : lang
				}));
				this.$el.attr("id", this.dataSet.id);
			},
			
			dataParser : function(data) {
				return {
					id : data.id,
					name : data.name,
					type : data.type,
					typeText : this._getFieldType(data.type),
					required : data.required,
					requiredText : data.required ? taskLang["필수"] : commonLang["선택"],
					defaultValue : data.defaultValue,
					options : data.options, 
					message : data.message,
					detail : this.getDetail(data),
					isSelectType : this._isSelectType(data.type),
					isBooleanType : this._isBooleanType(data.type),
					isTextType : this._isTextType(data.type)
				};
			},
			
			
			getDetail : function(data) {
				if (this._isSelectType(data.type)) {
					return $.map(data.options, function(option){
						return dataSet = {
							value : option,
							defaultValue : option == data.defaultValue
						};
					});
				} else if(this._isBooleanType(data.type)) {
					return [{
						value : data.message,
						defaultValue : false
					}, {
						value : data.defaultValue ? taskLang["체크 상태"] : taskLang["체크하지 않음"],
						defaultValue : true
					}];
				} else if(this._isTextType(data.type)){
					if (data.message == "") return;
					return dataSet = [{
						value : data.message,
						defaultValue : false
					}];
				} else {
					return "";
				}
			},
			
			
			// backbone view 로 Refactoring 하자
			fieldPopup : function() {
				var self = this;
				this.popup = $.goPopup({
                    modal : true,
                    pclass : "layer_normal layer_task_type",
                    header : taskLang["항목 수정"],
                    width : 500,
                    contents : FieldSettingTmpl({
                    	data : this.dataSet,
                    	lang : lang
                    }),
                    buttons : [{
                        btext : commonLang["확인"],
                        btype : "confirm", 
                        autoclose : false,
                        callback : function() {
                        	if (!self.popupValidate()) return;
                        	
                        	var data = self.getModifyData();
                        	self.dataSet = self.dataParser(data);
                        	self.$el.html(FieldTmpl.render({
            					data : self.dataSet,
            					lang : lang
            				}));
                        	self.$el.data("instance", data);
                        	self.popup.close();
                        }
                    }, {
                        btext : commonLang["취소"],
                        btype : "cancel"
                    }]
                });
				
				this.popupViewBind();
			},
			
			popupValidate : function() {
				var isValid = true;
				var fieldName = $("#fieldName");
				if (fieldName.val().length > 40 || fieldName.val().length < 2) {
					$.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 2, arg2 : 40}), fieldName, false, true);
					isValid = false;
				}
				
				var message = $("#message");
				if (message.val() && message.val().length > 200) {
					$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {arg1 : 200}), $("#message"), false, true);
            		isValid = false;
            	}
				
            	_.each(this.getDetailOptions(), function(input) {
            		if (!$(input).val() || $(input).val().length > 200) {
            			var message = GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 1, arg2 : 200});
            			$.goError(message, $(input), false, true);
            			isValid = false;
            		} 
            	});
            	return isValid;
			},
			
			
			getModifyData : function() {
				var options = $.map($("#optionList").find("tr"), function(option) {
        			return $(option).find("#option").val();
        		});
				var data = {
					id : this.dataSet.id,
            		name : $("#fieldName").val(),
            		type : this.dataSet.type,
            		required : $("#required").find("input[name=require]:checked").val() == "true" ? true : false,
            		defaultValue : this.getDefaultValue(),
            		options : options,
            		message : $("#message").val() == "" ? null : $("#message").val(),
            	};
				
				if (this._isSelectType(this.dataSet.type) && !options.length) data["required"] = false;
				
				return data;
			},
			
			// TODO Refactoring
			getDefaultValue : function() {
				if (this._isSelectType(this.dataSet.type)){
					return $("#optionList").find("input[name=option]:checked").parents("tr:first").find("#option").val();
				} else if (this._isBooleanType(this.dataSet.type)){
					return $("#defaultValue").find("input[name=defaultValue]:checked").val() == "true" ? true : false;
				} else {
					return "";
				}
			},
			
			// TODO Refactoring 
			popupViewBind : function() {
				var self = this;
				this.popup.find("span.ic_basket_bx").on("click", function(e, data){
					self.destroyOption(e);
				});
				this.popup.find("#addOption").on("click", function(e, data){
					if ($("#optionList").find("tr").length < 30) {
						self.addOption();
						self.popup.reoffset();
					} else {
						$.goError(taskLang["세부항목 30개"], $("#detailError"), false, true);
					}
				});
				this.popup.find("#optionInput").on("keyup", function(e, data){
					self.optionLengthCheck(e);
				});
				this.popup.find("input[name=option]").on("click", function(e, data){
					self.uniqCheckbox(this);
				});
			},
			
			// TODO Refactoring 
			checkboxRebind : function() {
				var self = this;
				$("input[name=option]").off("click");
				$("input[name=option]").on("click", function(e, data){
					self.uniqCheckbox(this);
				});
			},
			
			// TODO Refactoring 
			destroyOption : function(e) {
				$(e.target).parents("tr:first").remove();
			},
			
			// TODO Refactoring 
			addOption : function() {
				var optionName = $("#optionInput").val();
				if (optionName == "") return;
				if (optionName.length > 200) {
					$.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."], {"arg1" : "200"}), $("#detailError"), false, true);
					return;
				}
				var options = _.map(this.getDetailOptions(), function(input) {
					return $(input).val();
				});
				
				if (_.contains(options, optionName)) {
					$.goError(taskLang["세부항목이 이미 존재합니다."], $("#detailError"), false, true);
					return;
				}
				
				var optionItem = new OptionItem({name : optionName});
				$("#optionList").append(optionItem.el);
				$("#optionInput").val("");
				$("#optionInputLength").text(0);
				this.checkboxRebind();
			},
			
			// TODO Refactoring 
			optionLengthCheck : function(e) {
				var context = $(e.target);
				$("#" + context.attr("id") + "Length").text(context.val().length);
			},
			
			// TODO Refactoring 
			uniqCheckbox : function(checkbox) {
				if ($(checkbox).is(":checked")) $("input[name=option]").not(checkbox).attr("checked", false);
			},
			
			
			destroy : function() {
				var self = this;
				$.goConfirm(commonLang["삭제하시겠습니까?"], "", function() {
					self.$el.remove();
				});
			},
			
			
			getDetailOptions : function() {
				return $("input[data-tag=optionInput]");
			},
			
			
			_getFieldType : function(type) {
				if (this._isSelectType(type)) {
					return taskLang["선택형"];
				} else if(this._isBooleanType(type)) {
					return taskLang["확인형"];
				} else if(this._isTextType(type)){
					return taskLang["텍스트형"];
				} else {
					return "";
				}
			},
			
			
			_isSelectType : function(type) {
				return type == "SELECT";
			},
			
			
			_isBooleanType : function(type) {
				return type == "BOOLEAN";
			},
			
			
			_isTextType : function(type) {
				return type == "TEXT";
			}
		});
		return FieldItemView;
	});
}).call(this);