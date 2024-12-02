define('works/views/mobile/doc_detail/doc_action', function (require) {
    // dependency
    var Backbone = require('backbone');
    var App = require('app');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var boardLang = require('i18n!board/nls/board');
    var WorksUtil = require('works/libs/util');

    var DocActionView = require('works/views/app/doc_detail/doc_action');
    var ActionModel = require('works/models/action');

    var menus = {
        "상태변경": {
            selectId: "selectAction",
            text: worksLang['상태변경'],
            selectTriggerFunc: 'status-change'
        },
        "활동기록등록": {
            id: "btnWriteActivity",
            text: worksLang['활동기록'],
            triggerFunc: 'works-write-activity'
        },
        "활동기록": {
            id: "btnActivity",
            text: worksLang['활동기록'],
            cls: 'btn_comments',
            triggerFunc: 'works-activity'
        },
        "이전": {
            id: "previous",
            text: commonLang['위'],
            triggerFunc: 'works-prev',
            inMoreBtn: true
        },
        "다음": {
            id: "next",
            text: commonLang['아래'],
            triggerFunc: 'works-next',
            inMoreBtn: true
        },
        "목록": {
            id: "btnList",
            text: commonLang['목록'],
            triggerFunc: 'works-list',
            inMoreBtn: true
        },
        "수정": {
            id: "btnEdit",
            text: commonLang['수정'],
            triggerFunc: 'works-edit',
            inMoreBtn: true
        },
        "삭제": {
            id: "btnDelete",
            text: commonLang['삭제'],
            triggerFunc: 'works-delete',
            inMoreBtn: true
        },
        "URL 복사": {
            id: "works-url-copy",
            text: commonLang['URL 복사'],
            triggerFunc: "works-url-copy"
        }
    };

    return DocActionView.extend({

        events: {},

        initialize: function (options) {
            this.options = options || {};
            this.isAdmin = options.isAdmin;
            this.docId = this.model.id;
            this.appletId = this.model.get('appletId');
            this.subFormId = options.subFormId;
            this.isWriter = this.model.isCreator(GO.session('id'));
            this.actions = options.actions;
            this.useNavigate = options.useNavigate;
            this.activityCount = options.activityCount;
            $(document).off("backdrop");
            $(document).on("backdrop", $.proxy(function (e) {
                this.closeMoreLayout(e);
            }, this));
            //this.initWindowEvent();
            this.headerBindEvent();
        },
        headerBindEvent: function () {
            GO.EventEmitter.off('trigger-action');
            GO.EventEmitter.on('trigger-action', 'status-change', this.doAction, this);
            GO.EventEmitter.on('trigger-action', 'works-edit', this.goEdit, this);
            GO.EventEmitter.on('trigger-action', 'works-delete', this.doDelete, this);
            GO.EventEmitter.on('trigger-action', 'works-write-activity', this.goActivityCreate, this);
            GO.EventEmitter.on('trigger-action', 'works-activity', this.goActivity, this);
            GO.EventEmitter.on('trigger-action', 'works-prev', this._onClickPrevious, this);
            GO.EventEmitter.on('trigger-action', 'works-next', this._onClickNext, this);
            GO.EventEmitter.on('trigger-action', 'works-list', this._onClickList, this);
            GO.EventEmitter.on('trigger-action', 'works-url-copy', this.copyUrl, this);
        },
        render: function () {
            return this.getUseMenus();
        },

        getUseMenus: function () {
            var useMenuList = [];
            var isEditable = this.model.get('actions').updatable;
            var isDeletable = this.model.get('actions').removable;
            if (this.actions.length > 0) {
                useMenuList.push(menus.상태변경);
                this.actions.forEach($.proxy(function (action) {
                    var menu = {
                        selectId: "selectAction",
                        id: action.get('id'),
                        text: action.get('name')
                    };
                    useMenuList.push(menu);
                }), this);
            }
            if (this.activityCount == 0) {
                useMenuList.push(menus.활동기록등록);
            } else {
                menus.활동기록.commentsCount = this.activityCount;
                useMenuList.push(menus.활동기록);
            }
            useMenuList.push(menus["URL 복사"]);
            if (isEditable) {
                useMenuList.push(menus.수정);
            }
            if (isDeletable) {
                useMenuList.push(menus.삭제);
            }
            if (this.useNavigate && this._hasNavigateTable() && this._getPreviousDocId()) {
                useMenuList.push(menus.이전);
            }
            if (this.useNavigate && this._hasNavigateTable() && this._getNextDocId()) {
                useMenuList.push(menus.다음);
            }
            useMenuList.push(menus.목록);
            return useMenuList;
        },

        closeMoreLayout: function (e) {
            var moreLayout = $(e.currentTarget).find("#more_layout");
            if (moreLayout.is(':visible')) {
                moreLayout.hide();
            }
        },

        goActivity: function () {
            App.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + "/activities", true);
        },

        goActivityCreate: function () {
            App.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + "/activity", true);
        },

        goEdit: function () {
            WorksUtil.goEditDoc({
                appletId: this.appletId,
                subFormId: this.subFormId,
                docId: this.docId
            });
        },

        doDelete: function () {
            var self = this;
            if (confirm(commonLang["삭제하시겠습니까?"])) {
                var model = new Backbone.Model();
                model.id = self.appletId;
                model.url = GO.config('contextRoot') + 'api/works/applets/' + self.appletId + '/docs';
                model.set('ids', [parseInt(self.docId)]);
                model.save(null, {
                    type: 'DELETE',
                    contentType: 'application/json',
                    success: function () {
                        WorksUtil.goAppHome(self.appletId);
                    }
                });
            }
        },

        doAction: function () {
            var self = this;
            var actionId = $("#selectAction").val();
            if (!actionId) return;
            var model = new ActionModel({}, {
                appletId: this.appletId, docId: this.docId, actionId: actionId
            });
            model.save({}, {
                type: 'PUT',
                success: function () {
                    var navigateUrl = GO.util.isInvalidValue(self.subFormId) ?
                        "works/applet/" + self.appletId + "/doc/" + self.docId
                        : "works/applet/" + self.appletId + "/doc/" + self.docId + "/" + self.subFormId;
                    GO.router.navigate(navigateUrl, {trigger: true, replace: true});
                }, error: function () {
                    alert(commonLang['저장에 실패 하였습니다.']);
                }
            });
        },

        initWindowEvent: function () {
            this.orientationWindowEvent = {
                name: 'orientation',
                event: function () {
                    this.$el.find("#tool_bar").append(this.actionBar.render().el);
                    this.actionBar.renderToolbar();
                    this._toggleNavigate();
                }
            };

            this.setTimeoutToWindowEventHandler(this.orientationWindowEvent);
        },

        setTimeoutToWindowEventHandler: function (eventHandler) {
            var self = this;
            $(window).on(eventHandler.name, function () {
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout($.proxy(eventHandler.event, self), 200);
            });
        },

        _onClickList: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/home', true);
        },

        copyUrl: function () {
            GO.util.copyUrl();
        }
    });
});
