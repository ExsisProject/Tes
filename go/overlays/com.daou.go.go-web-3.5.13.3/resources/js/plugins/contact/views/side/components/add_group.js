define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");

    var GroupAddTpl = require("hgn!contact/templates/group_add");

    var CreateGroupModel = require("contact/models/create_group");

    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    require("jquery.go-popup");
    require("jquery.go-validation");

    var lang = {
        'USER': ContactLang['개인 주소록'],
        'COMPANY': ContactLang['전사 주소록'],
        'DEPARTMENT': ContactLang["부서 주소록"],
        'contact_group': ContactLang['주소록 그룹'],
        'group_add': ContactLang['연락처 그룹 추가'],
        'contact_add': ContactLang['연락처 주소록 추가'],
        'contact_all': ContactLang['전체 주소록'],
        'contact_group': ContactLang['주소록 그룹'],
        'contact_manage': ContactLang['주소록 관리'],
        'group_manage': ContactLang['그룹관리'],
        'fold': CommonLang['접기'],
        'open': CommonLang["펼치기"],
        'new_contact': ContactLang['새 연락처'],
        'contact': ContactLang['주소록'],
        'delete_contact': ContactLang["주소록 삭제"]
    };

    var popupLang = {
        'group_select': ContactLang['그룹선택'],
        'group_new': ContactLang['새 이름'],
        'save': CommonLang['저장'],
        'cancel': CommonLang['취소'],
        'groupname': ContactLang['연락처 그룹 이름'],
        "주소록 이름": ContactLang["주소록 이름"]
    };

    var AddGroupView = Backbone.View.extend({
        tagName: "li",
        className: "new",
        template: _.template("<p class='title'><ins class='ic'></ins><span data-event='addGroup' class='txt'><%=lang.contact_add%></span></p>"),

        type: "USER",

        events: {
            "click span[data-event='addGroup']": "add"
        },

        initialize: function () {
            this.type = _.isUndefined(this.options.type) ? this.type : this.options.type;
            this.deptId = this.options.deptId;
        },

        render: function () {
            var template = this.template({
                lang: lang
            })
            this.$el.html(template);
        },


        add: function (e) {
            var addGroupFormView = new AddGroupFormView({type: this.type, deptId: this.deptId});
            $(e.currentTarget).parents('li.new').before(addGroupFormView.el);
            addGroupFormView.render();
        }
    });

    var AddGroupFormView = Backbone.View.extend({
        tagName: "li",

        className: "group ui-state-disabled",

        events: {
            "click span.group_add_done": "done",
            "click span.group_add_cancel": "cancel"
        },

        type: "USER",

        initialize: function () {
            this.type = _.isUndefined(this.options.type) ? this.type : this.options.type;
            this.deptId = this.options.deptId;
        },

        render: function () {
            var tmpl = GroupAddTpl({
                lang: popupLang
            });

            this.$el.html(tmpl);
            this.$el.find("input").focus();
        },

        done: function (e) {
            var $newGroup = this.$el.find("input.edit");

            try {
                validate($newGroup);
            } catch (e) {
                console.log(e);
                return;
            }

            var model = new CreateGroupModel({type: this.type});

            // TODO : dom 탐색이 아니라 data 로 처리
            if (model.isDept()) {
                model.set("deptId", this.deptId);
            }

            model
                .save({"name": $newGroup.val()})
                .done(success)
                .error(error);

            function success(response) {
                if (response.code == '200') {
                    GO.EventEmitter.trigger('contact', 'changed:sideGroups');
                }
            }

            function error(response) {
                var result = JSON.parse(response.responseText);
                $.goMessage(result.message);
            }

            function validate($newGroup) {
                var groupName = $newGroup.val();
                if (!$.goValidation.isCheckLength(2, 16, groupName)) {
                    invalidAction(GO.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "16"}), $newGroup);
                    throw new Error();
                }

                if (!$.goValidation.isValidChar(groupName)) {
                    invalidAction(",#$<>;\\\`\'\"\| " + CommonLang["사용할 수 없는 문자입니다."], $newGroup);
                    throw new Error();
                }
            }
        },

        cancel: function (e) {
            $(e.currentTarget).closest('li.group').remove();
        }
    });

    function invalidAction(msg, focusEl) {
        $.goMessage(msg);
        if (focusEl) focusEl.focus();
        return false;
    };

    return AddGroupView;
});