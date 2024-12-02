define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");
    var ContactSideModel = require("contact/models/contact_side");

    var UserSideTpl = require("hgn!contact/templates/mobile/m_side_user");
    var DeptSideTpl = require("hgn!contact/templates/mobile/m_side_dept");
    var CompanySideTpl = require("hgn!contact/templates/mobile/m_side_company");
    var TreeMenuTpl = require('hgn!contact/templates/mobile/m_tree_menu');
    var TreeMenuView = require('contact/views/tree_menu');
    var CompanyGroupCollection = require("contact/collections/company_group");
    var Amplify = require("amplify");
    var App = require("app");
    var ContactLang = require("i18n!contact/nls/contact");
    var _ = require("underscore");

    var lang = {
        'USER': ContactLang['개인 주소록'],
        'COMPANY': ContactLang['전사 주소록'],
        'DEPARTMENT': ContactLang["부서 주소록"],
        'contact': ContactLang['주소록'],
        'contact_all': ContactLang['전체 주소록']
    };

    /**
     * 화면에서 사용하기 위한 용도.
     * Server 와의 통신은 없음
     */
    var TYPE = {
        isCompany: function (value) {
            return value == "COMPANY";
        },

        isUser: function (value) {
            return value == "USER";
        },

        isDept: function (value) {
            return value == "DEPARTMENT";
        }
    };

    var TYPE_TO_URL = {
        "USER": "personal",
        "COMPANY": "company",
        "DEPARTMENT": "dept"
    };

    var UserSideView = Backbone.View.extend({
        tagName: "section",
        className: "lnb",
        type: "USER",

        events: {
            "click span.contactTag": "moveLink"
        },

        initialize: function (options) {
            this.collection = options.collection;
        },

        render: function () {
            this.$el.html(UserSideTpl({
                lang: lang,
                data: this.collection,
                hasContactCount : function(){
                    return this.contactCount > 0;
                }
            }));
        },

        moveLink: function (e) {
            var $target = $(e.currentTarget);
            var url = ['contact', TYPE_TO_URL[this.type]];
            var groupId = $target.closest('li.group').data('group-id');

            if (groupId) {
                url.push(groupId);
            }

            App.router.navigate(url.join('/'), {trigger: true, pushState: true});
        }
    });

    var DeptSideView = Backbone.View.extend({
        tagName: "section",
        className: "lnb",
        type: "DEPARTMENT",

        events: {
            "click span.contactTag": "moveLink"
        },

        initialize: function (options) {
            this.collection = options.collection;
        },

        render: function () {
            this.$el.html(DeptSideTpl({
                lang: lang,
                data: this.collection.toJSON(),
                hasContactCount : function(){
                    return this.contactCount > 0;
                }
            }));
        },

        moveLink: function (e) {
            var $target = $(e.currentTarget);
            var groupId = $target.closest('li.group').data('group-id');
            var url = ['contact', TYPE_TO_URL[this.type]];

            url.push($target.closest('li.org').data('dept-id'));

            if (groupId) {
                url.push("group");
                url.push(groupId);
            }

            App.router.navigate(url.join('/'), {trigger: true, pushState: true});
        }
    });

    var CompanySideView = Backbone.View.extend({
        tagName: "section",
        className: "lnb",
        type: "COMPANY",

        LOCAL_STORAGE_KEY : "-contact-folder-toggle",

        events: {
            "click a.btn_close" : "toggleFolder",
            "click a.subject" : "moveLink"
        },

        initialize: function (options) {
            this.collection = CompanyGroupCollection.init();
            this.collection.set(options.collection.toJSON());
        },

        render: function () {
            this.$el.html(CompanySideTpl({
                lang: lang
            }));

            var nodes = this.collection.convertNodeTree();
            var $side = this.$el.find("#company_side");
            nodes.each($.proxy(function (model) {
                var nodeTemplate = renderTree.call(this, model, model.getChildren());
                $side.append(nodeTemplate);
            }, this));

            function renderTree(folderModel, treeNodes) {
                var $nodeLi;

                var storedCatetory = getStoredCategoryIsOpen(GO.session("loginId") + folderModel.id + folderModel.getName() + this.LOCAL_STORAGE_KEY);
                var isOpen = _.isUndefined(storedCatetory) ? false : true;
                $nodeLi = $(this.renderBoardTreeMenuNode({
                    "nodeId": folderModel.id,
                    "nodeType": 'FOLDER',	// 가상의 타입을 준다.
                    "nodeValue": folderModel.getName(),
                    "isAccessible": folderModel.isReadable() ? folderModel.isReadable() : false,
                    "hasChild": folderModel.hasChild(),
                    "close": !isOpen,
                    "iconType": 'folder',
                    "managable": false,
                    "isWritable": true //folderModel.isWritable()
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

        toggleFolder: function (e) {
            var currentTarget = $(e.currentTarget),
                $data = currentTarget.parent().find("a.subject"),
                id = $data.attr("data-id"),
                title = $data.attr("title"),
                $folder = currentTarget.find("span.ic");

            if(!currentTarget.hasClass('opened')) {
                this.renderChildrens(currentTarget.parent().find('.subject'));
                currentTarget.addClass('opened');
            }

            var isOpen = $folder.hasClass("open");
            storeCategoryIsOpen(GO.session("loginId") + id + title + this.LOCAL_STORAGE_KEY, !isOpen);

            if (isOpen) {
                $folder.removeClass("open").addClass("close");
                currentTarget.parent().next('ul').hide();
            } else {
                $folder.removeClass("close").addClass("open");
                currentTarget.parent().next('ul').show();
            }

            GO.EventEmitter.trigger('common', 'layout:refreshSideScroll');
            return false;
        },

        renderBoardTreeMenuNode: function () {
            return TreeMenuTpl.apply(undefined, arguments);
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
                "isMobile": true
            });
            treeMenuView.render();
            return treeMenuView;
        },

        moveLink : function(e){
            e.preventDefault();
            var folderId = $(e.currentTarget).closest("li").attr('data-id');

            if(folderId && $(e.currentTarget).data('readable')){
                var url = "contact/company/" + folderId;
                GO.router.navigate(url, true);
            }

            return false;
        }
    });

    var SideView = Backbone.View.extend({
        STORE_KEY: {
            "DEPARTMENT": GO.session("loginId") + '-contact-department-toggle',
            "COMPANY": GO.session("loginId") + '-contact-company-toggle',
            "USER": GO.session("loginId") + '-contact-personal-toggle'
        },
        tagName: 'article',

        events: {
            //"click span.contactTag": "moveContactGroup"
        },

        initialize: function () {
            this.$el.off();
            this.$el.css('min-height', '100%');
        },

        render: function () {
            this.packageName = this.options.packageName;

            this.setSideApp();
            this._renderGroups();

            return this;
        },

        _renderGroups: function () {
            var renderCallback = {
                "USER": $.proxy(renderUserSide, this),
                "DEPARTMENT": $.proxy(renderDeptSide, this),
                "COMPANY": $.proxy(renderCompanySide, this)
            };

            this.contactSide.get("priority").priorityTypes.forEach(function (type) {
                renderCallback[type]();
            });

            function renderUserSide() {
                var userSideView = new UserSideView({collection: this.contactSide.get('personalGroups')});
                this.$el.append(userSideView.el);
                userSideView.render();
            }

            function renderDeptSide() {
                var collection = this.contactSide.getDeptGroups();

                if(collection.isEmpty()){
                    return;
                }

                var deptSideView = new DeptSideView({collection: collection});
                this.$el.append(deptSideView.el);
                deptSideView.render();
            }

            function renderCompanySide() {
                var collection = this.contactSide.getCompanyGroups();
                if (collection.isEmpty()) {
                    return;
                }

                var companySideView = new CompanySideView({collection: collection});
                this.$el.append(companySideView.el);
                companySideView.render();
            }
        },

        moveContactGroup: function (e) {
            var $target = $(e.currentTarget),
                $section = $target.closest('section'),
                type = $section.data('type'),
                groupId = $target.closest('li.group').data('group-id'),
                url = ['contact', TYPE_TO_URL[type]];

            if (TYPE.isDept(type)) {
                url.push($target.closest('li.org').data('dept-id'));
                if (groupId) {
                    url.push('group');
                }
            }
            if (groupId)
                url.push(groupId);

            App.router.navigate(url.join('/'), {trigger: true, pushState: true});
        },

        dataFetch: function () {
            var deferred = $.Deferred();
            this.contactSide = ContactSideModel.read();

            $.when(this.contactSide).done(function () {
                deferred.resolve();
            });

            return deferred;
        },

        setSideApp: function () {
            $('body').data('sideApp', this.packageName);
        },

        /**
         * home 부분에서 사용할 param을 정의 합니다.
         */
        getInitParam: function () {
            return this.contactSide.getInitMenu();
        },

        /**
         *
         */
        getContactListExposure : function() {
            return this.contactSide.getContactListExposure();
        }
    }, {
        __instance__: null,
        create: function (packageName) {

            /*if(this.__instance__ === null)*/
            this.__instance__ = new this.prototype.constructor({'packageName': packageName});
            return this.__instance__;
        }
    });

    function getStoredCategoryIsOpen(store_key) {
        var savedCate = '';
        if (!window.sessionStorage) {
            savedCate = Amplify.store(store_key);
        } else {
            savedCate = Amplify.store.sessionStorage(store_key);
        }

        if (savedCate == undefined) {
            savedCate = true;
        }

        return savedCate;
    };

    function storeCategoryIsOpen(store_key, category) {
        return Amplify.store(store_key, category, {type: !window.sessionStorage ? null : 'sessionStorage'});
    };

    return SideView;
});
