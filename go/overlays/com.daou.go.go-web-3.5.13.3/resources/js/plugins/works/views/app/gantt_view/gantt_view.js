define('works/views/app/gantt_view/gantt_view', function (require) {
    var GO = require('app');

    var BaseAppletView = require("works/views/app/base_applet");
    var FilterView = require("works/components/filter/views/filter");
    var FieldSettingPopupView = require("works/views/app/gantt_view/field_setting_popup");
    var GanttListView = require("works/views/app/gantt_view/gantt_list_view");
    var GanttGraphView = require("works/views/app/gantt_view/gantt_graph_view");

    var ReferDocs = require('works/collections/docs');
    var AppletDocSearchView = require('works/components/applet_doc_search/views/applet_doc_search');

    var Fields = require("works/collections/fields");

    var GanttViewTemplate = require("hgn!works/templates/app/gantt_view/gantt_view")
    var FilterTemplate = require("hgn!works/components/filter/templates/filter");

    var CONSTANTS = require('works/constants/works');
    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var boardLang = require("i18n!board/nls/board");
    var contactLang = require("i18n!contact/nls/contact");
    var lang = {
        순서바꾸기: commonLang["순서바꾸기"],
        데이터불러오기: worksLang["데이터 불러오기"],
        그룹추가: contactLang["그룹추가"],
        모두닫기: boardLang["모두 닫기"],
        접기: commonLang["접기"],
        펴기: commonLang["펴기"],
        사용중인항목: worksLang["사용중인 항목"],
        오늘: commonLang["오늘"]
    };
    require("jquery.go-preloader");

    return BaseAppletView.extend({
        className: "content_page",
        events: {
            "click a.btnToggleNodes": "_onClickToggleNodes", //모두 닫기
            "click a.btnGroupAdd": "_onClickGroupAdd",// 그룹 추가
            "click a.btnSortable": "_onClickSortableToggle", //순서바꾸기
            "click a.btnBringDocNodes": "_onClickBringDocNodes", //데이터 불러오기

            'click #fieldSettingBtn': '_showFieldSettingPopup', //사용중인 항목
            'click #today': '_showToday', //오늘
            'click .toggleListView': '_toggleListView' //접기펴기
        },
        initialize: function (options) {
            GO.util.store.set('applet-viewtype', 'gantt', {type: 'session'});

            BaseAppletView.prototype.initialize.apply(this, arguments);
            this.options = options || {};
            this.appletId = this.options.appletId;

            this._setFilterOptions();
        },
        _setFilterOptions: function () {
            this.useCachedCondition = this.options.useCachedCondition;
            if (!this.useCachedCondition) {
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', {}, {type: 'session'});
            }

            this._fieldSynced = $.Deferred();
            this.fields = new Fields([], {
                appletId: this.appletId,
                type: 'accessible',
                includeProperty: true,
                includeDocNoAndProcess: true
            });
            this.fields.on("sync", this._onSyncFields, this);
        },
        _onSyncFields: function () {
            this._fieldSynced.resolve();
        },
        render: function () {
            this.preloader = $.goPreloader();
            this.preloader.render();

            $.when(
                BaseAppletView.prototype.render.apply(this, arguments),
                this.accessibleForms.length > 0 ? this.fields.fetch() : this._renderNoExistForm(this.$el)
            ).then($.proxy(function () {
                if (this.accessibleForms.length < 1) {
                    return;
                }
                this.isAdmin = this.baseConfigModel.isAdmin(GO.session('id'));
                this._unbindEvent();
                this._bindEvent();

                this._renderFilterView();
                this._adjustCssClass();

                $.when(this.sideView._ganttViewSynced).then($.proxy(function () {
                    this.ganttViewModel = this.sideView.ganttViewModel;
                    if (!this.ganttViewModel.hasRequiredFields() && this.isAdmin) {
                        this._showFieldSettingPopup(this.ganttViewModel);
                    } else if (!this.ganttViewModel.hasRequiredFields() && !this.isAdmin) {
                        $.goPopup({
                            "header": worksLang["간트 뷰를 사용할 수 없습니다."] + "<br>" + commonLang["운영자에게 문의하세요."]
                        });
                    }
                }, this));
            }, this));
        },
        _unbindEvent: function () {
            this.$el.off("searchByFilter");
            this.$el.off("changeFilter");
            GO.EventEmitter.off('ganttTree');
        },
        _bindEvent: function () {
            this.$el.on("searchByFilter", $.proxy(function (event, param) {
                this._search(param);
            }, this));
            this.$el.on('changeFilter', _.bind(function () {
                GO.router.navigate('works/applet/' + this.appletId + '/home/search', {replace: true});
            }, this));
            GO.EventEmitter.on('ganttTree', 'refresh:listAndGraph', function () {
                this._renderListAndGraphView();
            }, this);
            GO.EventEmitter.on('ganttTree', 'refresh:graph', function () {
                this._renderGraphView();
            }, this);
        },
        _search: function (param) {
            this.queryString = _.isUndefined(param) ? "" : param.queryString;
            $.when(this._fieldSynced, this.sideView._ganttViewSynced).then($.proxy(function () {
                if (this.$el.find('.gantt_tool_bar').length == 0) {
                    this.$el.append(GanttViewTemplate({lang: lang, isAdmin: this.isAdmin}));
                }
                this._renderListAndGraphView();
            }, this));
        },
        _renderListAndGraphView: function () {
            var self = this;
            $.when(this._renderListView(), this._renderGraphView())
                .then(function () {
                    self.preloader.release();
                });
        },
        _renderListView: function () {
            this.listView = new GanttListView({
                appletId: this.appletId,
                isAdmin: this.isAdmin,
                fields: this.fields,
                ganttViewModel: this.sideView.ganttViewModel,
                queryString: this.queryString
            });
            this.listView.render();
        },
        _renderGraphView: function () {
            this.graphView = new GanttGraphView({
                appletId: this.appletId,
                ganttViewModel: this.sideView.ganttViewModel.toJSON(),
                ganttTreeNodes: this.listView.ganttTreeConfigView.ganttTreeNodes
            });
            this.graphView.render();
        },

        _renderFilterView: function () {
            this.filterView = new FilterView({
                fields: this.fields,
                appletId: this.appletId,
                filters: this.filters,
                isAdmin: this.isAdmin,
                useDocNo: this.baseConfigModel.attributes.useDocNo,
                template: FilterTemplate,
                templateParam: {hideListSetting: true},
                useCachedCondition: this.useCachedCondition
            });

            this.$el.prepend(this.filterView.el);
            this.filterView.render();
        },
        _adjustCssClass: function () {
            // go_works_situation : apphome 특화 css
            var contentElement = this.layoutView.getContentElement();
            contentElement.removeClass("build_situation");
            contentElement.addClass("go_works_situation");
        },
        _showFieldSettingPopup: function () {
            this.fieldSettingPopup = new FieldSettingPopupView({
                appletId: this.appletId,
                fields: this.fields.getColumnFields().toJSON(),
                ganttViewModel: this.ganttViewModel
            });
            this.fieldSettingPopup.render();
            var self = this;
            var buttons = [];
            buttons.push({
                'btext': worksLang["입력화면 관리로 이동하기"],
                'autoclose': false,
                'callback': $.proxy(this._goToSettingsUserform, this)
            });
            var isAlreadyCreated = this.baseConfigModel.attributes.useGanttView;
            buttons.push({
                'btext': commonLang["완료"],
                'btype': 'confirm',
                'autoclose': false,
                'callback': $.proxy(isAlreadyCreated ? this._saveFieldSetting : this._createGanttView, this)
            });
            buttons.push({
                'btext': commonLang["취소"],
                'callback': $.proxy(isAlreadyCreated ? '' : this._goToListView, this)
            });

            $.goPopup({
                "header": worksLang["간트 뷰 항목 선택"],
                "title": '<p class="desc">' + worksLang['간트 뷰 항목 선택 설명'] + '</p>',
                "pclass": "layer_normal layer_gantt_set",
                "modal": true,
                "closeCallback": $.proxy(isAlreadyCreated ? '' : this._goToListView, this),
                "width": 400,
                "contents": self.fieldSettingPopup.$el,
                "buttons": buttons
            });
        },
        _goToSettingsUserform: function () {
            var self = this;
            $.goConfirm(worksLang["입력화면 관리 화면으로 이동"],
                worksLang["선택한 항목은 저장되지 않습니다. 이동하시겠습니까?"], function () {
                    GO.router.navigate('/works/applet/' + self.appletId + '/settings/userform', true);
                });
        },
        _goToListView: function () {
            GO.router.navigate('/works/applet/' + this.appletId + '/home', true);
        },
        _saveFieldSetting: function () {
            var self = this;
            var fieldSetting = this._getFieldSettingFromPopup();
            var isValid = this._validateFieldSetting(fieldSetting);
            if (isValid) {
                $.ajax({
                    type: "PUT",
                    dataType: 'json',
                    async: false,
                    contentType: "application/json",
                    url: GO.contextRoot + "api/works/applets/" + this.appletId + "/ganttview/setting/fields",
                    data: JSON.stringify(fieldSetting),
                    success: function (resp) {
                        GO.router.navigate('works/applet/' + self.appletId + '/gantt', true);
                        $.goMessage(commonLang["저장되었습니다."]);
                    },
                    error: function (error) {
                        var result = JSON.parse(error.responseText);
                        $.goMessage(result && result.message ? result.message : commonLang["저장에 실패 하였습니다."]);
                    }
                });
            }
        },
        _getFieldSettingFromPopup: function () {
            var $el = this.fieldSettingPopup.$el;
            return {
                titleFieldCid: $el.find("#title_setting option:selected").val(),
                startFieldCid: $el.find("#startdate_setting option:selected").val(),
                endFieldCid: $el.find("#enddate_setting option:selected").val(),
                userFieldCid: $el.find("#user_setting option:selected").val(),
                progressFieldCid: $el.find("#progress_setting option:selected").val()
            };
        },
        _validateFieldSetting: function (fieldSetting) {
            if (!fieldSetting.titleFieldCid || !fieldSetting.startFieldCid || !fieldSetting.endFieldCid) {
                $.goSlideMessage(commonLang["필수항목을 입력하지 않았습니다."]);
                return false;
            }
            if (fieldSetting.startFieldCid == fieldSetting.endFieldCid) {
                $.goSlideMessage(worksLang["시작날짜와 종료날짜가 동일하여 데이터를 표시할 수 없습니다."]);
                return false;
            }
            return true;
        },
        _createGanttView: function () {
            var self = this;
            var fieldSetting = this._getFieldSettingFromPopup();
            var isValid = this._validateFieldSetting(fieldSetting);
            if (isValid) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    url: GO.contextRoot + "api/works/applets/" + this.appletId + "/ganttview",
                    data: JSON.stringify(fieldSetting),
                    success: function (resp) {
                        GO.router.navigate('works/applet/' + self.appletId + '/gantt', true);
                        $.goSlideMessage(GO.i18n(worksLang["최적화된 간트 뷰 사용을 위해 매핑한 컴포넌트의 최근 등록 데이터 기준으로 {{arg0}}개까지만 그려집니다."],
                            {"arg0": CONSTANTS.GANTT_VIEW_DOC_NODE_MAX_COUNT}));
                    },
                    error: function (e) {
                        GO.router.navigate('works/applet/' + self.appletId + '/home', true);
                        $.goAlert(e.responseJSON.message);
                    }
                });
            }
        },

        _onClickToggleNodes: function (e) {
            this.listView.onClickToggleNodes(e);
        },
        _onClickGroupAdd: function (e) {
            this.listView.onClickAddGroup(e);
        },
        _onClickSortableToggle: function (e) {
            this.listView.onClickSortableToggle(e);
        },
        _onClickBringDocNodes: function () {
            if (this.$el.find("#totalDocNodeCount").text() >= CONSTANTS.GANTT_VIEW_DOC_NODE_MAX_COUNT) {
                return $.goConfirm(GO.i18n(worksLang["간트 뷰에서 볼 수 있는 데이터의 개수는 최대 {{arg0}}개 입니다."],
                    {arg0: CONSTANTS.GANTT_VIEW_DOC_NODE_MAX_COUNT}) + " "
                    + worksLang["이미 추가한 데이터를 제거한 후 [데이터 불러오기]를 이용해 주세요."]);
            }

            this.popupView = $.goPopup({
                pclass: 'layer_normal layer_app_search',
                header: worksLang['데이터 불러오기'],
                buttons: [{
                    btext: commonLang["닫기"]
                }]
            });

            var appletDocSearchView = new AppletDocSearchView({
                model: this._getModelForSelfIntegration(),
                docs: this._getDocsForSelfIntegration(),
                fieldsOfIntegrationApp: this.fields,
                selfIntegration: true,
                pageSize: 10
            });

            this.popupView.find('div.content').html(appletDocSearchView.render().el);
            this.popupView.on('onClickListItem', $.proxy(function (e, doc) {
                this._addDocNode(doc);
            }, this));
            appletDocSearchView.on('rendered:appletDocSearch', _.bind(this.popupView.reoffset));
        },
        _getModelForSelfIntegration: function () {
            var model = new Backbone.Model();
            model.set('integrationFieldCid', this.ganttViewModel.get('titleFieldCid'));
            model.set('integrationAppletId', this.appletId);
            var displayFields = [];
            displayFields.push({cid: this.ganttViewModel.get('titleFieldCid')});
            displayFields.push({cid: this.ganttViewModel.get('startFieldCid')});
            displayFields.push({cid: this.ganttViewModel.get('endFieldCid')});
            model.set('selectedDisplayFields', displayFields);
            return model
        },

        _getDocsForSelfIntegration: function () {
            return new ReferDocs([], {
                type: 'base',
                appletId: this.appletId,
                referAppletId: this.appletId,
                fieldCid: this.ganttViewModel.get('titleFieldCid')
            });
        },

        _addDocNode: function (doc) {
            var self = this;
            $.ajax({
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                url: GO.contextRoot + "api/works/applets/" + this.appletId + "/ganttview/doc/" + doc.id,
                success: function (resp) {
                    self._renderListAndGraphView();
                    $('#gantt_list_config').scrollTop($('#gantt_list_config')[0].scrollHeight);
                    $.goSlideMessage(commonLang["추가되었습니다."]);
                },
                error: function (e) {
                    $.goError(e.responseJSON.message);
                }
            });
        },

        _showToday: function () {
            this.graphView.showToday();
        },

        _toggleListView: function () {
            var $listView = this.$el.find("#gantt_list");
            if ($listView.css('display') == 'none') { //펴기
                this.$el.find(".btn_gantt_unfold").hide();
                this.$el.find(".btn_gantt_fold").show();
                $listView.show();
                this.$el.find(".gantt_tool_bar .critical").show();
            } else { //접기
                this.$el.find(".btn_gantt_fold").hide();
                this.$el.find(".btn_gantt_unfold").show();
                $listView.hide();
                this.$el.find(".gantt_tool_bar .critical").hide();
            }

            this.graphView.renderBookmarks();
        }
    });
});
