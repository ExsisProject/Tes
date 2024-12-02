define("admin/views/attnd_code_manage", function(require) {
	var $ = require("jquery");
	var GO = require("app");
	var Backbone = require("backbone");

	var AttndCode = require("admin/models/attnd_code");
	var AttndExtConfig = require("admin/models/attnd_ext_config");

	var Tmpl = require("hgn!admin/templates/attnd_code_list");
	var TmplCodeLayer = require("hgn!admin/templates/attnd_code_layer");

	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");

	require("jquery.go-popup");
	require("jquery.go-grid");

	var lang = {
		label_add_code : adminLang["추가"],
		label_code : adminLang["근태 유형 코드"],
		label_code_name : adminLang["근태 유형 명칭"],
		label_attnd_type : adminLang["근태 유형 타입"],
		label_use_yn : adminLang["사용여부"],
		label_attnd_manage : adminLang["근태 유형 등록"],
		label_attnd_modify : adminLang["근태 유형 설정"],
		label_empty_list : adminLang["등록된 근태관리코드가 없습니다."],
		label_caution_code : adminLang["근태 유형 코드는 필수입력값입니다."],
		label_caution_name : adminLang["근태 유형 명칭은 필수입력값입니다."],
		label_caution_total : adminLang['최대 30개까지만 추가할 수 있습니다.'],
		label_date : adminLang['날짜'],
		label_time : adminLang['시간'],
		label_setting : adminLang['설정'],
		label_use : adminLang["사용"],
		label_unuse : adminLang["미사용"],
		label_use_yn_tooltip : adminLang["사용 체크시 근태 현황 화면에서 확인 및 사용이 가능합니다."],
		label_code_check : commonLang["코드 입력값 체크"]
	};



	var AttndCodeManageList = Backbone.View.extend({

		events : {
			"click #btnManageControllCode #addCode" : "_addCode",
		},

		initialize : function(options) {
			this.attndExtConfig = new AttndExtConfig();
		},

		render : function() {
			var self = this;
			this.$el.html(Tmpl({
				lang : lang,
			}));

			var	extConfigPromise = this.attndExtConfig.fetch().promise();
			$.when(extConfigPromise).done(_.bind(function(){
				this._renderCodeDataTables();
			}, this));
		},

		_renderCodeDataTables : function() {
			var self = this;

			this.codeDataTable = $.goGrid({
				el : '#attndCodeManageTable',
				bDestory : true,
				method : 'GET',
				url : GO.contextRoot + 'ad/api/ehr/attnd/code',
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
							var code = obj.aData.attndCode;
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
							return self._attndTypeConverter(obj.aData.type);
						}
					},
					{ mData : null, sClass: "align_c", bSortable: false, sWidth : "100px",
						fnRender : function(obj) {
							return self._attndUseYNConverter(obj.aData.useYN);
						}
					},
					{ mData : null, sClass: "set align_c", bSortable: false, sWidth : "60px",
						fnRender : function(obj) {
							var btnTags = "<span id='settingCode' class='btn_fn7 btn-board-admin' data-id='" + obj.aData.id + "'>" + adminLang["설정"] + "</span>";
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
			var self = this;
			this.codeList = this.codeDataTable.tables.fnGetData();

			if(this.codeList.length >= 30 ){
				$.goAlert(adminLang['최대 30개까지만 추가할 수 있습니다.']);
				return;
			}

			this._callPopupAttndCode();
		},

		_editCode : function(e, id) {
			var self = this;
			this._callPopupAttndCode(id);
		},

		_callPopupAttndCode : function(id) {
			var isSyncActive = this.attndExtConfig.get('syncActive');
			this.codeList = this.codeDataTable.tables.fnGetData();
			this.editId = id;

			var self = this,
				TmplCode = TmplCodeLayer({
					lang : lang,
					'isEditable' : true,
					'checked' : true,
				});

			if(id) {
				this.code = new AttndCode();
				this.code.set("id", id);
				this.code.fetch({async: false});
				TmplCode = TmplCodeLayer({
					lang : lang,
					'id' : this.code.get('id'),
					'isEditable' : true,
					'isAttndType' : (this.code.get('type') == 'date') ? true : false,
					'checked' : (this.code.get('useYN') == true) ? true : false,
					'attndCode' : (this.code.get('attndCode') == undefined) ? '' : this.code.get('attndCode'),
					'name' : this.code.get('name'),
					'isSyncActive' : isSyncActive,
				});
			}

			this.groupPopup = $.goPopup({
				pclass : 'layer_normal layer_code_add',
				header : id == null ? lang.label_attnd_manage : lang.label_attnd_modify,
				modal : true,
				width : '320px',
				contents : TmplCode,
				buttons : [{
					btext : commonLang["저장"],
					btype : "confirm",
					autoclose : false,
					callback : function(popupEl) {
						var attndCode = popupEl.find('input#attndCode').val(),
							codeName = popupEl.find('input#name').val(),
							attndType = popupEl.find("select#attndType.selectBox").val(),
							useYN = popupEl.find("input#useYN[type='checkbox']").is(":checked"),
							isValid = true;

						// Validation
						// 영문(소/대), 숫자, -, _ 만 입력 가능
						var regExp = /^[a-zA-Z0-9-_]*$/;
						if (!regExp.test(attndCode)) {
							$('#stateNameValidate').text(lang.label_code_check);
							$("input#attndCode").focus();
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
								if(attndCode && item.attndCode == attndCode){
									if (self.editId && self.editId == item.id) {
										return true;
									}
									$('#stateNameValidate').text(lang.label_code + ' : ' + adminLang['이미 추가되어 있습니다.']);
									isValid = false;
									return;
								}
							});
							if(!isValid){
								$("input#attndCode").focus();
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
							self.code = new AttndCode();
						}
						self.code.set('attndCode', attndCode);
						self.code.set('name', codeName);
						self.code.set('type', attndType);
						self.code.set('useYN', useYN);
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
		},

		_attndTypeConverter : function(data) {
			var self = this;
			return (data == 'date') ? lang.label_date : lang.label_time;
		},

		_attndUseYNConverter : function(data) {
			var self = this;
			return (data == true) ? lang.label_use : lang.label_unuse;
		},
	});

	return AttndCodeManageList;
});