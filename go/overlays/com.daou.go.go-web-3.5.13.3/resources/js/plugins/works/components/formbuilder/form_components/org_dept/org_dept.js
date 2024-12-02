define('works/components/formbuilder/form_components/org_dept/org_dept', function (require) {

    var GO = require('app');
    var when = require('when');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var JoinedDepts = require("collections/joined_depts");

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/org_dept/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/org_dept/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/org_dept/option');
    var OrgView = require("views/mobile/m_org");
    var WorksUtil = require('works/libs/util');

    var NameTagView = require("go-nametags");
    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    require("jquery.go-orgslide");

    var MAX_DEPT_COUNT = 10;

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "기본값": worksLang["기본값"],
        "세부항목": worksLang["세부항목"],
        "추가": commonLang["추가"],
        "삭제": commonLang["삭제"],
        "이름숨기기": worksLang["이름숨기기"],
        "부서 선택 허용 수": worksLang["부서 선택 허용 수"],
        "제한 없음": worksLang["제한 없음"],
        "기본 값 지정": worksLang["기본 값 지정"],
        "등록자의 부서를 기본값으로 지정": worksLang["등록자의 부서를 기본값으로 지정"],
        "부서 최대값": GO.i18n(worksLang['최대 {{arg}}개 부서까지 설정 가능'], "arg", MAX_DEPT_COUNT)
    };

    var OptionView = BaseOptionView.extend({

        customEvents: {
            "keypress input[name=allowDeptCount]": "replaceNumber",
            "focusout input[name=allowDeptCount]": "_setAllowDeptCount"
        },

        replaceNumber: function (e) { //keypress가 한글에서는 이벤트가 동작하지 않는 버그때문에 keyup을 통해 막아야함. 근데 그것도 키보드 동시에 2개 누르면 못막는 버그가 있어서 replace해야함
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                var replace = $(e.currentTarget).val().replace(/[^0-9]/gi, '');
                $(e.currentTarget).val(replace);
                e.preventDefault();
                return false;
            }
        },

        _setAllowDeptCount: function (e) {
            var $target = $(e.currentTarget);
            if (!$target.val() || parseInt($target.val()) < 1) {
                this.model.set($target.attr('name'), 1);
                $target.val(1);
            } else if (parseInt($target.val()) > MAX_DEPT_COUNT) {
                this.model.set($target.attr('name'), MAX_DEPT_COUNT);
                $target.val(MAX_DEPT_COUNT);
            } else {
                this.model.set($target.attr('name'), parseInt($target.val()));
                $target.val(parseInt($target.val()));
            }

        },

        onAddDepts: function (data) {
            var depts = _.isArray(data) ? data : [data];
            _.each(depts, function (dept) {
                this.nameTag.addTag(dept.id, dept.name, {"attrs": dept, removable: true})
            }, this);
            this.model.set('depts', this.nameTag.getNameTagList());
        },

        renderBody: function () {
            var self = this;
            this.$el.html(renderOptionTpl({
                model: this.model.toJSON(),
                lang: lang
            }));

            this.nameTag = NameTagView.create({}, {useAddButton: true});
            this.$("div[name='nameTagArea']").html(this.nameTag.el);
            _.each(this.model.get('depts'), function (dept) {
                self.nameTag.addTag(dept.id, dept.name, {"attrs": dept, removable: true});
            }, this);

            this.nameTag.$el.on('nametag:clicked-add', function () {
                $.goOrgSlide({
                    header: worksLang['부서 추가'],
                    type: 'department',
                    desc: '',
                    contextRoot: GO.config("contextRoot"),
                    callback: $.proxy(function (data) {
                        if (data.type == 'org') {
                            self.onAddDepts(data);
                        }
                    }, self)
                });
            });

            this.nameTag.$el.on("nametag:removed", $.proxy(this.onRemoveDept, this));
        },

        onRemoveDept: function (e, id) {
            var depts = new Backbone.Collection(this.model.get('depts'));
            var toRemove = depts.findWhere({'id': id});
            depts.remove(toRemove);
            this.model.set('depts', depts.toJSON());
        }
    });

    var FormView = BaseFormView.extend({

        initialize: function () {
            this.registerDept = null;
            var collection = JoinedDepts.fetch();
            if (collection.length) {
                var myDept = _.find(collection.models, function (dept) {
                    return dept.get("userDepartmentOrder") == 1;
                });
                this.registerDept = myDept || collection.at(0);
            }
            BaseFormView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                lang: lang
            }));
            this.initRender();
        },

        initRender: function () {
            var self = this;
            this.nameTag = NameTagView.create({}, {useAddButton: true});
            this.$("div[name='nameTagArea']").html(this.nameTag.el);
            if (!this.isEditable()) {
                this.nameTag.$el.on('nametag:clicked-add', function () {
                    if (!GO.util.isMobile()) {
                        self.namtTagCallback();
                    } else {
                        self.mobileNametTagCallback();
                    }
                });
                this.nameTag.$el.on("nametag:removed", $.proxy(this.onRemove, this));
            }
            this.addCurrentDeptByOption();
            _.each(self._getDepts(), function (dept) {
                self.nameTag.addTag(dept.id, dept.name, {"attrs": dept, removable: !self.isEditable()});
            }, self);
            self.appletDocModel.set(self.getDataFromView());
        },

        mobileNametTagCallback: function () {
            var self = this;
            var depts = _.map(self.nameTag.getNameTagList(), function (dept) {
                return {
                    id: dept.id,
                    username: dept.name
                }
            });
            GO.router.navigate(GO.router.getUrl() + '#org', {trigger: false, pushState: true});
            this.orgView = new OrgView({type: 'department'});
            this.orgView.render({
                title: worksLang['부서 추가'],
                checkedUser: depts,
                callback: function (data) {
                    _.each(self.nameTag.getNameTagList(), function (m) {
                        self.nameTag.removeTag(m.id);
                    }, self); // 지우고 다시 그려야한다.
                    self.onAddDepts(data);
                    return false;
                }
            });
            GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
        },

        namtTagCallback: function () {
            var self = this;
            $.goOrgSlide({
                header: worksLang['부서 추가'],
                type: 'department',
                desc: '',
                contextRoot: GO.config("contextRoot"),
                callback: $.proxy(function (data) {
                    if (data.type == 'org') {
                        self.onAddDepts(data);
                    }
                }, self)
            });
        },

        addCurrentDeptByOption: function () {
            if (this.model.get('useDefaultRegister') && !this.isEditable() && !this.appletDocModel.id && this.registerDept) {
                this.nameTag.addTag(this.registerDept.get('id'), this.registerDept.get('name'), {
                    "attrs": this.registerDept.toJSON(),
                    removable: true
                });
            }
        },

        _getDepts: function () {
            return this.appletDocModel.id ? this.appletDocModel.get(this.getCid()) : this.appletDocModel.get(this.getCid()) || this.model.get('depts');
        },

        validate: function () {
            var $target = this.$('div[name="nameTagArea"]');
            var depts = this.nameTag.getNameTagList();
            if (this.model.get('required') && (depts.length < 1)) {
                this.printErrorTo($target, worksLang['필수 항목입니다.']);
                return false;
            } else if (depts.length > this.model.get('allowDeptCount')) {
                this.printErrorTo($target, GO.i18n(worksLang['최대 {{arg}}개 부서까지 설정할 수 있습니다'], "arg", this.model.get('allowDeptCount')));
                return false;
            } else if (depts.length > MAX_DEPT_COUNT) {
                this.printErrorTo($target, GO.i18n(worksLang['최대 {{arg}}개 부서까지 설정할 수 있습니다'], "arg", MAX_DEPT_COUNT));
                return false;
            }
            return true;
        },

        //getFormData: function() {
        //	return this.appletDocModel.toJSON();
        //},

        getDataFromView: function () {
            var result = {};
            result[this.clientId] = this.nameTag ? this.nameTag.getNameTagList() : '';
            return result;
        },

        onAddDepts: function (data) {
            var depts = _.isArray(data) ? data : [data];
            _.each(depts, function (dept) {
                this.nameTag.addTag(dept.id, dept.name, {"attrs": dept, removable: true})
            }, this);
            this.appletDocModel.set(this.getDataFromView());
        },

        onRemove: function () {
            this.appletDocModel.set(this.getDataFromView());
        },

        _getDefaultValue: function () {
            var members = this.model.get('depts') || [];
            if (this.model.get('useDefaultRegister')) {
                if (this.registerDept) members.push(this.registerDept);
            }
            return members;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var userData = _.each(this.appletDocModel.get(this.clientId), function (dept) {
                dept['displayName'] = dept.name;
            });

            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                userData: userData,
                label: GO.util.escapeHtml(this.model.get('label')),
                "isMobile?": GO.util.isMobile(),
                lang: lang
            }));
        },

        getTitle: function () {
            var value = this.appletDocModel.get(this.clientId) || [];
            var userData = _.each(value, function (dept) {
                dept['displayName'] = dept.name;
            });
            return userData.length < 1 ? "" : _.pluck(this.appletDocModel.get(this.clientId), 'displayName').join(', ');
        }
    });

    var OrgDeptComponent = FormComponent.define(ComponentType.OrgDept, {
        type: 'org_dept',
        name: worksLang['부서 선택'],
        valueType: 'DEPTS',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['부서 선택']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "noLimit": {defaultValue: true},	// 부서 선택 허용수 제한. true = 제한없음, false = 제한있음.
            "useDefaultRegister": {defaultValue: false},	// 등록자의 부서를 기본값으로 사용여부.
            "allowDeptCount": {defaultValue: '1'}, // 부서 선택 허용 수. 1이면 한명만 선택 가능
            "depts": {defaultValue: []} //기본값으로 지정된 부서
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(OrgDeptComponent);
});
