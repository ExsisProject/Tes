define([
    "jquery",
    "underscore",
    "backbone",
    "app",

    "hgn!admin/templates/appr_activity_box_setting",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin"
],
function(
    $,
    _,
    Backbone,
    GO,

    ApprActivityBoxSettingTmpl,
    commonLang,
    approvalLang,
    adminLang
) {

    var lang = {
        '직위' : adminLang['직위'],
        '직책' : adminLang['직책'],
        '부서' : approvalLang['부서'],
        '서명' : approvalLang['서명'],
        '이름' : commonLang['이름'],
        '직위' : adminLang['직위'],
        '직책' : adminLang['직책'],
        '결재 타입' : approvalLang['결재 타입'],
        '날짜 표시' : approvalLang['날짜 표시'],
        '결재칸에 표시될 항목을 선택해 주세요.' : approvalLang['결재칸에 표시될 항목을 선택해 주세요.'],
        '사용자가 자신의 서명을 변경할 수 있음' : approvalLang['사용자가 자신의 서명을 변경할 수 있음'],
        '①번 항목을 한 가지 이상 선택해 주세요.' : approvalLang['①번 항목을 한 가지 이상 선택해 주세요.'],
        '②번 항목을 한 가지 이상 선택해 주세요.' : approvalLang['②번 항목을 한 가지 이상 선택해 주세요.'],
        '②번 항목 갯수 제한 메시지 서명 사용한 경우' : approvalLang['②번 항목 갯수 제한 메시지 서명 사용한 경우'],
        '②번 항목 갯수 제한 메시지 서명 사용 안한 경우' : approvalLang['②번 항목 갯수 제한 메시지 서명 사용 안한 경우']
    };

    var ApprActivityBoxSettingView = Backbone.View.extend({

        initialize: function(options) {
            this.model = options.configModel;
            this.$el = options.el;
        },

        render: function() {
            var data = {
                'allowSignModify': this.model.get('allowSignModify'),
                'activityBoxContentSign': this.model.get('activityBoxContentSign'),
                'activityBoxContentName': this.model.get('activityBoxContentName'),
                'activityBoxContentPosition': this.model.get('activityBoxContentPosition'),
                'activityBoxContentDuty': this.model.get('activityBoxContentDuty'),
                'activityBoxContentDept': this.model.get('activityBoxContentDept'),
                'activityBoxContentActType': this.model.get('activityBoxContentActType'),
                'activityBoxHeaderType': {
                    'isPosition' : this.model.get('activityBoxHeaderType') == 'POSITION',
                    'isActType' : this.model.get('activityBoxHeaderType') == 'ACTTYPE',
                    'isDuty' : this.model.get('activityBoxHeaderType') == 'DUTY',
                    'isName' : this.model.get('activityBoxHeaderType') == 'NAME',
                    'isDept' : this.model.get('activityBoxHeaderType') == 'DEPT'
                }
            };

            this.$el.html(ApprActivityBoxSettingTmpl({
                data: data,
                lang: lang
            }));

            this._setSignModifyCheckboxProperties();
            this._bindEvents();
            return this.$el;
        },

        _bindEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.on("click", "#activityBoxContentSettingWrap input:checkbox", $.proxy(this._validateBoxContentMaxCount, this));
            this.$el.on("click", "#activityBoxContentSign", $.proxy(this._onActivityBoxContentSignClicked, this));
        },

        getData: function() {
            return {
                'allowSignModify': $('input[name=allowSignModify]').is(":checked"),
                'activityBoxHeaderType' : $('input:radio:checked[name=activityBoxHeaderType]').val(),
                'activityBoxContentSign': $('input[name=activityBoxContentSign]').is(":checked"),
                'activityBoxContentName': $('input[name=activityBoxContentName]').is(":checked"),
                'activityBoxContentPosition': $('input[name=activityBoxContentPosition]').is(":checked"),
                'activityBoxContentDuty': $('input[name=activityBoxContentDuty]').is(":checked"),
                'activityBoxContentDept': $('input[name=activityBoxContentDept]').is(":checked"),
                'activityBoxContentActType': $('input[name=activityBoxContentActType]').is(":checked")
            }
        },

        validateData: function() {
            var data = this.getData();
            if (_.isEmpty(data.activityBoxHeaderType)) {
                return lang["①번 항목을 한 가지 이상 선택해 주세요."];
            }

            if (!data.activityBoxContentSign && !data.activityBoxContentName && !data.activityBoxContentPosition && !data.activityBoxContentDuty && !data.activityBoxContentDept && !data.activityBoxContentActType) {
                return lang["②번 항목을 한 가지 이상 선택해 주세요."];
            }

            return "";
        },

        _validateBoxContentMaxCount: function(e) {
            var $checked = this.$("#activityBoxContentSettingWrap input:checked[id!=allowSignModify]");
            var $signCheckbox = this.$("#activityBoxContentSign");
            var $target = $(e.currentTarget);

            if ($signCheckbox.is(':checked') && $checked.length > 2) {
                $.goMessage(lang["②번 항목 갯수 제한 메시지 서명 사용한 경우"]);
                $target.attr('checked', false);
            }

            if (!$signCheckbox.is(':checked') && $checked.length > 3) {
                $.goMessage(lang["②번 항목 갯수 제한 메시지 서명 사용 안한 경우"]);
                $target.attr('checked', false);
            }
        },

        _onActivityBoxContentSignClicked: function(e) {
            this._setSignModifyCheckboxProperties();
        },

        _setSignModifyCheckboxProperties: function() {
            var $signModifyCheckbox = $('#allowSignModify');
            var $signUseCheckbox = $('input[name=activityBoxContentSign]');
            if ($signUseCheckbox.is(':checked')) {
                $signModifyCheckbox.removeProp('disabled');
            } else {
                $signModifyCheckbox.removeProp('checked');
                $signModifyCheckbox.prop('disabled', true);
            }
        }
    });

    return ApprActivityBoxSettingView;
});