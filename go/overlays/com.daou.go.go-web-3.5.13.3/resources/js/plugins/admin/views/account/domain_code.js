define('admin/views/account/domain_code', function(require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");

    var InstallInfoModel = require("admin/models/install_info");
    var DomainCodeModel = require("admin/models/domain_code");
    var DomainCodeModelById = require("admin/models/domain_code_by_id");
	
    var DomainCodeSampleView = require("admin/views/account/domain_code_sample");
    var BackdropView = require('components/backdrop/backdrop');

    var domainCodeExTmpl = require("hgn!admin/templates/domain_code_example");
    var domainCodeTmpl = require("hgn!admin/templates/domain_code");
    var codeCreateTmpl = require("hgn!admin/templates/domain_code_create");
    var codeUpdateTmpl = require("hgn!admin/templates/domain_code_update");
    var emptyTmpl = require("hgn!admin/templates/list_empty");

    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    require("jquery.go-grid");
    require("jquery.go-validation");
    require("jquery.go-popup");
    require("jquery.go-sdk");
    require("jquery.go-grid");
    require("GO.util");

    var	lang = {
		label_position: adminLang["직위"],
        label_duty: adminLang["직책"],
        label_grade: adminLang["직급"],
		label_usergroup: adminLang["사용자그룹"],
		label_position_desc : adminLang["직위 설명"],
        label_duty_desc : adminLang["직책 설명"],
        label_grade_desc : adminLang["직급 설명"],
        label_usergroup_desc : adminLang["사용자그룹 설명"],
		label_list : commonLang["목록"],
		label_downloadExcelBatchRegist : adminLang["엑셀 내려받기/일괄등록"],

		label_add: adminLang["추가"],
		label_delete: commonLang["삭제"],
		label_order: adminLang["순서 바꾸기"],
		label_name: adminLang["명칭"],
		label_code: adminLang["코드"],
		label_account: adminLang["사용멤버(명)"],
		label_ok: commonLang["저장"],
		label_cancel: commonLang["취소"],
		label_fail: commonLang["실패"],
		label_useTemplateSuggestion: adminLang["우측 템플릿에서 항목을 선택하여 직위 체계를 설계하세요"],
		label_failDesc: commonLang["실패했습니다."],

		label_edit: commonLang["수정"],
		label_open : commonLang["열기"],
		label_close : commonLang["닫기"],
		label_multi_lang : adminLang["다국어"],
		label_ko: adminLang["KO"],
		label_en: adminLang["EN"],
		label_jp: adminLang["JP"],
		label_zhcn: adminLang["ZH-CN"] ,
		label_zhtw: adminLang["ZH-TW"],
		label_vi: adminLang["VI"],
		label_info_add : adminLang["항목추가"],
		label_info_add_select : adminLang["추가할 항목을 선택하세요."],
		label_alert: adminLang['0자이상 0이하 입력해야합니다.'],
		label_save: commonLang["저장되었습니다."],
		label_used_delete : adminLang["사용중인도메인코드삭제불가"],
		label_bring_item : adminLang["항목 가져오기"],

        example_layer_title : adminLang["예시를 통해 쉽게 이해하는 직위 체계"],
        example_layer_desc : adminLang["예시를 통해 쉽게 이해하는 직위 체계 설명"],
        position_example : adminLang["직위 예시"],
        position_example_desc : adminLang["직위 예시 설명"],
        position_example_desc_detail_1 : adminLang["직위 예시 설명 세부1"],
        position_example_desc_detail_2 : adminLang["직위 예시 설명 세부2"],
        duty_example : adminLang["직책 예시"],
        duty_example_desc : adminLang["직책 예시 설명"],
        duty_example_desc_detail_1 : adminLang["직책 예시 설명 세부1"],
        duty_example_desc_detail_2 : adminLang["직책 예시 설명 세부2"],
        grade_example : adminLang["직급 예시"],
        grade_example_desc : adminLang["직급 예시 설명"],
        grade_example_desc_detail_1 : adminLang["직급 예시 설명 세부1"],
        grade_example_desc_detail_2 : adminLang["직급 예시 설명 세부2"],
        usergroup_example : adminLang["사용자그룹 예시"],
        usergroup_example_desc : adminLang["사용자그룹 예시 설명"],
        usergroup_example_desc_detail_1 : adminLang["사용자그룹 예시 설명 세부1"],
        usergroup_example_desc_detail_2 : adminLang["사용자그룹 예시 설명 세부2"],
	};
			
    var DomainCodeView = GO.BaseView.extend({
		events : {
			"click ul li" : "changeTab",
			"click span#btn_add" : "addCode",
			"click span#btn_delete" : "deleteCode",
			"click form[name='formCodeList'] input:checkbox" : "toggleCheckbox",
			"click span#btnReorderCodes" : "setOrderCode",
			"click span#setSampleItemBtn" : "setSampleItem",
			"click a#batchRegisterShortcut" : 'goToBatchRegisterLink'
		},

		initialize : function() {
			this.dataTable = null;
		},

		render : function() {
			this.appendMenuExample();

			this.$el.empty().html(domainCodeTmpl({
				lang : lang,
				isUseOrgService : GO.util.isUseOrgService(true)
			}));

            var companyLocale = this.getInstallLocale();
            this.$el.find('#btn_add').attr('data-locale', companyLocale);
            this.type = this.$el.find('li.active').children().attr('id');
			this.renderCodeList(this.type);
			this.domainCodeSampleView = new DomainCodeSampleView(companyLocale);
			this.domainCodeSampleView.render(this.type);
		},

		getInstallLocale : function() {
            var installLocale = InstallInfoModel.read().toJSON().language;
            if(installLocale == 'ja') {
                return 'jp';
            } else if(installLocale == 'zh_CN') {
                return 'zhcn';
            } else if(installLocale == 'zh_TW') {
                return 'zhtw';
            }
            return installLocale;
		},

		appendMenuExample : function() {
			var $target = this.$el.closest('.admin_content').find('header.content_top > div');
			$target.append(domainCodeExTmpl({lang : lang}));
            $('span#menuDescBtn').on('click', this.toggleMenuDesc);
            $("span#menuDescBtn ul.tab_v span.menu").on('mouseover', this.showExampleByDomainCode);

            this.showMenuExampleIfFirstVisit();
		},

		showMenuExampleIfFirstVisit : function () {
            if(!GO.util.store.get(GO.session("id") + '-show-domain-code-example-layer')) {
                GO.util.store.set(GO.session("id") + '-show-domain-code-example-layer', true, 'local');
                $("span#menuDescBtn").trigger('click');
            }
		},

        toggleMenuDesc: function () {
			if(!this.backdropView) {
				this.backdropView = new BackdropView();
				this.backdropView.backdropToggleEl = $("div[el-backdrop]");
				this.backdropView.linkBackdrop($("#menuDescBtn"));
			}
		},

        showExampleByDomainCode : function (e) {
            var $domainCodeExamples = $("span#menuDescBtn ul.tab_v li");
            $domainCodeExamples.find("span.menu").removeClass('on');
            $domainCodeExamples.find("div.tab_v_content").hide();
            $(e.currentTarget).addClass('on');
            $(e.currentTarget).closest('li').find("div.tab_v_content").show();
		},

		changeModify : function(e) {
			var targetEl = $(e.currentTarget).parent();
			if(targetEl && targetEl.attr('data-formname')) {
				$(e.currentTarget).hide();
				targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input w_full" value="', targetEl.attr('data-value'), '" />'].join(''))
					.find('input').focusin();
			}
		},

		changeTab : function(e){
			var target = $(e.currentTarget);
			var type = target.find("span").attr('id');
			if (this.type == type) return;
			this.type = type;
			this.$el.find('ul.tab_menu span.type').parent().attr('class', '');
			target.attr("class", "active");
			this.offReorderMode();
			try {
				this.dataTable.tables.find('tbody').sortable("destroy");
			} catch(exception){}
			this.renderCodeList(type);
			this.domainCodeSampleView.render(type);
		},

		toggleCheckbox : function(e) {
			if($(e.currentTarget).is(':checked')) {
				$(e.currentTarget).attr('checked', true);
			} else {
				this.$el.find('#checkedAll').attr('checked', false);
				$(e.currentTarget).attr('checked', false);
			}
		},

        toggleMultiLang : function(e) {
			var $targetForm = $(e.currentTarget).parents('form');
            var $targetBtn = $targetForm.find("span#btnMultiLang i");
            if($targetBtn.hasClass('ic_accordion_s')) {
                $targetBtn.removeClass('ic_accordion_s').addClass('ic_accordion_c').attr('title', lang.close);
                $targetForm.find('tr[id$="NameInput"]').show();
            } else {
                $targetBtn.removeClass('ic_accordion_c').addClass('ic_accordion_s').attr('title', lang.open);
                $targetForm.find('tr[id$="NameInput"]').hide();
            }
            if($targetForm.attr('id') === "formCreateCode") {
                this.addCodePopupEl.reoffset();
            } else {
            	this.updateCodePopupEl.reoffset();
            }
        },

		renderCodeList : function(type) {
			var self = this,
			companyLocale = this.$el.find('#btn_add').attr('data-locale'),
			columnName = companyLocale + "Name",
			url = null;
			switch(type) {
				case 'position':
					url = GO.contextRoot + 'ad/api/position/sort/list';
					break;
				case 'duty':
					url = GO.contextRoot + 'ad/api/duty/sort/list';
					break;
                case 'grade':
                    url = GO.contextRoot + 'ad/api/grade/sort/list';
                    break;
				case 'usergroup':
					url = GO.contextRoot + 'ad/api/usergroup/sort/list';
					break;
			}
			this.$el.find("#domainCodeType").text(lang['label_'+type] +' '+ lang['label_list']);
            this.$el.find("#domainCodeTypeDesc").text(lang['label_'+type+'_desc']);

			if(this.dataTable != null) this.dataTable.tables.fnDestroy();

			this.dataTable  = $.goGrid({
				el : self.$el.find("#codeList"),
				method : 'GET',
				url : url,
				emptyMessage : emptyTmpl({label_desc : lang.label_useTemplateSuggestion}),
				defaultSorting : [],
				pageUse : false,
				sDomUse : false,
				checkbox : true,
				sDomType : 'admin',
				checkboxData : 'id',
				displayLength : 999,
				columns : [
					{ mData: null, bSortable: true, fnRender : function(obj) {
						var data = obj.aData[columnName];
						return data == null || data == '' ? "-" : data;
					}},
					{ mData : "code", bSortable: true},
					{ mData : "userCount", bSortable: true}
				],
				fnDrawCallback : function() {
					var $codeList = self.$el.find("form[name='formCodeList']");
					$codeList.find('tr>td:nth-child(2)').attr('data-locale', $codeList.find('#btn_add').attr('data-locale'));
					$codeList.find('tr>td:nth-child(2)').css('cursor', 'pointer').click(function(e) {
						self.modifyCode(e);
					});
					$codeList.find('#checkedAll').attr('checked', false);
				}
			});
		},

		setOrderCode : function(e) {
			var self = this;
			var isReorderOn = $(e.currentTarget).hasClass('on');

			if(this.dataTable.tables.isEmpty()) {
				$.goSlideMessage(lang['label_useTemplateSuggestion']);
				return false;
			}

			if(isReorderOn) {
				this.$el.find('#codeList').find('tbody').sortable("destroy");
				var codeIds = new Array(),
					form = this.$el.find('form[name=formCodeList]'),
					codeEl = form.find('input[type="checkbox"]');

				codeEl.attr('value', function(i, val){
					if(val != null && val != 'on'){
						codeIds.push(val);
					}
				});
				var url = GO.contextRoot + 'ad/api/domaincode/order/'+self.type;
				$.go(url, JSON.stringify({ids: codeIds}), {
					async: false,
					qryType : 'PUT',
					contentType : 'application/json',
					responseFn : function(rs) {
						if(rs.code == 200){
							$.goSlideMessage(commonLang["변경되었습니다."]);
						} else if(rs.code != 200) {
							var responseData = JSON.parse(rs.responseText);
							if(responseData.message != null){
								$.goSlideMessage(responseData.message);
							} else {
								$.goSlideMessage(lang['label_failDesc']);
							}
						self._reloadMemberTables();
						}
					}
				});
				this.offReorderMode();

			} else {
				this.onReorderMode();

				this.$el.find('#codeList').find('tbody').sortable({
					opacity : '1',
					delay: 100,
					cursor : "move",
					items : "tr",
					containment : '.admin_content',
					hoverClass: "ui-state-hover",
					placeholder : 'ui-sortable-placeholder',
					start : function (event, ui) {
						ui.placeholder.html(ui.helper.html());
						ui.placeholder.find('td').css('padding','5px 10px');
					}
				});
			}

			this.$el.find('input[type=checkbox]').attr({
				checked : false,
				disabled : !isReorderOn
			});
		},

		offReorderMode : function() {
			var self = this;
			this.$el.find('#btnReorderCodes').removeClass('on');
			this.$el.find('#btnReorderCodes').parent().find('.desc').remove();
			this.$el.find('#btnReorderCodes .txt').text(adminLang["순서 바꾸기"]);
			this.$el.find("form[name='formCodeList'] tr>td:nth-child(2)").css('cursor', 'pointer').click(function(e) {
				self.modifyCode(e);
			});
			this.$el.find('#btn_add').show();
			this.$el.find('#btn_delete').show();
			this.$el.find('.column_func').show();
			this.$el.find('.template_oganization').show();
		},

		onReorderMode : function() {
			this.$el.find('#btn_add').hide();
			this.$el.find('#btn_delete').hide();
			this.$el.find('.column_func').hide();
			this.$el.find('.template_oganization').hide();

			this.$el.find('#btnReorderCodes').addClass('on')
				.before('<span class="vertical_wrap desc">'+adminLang["목록 순서변경"]+'&nbsp;</span>');
			this.$el.find('#btnReorderCodes .txt').text(adminLang["순서바꾸기 완료"]);
			this.$el.find("form[name='formCodeList'] tr>td:nth-child(2)").css('cursor', '').off('click');
		},

		modifyCode : function(e){
			var codeEl = $(e.currentTarget).parent().find('input[type="checkbox"]'),
				codeId = codeEl.val();

			if($(e.currentTarget).parents('tbody:eq(0)').hasClass('ui-sortable')) {
				$.goSlideMessage(adminLang["순서 바꾸기 완료후 수정"]);
				return false;
			}

			this.model = DomainCodeModelById.read(codeId);
			var companyLocale = $(e.currentTarget).attr('data-locale');
			var self = this,
				tmpl = codeUpdateTmpl({
					lang : lang,
					popupmodel : this.model.toJSON(),
					isKoLocale : companyLocale == 'ko',
					isEnLocale : companyLocale == 'en',
					isJpLocale : companyLocale == 'jp',
					isZhcnLocale : companyLocale == 'zhcn',
					isZhtwLocale : companyLocale == 'zhtw',
					isViLocale : companyLocale == 'vi',
                    companyLocale : companyLocale
				});
			this.updateCodePopupEl = $.goPopup({
                pid : 'updateCodePopupLayer',
				width: 400,
				targetEl : '.admin_body',
				header : adminLang["항목수정"],
				modal : true,
				buttons : [{
					btext : lang['label_ok'],
					btype : "confirm",
					autoclose : false,
					callback : function() {
						setModifyCode(self, companyLocale);
						return;
					}
				}, {
					btext : lang['label_cancel']
				}]
			});
			this.updateCodePopupEl.find('.content').append(tmpl);
			this.updateCodePopupEl.reoffset();

			this.popupUnbindEvents(this.updateCodePopupEl);
			this.popupBindEvents(this.updateCodePopupEl);

			var setModifyCode = function(self, companyLocale){
				var popup = self.updateCodePopupEl,
					validate = true,
					form = popup.find('form#formUpdateCode');
				$('.go_alert').remove();
				$.each(form.serializeArray(), function(k,v) {
					if(!$.goValidation.isCheckLength(1,32,v.value)){
						if(v.name == 'code' || v.name == companyLocale + 'Name'){
							validate = false;
							$('#'+v.name).focus();
							$('#'+v.name).parent().after('<p class="go_alert">' + GO.i18n(lang['label_alert'], {"arg1":"1","arg2":"32"}) + '</p>');
							$('#'+v.name).click(function(){
								$('.go_alert').remove();
							});
							$('#'+v.name).keydown(function(){
								$('.go_alert').remove();
							});
							return false;
						}
					}
					self.model.set(v.name, v.value, {silent: true});
				});

				if(!validate) return false;

				self.model.save({},{
					success : function(model, response) {
						if(response.code == '200') {
							$.goSlideMessage(lang['label_save']);
							popup.close();
							self.renderCodeList(self.type);
						}
					},
					error : function(model, response) {
						self.__errorFunction(response, 'modify');
					}
				});
			};
		},

		popupUnbindEvents : function(popupEl) {
			popupEl.off();
		},

		popupBindEvents : function(popupEl){
            popupEl.on("click", "span.btn_box[data-btntype='changeform']", $.proxy(this.changeModify, this));
            popupEl.on("click", "#btnMultiLang", $.proxy(this.toggleMultiLang, this));
		},

		addCode : function(e){
			this.model = new DomainCodeModel({type : this.type});
			var companyLocale = $(e.currentTarget).attr('data-locale');
			var self = this,
				tmpl = codeCreateTmpl({
					lang : lang,
                    isKoLocale : companyLocale == 'ko',
                    isEnLocale : companyLocale == 'en',
                    isJpLocale : companyLocale == 'jp',
                    isZhcnLocale : companyLocale == 'zhcn',
                    isZhtwLocale : companyLocale == 'zhtw',
                    isViLocale : companyLocale == 'vi',
                    companyLocale : companyLocale
				});
			this.addCodePopupEl = $.goPopup({
                pid : 'addCodePopupLayer',
				targetEl : '.admin_body',
				header : adminLang["항목추가"],
				width : 600,
				modal : true,
				buttons : [{
					btext : lang['label_ok'],
					btype : "confirm",
					autoclose : false,
					callback : function() {
						setAddCode(self, companyLocale);
						return;
					}
				}, {
					btext : lang['label_cancel']
				}]
			});
            this.addCodePopupEl.find('.content').append(tmpl);
			this.popupUnbindEvents(this.addCodePopupEl);
			this.popupBindEvents(this.addCodePopupEl);

			var setAddCode = function(self, companyLocale){
				var popup = self.addCodePopupEl,
				validate = true,
				form = popup.find('form#formCreateCode');
				$('.go_alert').remove();
				$.each(form.serializeArray(), function(k,v) {
					if(!$.goValidation.isCheckLength(1,32,v.value)){
						if(v.name == 'code' || v.name == companyLocale + 'Name'){
							validate = false;
							$('#'+v.name).focus();
							$('#'+v.name).after('<p class="go_alert">' + GO.i18n(lang['label_alert'], {"arg1":"1","arg2":"32"}) + '</p>');
							$('#'+v.name).click(function(){
								$('.go_alert').remove();
							});
							$('#'+v.name).keydown(function(){
								$('.go_alert').remove();
							});
							return false;
						}
					}
					self.model.set(v.name, v.value, {silent: true});
				});

				if(!validate){
					return false;
				}

				self.model.save({},{
					success : function(model, response) {
						if(response.code == '200') {
							$.goSlideMessage(lang['label_save']);
							popup.close();
							self.renderCodeList(self.type);
						}
					},
					error : function(model, response) {
                        self.alertErrorMsg(response.responseJSON);
					}
				});
			};
		},

		__errorFunction : function(response, status) {
			var self = this;
			if(response.status == '400'){
				var responseData = JSON.parse(response.responseText);
				var message = responseData.message,
					responseName = responseData.name;

				if(responseName == 'invalid.code' || responseName == 'duplicated.code' || responseName == 'invalid.max.length.code' || responseName == 'invalid.min.length.code') {
					self.__errorMessage('code', message, status);
				} else if(responseName == 'duplicated.ko.name' || responseName == 'invalid.max.length.code.koname'
					|| responseName == 'invalid.min.length.code.koname' || responseName == 'exclude.char.code.koname') {
					self.__errorMessage('koName', message, status);
				} else if(responseName == 'duplicated.en.name' || responseName == 'invalid.max.length.code.enname'
					|| responseName == 'invalid.min.length.code.enname' || responseName == 'exclude.char.code.enname') {
					self.__errorMessage('enName', message, status);
				} else if(responseName == 'duplicated.jp.name' || responseName == 'invalid.max.length.code.jpname'
					|| responseName == 'invalid.min.length.code.jpname' || responseName == 'exclude.char.code.jpname') {
					self.__errorMessage('jpName', message, status);
				} else if(responseName == 'duplicated.zhcn.name' || responseName == 'invalid.max.length.code.zhcnname'
					|| responseName == 'invalid.min.length.code.zhcnname' || responseName == 'exclude.char.code.zhcnname') {
					self.__errorMessage('zhcnName', message, status);
				} else if(responseName == 'duplicated.zhtw.name' || responseName == 'invalid.max.length.code.zhtwname'
					|| responseName == 'invalid.min.length.code.zhtwname' || responseName == 'exclude.char.code.zhtwname') {
					self.__errorMessage('zhtwName', message, status);
				} else if(responseName == 'duplicated.vi.name' || responseName == 'invalid.max.length.code.viname'
					|| responseName == 'invalid.min.length.code.viname' || responseName == 'exclude.char.code.viname') {
					self.__errorMessage('viName', message, status);
				} else {
					$.goAlert('',commonLang["모든 항목의 조건을 확인해 주세요."]);
				}
			} else {
				var responseData = JSON.parse(response.responseText);
				if(responseData.message != null){
					$.goAlert(lang['label_fail'], responseData.message);
				} else {
					$.goAlert(lang['label_fail'], lang['label_failDesc']);
				}
			}
		},

		__errorMessage : function(id, message, status) {
			$('.go_alert').remove();
			$('#'+id).focus();
			if ($('#'+id).length > 0) {
				$('#'+id).parent().after('<p class="go_alert">' + message + '</p>');
			} else {
				this.updateCodePopupEl.find('form#formUpdateCode').append('<p class="go_alert">' + message + '</p>');
			}
			$('#'+id).click(function(){
				$('.go_alert').remove();
			});
			$('#'+id).keydown(function(){
				$('.go_alert').remove();
			});
		},

        alertErrorMsg : function(responseJSON) {
            var responseMsg = responseJSON.message;
            if(responseJSON.code == '400') {
                $.goError(responseMsg);
            } else {
                $.goError(commonLang["실패"], responseMsg != null ? responseMsg : commonLang["실패했습니다."]);
            }
        },

		deleteCode : function(){
			var self = this,
				codeIds = new Array(),
				form = this.$el.find('form[name=formCodeList]'),
				codeEl = form.find('input[type="checkbox"]:checked');
			if(codeEl.size() == 0){
				$.goSlideMessage(adminLang["삭제할 항목을 선택하세요."]);
				return;
			}
			codeEl.attr('value', function(i, val) {
				if(val == 'on') {
				} else {
					if(val != null) {
						codeIds.push(val);
					}
				}
			});

			$.goPopup({
				width: 500,
				title : adminLang["선택한 항목을 삭제하시겠습니까?"],
				message : adminLang["항목을 삭제하면 복구되지 않습니다."],
				modal : true,
				buttons : [{
					btext : commonLang['삭제'],
					btype : "caution",
					autoclose : true,
					callback : function() {
						this.model = new DomainCodeModel();
						var url = GO.contextRoot + 'ad/api/domaincode/';
						$.go(url, JSON.stringify({ids: codeIds}), {
							qryType : 'DELETE',
							contentType : 'application/json',
							responseFn : function(response) {
								if(response.code == 200){
									$.goSlideMessage(commonLang["삭제되었습니다."]);
									self.renderCodeList(self.type);
								}
							},
							error : function(response) {
								var responseData = JSON.parse(response.responseText);

								if(responseData.name == "can.not.remove.domain.code"){
									$.goSlideMessage(responseData.message);
								} else {
									$.goSlideMessage(lang['label_used_delete']);
								}
							}
						});

					}
				}, {
					btext : commonLang['취소']
				}]
			});

        },

        setSampleItem : function() {
            this.domainCodeSampleView.setSampleItem();
            this.renderCodeList(this.type);
        },

        goToBatchRegisterLink: function () {
            $.goPopup({
                width : 500,
                title : "",
                pclass : "layer_confim",
                contents : "<p class='q'>" + GO.i18n(adminLang['메뉴로 이동하시겠습니까'], {"menuName":adminLang['일괄 등록']}) + "</p>",
                buttons : [{
                    btext : commonLang["확인"],
                    btype : "confirm",
                    autoclose : true,
                    callback : function() {
                        GO.router.navigate("account/batch/regist", true);
                    }
                }, {
                    btext : commonLang["취소"]
                }]
            });
		}

	});
    return DomainCodeView;
});