define("admin/views/department/add_dept", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");
    var Tpl = require("hgn!admin/templates/_add_dept");
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");
    var apiBaseUrl = GO.contextRoot + 'ad/api/';
    var AddDept = Backbone.View.extend({
        events: {
            'click #favorite': 'onClickFavorite',
            'click span#btnMultiLang' : 'toggleMultiLang'
        },

        initialize: function () {
        },

        render: function (installLocale) {

            this.$el.html(Tpl({
                lang: {
                    locale_ko: adminLang["KO"],
                    locale_en: adminLang["EN"],
                    locale_jp: adminLang["JP"],
                    locale_zhcn: adminLang["ZH-CN"],
                    locale_zhtw: adminLang["ZH-TW"],
                    locale_vi: adminLang["VI"],
                    info_add: adminLang['항목추가'],
                    dept_name: adminLang['부서명'],
                    save: commonLang['저장'],
                    cancel: commonLang['취소'],
                    dept_mail_id : adminLang['부서메일아이디'],
                    dept_code : adminLang['부서코드'],
                    dept_alias : adminLang['부서약어'],
                    none : adminLang['미지정'],
                    multi_lang: adminLang['다국어'],
                    open: commonLang['열기'],
                    close: commonLang['닫기'],
                    auto_desc : adminLang['미지정시 자동설정'],
                    dept_mail_id_desc: adminLang['부서 메일 아이디 설명'],
                    dept_code_desc: adminLang['부서 코드 설명'],
                    dept_alias_desc: adminLang['부서 약어 설명']
                },
                isKoLocale: installLocale === 'ko',
                isEnLocale: installLocale === 'en',
                isJpLocale: installLocale === 'ja',
                isZhcnLocale: installLocale === 'zhcn',
                isZhtwLocale: installLocale === 'zhtw',
                isViLocale: installLocale === 'vi',
            }));
            return this;
        },
        reset : function(){
            var form = $("#formCreateDept");
            form[0].reset();
            form.find("input[name='name']").focus();
        },
        save: function (parentId) {
            var self = this;
            this.form = this.$el.find('form#formCreateDept');
            this.name = this.form.find('input[name="name"]').val();
            var code = this.form.find('input[name="code"]').val();

            var saveParam = {
                parentId: parentId,
                name: this.name,
                emailId: this.form.find('input[name="emailId"]').val(),
                code : code === '' ? null : code, //code와 company_id에 UK 걸려있어서 ''일 경우 null 처리필요
                deptAlias: this.form.find('input[name="deptAlias"]').val()
            };

            var additions = {
                koName: this.form.find('input[name="koName"]').val(),
                enName: this.form.find('input[name="enName"]').val(),
                jpName: this.form.find('input[name="jpName"]').val(),
                zhcnName: this.form.find('input[name="zhcnName"]').val(),
                zhtwName: this.form.find('input[name="zhtwName"]').val(),
                viName: this.form.find('input[name="viName"]').val(),
            };
            if (!self.validate()) {
                return false;
            }
            saveParam['additions'] = additions;
            if (saveParam.name === adminLang['부서명'] || saveParam.name === '') {
                $.goMessage("부서명 확인");
                return false;
            } else {
                $.go(apiBaseUrl + 'department', JSON.stringify(saveParam), {
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        if(self.deptSave){
                            $.goMessage(self.name + " " +commonLang['저장되었습니다.']);
                            self.deptSave.resolve();
                        }
                    },
                    error:  function (error) {
                        var result = JSON.parse(error.responseText);
                        if (result && result.message) {
                            $.goMessage(result.message);
                            return;
                        }
                        $.goMessage(commonLang["저장에 실패 하였습니다."]);
                    }
                });
            }
        },

        toggleMultiLang: function () {
            var $targetBtn = this.$el.find("span#btnMultiLang i");
            if($targetBtn.hasClass('ic_accordion_s')) {
                $targetBtn.removeClass('ic_accordion_s').addClass('ic_accordion_c').attr('title', commonLang['닫기']);
                this.$el.find('tr[id$="NameInput"]').show();
            } else {
                $targetBtn.removeClass('ic_accordion_c').addClass('ic_accordion_s').attr('title', commonLang['열기']);
                this.$el.find('tr[id$="NameInput"]').hide();
            }
        },

        validate: function () {
            var name =  this.form.find("input[name='name']").val();
            if (name !== undefined && name.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, name)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1": adminLang['부서명'] + "(" + adminLang["KO"] + ")", "arg2": "2", "arg3": "64"}));
                    return false;
                }
            }

            var koNameEl =  this.form.find("input[name='koName']").val();
            if (koNameEl !== undefined && koNameEl.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, koNameEl)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1": adminLang['부서명'] + "(" + adminLang["KO"] + ")", "arg2": "2", "arg3": "64"}));
                    return false;
                }
            }

            var enNameEl = this.form.find("input[name='enName']").val();
            if (enNameEl !== undefined && enNameEl.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, enNameEl)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1": adminLang['부서명'] + "(" + adminLang["EN"] + ")", "arg2": "2", "arg3": "64"}));
                    return false;
                }
            }

            var jpNameEl = this.form.find("input[name='jpName']").val();
            if (jpNameEl !== undefined && jpNameEl.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, jpNameEl)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1": adminLang['부서명'] + "(" + adminLang["JP"] + ")", "arg2": "2", "arg3": "64"}));
                    return false;
                }
            }

            var zhcnNameEl = this.form.find("input[name='zhcnName']").val();
            if (zhcnNameEl !== undefined && zhcnNameEl.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, zhcnNameEl)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {
                            "arg1": adminLang['부서명'] + "(" + adminLang["ZH-CN"] + ")",
                            "arg2": "2",
                            "arg3": "64"
                        }));
                    return false;
                }
            }

            var zhtwNameEl = this.form.find("input[name='zhtwName']").val();
            if (zhtwNameEl !== undefined && zhtwNameEl.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, zhtwNameEl)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {
                            "arg1": adminLang['부서명'] + "(" + adminLang["ZH-TW"] + ")",
                            "arg2": "2",
                            "arg3": "64"
                        }));
                    return false;
                }
            }

            var viNameEl = this.form.find("input[name='viName']").val();
            if (viNameEl !== undefined && viNameEl.length > 0) {
                if (!$.goValidation.isCheckLength(2, 64, viNameEl)) {
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1": adminLang['부서명'] + "(" + adminLang["VI"] + ")", "arg2": "2", "arg3": "64"}));
                    return false;
                }
            }
            var emailIdEl = this.$el.find("input[name='emailId']");
            if(emailIdEl.val() !== undefined && emailIdEl.val().length > 0){
                if(!$.goValidation.isCheckLength(1,32,emailIdEl.val())){
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1":adminLang['부서메일아이디'],"arg2":"1","arg3":"32"}));
                    return false;
                }else if(!$.goValidation.isValidEmailId(emailIdEl.val())){
                    $.goMessage(GO.i18n(adminLang['사용할 수 없는 이메일입니다.']));
                    return false;
                }
            }
            var codeEl = this.$el.find("input[name='code']");
            if(codeEl.val() !== undefined && codeEl.val().length > 0){
                if(!$.goValidation.isCheckLength(1,32,codeEl.val())){
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1":adminLang['부서코드'],"arg2":"1","arg3":"32"}));
                    return false;
                }else if($.goValidation.isInvalidSrc(codeEl.val())){
                    $.goMessage(GO.i18n(adminLang['사용할 수 없는 부서코드입니다.']));
                    return false;
                }
            }
            var aliasEl = this.$el.find("input[name='deptAlias']");
            if(aliasEl.val() !== undefined && aliasEl.val().length > 0){
                if(!$.goValidation.isCheckLength(1,20,aliasEl.val())){
                    $.goMessage(GO.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                        {"arg1":adminLang['부서약어'],"arg2":"1","arg3":"20"}));
                    return false;
                }else if($.goValidation.isInvalidSrc(aliasEl.val())){
                    $.goMessage(GO.i18n(adminLang['사용할 수 없는 부서약어입니다.']));
                    return false;
                }
            }
            return true;
        }
    });


    return AddDept;

});