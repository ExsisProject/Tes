define('works/search/views/search_popup', function (require) {

    var Hogan = require('hogan');
    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var dashboardLang = require('i18n!dashboard/nls/dashboard');
    var AppList = require("works/collections/applet_simples");

    var lang = {
        creator: worksLang['등록자'],
        keyword: commonLang['검색어'],
        period: commonLang['기간'],
        '앱 명': worksLang['앱 명'],
        all: commonLang['전체'],
        aweek: dashboardLang['최근 1주일'],
        twoweeks: dashboardLang['최근 2주일'],
        amonth: dashboardLang['최근 1개월'],
        directly: dashboardLang['직접선택'],
        '텍스트': worksLang['텍스트'],
        '활동기록': worksLang['활동기록'],
        '댓글': commonLang['댓글'],
        '첨부파일 명': commonLang['첨부파일 명'],
        '첨부파일 내용': commonLang['첨부파일 내용'],
        '직접 입력': adminLang['직접 입력']
    };

    var AppListView = Hogan.compile(
        '<option value="{{data.id}}">{{data.name}}</option>'
    )

    var Template = require('hgn!works/search/templates/search_popup');

    return Backbone.View.extend({

        tagName: "form",

        events: {
            "change input[type=radio]": "changeTerm",
            "change #appType": "toggleAppType"
        },

        initialize: function () {
            this.appList = new AppList();
        },

        render: function () {
            this.$el.html(Template({
                lang: lang
            }));

            this.appList.fetch({
                success: function (collection) {

                    collection.each(function (model) {
                        this.$("#appList").append(AppListView.render({
                            data: model.toJSON()
                        }));
                    });
                }
            });

            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            this.renderDatePicker();
            return this;
        },

        renderDatePicker: function () {
            this.$("#fromDate").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true
            });

            this.$("#toDate").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true
            });
        },

        changeTerm: function (e) {
            var isDirectly = $(e.currentTarget).attr("id") == "radioDirectly";

            this.$("input[data-type=datepicker]").prop("disabled", !isDirectly);
            this.renderDatePicker();

            if (isDirectly) this.$("input[data-type=datepicker]").val(GO.util.shortDate(new Date()));
        },

        getSearchParam: function () {
            var isValid = this.validate();
            if (!isValid) return;

            var date = this.getSearchTerm();
            return {
                stype: "detail",
                keyword: this.$('#keyword').val(),
                searchAttachContents: this.$("#searchAttachContents").is(':checked'),
                searchTerm: date.searchTerm,
                page: 0,
                offset: 15,
                fromDate: date.fromDate,
                toDate: date.toDate,
                adv: "on",
                authorName: this.$('#creator').val(),
                content: this.$('input[name="text"]').is(':checked'),
                activityContents: this.$('input[name="activity"]').is(':checked'),
                comments: this.$('input[name="comment"]').is(':checked'),
                attachFileNames: this.$('input[name="attachName"]').is(':checked'),
                attachFileContents: this.$('input[name="attachContent"]').is(':checked'),
                appletId: this.$("#appList option:selected").val(),
                appletName: this.$("#appName").val()
            };
        },

        getSearchTerm: function () {
            var term = this.$el.find("input[type=radio]:checked").val();
            var currentDate = GO.util.shortDate(new Date());
            var fromDate = GO.util.toISO8601('1970/01/01');
            var toDate = GO.util.toISO8601(new Date());
            var searchTerm = "all";

            if (term == "-1") {
                fromDate = GO.util.calDate(currentDate, "weeks", term);
                searchTerm = "1w";
            } else if (term == "-2") {
                fromDate = GO.util.calDate(currentDate, "weeks", term);
                searchTerm = "2w";
            } else if (term == "month") {
                fromDate = GO.util.calDate(currentDate, "months", -1);
                searchTerm = "1m";
            } else if (term == "directly") {
                searchTerm = "";
                fromDate = GO.util.toISO8601($("#fromDate").val());
                toDate = GO.util.searchEndDate($("#toDate").val());
            }

            return {fromDate: fromDate, toDate: toDate, searchTerm: searchTerm};
        },

        validate: function () {
            var appType = this.$('#appType').val();
            if (appType == 'directInput') {
                var $appName = this.$('#appName');
                var appName = $.trim($appName.val());
                if (appName == '') {
                    $.goError(worksLang['앱 명을 입력하세요.']);
                    $appName.focus();
                    return false;
                }
            }
            var $keyword = this.$('#keyword');
            var keyword = $.trim($keyword.val());
            if (keyword == '') {
                $.goError(commonLang['검색어를 입력하세요.']);
                $keyword.focus();
                return false;
            }

            if (!$.goValidation.isCheckLength(2, 64, keyword)) {
                $.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}));
                $keyword.focus();
                return false;
            }

            if ($.goValidation.isInValidEmailChar(keyword)) {
                $.goMessage(commonLang['메일 사용 불가 문자']);
                $keyword.focus();
                return false;
            }

            var $creator = this.$('#creator');
            var creator = $creator.val();
            if (creator.length && !$.goValidation.isCheckLength(2, 64, creator)) { // 입력하지 않거나 최소 2자 이상
                $.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}));
                $creator.focus();
                return false;
            }

            return true;
        },
        toggleAppType: function (e) {
            var appType = $(e.currentTarget).val();
            if (appType == 'directInput') {
                this.$('#appList').hide();
                this.$('#appName').show();
            } else {
                this.$('#appList').show();
                this.$('#appName').hide();
            }
        },
    });
});
