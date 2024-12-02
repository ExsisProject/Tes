define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");

    var DeptSideTpl = require("hgn!contact/templates/side_dept");
    var DeptsSideTpl = require("hgn!contact/templates/side_depts");
    var LocalStorage = require("contact/helpers/local_storage");
    var AddGroupView = require("contact/views/side/components/add_group");
    var ManageView = require("contact/views/side/components/manage_popup");
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
        'contact_manage': ContactLang['주소록 관리'],
        'group_manage': ContactLang['그룹관리'],
        'fold': CommonLang['접기'],
        'open': CommonLang["펼치기"],
        'new_contact': ContactLang['새 연락처'],
        'contact': ContactLang['주소록'],
        'delete_contact': ContactLang["주소록 삭제"]
    };

    // DEPARTMENTS VIEW
    var DeptsSideView = Backbone.View.extend({
        tagName: "section",
        className: "lnb",

        SIDE_STORE_KEY: GO.session("loginId") + '-contact-dept-toggle',

        events: {
            "click .side_toggle": "sideToggle"
        },

        type: "DEPARTMENT",

        initialize: function (options) {
            this.$el.attr("data-type", "DEPARTMENT");
            this.collection = options.collection;
        },

        render: function () {
            this.$el.html(DeptsSideTpl({
                lang: lang,
                isToggleOpen: LocalStorage.getStoredCategoryIsOpen(this.SIDE_STORE_KEY)
            }));

            this.collection.each($.proxy(function (model) {
                var deptSideView = new DeptSideView({
                    deptName: model.get("deptName"),
                    deptId: model.get("deptId"),
                    collection: model.get("groups")
                });
                this.$el.find("ul.side_depth").append(deptSideView.el);
                deptSideView.render();
            }, this));
        },

        sideToggle: function (e) {
            var $currentTarget = $(e.currentTarget);
            sideToggle($currentTarget, this.SIDE_STORE_KEY);
        }
    });

    // DEPARTMENT ITEM VIEW
    var DeptSideView = Backbone.View.extend({
        tagName: "li",
        className: "org",

        events: {
            "click span.contactTag": "moveLink",
            "click span.groupManage": "groupManage"
        },

        type: "DEPARTMENT",

        initialize: function (options) {
            this.deptId = options.deptId;
            this.$el.attr("data-dept-id", this.deptId);
            this.collection = options.collection;
            this.deptName = options.deptName;
            this.addGroupView = new AddGroupView({type: this.type, deptId: this.deptId});
        },

        render: function () {
            this.$el.html(DeptSideTpl({
                lang: lang,
                data: this.collection,
                deptName: this.deptName,
                hasContactCount : function(){
                    return this.contactCount > 0;
                }
            }));

            this.$el.find("#dept_groups").append(this.addGroupView.el);
            this.addGroupView.render();
        },

        groupManage: function () {
            var $selected = this.$el.closest("section").find("p.on").closest("li");
            var manageView = new ManageView({type: this.type, deptId: this.deptId, id : $selected.data("id")});
            manageView.render();
        },

        moveLink: function (e) {
            var $current = $(e.currentTarget);
            var groupId = $current.closest("li.group").data("id");
            var url = makeUrl.call(this, groupId);
            GO.router.navigate(url, {trigger: true, pushState: true});
            GO.EventEmitter.trigger('contact', 'changed:sideGroups');

            function makeUrl(groupId) {
                var url = [];
                url.push("contact");
                url.push("dept");
                url.push(this.deptId);

                if (groupId) {
                    url.push("group");
                    url.push(groupId);
                }
                return url.join("/");
            }
        }
    });

    function sideToggle($el, key){
        var $section = $el.closest("section"),
            parentTarget = $el.parents('h1'),
            toggleBtn = parentTarget.find('.ic_side');

        $section.find('ul.side_depth').slideToggle("fast", function () {
            if ($(this).css('display') == 'block') {
                parentTarget.removeClass('folded');
                toggleBtn.attr("title", CommonLang["접기"]);
            } else {
                parentTarget.addClass('folded');
                toggleBtn.attr("title", CommonLang["펼치기"]);
            }

            var isOpen = !parentTarget.hasClass("folded");

            LocalStorage.storeCategoryIsOpen(key, isOpen);
        });
    }

    return DeptsSideView;
});

