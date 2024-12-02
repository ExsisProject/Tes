define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");
    var _ = require("underscore");

    var CompanySideTpl = require("hgn!contact/templates/side_company");
    var DocsTreeMenuTpl = require('hgn!docs/templates/docs_tree_menu');
    var CompanyGroupCollection = require("contact/collections/company_group");
    var LocalStorage = require("contact/helpers/local_storage");

    var TreeMenuView = require('contact/views/side/components/tree_menu');

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

    // COMPANY VIEW
    var CompanySideView = Backbone.View.extend({
        tagName: "section",
        className: "lnb oganization",

        LOCAL_STORAGE_KEY: "-contact-folder-toggle",

        SIDE_STORE_KEY: GO.session("loginId") + '-contact-company-toggle',

        type: "COMPANY",

        events: {
            "click span.ic_side_setting": "moveManageLink",
            "click #toggleFolder": "toggleFolder",
            "click a.node-value": "moveLink",
            "click .side_toggle": "sideToggle"
        },

        initialize: function (options) {
            this.$el.attr("data-type", "COMPANY");
            this.collection = CompanyGroupCollection.init();
            this.collection.set(options.collection.toJSON());
            this.isManager = options.isManager;
        },

        render: function () {
            var template = CompanySideTpl({
                lang: lang,
                isToggleOpen: LocalStorage.getStoredCategoryIsOpen(this.SIDE_STORE_KEY),
                isManager: this.isManager
            });
            this.$el.html(template);

            var nodes = this.collection.convertNodeTree();
            var $side = this.$el.find("#company_side");
            nodes.each($.proxy(function (model) {
                var nodeTemplate = renderTree.call(this, model, model.getChildren());
                $side.append(nodeTemplate);
            }, this));

            function renderTree(folderModel, treeNodes) {
                var $nodeLi;

                $nodeLi = $(this.renderBoardTreeMenuNode({
                    "nodeId": folderModel.id,
                    "nodeType": 'FOLDER',	// 가상의 타입을 준다.
                    "nodeValue": folderModel.getName(),
                    "isAccessible": folderModel.isReadable() ? folderModel.isReadable() : false,
                    "hasChild": folderModel.hasChild(),
                    "close": false,
                    "iconType": 'folder',
                    "managable": false,
                    "isWritable": folderModel.isWritable()
                }));

                return $nodeLi;
            }
        },

        renderChildrens : function(target) {
            var parentId = target.attr("data-id");
            var childGroups = CompanyGroupCollection.getCollectionByParent(parentId);
            var groupTreeView = this._renderMenuTree(Number(parentId), childGroups.toJSON(), undefined);
            target.parent().after(groupTreeView.el);
        },

        moveManageLink: function () {
            var url = "contact/company/manage";
            GO.router.navigate(url, {trigger: true, pushState: true});
        },

        renderBoardTreeMenuNode: function () {
            return DocsTreeMenuTpl.apply(undefined, arguments);
        },

        /**
         * 트리구조의 메뉴 렌더링
         */
        _renderMenuTree: function (folderId, treeNodes, menuId) {
            var treeMenuView = new TreeMenuView({
                "nodes": treeNodes,
                "menuId": menuId,
                "parentId": folderId,
                "localStorageKey": this.LOCAL_STORAGE_KEY,
                "isSiteAdmin" : false
            });
            treeMenuView.render();
            return treeMenuView;
        },

        toggleFolder: function (e) {
            var currentTarget = $(e.currentTarget),
                id = currentTarget.parent().find("a").attr("data-id"),
                title = currentTarget.parent().find("a").attr("title");

            if(!currentTarget.hasClass('opened')) {
                this.renderChildrens(currentTarget.parent().find("a"));
                currentTarget.addClass('opened');
            }

            var isOpen = currentTarget.hasClass("close");
            LocalStorage.storeCategoryIsOpen(GO.session("loginId") + id + title + this.LOCAL_STORAGE_KEY, !isOpen);
            if (isOpen) {
                currentTarget.removeClass("close").addClass("open");
                currentTarget.parent().next('ul').hide();
            } else {
                currentTarget.removeClass("open").addClass("close");
                currentTarget.parent().next('ul').show();
            }
        },

        moveLink: function (e) {
            e.preventDefault();
            var folderId = $(e.currentTarget).attr('data-id');

            if (folderId && $(e.currentTarget).data('readable')) {
                $('#side p.title.on').removeClass('on');
                $(e.currentTarget).parent().addClass('on');
                var url = "contact/company/" + folderId;
                GO.router.navigate(url, true);
            }

            return false;
        },

        sideToggle: function (e) {
            var $currentTarget = $(e.currentTarget);
            sideToggle($currentTarget, this.SIDE_STORE_KEY);
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

    return CompanySideView;
});
