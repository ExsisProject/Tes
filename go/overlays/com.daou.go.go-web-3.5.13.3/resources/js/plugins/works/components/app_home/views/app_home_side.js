define('works/components/app_home/views/app_home_side', function (require) {
    var BaseView = require('views/base_view');
    var FilterItemView = require('works/components/app_home/views/app_home_side_filter_item');
    var ShortcutsView = require('works/components/app_home/views/app_home_side_shortcuts');
    var FilterListView = require('works/components/filter/views/filter_list');
    var BackdropView = require('components/backdrop/backdrop');

    var CalendarViewModel = require("works/models/calendar_view");
    var GanttViewModel = require("works/models/gantt_view");

    var Template = require('hgn!works/components/app_home/templates/app_home_side');
    var ViewMenuTemplate = require('hgn!works/components/app_home/templates/app_home_side_view_menu');

    var when = require("when");
    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    require("jquery.go-validation");

    var lang = {
        '모든 문서': worksLang['모든 데이터'],
        '편집': commonLang['편집'],
        '접기': commonLang['접기'],
        '수정완료': commonLang['수정완료'],
        '취소': commonLang['취소'],
        '내가 등록한 데이터': worksLang['내가 등록한 데이터'],
        '기본 필터': worksLang['기본 필터'],
        '개인 필터': worksLang['개인 필터'],
        '다른 사용자의 필터 사용하기': worksLang['다른 사용자의 필터 사용하기'],
        '캘린더': commonLang["캘린더"],
        "이름 변경": worksLang["이름 변경"],
        "삭제": commonLang["삭제"],
        "리스트 뷰": worksLang["리스트 뷰"],
        "간트 뷰": worksLang["간트 뷰"],
        "캘린더 뷰": worksLang["캘린더 뷰"],
        "리포트": worksLang["리포트"],
        "뷰": worksLang["뷰"]
    };

    var fetchOption = {
        statusCode: {
            400: function () {
                GO.util.error('404', {"msgCode": "400-common"});
            },
            403: function () {
                GO.util.error('403', {"msgCode": "400-common"});
            },
            404: function () {
                GO.util.error('404', {"msgCode": "400-common"});
            },
            500: function () {
                GO.util.error('500');
            }
        }
    };

    return BaseView.extend({

        className: 'go_side',

        events: {
            'click [el-default]': '_onClickDefaultFilter',
            'click [data-el-create]': '_onClickCreateByForm',
            'click #creteAppletDoc': '_onClickCreateAppletDoc',
            'click [data-el-create-doc]': '_onClickAddAppletDocByBackdrop',
            'click span[data-reorder]': '_onClickReorder',
            'click #otherFilter': '_onClickOtherFilter',
            'click span[data-fold]': '_onClickFold',
            'click span[data-save]': '_onClickSave',
            'click span[data-cancel]': '_onClickCancel',
            'click #works_view_list li#calendar_view a, #add_calendar_view': '_onClickCalendarView',
            'click #calendar_view_setting_btn': '_onClickCalendarViewSetting',
            'click #works_view_list li#gantt_view a, #add_gantt_view': '_onClickGanttView',
            'click #gantt_view_setting_btn': '_onClickGanttViewSetting',
            'click #works_view_list li[el-rename]': '_onClickViewRename',
            'click #works_view_list li[el-delete]': '_onClickViewDelete',
            'click #goToListView': '_onClickListView',
            'click #goToReport': '_onClickReportView'
        },

        initialize: function (options) {
            options = options || {};
            this.appletId = options.appletId;
            this.accessibleForms = options.accessibleForms;
            this.hasOnlyOneForm = this.accessibleForms.length == 1;
            this.filters = options.filters;
            this.isAdmin = options.isAdmin;

            this.baseConfigModel = options.baseConfigModel;
            this.share = options.share;

            this.baseFilters = this.filters.getBaseFilters();
            this.baseFilters.on('sync', this._onSyncBaseFilters, this);
            this.baseFilters.on('remove', this._onRemoveBaseFilters, this);
            this.baseFilters.fetch(fetchOption);

            this.mineFilters = this.filters.getMineFilters();
            this.mineFilters.on('sync', this._onSyncMineFilters, this);
            this.mineFilters.on('remove', this._onRemoveMineFilters, this);
            this.mineFilters.fetch(fetchOption);

            this.calendarViewModel = new CalendarViewModel({appletId: this.appletId});
            this.ganttViewModel = new GanttViewModel({appletId: this.appletId});

            this.applets = options.applets;
            this.subFormId = options.subFormId;
        },

        render: function () {
            var hasAccessibleForm = this.accessibleForms.length > 0;
            this.$el.html(Template({
                lang: lang,
                isAdmin: this.isAdmin,
                appName: commonLang['Works'],
                contextRoot: GO.config('contextRoot'),
                hasAccessibleForm: hasAccessibleForm
            }));
            this._renderViewMenu();
            this._renderShortcuts();
            if (hasAccessibleForm) {
                this._renderAddAppletDoc();
                this._setFoldFilterList();
                this._toggleSideRegisterButton();
            }
            $('#side').on("resetFilterHeight", $.proxy(function () {
                this._setFilterAreaHeight();
            }, this));
            return this;
        },

        _renderMineFilters: function () {
            var $el = this.$('#mineFilters');
            $el.find('li').remove();
            this._renderFiltersByCollection(this.mineFilters, $el, true);
        },

        _renderBaseFilters: function () {
            var $el = this.$('#baseFilters');
            $el.find('li:not([el-default])').remove();
            this._renderFiltersByCollection(this.baseFilters, $el, this.isAdmin);
        },

        _renderFiltersByCollection: function (collection, $el, auth) {
            collection.each(function (filter) {
                var filterItemView = new FilterItemView({
                    appletId: this.appletId,
                    model: filter,
                    collection: collection,
                    auth: auth
                });
                $el.append(filterItemView.render().el);
            }, this);
        },

        _renderShortcuts: function () {
            var view = new ShortcutsView({
                applets: this.applets
            });
            this.$('section[el-title]').after(view.render().el);
        },

        _renderAddAppletDoc: function () {
            var firstForm = _.first(this.accessibleForms);
            var firstFormDataId = firstForm.mainForm ? "mainForm" : firstForm.id;
            var html = [];
            html.push('<section class="function" id="registerButtonArea">');
            if (this.hasOnlyOneForm && !firstForm.mainForm) {
                html.push('<a class="btn_function" data-formId="' + firstForm.id + '"data-el-create>');
            } else {
                html.push('<a class="btn_function" id="creteAppletDoc">');
            }
            html.push('<span class="txt">' + commonLang['등록'] + '</span>');


            if (this.accessibleForms.length > 1) {
                html.push('</a>');
                html.push('<span class="ic_set ic_arrow_open" data-el-create></span>');

                html.push('<div class="array_option layer_side_func on" style="display:none;" el-backdrop-create>')
                html.push('<ul class="array_type">');
                _.each(this.accessibleForms, function (form) {
                    if (form.mainForm) {
                        html.push('<li data-el-create-doc data-id="' + firstFormDataId + '" style="display: list-item;">');
                    } else {
                        html.push('<li data-el-create-doc data-id="' + form.id + '" style="display: list-item;">');
                    }
                    html.push('<span class="txt">' + form.name + '</span>');
                    if (form.mainForm) {
                        html.push('<span class="label_state normal">main</span>');
                    }
                    html.push('</li>')
                });
                html.push('</ul>');
                html.push('</div>');
                html.push('</section>');
            } else {
                html.push('</a>');
                html.push('</section>');
            }

            this.$('.side_nav').after(html.join('\n'));

        },

        _onClickCreateByForm: function () {
            if (this.hasOnlyOneForm) {
                var subFormId = this.$('[data-el-create]').attr('data-formId');
                this._goCreateDoc(subFormId);
            } else if (!this.backdropLayer) {
                this.backdropLayer = new BackdropView({el: this.$('[el-backdrop-create]')});
                this.backdropLayer.linkBackdrop(this.$('[data-el-create]'));
            }
        },

        _onSyncMineFilters: function () {
            this._renderMineFilters();
        },

        _onSyncBaseFilters: function () {
            this._renderBaseFilters();
        },

        _renderViewMenu: function () {
            var fetchList = [];
            this.useCalendarView = this.baseConfigModel.get('useCalendarView');
            this.useGanttView = this.baseConfigModel.get('useGanttView');
            if (this.useCalendarView) {
                fetchList.push(this.calendarViewModel.fetch());
            }
            if (this.useGanttView) {
                this.ganttViewModel.setType('GET');
                fetchList.push(this.ganttViewModel.fetch());
            }

            this._ganttViewSynced = $.Deferred();

            when.all(fetchList).then($.proxy(function () {
                var currentUrl = GO.router.getUrl();
                var selectListView = currentUrl.indexOf('/home') > 0;
                var selectGanttView = currentUrl.indexOf('/gantt') > 0;
                var selectCalendarView = currentUrl.indexOf('/calendar') > 0;
                var selectReportView = currentUrl.indexOf('/report') > 0;

                var showCalendarView = this.useCalendarView;
                if (showCalendarView) {
                    var calendarViewModel = this.calendarViewModel.toJSON();
                    showCalendarView = calendarViewModel.periodExist || this.isAdmin;
                }

                var showGanttView = this.useGanttView;

                this._ganttViewSynced.resolve();

                this.$el.find("#filter_area").before(ViewMenuTemplate({
                    lang: lang,
                    calendarViewModel: calendarViewModel,
                    ganttViewModel: this.ganttViewModel.toJSON(),
                    isAdmin: this.isAdmin,
                    showAdditionalView: this.isAdmin || showCalendarView || showGanttView,
                    showCalendarView: showCalendarView,
                    addCalendarView: this.isAdmin && !showCalendarView,
                    showCalendarEl: showCalendarView || (this.isAdmin && !showCalendarView),
                    showGanttView: showGanttView,
                    addGanttView: this.isAdmin && !showGanttView,
                    showGanttEl: showGanttView || (this.isAdmin && !showGanttView),
                    showListView: showCalendarView || showGanttView,
                    selectListView: selectListView ? "on" : "",
                    selectGanttView: selectGanttView ? "on" : "",
                    selectCalendarView: selectCalendarView ? "on" : "",
                    selectReportView: selectReportView ? "on" : ""
                }));
                this._setFilterAreaHeight();
            }, this));
        },
        _setFilterAreaHeight: function () {
            var totalHeight = this._getFilterAreaHeight();
            this.$el.find("#filter_area").height(totalHeight - 2);
        },

        _getFilterAreaHeight: function () {
            /*
            * 필터길이 지정 : 화면 높이 - (화면 상단 ~ 필터 영역 위에까지의 높이)
            * 화면 상단 ~ 리포트까지의 길이를 제외한 높이로 필터 높이 지정
            * */
            var innerHeight = window.innerHeight;
            if (!GO.isAdvancedTheme()) {
                innerHeight -= ($(".go_header_advanced").outerHeight(true) + 2);
            }

            var sideHeight = $("#side").outerHeight(true);
            var filterHeight = this.$el.find("#filter_area").outerHeight(true);
            var guideHeight = this.$el.find("#guide_area").outerHeight(true);
            return innerHeight - (sideHeight - filterHeight - guideHeight);
        },

        _onRemoveMineFilters: function () {
            this._renderMineFilters();
        },

        _onRemoveBaseFilters: function () {
            this._renderBaseFilters();
        },

        _onClickDefaultFilter: function (e) {
            var type = $(e.currentTarget).attr('data-id');
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-last-filter-id', type);
            var viewtype = GO.util.store.get('applet-viewtype');
            if (viewtype == 'calendar' || viewtype == 'gantt') {
                GO.router.navigate('works/applet/' + this.appletId + '/' + viewtype, true);
            } else {
                GO.router.navigate('works/applet/' + this.appletId + '/home', {replace: true});
                this.filters.trigger('changeFilter.filters', type);
            }
        },

        _onClickAddAppletDocByBackdrop: function (e) {
            e.stopPropagation();
            this.$el.trigger('storeParam');
            var subFormId = $(e.currentTarget).attr('data-id');
            this._goCreateDoc(subFormId === "mainForm" ? null : subFormId);
        },

        _onClickCreateAppletDoc: function (e) {
            this._goCreateDoc(this.subFormId);
        },

        _goCreateDoc: function (subFormId) {
            if (GO.util.isInvalidValue(subFormId)) {
                GO.router.navigate('works/applet/' + this.appletId + '/doc/new', true);
            } else {
                GO.router.navigate('works/applet/' + this.appletId + '/doc/new/' + subFormId, true);
            }
        },

        _onClickOtherFilter: function () {
            this.popupView = $.goPopup({
                pclass: 'layer_normal layer_app_search',
                header: worksLang['필터 검색'],
                buttons: [{
                    btext: commonLang["닫기"],
                    callback: $.proxy(function () {
                    }, this)
                }]
            });

            this.filterListView = new FilterListView({
                appletId: this.appletId
            });
            this.filterListView.$el.on('onClickListItem', $.proxy(function (e, modelObject) {
                this.filters.trigger('changeFilter.filters', modelObject.id, modelObject.type);
                this.popupView.close();
            }, this));

            this.popupView.find('.content').html(this.filterListView.render().el);
            this.filterListView.defer.done($.proxy(function () {
                this.popupView.reoffset();
            }, this));
        },

        _onClickFold: function (e) {
            var target = $(e.currentTarget);
            var toggleFlag = target.parents('h1').hasClass('folded');
            var type = target.closest('section').attr('data-type');
            this._toggleFilterListByType(type, toggleFlag);
            GO.util.store.set(GO.session('id') + '-works-side-fold-' + type, toggleFlag, 'local');
        },

        _toggleFilterListByType: function (type, toggleFlag) {
            var $section = this.$('section[data-type="' + type + '"]');
            var toggleBtn = $section.find('span[data-fold]');
            $section.find('ul').toggle(toggleFlag);
            if (toggleFlag) {
                $section.find("h1").removeClass("folded");
                toggleBtn.attr('title', commonLang['접기']);
            } else {
                $section.find("h1").addClass("folded");
                toggleBtn.attr('title', commonLang['펼치기']);
            }
        },

        /**
         * 저장된 값이 없을때(또는 true 일때) 열려야 한다.
         */
        _setFoldFilterList: function () {
            var baseFoldFlag = GO.util.store.get(GO.session('id') + '-works-side-fold-base');
            var mineFoldFlag = GO.util.store.get(GO.session('id') + '-works-side-fold-mine');
            this._toggleFilterListByType('base', _.isUndefined(baseFoldFlag) ? true : baseFoldFlag);
            this._toggleFilterListByType('mine', _.isUndefined(mineFoldFlag) ? true : mineFoldFlag);
        },

        _onClickReorder: function (e) {
            var $section = $(e.currentTarget).closest('section');
            var type = $section.attr('data-type');
            if (type === 'base') this.$('[el-default]').hide();
            $section.find('span.btn_wrap').toggle();
            $section.addClass('lnb_edit').sortable({
                items: 'li',
                opacity: '1',
                delay: 100,
                cursor: 'move',
                hoverClass: 'move',
                containment: $section,
                forceHelperSize: 'true',
                helper: 'clone',
                placeholder: 'ui-sortable-placeholder'
            }).sortable('enable');
        },

        _onClickSave: function (e) {
            var type = $(e.currentTarget).attr('data-type');
            var ids = _.map(this.$('#' + type + 'Filters').find('li[data-id]:not([el-default])'), function (li) {
                return $(li).attr('data-id');
            });
            $.ajax({
                type: 'PUT',
                contentType: "application/json",
                url: GO.contextRoot + 'api/works/applets/' + this.appletId + '/filters/' + type,
                data: JSON.stringify({ids: ids}),
                success: $.proxy(function () {
                    this[type + 'Filters'].fetch().done($.proxy(function () { // 검색용 주석. baseFilters / mineFilters
                        this._disableSortable(type);
                    }, this));
                    $.goMessage(commonLang['변경되었습니다.']);
                }, this)
            });
        },

        _onClickCancel: function (e) {
            var type = $(e.currentTarget).attr('data-type');
            this._disableSortable(type);
        },
        _onClickReportView: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/reports', true);
        },
        _onClickCalendarView: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/calendar', true);
        },
        _onClickGanttView: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/gantt', true);
        },
        _onClickListView: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/home', true);
        },
        _onClickCalendarViewSetting: function (e) {
            this._bindBackdrop(this.$("#calendar-backdrop"), this.$("#calendar_view_setting_btn"));
        },
        _onClickGanttViewSetting: function () {
            this._bindBackdrop(this.$("#gantt-backdrop"), this.$("#gantt_view_setting_btn"));
        },
        _bindBackdrop: function ($backdropEl, $link) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $backdropEl;
            backdropView.linkBackdrop($link);
        },
        _onClickViewRename: function (e) {
            e.stopPropagation();
            var isCalendarView = $(e.currentTarget).parent().closest('li').attr('id') == 'calendar_view';
            if (isCalendarView) {
                var desc = worksLang["변경할 캘린더뷰 이름을 입력하세요."];
                var name = this.calendarViewModel.get('name');
                var header = worksLang["캘린더뷰 이름 변경"];
            } else {
                var desc = worksLang["변경할 간트뷰 이름을 입력하세요."];
                var name = this.ganttViewModel.get('name');
                var header = worksLang["간트뷰 이름 변경"];
            }
            var contentTmpl = [
                '<div class="content">',
                '<p class="desc">' + desc + '</p>',
                '<div class="form_type">',
                '<input el-new-name class="txt_mini w_max" type="text" value="' + name + '">',
                '</div>',
                '</div>'
            ].join("");

            this.renamePopup = $.goPopup({
                modal: true,
                header: header,
                width: 500,
                contents: contentTmpl,
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    callback: $.proxy(function () {
                        var newName = this.renamePopup.find("input[el-new-name]").val();
                        isCalendarView ? this._renameCalendarView(newName) : this._renameGanttView(newName);
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal"
                }]
            });
        },
        _renameCalendarView: function (name) {
            if (!$.goValidation.isCheckLength(1, 64, name)) {
                return $.goMessage(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {"arg1": "1", "arg2": "64"}));
            }
            var self = this;
            this.calendarViewModel.save({name: name}, {
                type: 'PUT',
                success: function (model, response) {
                    if (response.code == '200') {
                        self.$el.find('#calendar_view_' + model.get('id') + " .txt").text(name);
                        $.goMessage(commonLang["저장되었습니다."]);
                    }
                },
                error: function (model, response) {
                    var responseData = JSON.parse(response.responseText);
                    $.goMessage(responseData.message);
                }
            });
        },
        _renameGanttView: function (name) {
            if (!$.goValidation.isCheckLength(1, 64, name)) {
                return $.goMessage(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {"arg1": "1", "arg2": "64"}));
            }
            var self = this;
            $.ajax({
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                url: GO.contextRoot + "api/works/applets/" + this.appletId + "/ganttview/rename",
                data: JSON.stringify({str: name}),
                success: function (resp) {
                    self.$el.find('#gantt_view_' + resp.data.id + " .txt").text(name);
                    self.ganttViewModel.set({name: name});
                    $.goMessage(commonLang["저장되었습니다."]);
                },
                error: function (resp) {
                    $.goError(resp.message);
                }
            });
        },
        _onClickViewDelete: function (e) {
            e.stopPropagation();
            var self = this;
            var isCalendarView = $(e.currentTarget).parent().closest('li').attr('id') == 'calendar_view';
            $.goCaution(commonLang["삭제 시 복구되지 않습니다."], commonLang["삭제하시겠습니까?"], function () {
                self.ganttViewModel.setType('DELETE');
                var model = isCalendarView ? self.calendarViewModel : self.ganttViewModel;
                GO.util.preloader(model.destroy({
                    success: function () {
                        GO.router.navigate("works/applet/" + self.appletId + "/home", true);
                        $.goSlideMessage(commonLang["삭제되었습니다."]);
                    },
                    error: function (model, response) {
                        var responseData = JSON.parse(response.responseText);
                        $.goError(responseData.message);
                    }
                }));
            });

        },
        _savePeriods: function () {
            this.periodEditorPopupView.savePeriods(this.appletId);
        },

        _disableSortable: function (type) {
            var $section = this.$('section[data-type="' + type + '"]');
            if (type === 'base') this.$('[el-default]').show();
            $section.removeClass('lnb_edit').sortable('disable');
            $section.find('span.btn_wrap').toggle();
            var methodMap = {
                base: '_renderBaseFilters',
                mine: '_renderMineFilters'
            };
            this[methodMap[type]]();
        },

        _toggleSideRegisterButton: function () {
            if (!this.share.get('docAddible')) this.$('#registerButtonArea').hide();
        }
    });
});
