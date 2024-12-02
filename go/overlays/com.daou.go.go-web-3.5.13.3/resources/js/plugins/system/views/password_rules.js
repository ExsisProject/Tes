define("system/views/password_rules", [
	"jquery",
	"backbone", 	
	"app",
	"hgn!system/templates/password_rules",
	"system/models/password_rules",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-validation",
    "jquery.go-popup"
], 

function(
	$, 
	Backbone,
	App,
	PasswordRulesTmpl,
	PasswordRulesModel,
	commonLang,
	adminLang
) {
    var	tmplVal = {
        label_title: adminLang["비밀번호 정책 설정"],
        label_pwd_manage: adminLang["비밀번호 관리"],
        label_select: adminLang["사용여부"],
        label_use: adminLang["사용함"],
        label_notuse: commonLang["사용하지 않음"],
        label_min_length: adminLang["비밀번호 최소 길이"],
        label_max_length: adminLang["비밀번호 최대 길이"],
        label_mandatory: adminLang["필수포함 문자"],
        label_num: adminLang["숫자"],
        label_blank: adminLang["공백"],
        label_Alphabet : adminLang["문자"],
        label_symbol: adminLang["특수문자"],
        label_taboo: adminLang["사용금지 문자"],
        label_name: commonLang["이름"],
        label_id: adminLang["아이디"],
        label_same: adminLang["동일문자"],
        label_over: adminLang["개 이상"],
        label_serial: adminLang["연속문자"],
        label_input: adminLang["직접입력"],
        label_desc: adminLang["※ 금지문자는 한줄에 한 개씩 입력"],
        label_reuse: adminLang['이전 비밀번호 재사용'],
        label_limit_password_reuse_count_desc : adminLang["이전 비밀번호 재사용 설명"],
        label_enable: commonLang['허용'],
        label_disable: commonLang['허용하지 않음'],
        label_last : adminLang["최근"],
        label_time : adminLang["회"],
        label_within : adminLang["이내"],
        label_alert: adminLang['입력값은 0~0이어야 합니다.'],
		label_system_config: adminLang["시스템 설정"],
        label_site_config: adminLang["사이트 별 설정"],
		lable_rule_default_config: adminLang['비밀번호 정책 기본값 설정'],
        lable_rule_default_config_desc: adminLang['비밀번호 정책 기본값 설정 설명'],
        label_ok: commonLang["저장"],
        label_cancel: commonLang["취소"]
    };

    var PasswordRulesView = App.BaseView.extend({

        events : {
            "click span#btn_ok" : "_confirmSave",
            "click span#btn_cancel" : "_passwordConfigCancel",
            "click form[name='formPasswordRule'] input:checkbox" : "_toggleCheckbox",
            "click form[name='formPasswordRule'] input:radio" : "_toggleRadio",
            "click span#data" : "_changeModifyForm",
            "click span.btn_box[data-btntype='changeform']" : "_changeModifyForm",
            "focusout input[type='input']" : "_onChangeInput",
            "focusout textarea" : "_onChangeInput",
            "keyup #passwordWrap input[type='input']" : "_keyupValidator",
            "keyup #passwordWrap textarea" : "_keyupValidator",
            "change input[name=passwordReuse]" : "_toggleReuse"
        },

		initialize : function(options) {
			this.model = new PasswordRulesModel();
            this.model.fetch().done($.proxy(function() {
                this.render();
            }, this));
		},

		render : function() {
            $('.breadcrumb .path').html(adminLang['기타 설정'] +" > " + adminLang["비밀번호 정책 설정"]);
            var data = this.model.toJSON();
		    this.$el.html(PasswordRulesTmpl({
				lang : tmplVal,
                model: data,
                LimitPasswordReuseCount: [
                    {"value": "1"}, {"value": "2"}, {"value": "3"},
                    {"value": "4"}, {"value": "5"}, {"value": "6"},
                    {"value": "7"}, {"value": "8"}, {"value": "9"},
                    {"value": "10"}
                ]
			}));

            if(!this.model.get('tabooCharSame')) {
                $('span#sameCharLength').hide();
            }
            if(!this.model.get('tabooCharSerial')) {
                $('span#serialCharLength').hide();
            }
            if(!this.model.get('tabooCharInput')) {
                $('span#inputChar').hide();
            }
            if (!this.model.get("passwordReuse")) {
                this.$('#limitPasswordReuseCount').val(this.model.get("limitPasswordReuseCount"));
            }

            if(!this.model.get("usePasswordConfig")) {
                this._usePasswordConfigFalse();
            } else {
                this._usePasswordConfigTrue();
            }
            return this;
		},

        _toggleCheckbox : function(e) {
            e.stopPropagation();

            if($(e.currentTarget).is(':checked')) {
                $(e.currentTarget).val(true);
                $(e.currentTarget).attr('checked', true);
                if($(e.currentTarget).is(':checkbox[name="tabooCharSame"]')) {
                    $('span#sameCharLength').show();
                }else if($(e.currentTarget).is(':checkbox[name="tabooCharSerial"]')) {
                    $('span#serialCharLength').show();
                }else if($(e.currentTarget).is(':checkbox[name="tabooCharInput"]')) {
                    $('span#inputChar').show();
                }
            }else{
                $(e.currentTarget).val(false);
                $(e.currentTarget).attr('checked', false);
                if($(e.currentTarget).is(':checkbox[name="tabooCharSame"]')) {
                    $('span#sameCharLength').hide();
                }else if($(e.currentTarget).is(':checkbox[name="tabooCharSerial"]')) {
                    $('span#serialCharLength').hide();
                }else if($(e.currentTarget).is(':checkbox[name="tabooCharInput"]')) {
                    $('span#inputChar').hide();
                }
            }
        },

        _toggleRadio : function(e){
            e.stopPropagation();

            if($(e.currentTarget).attr('value') == "true" && $(e.currentTarget).attr('name') == "usePasswordConfig") {
                this._usePasswordConfigTrue();
            }else if($(e.currentTarget).attr('value') == "false" && $(e.currentTarget).attr('name') == "usePasswordConfig") {
                this._usePasswordConfigFalse();
                this._makeOriginalInputData();
                $.goAlert(adminLang['비밀번호 관리를 사용하지 않는 경우, 보안에 취약할 수 있습니다.'],"", "", commonLang["확인"]);
            }
        },

        _changeModifyForm : function(e) {
            e.stopPropagation();

            var targetEl = $(e.currentTarget).parent();
            if(targetEl && targetEl.attr('data-formname') == 'inputChar') {
                targetEl.html(['<textarea class="input w_small" id="', targetEl.attr('data-formname'), '" name="', targetEl.attr('data-formname'),'">', targetEl.attr('data-value'), '</textarea>'].join(''))
                    .find('input').focusin();
            } else if(targetEl && targetEl.attr('data-formname') == 'resetPassword') {
                $(e.currentTarget).hide();
                targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input w200" maxlength="16" value="', targetEl.attr('data-value'), '" />'].join(''))
                    .find('input').focusin();
            } else {
                $(e.currentTarget).hide();
                targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input t_num" value="', targetEl.attr('data-value'), '" />'].join(''))
                    .find('input').focusin();
            }
        },

        _onChangeInput : function(e) {
            e.stopPropagation();
            this._inputValidator(e.currentTarget.id, e.currentTarget.value);
        },

        _inputValidator : function(targetId, targetValue) {
            var targetEl = $('#' + targetId).parent();
            var sameChar = $('input#tabooCharSame').is(":checked"),
                serialChar = $('input#tabooCharSerial').is(":checked"),
                serialInput = $('input#tabooCharInput').is(":checked");
            var validateEl = targetEl.parent().parent().find('#'+targetId+'Alert');
            validateEl.html('');
            if(targetId == 'minPasswordLength') {
                var maxLength = $('div.maxPasswordLength').children().attr('data-value');
                if(targetValue <8 || targetValue > 15){
                    validateEl.html(App.i18n(tmplVal['label_alert'], {"arg1":"8","arg2":"15"}));
                    $('#' + targetId).focus();
                    $('#' + targetId).val('');
                    return false;
                } else if(parseInt(targetValue) >= parseInt(maxLength)) {
                    validateEl.html(adminLang['최대값보다 큰경우 경고']);
                    $('#' + targetId).focus();
                    $('#' + targetId).val('');
                    return false;
                } else {
                    targetEl.attr('data-value', targetValue);
                }
            }
            if(targetId == 'maxPasswordLength') {
                var minLength = $('div.minPasswordLength').children().attr('data-value');
                if(targetValue < 9 || targetValue > 16){
                    validateEl.html(App.i18n(tmplVal['label_alert'], {"arg1":"9","arg2":"16"}));
                    $('#' + targetId).focus();
                    $('#' + targetId).val('');
                    return false;
                } else if(parseInt(targetValue) <= parseInt(minLength)) {
                    validateEl.html(adminLang['최소값보다 작은경우 경고']);
                    $('#' + targetId).focus();
                    $('#' + targetId).val('');
                    return false;
                } else {
                    targetEl.attr('data-value', targetValue);
                }
            }
            if((sameChar && targetId == 'sameCharLength') || (serialChar && targetId == 'serialCharLength')) {
                if(targetValue < 3 || targetValue > 6) {
                    validateEl.html(App.i18n(tmplVal['label_alert'], {"arg1":"3","arg2":"6"}));
                    $('input#' + targetId).focus();
                    $('input#' + targetId).val('');
                    return false;
                }
            }
            if(serialInput && targetId == 'inputChar') {
                if(!$.goValidation.isCheckLength(0,100,targetValue)) {
                    validateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"100"}));
                    $('textarea#' + targetId).focus();
                    $('textarea#' + targetId).val('');
                    return false;
                }
            }
            return true;
        },

        _keyupValidator : function(e) {
            e.stopPropagation();

            var targetId = e.currentTarget.id;
            var targetEl = $(e.currentTarget).parent();
            var validateEl = targetEl.parent().parent().find('.go_alert');
            validateEl.html('');
            if(targetId != 'inputChar') {
                if(e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 46 || e.keyCode == 13 || e.keyCode == 8) {
                } else {
                    validateEl.html(adminLang["숫자만 입력하세요."]);
                    e.currentTarget.value = '';
                    return false;
                }
            }
        },

        _toggleReuse : function(e) {
            e.stopPropagation();

            var display = !GO.util.toBoolean($(e.currentTarget).val());
            this.$('#limitPasswordReuseCount').toggle(display);
        },

        _confirmSave : function(e){
            e.stopPropagation();

            if($('#usePasswordConfig_false').is(":checked")){
                this._passwordConfigSave();
                return;
            }
            var self = this;
            var mandatoryNumber = $('#mandatoryCharNumber').is(":checked") ? true : false,
                mandatoryBlank = $('#mandatoryCharBlank').is(":checked") ? true : false,
                mandatoryAlphabet = $('#mandatoryCharAlphabet').is(":checked") ? true : false,
                mandatorySymbol = $('#mandatoryCharSymbol').is(":checked") ? true : false,

                name = $('#tabooCharName').is(":checked") ? true : false,
                id = $('#tabooCharId').is(":checked") ? true : false,
                sameChar = $('#tabooCharSame').is(":checked") ? true : false,
                serialChar = $('#tabooCharSerial').is(":checked") ? true : false,
                serialInput = $('#tabooCharInput').is(":checked") ? true : false;

            if(mandatoryNumber || mandatoryBlank || mandatoryAlphabet || mandatorySymbol || sameChar || serialChar || serialInput || name || id) {
                this._passwordConfigSave();
            } else {
                $.goConfirm(adminLang['필수포함 문자 또는 사용금지 문자를 설정하지 않으면 보안에 취약할 수 있습니다.'] + "<br>" + adminLang['저장하시겠습니까?'], "", function(){self._passwordConfigSave();}, commonLang['확인'], function(){});
            }
        },

        _passwordConfigSave : function(){
            var self = this,
                validation = true;
            form = this.$el.find('form[name=formPasswordRule]');

            if($('input#minPasswordLength').length > 0) {
                if(!this._inputValidator('minPasswordLength', $('#minPasswordLength').val())) {
                    return false;
                }
            }
            if($('input#minPasswordLength').length > 0) {
                if (!this._inputValidator('maxPasswordLength', $('#maxPasswordLength').val())) {
                    return false;
                }
            }
            if(!this._inputValidator('sameCharLength', $('input#sameCharLength').val())) {
                return false;
            }
            if(!this._inputValidator('serialCharLength', $('input#serialCharLength').val())) {
                return false;
            }
            if(!this._inputValidator('inputChar', $('textarea#inputChar').val())) {
                return false;
            }

            $.each(form.serializeArray(), function(k,v) {
                self.model.set(v.name, v.value, {silent: true});
            });

            $.each(form.find('input[type="checkbox"]'), function(k,v) {
                if($(v).attr('checked')) {
                    if(v.name == 'tabooCharInput' && $('textarea').length > 0) {
                        var inputVal = $.trim($('textarea').val());
                        if(inputVal == undefined || inputVal == "") {
                            validation = false;
                            $.goMessage(adminLang["제한 값을 입력하세요."]);
                            $('textarea').focus();
                            return false;
                        }
                    }
                } else {
                    self.model.set(v.name, v.value, {silent: true});
                }
            });
            
            if(!validation) return false;

            GO.util.preloader(this.model.save({}, {
                type : 'PUT',
                success : function(model, response) {
                    if(response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        self.render();
                    }
                },
                error : function(model, response) {
                    try {
                        var responseData = JSON.parse(response.responseText);
                        $.goAlert(commonLang["실패"], responseData.message);
                    } catch (ex) {
                        $.goAlert(commonLang["실패"], 'code: ' + response.status + ',statusText: ' + response.statusText);
                    }
                }
            }));
        },

        _passwordConfigCancel: function(e){
            e.stopPropagation();

            var self = this;
            $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
                self.render();
                $.goMessage(commonLang["취소되었습니다."]);
            }, commonLang["확인"]);
        },

        _usePasswordConfigTrue : function() {
            $('.minPasswordLength').attr("style", "");
            $('.maxPasswordLength').attr("style", "");
            if($('#tabooCharInput').is(':checked')){
                $('span#inputChar').attr("style", "");
            }
            if($('#tabooCharSame').is(':checked')){
                $('span#sameCharLength').attr("style", "");
            }
            if($('#tabooCharSerial').is(':checked')){
                $('span#serialCharLength').attr("style", "");
            }

            $('textarea').attr("style", "");

            $('#tabooCharInput').attr("disabled", false);
            $('#tabooCharSerial').attr("disabled", false);
            $('#tabooCharSame').attr("disabled", false);
            $('#tabooCharName').attr("disabled", false);
            $('#tabooCharId').attr("disabled", false);
            $('#mandatoryCharNumber').attr("disabled", false);
            $('#mandatoryCharBlank').attr("disabled", false);
            $('#mandatoryCharAlphabet').attr("disabled", false);
            $('#mandatoryCharSymbol').attr("disabled", false);
            $('input[name="passwordReuse"]').attr("disabled", false);

            $.each($('#first_tr').siblings(), function(k,v) {
                $(v).attr("style", "");
            });
        },

        _usePasswordConfigFalse : function() {
            $('.minPasswordLength').attr("style", "display:none");
            $('.maxPasswordLength').attr("style", "display:none");
            $('span#inputChar').attr("style", "display:none");
            $('span#sameCharLength').attr("style", "display:none");
            $('span#serialCharLength').attr("style", "display:none");
            $('textarea').attr("style", "display:none");
            $('#tabooCharInput').attr("disabled", true);
            $('#tabooCharSerial').attr("disabled", true);
            $('#tabooCharSame').attr("disabled", true);
            $('#tabooCharName').attr("disabled", true);
            $('#tabooCharId').attr("disabled", true);
            $('#mandatoryCharNumber').attr("disabled", true);
            $('#mandatoryCharBlank').attr("disabled", true);
            $('#mandatoryCharAlphabet').attr("disabled", true);
            $('#mandatoryCharSymbol').attr("disabled", true);
            $('input[name="passwordReuse"]').attr("disabled", true);

            $.each($('#first_tr').siblings(), function(k,v) {
                if(v.id != 'useSystemPasswordRules') {
                    $(v).attr("style", "display:none");
                }
            });
        },

        _makeOriginalInputData : function() {
            $('input[id="minPasswordLength"]').val(this.model.get("minPasswordLength"));
            $('[data-formname = "minPasswordLength"]').attr('data-value', this.model.get("minPasswordLength"));
            $('input[id="maxPasswordLength"]').val(this.model.get("maxPasswordLength"));
            $('[data-formname = "maxPasswordLength"]').attr('data-value', this.model.get("maxPasswordLength"));

            $('textarea[id="inputChar"]').val(this.model.get("inputChar"));
            $('[data-formname = "inputChar"]').attr('data-value', this.model.get("inputChar"));
            $('input[id="sameCharLength"]').val(this.model.get("sameCharLength"));
            $('[data-formname = "sameCharLength"]').attr('data-value', this.model.get("sameCharLength"));
            $('input[id="serialCharLength"]').val(this.model.get("serialCharLength"));
            $('[data-formname = "serialCharLength"]').attr('data-value', this.model.get("serialCharLength"));
        },

        refresh : function() {
            this.model.fetch().done($.proxy(function() {
                this.render();
            }, this));
        }

    });

	return PasswordRulesView;
});
