define('works/components/formbuilder/form_components/org/org', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/org/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/org/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/org/option');
    var OrgView = require("views/mobile/m_org");
    var WorksUtil = require('works/libs/util');

    var NameTagView = require("go-nametags");
    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    require("jquery.go-orgslide");

    var MAX_MEMBER_COUNT = 30;

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
        "사용자 선택 허용 수": worksLang["사용자 선택 허용 수"],
        "제한 없음": worksLang["제한 없음"],
        "기본 값 지정": worksLang["기본 값 지정"],
        "등록자를 기본값으로 지정": worksLang["등록자를 기본값으로 지정"],
        "사용자 최대값": GO.i18n(worksLang['최대 {{arg}}명까지 설정 가능'], "arg", MAX_MEMBER_COUNT)
    };

    var OptionView = BaseOptionView.extend({

        customEvents: {
            "keypress input[name=allowMemberCount]": "replaceNumber",
            "focusout input[name=allowMemberCount]": "_setAllowMemberCount"
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

        _setAllowMemberCount: function (e) {
            var $target = $(e.currentTarget);
            if (!$target.val() || parseInt($target.val()) < 1) {
                this.model.set($target.attr('name'), 1);
                $target.val(1);
            } else if (parseInt($target.val()) > MAX_MEMBER_COUNT) {
                this.model.set($target.attr('name'), MAX_MEMBER_COUNT);
                $target.val(MAX_MEMBER_COUNT);
            } else {
                this.model.set($target.attr('name'), parseInt($target.val()));
                $target.val(parseInt($target.val()));
            }
        },

        onAddMembers: function (data) {
            var members = _.isArray(data) ? data : [data];
            _.each(members, function (member) {
                var displayName = member.position ? member.name + " " + member.position : member.name;
                this.nameTag.addTag(member.id, displayName, {"attrs": member, removable: true})
            }, this);
            this.model.set('members', this.nameTag.getNameTagList());
        },

        renderBody: function () {
            var self = this;
            this.$el.html(renderOptionTpl({
                model: this.model.toJSON(),
                lang: lang
            }));

            this.nameTag = NameTagView.create({}, {useAddButton: true});
            this.$("div[name='nameTagArea']").html(this.nameTag.el);
            _.each(this.model.get('members'), function (member) {
                var displayName = member.position ? member.name + " " + member.position : member.name;
                self.nameTag.addTag(member.id, displayName, {"attrs": member, removable: true});
            }, this);

            this.nameTag.$el.on('nametag:clicked-add', function () {
                $.goOrgSlide({
                    header: worksLang['사용자 추가'],
                    type: 'node',
                    isBatchAdd: true,
                    externalLang: commonLang,
                    desc: '',
                    contextRoot: GO.config("contextRoot"),
                    callback: _.bind(self.onAddMembers, self)
                });
            });

            this.nameTag.$el.on("nametag:removed", $.proxy(this.onRemoveMember, this));
        },

        onRemoveMember: function (e, id) {
            var members = new Backbone.Collection(this.model.get('members'));
            var toRemove = members.findWhere({'id': id});
            members.remove(toRemove);
            this.model.set('members', members.toJSON());
        }
    });

    var FormView = BaseFormView.extend({
        render: function () {
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                lang: lang
            }));
            if (GO.config('isMobileApp')) {
                this.setAppCallBack();
            }
            this.initRender();
        },

        setAppCallBack: function () {
            var self = this;
            var eventName = 'addSuccess' + this.clientId;
            window[eventName] = function (r) {
                var data = JSON.parse(r);
                _.each(self.nameTag.getNameTagList(), function (m) {
                    self.nameTag.removeTag(m.id);
                }, self); // 지우고 다시 그려야한다.
                self.onAddMembers(data);
            };
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
                this.nameTag.$el.on("nametag:removed", $.proxy(this.onRemoveMember, this));
            }
            this.addCurrentMemberByOption(); //TODO 리펙토링
            _.each(this._getMembers(), function (member) {
                var displayName = member.position ? member.name + " " + member.position : member.name;
                if (displayName) {
                    this.nameTag.addTag(member.id, displayName, {"attrs": member, removable: !this.isEditable()});
                }
            }, this);
            this.appletDocModel.set(this.getDataFromView());
        },

        mobileNametTagCallback: function () {
            var self = this;
            var members = _.map(self.nameTag.getNameTagList(), function (member) {
                return {
                    id: member.id,
                    username: member.name,
                    position: member.position
                }
            });
            if (GO.config('isMobileApp')) {
                WorksUtil.callOrg(self.clientId, members);
            } else {
                GO.router.navigate(GO.router.getUrl() + '#org', {trigger: false, pushState: true});
                this.orgView = new OrgView({});
                this.orgView.render({
                    title: worksLang['사용자 추가'],
                    checkedUser: members,
                    callback: function (data) {
                        _.each(self.nameTag.getNameTagList(), function (m) {
                            self.nameTag.removeTag(m.id);
                        }, self); // 지우고 다시 그려야한다.
                        self.onAddMembers(data);
                        return false;
                    }
                });
                GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
            }
        },

        namtTagCallback: function () {
            var self = this;
            $.goOrgSlide({
                header: worksLang['사용자 추가'],
                type: 'node',
                isBatchAdd: true,
                externalLang: commonLang,
                desc: '',
                contextRoot: GO.config("contextRoot"),
                callback: _.bind(self.onAddMembers, self)
            });
        },

        addCurrentMemberByOption: function () {
            if (this.model.get('useDefaultRegister') && !this.isEditable() && !this.appletDocModel.id) {
                var userId = GO.session('id');
                var label = GO.session().name + " " + GO.session().position;
                this.nameTag.addTag(userId, label, {"attrs": GO.session(), removable: true});
            }
        },

        _getMembers : function(){
        	var value = this.appletDocModel.get(this.getCid());
        	if (this.appletDocModel.id || value) {
				return value ? (_.isArray(value) ? value : [value]) : value;
			} else {
				return this.model.get('members');
			}
        },

        validate: function () {
            var $target = this.$('div[name="nameTagArea"]');
            var members = this.nameTag.getNameTagList();
            if (this.model.get('required') && (members.length < 1)) {
                this.printErrorTo($target, worksLang['필수 항목입니다.']);
                return false;
            } else if (members.length > this.model.get('allowMemberCount')) {
                this.printErrorTo($target, GO.i18n(worksLang['최대 {{arg}}명까지 설정할 수 있습니다'], "arg", this.model.get('allowMemberCount')));
                return false;
            } else if (members.length > MAX_MEMBER_COUNT) {
                this.printErrorTo($target, GO.i18n(worksLang['최대 {{arg}}명까지 설정할 수 있습니다'], "arg", MAX_MEMBER_COUNT));
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

        onAddMembers: function (data) {
            var members = _.isArray(data) ? data : [data];
            _.each(members, function (member) {
                var displayName = member.position ? member.name + " " + member.position : member.name;
                this.nameTag.addTag(member.id, displayName, {"attrs": member, removable: true})
            }, this);
            this.appletDocModel.set(this.getDataFromView());
        },

        onRemoveMember: function () {
            this.appletDocModel.set(this.getDataFromView());
        },

        _getDefaultValue: function () {
            var members = this.model.get('members') || [];
            if (this.model.get('useDefaultRegister')) {
                members.push(GO.session());
            }
            return members;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var userData = _.each(this.appletDocModel.get(this.clientId), function (member) {
                member['displayName'] = member.position ? member.name + " " + member.position : member.name;
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
            var userData = _.each(value, function (member) {
                member['displayName'] = member.position ? member.name + " " + member.position : member.name;
            });
            return userData.length < 1 ? "" : _.pluck(this.appletDocModel.get(this.clientId), 'displayName').join(', ');
        }
    });

    var OrgComponent = FormComponent.define(ComponentType.Org, {
        type: 'org',
        name: worksLang['사용자 선택'],
        valueType: 'USERS',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['사용자 선택']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "noLimit": {defaultValue: true},	// 사용자 선택 허용수 제한. true = 제한없음, false = 제한있음.
            "useDefaultRegister": {defaultValue: false},	// 등록자를 기본값으로 사용여부.
            "allowMemberCount": {defaultValue: '1'}, // 사용자 선택 허용 수. 1이면 한명만 선택 가능
            "members": {defaultValue: []} //기본값으로 지정된 멤버
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(OrgComponent);
});
