define('works/views/app/doc_detail/doc_action', function (require) {
    var Backbone = require('backbone');
    var renderActionTpl = require('hgn!works/templates/app/doc_detail/doc_action');
    var SelectView = require('components/select/views/select');
    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var WorksUtil = require('works/libs/util');
    var Applets = require("works/collections/applet_simples");

    var lang = {
        "수정": commonLang["수정"],
        "삭제": commonLang["삭제"],
        "목록": commonLang["목록"],
        "인쇄": commonLang["인쇄"],
        "복사": commonLang["URL 복사"],
        '다른 앱으로 데이터 복사': worksLang['다른 앱으로 데이터 복사'],
        '위': commonLang['위'],
        '아래': commonLang['아래']
    };

    var ActionModel = require('works/models/action');

    return Backbone.View.extend({

        events: {
            'click a[name="btnAction"]': "doAction",
            'click #btnEdit': "goEdit",
            'click #btnDelete': "doDelete",
            'click #taskPrint': "printPopup",
            'click #goToListBtn': "_onClickList",
            'click #previous': '_onClickPrevious',
            'click #next': '_onClickNext'
        },

        initialize: function (options) {
            this.options = options || {};
            this.isAdmin = options.isAdmin;
            this.subFormId = options.subFormId;
            this.docId = this.model.id;
            this.appletId = this.model.get('appletId');
            this.actions = options.actions;
            this.writableApplets = new Applets([], {writable: true, type: 'accessible'});
            // 데이터 팝업보기일 경우 "수정, 데이터 복사, 목록" 버튼은 미제공
            this.isOrgDocPopup = options.isOrgDocPopup ? options.isOrgDocPopup : false;
            this.accessibleMainForm = options.accessibleMainForm ? options.accessibleMainForm : false;
            this.useNavigate = options.useNavigate;
        },

        render: function () {
            var isEditable = this.model.get('actions').updatable;
            var isDeletable = this.model.get('actions').removable;
            this.$el.html(renderActionTpl({
                data: this.actions.toJSON(),
                isEditable: isEditable,
                isDeletable: isDeletable,
                isOrgDocPopup: this.isOrgDocPopup,
                lang: lang,
                navigate: this.useNavigate && this._hasNavigateTable(),
                isShowBtn: function () {
                    return ((isEditable && !this.isOrgDocPopup) || isDeletable);
                }
            }));
            this._toggleNavigate();
            if (!this.isOrgDocPopup && this.accessibleMainForm) this._renderCopyButton();

            return this;
        },

        doAction: function (e) {
            var id = $(e.currentTarget).attr('id');
            var model = new ActionModel({}, {
                appletId: this.appletId, docId: this.docId, actionId: id
            });
            model.save({}, {
                type: 'PUT',
                success: $.proxy(function () {
                    this.$el.trigger('doAction');
                }, this),
                error: function () {
                    $.goAlert(commonLang['저장에 실패 하였습니다.']);
                }
            });
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
            $.goCaution(
                commonLang["삭제"],
                commonLang["삭제하시겠습니까?"],
                _.bind(function () {
                    var model = new Backbone.Model();
                    model.id = self.appletId;
                    model.url = GO.config('contextRoot') + 'api/works/applets/' + self.appletId + '/docs';
                    model.set('ids', [parseInt(self.docId)]);
                    model.save(null, {
                        type: 'DELETE',
                        contentType: 'application/json',
                        success: function () {
                            if (self.isOrgDocPopup) {
                                window.close();
                            } else {
                                WorksUtil.goAppHome(self.appletId);
                            }
                        }
                    });
                }, this)
            );
        },

        _onClickList: function () {
            GO.router.navigate("works/applet/" + this.appletId + "/home/search", true);
        },

        printPopup: function () {
            var url = GO.contextRoot + "app/works/applet/" + this.appletId + "/doc/" + this.docId + "/print";
            if (GO.util.isValidValue(this.subFormId)) {
                url = url + "/" + this.subFormId;
            }
            window.open(url, '', 'location=no, directories=no, resizable=yes, status=no, toolbar=no, menubar=no, width=1280, height=650, left=0, top=0, scrollbars=yes');
        },

        _renderCopyButton: function () {
            var selectView = new SelectView({
                useScroll: true,
                useCheckbox: false,
                valueKey: 'id',
                labelKey: 'name',
                iconPathKey: 'thumbSmall',
                collection: this.writableApplets,
                buttonText: lang['다른 앱으로 데이터 복사']
            });
            this.writableApplets.fetch();
            this.$('div.critical').append(selectView.render().el);
            this.$el.on('clickOption', $.proxy(function (e, data) {
                GO.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + '/copy/' + data.value, true);
            }, this));
            selectView.$el.on('directSelect', $.proxy(function (e, data) {
                GO.router.navigate("works/applet/" + this.appletId + "/doc/" + this.docId + '/copy/' + data.value, true);
            }, this));
        },

        _hasNavigateTable: function () {
            var idsTable = this._getDocIdsTable();
            return !!idsTable.length;
        },

        _getDocIdsTable: function () {
            return GO.util.store.get(GO.session('id') + '-' + this.appletId + '-docIdsTable') || [];
        },

        _getPreviousDocId: function () {
            var idsTable = this._getDocIdsTable();
            if (!idsTable.length) return false;
            var index = _.indexOf(idsTable, parseInt(this.model.id));
            return index > 0 ? idsTable[index - 1] : false;
        },

        _getNextDocId: function () {
            var idsTable = this._getDocIdsTable();
            if (!idsTable.length) return false;
            var index = _.indexOf(idsTable, parseInt(this.model.id));
            return index < idsTable.length ? idsTable[index + 1] : false;
        },

        _onClickPrevious: function () {
            var previousDocId = this._getPreviousDocId();
            if (!previousDocId) return;
            GO.router.navigate("works/applet/" + this.appletId + "/doc/" + previousDocId + '/navigate', true);
        },

        _onClickNext: function () {
            var nextDocId = this._getNextDocId();
            if (!nextDocId) return;
            GO.router.navigate("works/applet/" + this.appletId + "/doc/" + nextDocId + '/navigate', true);
        },

        _toggleNavigate: function () {
            var previousDocId = this._getPreviousDocId();
            var nextDocId = this._getNextDocId();
            previousDocId ? this.$("#previous").css("display", "inline-block") : this.$("#previous").hide();
            nextDocId ? this.$("#next").css("display", "inline-block") : this.$("#next").hide();
        }
    });
});
