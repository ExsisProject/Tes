define('works/components/formbuilder/core/views/form_access_setting', function (require) {

    var App = require('app');
    var FBToolboxPaneView = require('works/components/formbuilder/core/views/toolbox_pane');
    var CircleView = require("views/circle");

    var renderTemplate = require('hgn!works/components/formbuilder/core/templates/form_access_setting');

    var worksLang = require('i18n!works/nls/works');
    var boardLang = require('i18n!board/nls/board');
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");

    var constants = require('works/components/formbuilder/constants');

    require('jquery.ui');
    require('jquery.go-popup');
    require("jquery.go-sdk");
    require("jquery.go-orgslide");

    var lang = {
        '폼 권한관리': worksLang['폼 권한관리'],
        '폼 이름': worksLang['폼 이름'],
        '이름을 입력해주세요': worksLang["이름을 입력해주세요."],
        '비공개': worksLang['비공개'],
        '공개': worksLang['공개'],
        '차단할 클래스 선택': adminLang['차단할 클래스 선택'],
        '예외 허용 클래스 선택': adminLang['예외 허용 클래스 선택'],
        '메인폼 설명': worksLang['메인폼 설명'],
        '공개 설정': boardLang['공개 설정']
    }

    var FBAccessSettingView = FBToolboxPaneView.extend({
        className: 'builder_side_box component-option',

        title: worksLang['폼 권한관리'],
        useResizer: false,
        titleWrapClassname: 'title_attr_edit',
        contentWrapClassname: 'tool_attr',

        events: _.extend({
            'click #selectAccessPolicy input:radio': '_changeAccessSetting',
            'keyup input[name="name"]': '_keyupCheckFormNameLength',
        }, FBToolboxPaneView.prototype.events),

        initialize: function (options) {
            options = options || {};
            FBToolboxPaneView.prototype.initialize.apply(this, arguments);

            this.observer = null;

            if (options.hasOwnProperty('observer')) {
                this.observer = options.observer;
            }
            this.appletFormModel = options.appletFormModel;
            this.mainForm = this.appletFormModel.mainForm;

            this.name = this.appletFormModel.name;
            this.accessSetting = this.appletFormModel.accessSetting;
            this.accessTarget = this.appletFormModel.accessTarget;
            this.exceptionTarget = this.appletFormModel.exceptionTarget;

            this.listenTo(this.observer, constants.REQ_SAVE, this._requestSave);
        },

        render: function () {
            this.$el.find('.tool_attr').off();
            var searchClass = 'form-component-option';
            var $newEl = $('<div class="scroll-inner"><ul class="form-component-option"></ul></div>');

            this.$('.toolbox-content').append($newEl);
            this.$('.form-component-option').append(renderTemplate({
                formName: this.name,
                mainForm: this.mainForm,
                lang: lang
            }));

            this._renderAccessUserView();
            this._renderExceptionUserView();

            var accessSetting = this.accessSetting;
            $('input[name="accessSetting"][value="' + accessSetting + '"]').attr('checked', true);
            if ("black" == accessSetting) {
                $('#selectedClass').text(adminLang['차단할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외허용 클래스 선택 툴팁']);
            } else {
                $('#selectedClass').text(adminLang['허용할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외차단 클래스 선택 툴팁']);
            }

            var self = this;
            this.$el.find("input[name='name']").on('change', function () {
                self._triggerModelUpdate();
            });
        },

        _renderAccessUserView: function () {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (GO.util.isUseOrgService(false)) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            var circleChangeCallback = function () {
                this._triggerModelUpdate();
            };
            this.accessUserView = new CircleView({
                selector: '#accessUser',
                isAdmin: false,
                isWriter: true,
                circleJSON: this.accessTarget,
                nodeTypes: nodeTypes,
                isWorksSetting: true,
                addCallback: $.proxy(circleChangeCallback, this),
                removeCallback: $.proxy(circleChangeCallback, this)
            });
            this.accessUserView.render();
        },
        _renderExceptionUserView: function () {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (GO.util.isUseOrgService(false)) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            var circleChangeCallback = function () {
                this._triggerModelUpdate();
            };
            this.exceptionUserView = new CircleView({
                selector: '#exceptionUser',
                isAdmin: false,
                isWriter: true,
                circleJSON: this.exceptionTarget,
                nodeTypes: nodeTypes,
                isWorksSetting: true,
                addCallback: $.proxy(circleChangeCallback, this),
                removeCallback: $.proxy(circleChangeCallback, this)
            });
            this.exceptionUserView.render();
        },
        _keyupCheckFormNameLength: function (e) {
            var name = $(e.currentTarget);
            if (!$.goValidation.isCheckLength(1, 100, name.val())) {
                $.goSlideMessage(App.i18n(adminLang['{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다.'],
                    {"arg1": worksLang['폼 이름'], "arg2": "1", "arg3": "100"}));
            }
            name.focus();
        },

        _changeAccessSetting: function (e) {
            if ($(e.currentTarget).val() == "black") {
                $('#selectedClass').text(adminLang['차단할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외허용 클래스 선택 툴팁']);
            } else {
                $('#selectedClass').text(adminLang['허용할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외차단 클래스 선택 툴팁']);
            }
            this._confirmDeleteTarget(e);
        },

        _confirmDeleteTarget: function (e) {
            var self = this;
            var cancelCallback = function () {
                if ($(e.currentTarget).val() == "black") {
                    $('input[name="accessSetting"][value="white"]').attr('checked', true);
                    $('#selectedClass').text(adminLang['허용할 클래스 선택']);
                    $('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                    $('#exceptedClassToolTip').text(adminLang['예외차단 클래스 선택 툴팁']);
                } else {
                    $('input[name="accessSetting"][value="black"]').attr('checked', true);
                    $('#selectedClass').text(adminLang['차단할 클래스 선택']);
                    $('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                    $('#exceptedClassToolTip').text(adminLang['예외허용 클래스 선택 툴팁']);
                }
            };
            var confirmCallback = function () {
                self.accessUserView.deleteAllData();
                self.exceptionUserView.deleteAllData();
                self._triggerModelUpdate();
            };
            $.goConfirm(adminLang['정책 설정 변경 확인'], "", confirmCallback, cancelCallback, commonLang['확인']);
        },

        _requestSave: function (componentModelData, resolve, reject) {
            var appletFormModel = this.__getAccessSettingData();
            appletFormModel.data = componentModelData;
            this.observer.trigger(constants.REQ_FORM_SAVE, appletFormModel, resolve, reject);
        },

        _triggerModelUpdate: function () {
            this.observer.trigger(constants.EVENT_UPDATE_FORM_ACCESS_SETTING, this.__getAccessSettingData());
        },
        __getAccessSettingData: function () {
            var formName = _.isEmpty(this.$(":text[name='name']").val()) ? this.name : this.$(":text[name='name']").val();
            return {
                "name": formName,
                "accessSetting": $(":radio[name='accessSetting']:checked").val(),
                "accessTarget": this.accessUserView.getData(),
                "exceptionTarget": this.exceptionUserView.getData()
            }
        },

        /**
         * @Override
         */
        toggleContent: function (bool) {
            FBToolboxPaneView.prototype.toggleContent.apply(this, arguments);
            if (bool || false) {
                this.$('.' + this.titleWrapClassname).removeClass('off');
            } else {
                this.$('.' + this.titleWrapClassname).addClass('off');
            }
            if (bool) {
                this.observer.trigger(constants.EVENT_FOLD_ACCESS_PANNEL);
            }
        },
        /**
         * @Override
         */
        getMarginHeight: function () {
            var marginHeight = 40;
            return this.$('.toolbox-title').outerHeight() + marginHeight;
        }
    });

    return FBAccessSettingView;
});
