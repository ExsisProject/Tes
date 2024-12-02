define('works/views/app/calendar_view/calendar_view', function (require) {
    var GO = require('app');
    var _ = require('underscore');
    var when = require('when');
    var calLang = require("i18n!calendar/nls/calendar");
    var worksLang = require("i18n!works/nls/works");
    var commonLang = require("i18n!nls/commons");
    var WorksUtil = require("works/libs/util");

    var CalendarTpl = require("hgn!works/templates/app/calendar_view/calendar_view");
    var FilterTemplate = require("hgn!works/components/filter/templates/filter");

    var BaseAppletView = require("works/views/app/base_applet");
    var CalbeanView = require("works/views/app/calendar_view/works_calbean");
    var ColorPicker = require("calendar/views/color_picker");
    var PeriodEditorPopup = require("works/views/app/calendar_view/period_editor_popup")
    var FilterView = require("works/components/filter/views/filter");
    var BackdropView = require('components/backdrop/backdrop');

    var PeriodCollection = require("works/collections/periods");
    var Fields = require("works/collections/fields");

    var EVENT_CHANGE_CAL_TYPE = GO.constant("works", "EVENT_CHANGE_CAL_TYPE");

    var now = moment().lang(GO.config('locale'));
    var lang = {
        "tab_daily": calLang["일간"],
        "tab_weekly": calLang["주간"],
        "tab_monthly": calLang["월간"],
        "date_str": now.format(calLang["YYYY년 MM월"]),
        "today": calLang["오늘"],
        "using_period": worksLang["사용중인 항목"],
        "view_setting": worksLang["보기설정"],
        "color_config": commonLang["색상 변경"],
        "text_prev": commonLang["이전"],
        "text_next": commonLang["다음"],
        "text_all": commonLang["전체"]
    };

    return BaseAppletView.extend({
        tagName: "div",
        className: "content_page",
        calendarView: null,
        height: 0,
        initialize: function (options) {
            GO.util.store.set('applet-viewtype', 'calendar', {type: 'session'});

            BaseAppletView.prototype.initialize.apply(this, arguments);
            this.height = 0;
            this.options = options || {};
            this.appletId = this.options.appletId;

            this._setFilterOptions();
            this.periodCollection = new PeriodCollection({appletId: this.appletId});
            this.periodCollection.fetch({async: false});
            this.periodIds = this.periodCollection.getIds();
            this.periods = this.periodCollection.toJSON();
            var savedSelectedPeriod = WorksUtil.getSavedSelectedPeriod(this.appletId);
            this.checkedPeriodIds = !_.isUndefined(savedSelectedPeriod) && savedSelectedPeriod.length > 0 ?
                savedSelectedPeriod.split(',').map(Number) : [];
            // 저장된 checkedPeriodIs가 없거나, periodIds 에 속하지 않은 id를 가질 저장소 내 periodIds 로 set
            if (this.checkedPeriodIds.length == 0 || _.difference(this.checkedPeriodIds, this.periodIds).length > 0) {
                this.checkedPeriodIds = this.periodIds
                WorksUtil.saveCheckedPeriod(this.appletId, this.periodIds);
            }

            this.datastore = initDatastore(this.appletId);
            this.options = _.defaults(this.options, {
                type: this.datastore.viewtype,
                date: GO.util.toMoment(this.datastore.basedate).toDate(),
                periods: this.datastore.selectedperiod,
                startday: 0
            });

            this.calendarView = new CalbeanView(this.options);
        },
        _setFilterOptions: function () {
            this.useCachedCondition = this.options.useCachedCondition;

            this._fieldSynced = $.Deferred();
            if (!this.useCachedCondition) {
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', {}, {type: 'session'});
            }
            this.fields = new Fields([], {
                appletId: this.appletId,
                type: 'accessible',
                includeProperty: true,
                includeDocNoAndProcess: true
            });
            this.fields.on("sync", this._onSyncFields, this);

            this.$el.on('changeFilter', _.bind(function () {
                GO.router.navigate('works/applet/' + this.appletId + '/home/search', {replace: true});
            }, this));
        },
        unbindEvent: function () {
            this.$el.off("click", ".tool_bar #using_period");
            this.$el.off("click", ".tool_bar #view_setting_btn");
            this.$el.off("click", ".layer_viewsetting input[name='period_id']");
            this.$el.off("click", ".layer_viewsetting input#check_all");
            this.$el.off("click", ".layer_viewsetting span.chip");
            this.$el.find(".chip").off("changed:period-color");

            this.$el.off("click", ".tab_nav > li");
            this.$el.off("click", ".current_date .prev-btn");
            this.$el.off("click", ".current_date .next-btn");
            this.$el.off("click", ".current_date .datepicker-btn");
            this.$el.off("click", ".current_date .today-btn");
            this.getTabElement().off(EVENT_CHANGE_CAL_TYPE);

            this.$el.off("searchByFilter");

        },
        bindEvent: function () {
            this.$el.on("click", ".tool_bar #using_period", $.proxy(this._showUsingPeriod, this));
            this.$el.on("click", ".tool_bar #view_setting_btn", $.proxy(this._showViewSetting, this));
            this.$el.on("click", ".layer_viewsetting input[name='period_id']", $.proxy(this._changeViewSetting, this));
            this.$el.on("click", ".layer_viewsetting input#check_all", $.proxy(this._checkAll, this));
            this.$el.on("click", ".layer_viewsetting span.chip", $.proxy(this._toggleColorPicker, this));
            this.$el.on("changed:chip-color.works", ".chip", $.proxy(this._bindChangedPeriodColor, this));

            this.$el.on("click", ".tab_nav > li", $.proxy(this._changeCalendarType, this));
            this.$el.on("click", ".current_date .prev-btn", $.proxy(this._goToPrev, this));
            this.$el.on("click", ".current_date .next-btn", $.proxy(this._goToNext, this));
            this.$el.on("click", ".current_date .datepicker-btn", $.proxy(this._goToDate, this));
            this.$el.on("click", ".current_date .today-btn", $.proxy(this._goToToday, this));
            this._bindTabEvent();

            this.$el.on("searchByFilter", $.proxy(function (event, param) {
                this._search(param);
            }, this));
        },
        render: function () {
            $.when(
                BaseAppletView.prototype.render.apply(this, arguments),
                this.accessibleForms.length > 0 ? this.fields.fetch() : this._renderNoExistForm(this.$el)
            ).then($.proxy(function () {
                if (this.accessibleForms.length < 1) {
                    return;
                }
                this.calendarView.setFields(this.fields);
                this.calendarView.setDodAddable(this.share.get('docAddible'));

                this.isAdmin = this.baseConfigModel.isAdmin(GO.session('id'));
                this.$el.empty().append(CalendarTpl({
                    lang: lang,
                    isPeriodEmpty: this._isPeriodEmpty(),
                    isAdmin: this.isAdmin,
                    periods: this.periods
                }));
                this.setDateIndicator();
                $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);

                this.unbindEvent();
                this.bindEvent();

                this._renderFilterView();
                this._adjustCssClass();

                this._initTab();
                this._initDatepicker();
                this._initViewSetting();

                if (this._isPeriodEmpty() && this.isAdmin) {
                    this._showPeriodEditorPopup(true);
                }
                return this.el;
            }, this));
        },
        _renderFilterView: function () {
            var filterView = new FilterView({
                fields: this.fields,
                appletId: this.appletId,
                filters: this.filters,
                isAdmin: this.isAdmin,
                useDocNo: this.baseConfigModel.attributes.useDocNo,
                refLink: this.options.refLink,
                template: FilterTemplate,
                templateParam: {hideListSetting: true},
                useCachedCondition: this.useCachedCondition
            });

            this.$el.prepend(filterView.el);
            filterView.render();
        },
        _adjustCssClass: function () {
            // go_works_situation : apphome 특화 css
            var contentElement = this.layoutView.getContentElement();
            contentElement.removeClass("build_situation");
            contentElement.addClass("go_works_situation");
            // 디자인팀 요청 클래스 반영.
            contentElement.addClass("go_attend_situation");
        },
        _initTab: function () {
            this.getTabElement().find('li[data-type="' + this.options.type + '"]').addClass("on");
            return this;
        },
        getTabElement: function () {
            return this.$el.find('.tab_nav');
        },
        _initDatepicker: function () {
            var self = this;
            this.$el.find("#calendarDatepicker").datepicker({
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: function (selected) {
                    self._changeDate(selected);
                }
            });

            this.$el.find("#calendarDatepicker").datepicker("setDate", this.options.date);
        },
        _initViewSetting: function () {
            var self = this;
            var checkedLength = 0;
            this.checkedPeriodIds.forEach(function (checkedPeriodId) {
                var input = self.$el.find(".layer_viewsetting input#period_id_" + checkedPeriodId);
                if (!_.isUndefined(input)) {
                    input.prop("checked", true);
                    checkedLength++;
                }
            });
            if (this.$el.find(".layer_viewsetting input[name='period_id']").length == checkedLength) {
                this.$el.find(".layer_viewsetting input[name='check_all']").prop("checked", true);
            }
        },
        _isPeriodEmpty: function () {
            return this.options.periods == '';
        },
        _search: function (param) {
            this.calendarView.queryString = param.queryString;
            this.calendarView.__initRendered__ = false;

            when.all([this._fieldSynced]).then($.proxy(function () {
                this.calendarView.render({height: this.getHeight(), clearOld: true});
                this.$el.append(this.calendarView.el);
            }, this));
        },
        _onSyncFields: function () {
            this._fieldSynced.resolve();
        },
        _storeConditions: function (e, filter) {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};
            data.filter = filter;
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', data, {type: 'session'});
        },
        _bindTabEvent: function () {
            var tab = this.getTabElement();
            $(this.getTabElement()).find('li').each(function (i, me) {
                $(tab).on(EVENT_CHANGE_CAL_TYPE, function (tab, type) {
                    if ($(me).attr('data-type') === type) {
                        $(me).addClass('on');
                    } else {
                        $(me).removeClass('on');
                    }
                });
            });
            return this;
        },
        resize: function (height) {
            if (typeof height !== 'undefined') this.setHeight(height);
            this.$el.height(this.height);
            this.calendarView.resize(this.height);
        },
        setHeight: function (height) {
            var toolbarMargin = 24;
            this.height = height - this.getToolbarView().outerHeight() + toolbarMargin;
        },
        getHeight: function () {
            return this.height;
        },
        setDateFields: function () {
            this.dateFields = _.filter(this.fields.toJSON(), function (field) {
                return field.valueType == 'DATE' || field.valueType == 'DATETIME';
            });
        },
        _showPeriodEditorPopup: function (force) {
            var self = this;
            if (!this.dateFields) {
                this.setDateFields();
            }
            this.periodEditorPopupView = new PeriodEditorPopup({
                appletId: this.appletId,
                periods: this.periods,
                dateFields: this.dateFields
            });
            this.periodEditorPopupView.render();
            var buttons = [];
            buttons.push({
                'btext': worksLang["입력화면 관리로 이동하기"],
                'autoclose': false,
                'callback': $.proxy(this._goToSettingsUserform, this)
            });
            buttons.push({
                'btext': commonLang["완료"],
                'autoclose': false,
                'btype': 'confirm',
                'callback': $.proxy(self._savePeriods, self)
            });
            buttons.push({
                'btext': commonLang["취소"],
                'callback': $.proxy(force ? this._goToListView : '', this)
            });
            
            $.goPopup({
                "header": worksLang["캘린더 뷰 항목 선택"],
                "title": '<p class="desc">' + worksLang["캘린더 뷰 항목 선택 설명"] + '</p>',
                "modal": true,
                "pclass": 'layer_calendar_check layer_normal',
                "width": 500,
                'closeCallback': $.proxy(force ? this._goToListView : '', this),
                "contents": self.periodEditorPopupView.$el,
                "buttons": buttons
            });
        },
        _goToListView: function () {
            GO.router.navigate('/works/applet/' + this.appletId + '/home', true);
        },
        _goToSettingsUserform: function () {
            var self = this;
            $.goConfirm(worksLang["입력화면 관리 화면으로 이동"],
                worksLang["선택한 항목은 저장되지 않습니다. 이동하시겠습니까?"], function () {
                    GO.router.navigate('/works/applet/' + self.appletId + '/settings/userform', true);
                });
        },
        _showUsingPeriod: function () {
            this._showPeriodEditorPopup();
        },
        _savePeriods: function () {
            this.periodEditorPopupView.savePeriods(this.appletId);
        },
        _showViewSetting: function (e) {
            this._bindBackdrop(this.$el.find(".layer_viewsetting"), $(e.currentTarget));
        },
        _changeViewSetting: function (e) {
            var checkedPeriodId = $(e.currentTarget).val();
            var isChecked = $(e.currentTarget).prop("checked");
            var checkedEls = this.$el.find(".layer_viewsetting input[name='period_id']:checked");
            var checkAllEl = this.$el.find(".layer_viewsetting input#check_all");
            if (checkedEls.length === 0 || !isChecked) {
                checkAllEl.prop("checked", false);
            } else if (checkedEls.length === this.periodIds.length) {
                checkAllEl.prop("checked", true);
            }
            this.checkedPeriodIds = _.map(checkedEls, function (el) {
                return $(el).val();
            });
            WorksUtil.saveCheckedPeriod(this.appletId, this.checkedPeriodIds);
            $(document).trigger(isChecked ? "show:period" : "hide:period", [checkedPeriodId]);
        },
        _bindBackdrop: function ($el, $link) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $el;
            backdropView.linkBackdrop($link);
            return backdropView;
        },
        _checkAll: function (e) {
            var isChecked = $(e.currentTarget).prop("checked");
            this.$el.find(".layer_viewsetting input[name='period_id']").prop("checked", isChecked);
            this.checkedPeriodIds = isChecked ? this.periodIds : [];
            WorksUtil.saveCheckedPeriod(this.appletId, this.checkedPeriodIds);
            $(document).trigger(isChecked ? "show:period" : "hide:period", [this.periodIds]);
        },
        _toggleColorPicker: function (e) {
            ColorPicker.show(e.target, 'works', 'left');
        },
        _bindChangedPeriodColor: function (e, code) {
            var self = this;
            var target = e.target;
            var targetPeriodId = $(e.currentTarget).closest('div').find("input[name='period_id']").val();
            $.ajax({
                type: 'PUT',
                dataType: 'json',
                contentType: "application/json",
                url: GO.config("contextRoot") + 'api/works/applet/' + self.appletId + '/period/' + targetPeriodId + '/color/' + code,
                success: function (resp) {
                    self._resetPeriodColor(target, code);
                    // 색상변경 이벤트를 캘린더 UI에 전달
                    $(document).trigger('changed:period-color', [targetPeriodId, code]);
                },
                error: function (resp) {
                    var errorMsg = resp.responseJSON.message;
                    $.goSlideMessage(errorMsg != null ? errorMsg : commonLang['저장에 실패 하였습니다.'], 'caution');

                }
            });
        },
        _resetPeriodColor: function (target, newCode) {
            $(target).attr("class", "");
            $(target).addClass("chip");
            $(target).addClass("bgcolor" + newCode);
            return this;
        },
        _changeCalendarType: function (e) {
            var $me = $(e.currentTarget).is('span') ? $(e.currentTarget).parent() : $(e.currentTarget);
            var type = $me.attr('data-type') || 'monthly';
            var date = WorksUtil.getDateForUrl(type, this.options.date);
            var targetUrl = ["works/applet", this.appletId, 'calendar', type, date].join("/");

            this.setCalendarType(type);
            this.setDateIndicator();
            this.getTabElement().trigger(EVENT_CHANGE_CAL_TYPE, [type]);
            GO.router.navigate(targetUrl, {trigger: false, pushState: true});
            return this;
        },
        setCalendarType: function (newType) {
            this.options.type = newType;
            WorksUtil.saveCalendarType(this.appletId, newType);
            this.resetCalendarView();
            return this;
        },
        resetCalendarView: function () {
            this.calendarView.changeType(this.getCalendarType());
            return this;
        },

        _goToPrev: function () {
            this._goToOffset(-1);
            return this;
        },
        _goToNext: function () {
            this._goToOffset(1);
            return this;
        },
        _goToOffset: function (offset) {
            var category = {"monthly": "months", "weekly": "weeks", "daily": "days"}[this.getCalendarType()];
            var basedate = GO.util.toMoment(this.options.date).clone().add(category, offset);
            this._changeDate(basedate);
            return this;
        },
        _goToDate: function () {
            this.$el.find("#calendarDatepicker").trigger("focus");
        },
        _goToToday: function () {
            this._changeDate();
            return this;
        },

        _changeDate: function (date) {
            var type = this.options.type;
            var basedate = this.options.date = GO.util.toMoment(date || new Date()).toDate();

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");

            this.calendarView.changeDate(basedate);
            WorksUtil.saveBasedate(basedate);
            this.setDateIndicator();

            var targetUrl = ["works/applet", this.appletId, 'calendar', type, WorksUtil.getDateForUrl(type, this.options.date)].join("/");
            GO.router.navigate(targetUrl, {trigger: false, pushState: true});

            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
            return this;
        },

        setDateIndicator: function () {
            var fYYYYMMDD = "YYYY.MM.DD";
            var basedate = GO.util.toMoment(this.options.date);
            var dateFormat = basedate.format(fYYYYMMDD);
            var monthFormat = basedate.format("YYYY.MM");
            var startDateOfWeek = GO.util.toMoment(GO.util.getStartDateOfWeek(basedate, this.options.startday));
            var endDateOfWeek = GO.util.toMoment(GO.util.getEndDateOfWeek(basedate, this.options.startday));

            var datestr = {
                "monthly": monthFormat,
                "weekly": [startDateOfWeek.format(fYYYYMMDD), endDateOfWeek.format(fYYYYMMDD)].join(" ~ "),
                "daily": dateFormat
            }[this.getCalendarType()];
            this.getToolbarView().find("#date-indicator").empty().html(datestr);
            return this;
        },
        getCalendarType: function () {
            return this.options.type;
        },
        getToolbarView: function () {
            return this.$el.find('.tool_bar');
        },
        getCheckedPeriodIds: function () {
            return this.checkedPeriodIds;
        },
        addPeriods: function () {
            var periodIds = Array.prototype.slice.call(arguments);
            _.each(periodIds, function (periodId) {
                this.calendarView.addPeriod(parseInt(periodId));
            }, this);
            return this;
        },
        clearPeriods: function () {
            this.calendarView.clearPeriods();
        }
    });

    function initDatastore(appletId) {
        var storePrefix = GO.session("id") + '-works-' + appletId;
        var configs = {
            "viewtype": {"storetype": "local", "default": "monthly"},
            "basedate": {"storetype": "session", "default": GO.util.toMoment(new Date).format('YYYY-MM-DD')},
            "selectedperiod": {"storetype": "local", "default": ""}
        };
        var result = {};
        _.each(configs, function (config, key) {
            var storeKey = storePrefix + '-calendar-' + key;
            var store = GO.util.store;
            var savedVal = store.get(storeKey);

            if (!savedVal) {
                store.set(storeKey, config['default'], {type: config.storetype});
                result[key] = config['default'];
            } else {
                result[key] = savedVal;
            }
        });
        return result;
    }
});
