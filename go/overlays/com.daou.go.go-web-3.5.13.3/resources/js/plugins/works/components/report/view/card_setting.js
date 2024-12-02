define("works/components/report/view/card_setting", function(require) {
    var Backbone = require('backbone');

    var Template = require('hgn!works/components/report/template/card_setting');
    var ColorPicker = require("calendar/views/color_picker");

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var adminLang = require("i18n!admin/nls/admin");

    var MethodOptionTemplate = Hogan.compile([
        '<option value="SUM">{{{lang.합계}}}</option>',
        '<option value="AVG">{{{lang.평균}}}</option>',
        '<option value="COUNT">{{{lang.개수}}}</option>',
        '<option value="MAX">{{{lang.최대값}}}</option>',
        '<option value="MIN">{{{lang.최소값}}}</option>'
    ].join(""));

    var CompareRangeOptionTemplate = Hogan.compile([
        '<option value="DONE" DONE>{{{lang.사용안함}}}</option>',
        '<option value="SAME_DAY" SAME_DAY>{{{lang.직전일 동일 기간}}}</option>',
        '<option value="ONE_DAY_AGO" ONE_DAY_AGO>{{{lang.직전일}}}</option>',
        '<option value="ONE_YEAR_AGO" ONE_YEAR_AGO>{{{lang.이전 연도}}}</option>',
        '<option value="CUSTOM" CUSTOM>{{{lang.사용자 설정}}}</option>'
    ].join(""));


    var lang = {
        "일": worksLang["일"],
        "컴포넌트" : worksLang["컴포넌트"],
        "집계 방식" : worksLang["집계 방식"],
        "합계" : worksLang["합계"],
        "개수" : worksLang["개수"],
        "평균" : worksLang["평균"],
        "최대값" : worksLang["최대값"],
        "최소값" : worksLang["최소값"],
        "전체": commonLang["전체"],
        "이전 연도" : worksLang["이전 연도"],
        "직전일" : worksLang["직전일"],
        "직전일 동일 기간" : worksLang["직전 동일 기간"],
        "사용안함" : commonLang["사용안함"],
        "최근 30일간" : adminLang['최근 30일간'],
        "최근 7일간" : adminLang["최근 7일간"],
        "색상": commonLang["색상"],
        "색상 변경": commonLang["색상 변경"],
        "데이터" : worksLang["데이터"],
        "사용자 설정" : adminLang["사용자 설정"],
        "미리보기" : commonLang["미리보기"],
        "새 카드" : worksLang["새 카드"],
        "이름": commonLang["이름"],
        "카드": worksLang["카드"],
        "집계 기간": worksLang["집계 기간"],
        "비교 기간": worksLang["비교 기간"],
        "제목은 0자이상 0이하 입력해야합니다": GO.i18n(adminLang['제목은 0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"20"})
    }

    //Table 셋팅을 위한 뷰
    return Backbone.View.extend({
        events : {
            'click span[id="stateColor"]': 'toggleColorPickerByWorks',
            'change #aggRangeOption':  'toggleAggRangeOption',
            'change #compareRangeOption':  'toggleCompareRangeOption',
            'change #title': '_validateTitle',
            'change #cid': '_onChangeCid'
        },

        initialize: function (options) {
            this.model = options.model;
            this.appletId = options.appletId;
            this.fields = options.fields;
            this.chartFields = this.fields.getChartFields();

            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
        },

        render: function () {
            this.$el.html(Template({
                lang : lang,
                title: this.model.get('title'),
                aggStartDate: this.model.get('aggStartDate'),
                aggEndDate: this.model.get('aggEndDate'),
                compareStartDate: this.model.get('compareStartDate'),
                compareEndDate: this.model.get('compareEndDate'),
                model : this.model,
                chartFields: this.chartFields.toJSON()
            }));

            this._load();
            return this;
        },

        toggleColorPickerByWorks: function(e) {
            ColorPicker.show(e.target, 'works');
        },

        onChangeStateColor: function(e, newCode) {
            this.setColer(e.target, newCode);
        },

        setColer: function (target, newCode) {
            $(target).attr("class", "chip");
            $(target).addClass("bgcolor" + newCode);
            $(target).attr('color', newCode);
        },

        save : function () {
            this.model.set('title', this.$('#title').val());
            this.model.set('cid', this.$('#cid').val());
            this.model.set('method', this.$('#method').val());
            this.model.set('aggRangeOption', this.$('#aggRangeOption').val());
            this.model.set('compareRangeOption', this.$('#compareRangeOption').val());
            this.model.set('color', this.$('#stateColor').attr('color'));
            this.model.set('aggStartDate', this.$('#aggStartDate').val());
            this.model.set('aggEndDate', this.$('#aggEndDate').val());
            this.model.set('compareStartDate', this.$('#compareStartDate').val());
            this.model.set('compareEndDate', this.$('#compareEndDate').val());
        },

        isValid: function () {
            if (!this._validateTitle()) {
                return false;
            }
            return true;
        },

        _validateTitle: function() {
            var title = this.$el.find('#title').val();
            if (title.length < 1 || title.length > 20) {
                $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 1, arg2 : 20}), this.$("#title"), false, true);
                return false;
            }
            return true;
        },

        _onChangeCid: function () {
            var type = this.$el.find('#cid :selected').attr('data-value-type');

            if('NUMBER' === type) {
                this.$el.find('#method').children().remove();
                this.$el.find('#method').append(MethodOptionTemplate.render({lang:lang}));
            } else {
                this.$el.find('#method').children().not('[value=COUNT]').remove();
                this.$el.find('#method').val('COUNT');
            }
        },

        _load : function () {
            this.setColer(this.$('#stateColor'), this.model.get('color'));
            this.$('#cid').val(this.model.get('cid'));
            this.$('#method').val(this.model.get('method'));
            this.$('#cid').trigger('change');
            this.$('#aggRangeOption').val(this.model.get('aggRangeOption'));
            this.$('#compareRangeOption').val(this.model.get('compareRangeOption'));

            this.$('#aggRangeOption').trigger('change');
            this.$('#compareRangeOption').trigger('change');

            this.$el.on("changed:chip-color.works", ".chip", $.proxy(this.onChangeStateColor, this));
            this.initDatepicker();

            this.setDiffrenceBetween(this.model.get('aggStartDate'), this.model.get('aggEndDate'), this.$('#aggDiffDate'));
            this.setDiffrenceBetween(this.model.get('compareStartDate'), this.model.get('compareEndDate'), this.$('#compareDiffDate'));
        },

        toggleAggRangeOption : function () {
            var aggRangeOption = this.$('#aggRangeOption').val();
            if ('CUSTOM' == aggRangeOption) {
                this.$('#aggRangeCustomWrap').show();
                this.aggStartDate = this.$('#aggStartDate').val();
                this.aggEndDate = this.$('#aggEndDate').val();
            } else {
                this.$('#aggRangeCustomWrap').hide();
            }

            if ('ALL' == aggRangeOption){
                if ('SAME_DAY' == this.$('#compareRangeOption').val() || 'ONE_YEAR_AGO' == this.$('#compareRangeOption').val()) {
                    this.$('#compareRangeOption').val('DONE');
                }
                this.$('option[ONE_YEAR_AGO]').remove();
                this.$('option[SAME_DAY]').remove();
            } else {
                if ('WEEK' == aggRangeOption) {
                    this.aggStartDate = GO.util.now().add('days', -6).format("YYYY-MM-DD");
                    this.aggEndDate = GO.util.now().format("YYYY-MM-DD");
                } else if ('MONTH' == aggRangeOption) {
                    this.aggStartDate = GO.util.now().add('days', -29).format("YYYY-MM-DD");
                    this.aggEndDate = GO.util.now().format("YYYY-MM-DD");
                }

                this.$('#compareRangeOption').children().remove();
                this.$('#compareRangeOption').append(CompareRangeOptionTemplate.render({lang:lang}));
                this.$('#compareRangeOption').val(this.model.get('compareRangeOption'));
            }

            this.toggleCompareRangeOption();
        },

        toggleCompareRangeOption : function () {
            var aggRangeOption = this.$('#aggRangeOption').val();
            var compareRangeOption = this.$('#compareRangeOption').val();

            if ('CUSTOM' == compareRangeOption) {
                this.$('#compareRangeCustomWrap').show();
                this.$('#compareStartDate').attr('disabled', false);
                this.$('#compareEndDate').attr('disabled', false);
            } else if ('ALL' == aggRangeOption || 'DONE' == compareRangeOption) {
                this.$('#compareRangeCustomWrap').hide();
            } else {
                this.$('#compareRangeCustomWrap').show();
                this.$('#compareStartDate').attr('disabled', true);
                this.$('#compareEndDate').attr('disabled', true);

                var diff = this.getDiffrenceBetween(this.aggStartDate, this.aggEndDate);
                if ('SAME_DAY' == compareRangeOption) {
                    this.$('#compareStartDate').val(GO.util.toMoment(this.aggStartDate).add('days', -1).add('days', diff).format("YYYY-MM-DD"));
                    this.$('#compareEndDate').val(GO.util.toMoment(this.aggStartDate).add('days', -1).format("YYYY-MM-DD"));
                } else if ('ONE_DAY_AGO' == compareRangeOption) {
                    this.$('#compareStartDate').val(GO.util.toMoment(this.aggEndDate).add('days', -1).add('days', diff).format("YYYY-MM-DD"));
                    this.$('#compareEndDate').val(GO.util.toMoment(this.aggEndDate).add('days', -1).format("YYYY-MM-DD"));
                } else if ('ONE_YEAR_AGO' == compareRangeOption) {
                    this.$('#compareStartDate').val(GO.util.toMoment(this.aggStartDate).add('years', -1).format("YYYY-MM-DD"));
                    this.$('#compareEndDate').val(GO.util.toMoment(this.aggEndDate).add('years', -1).format("YYYY-MM-DD"));
                }

                this.setDiffrenceBetween(this.$('#compareStartDate').val(), this.$('#compareEndDate').val(), this.$('#compareDiffDate'));
            }
        },

        initDatepicker : function() {
            var self = this;

            this.$('#aggStartDate').datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose: function( selectedDate ) {
                    if(selectedDate) {
                        self.$('#aggEndDate').datepicker("option", "minDate", selectedDate);
                        self.aggStartDate = selectedDate;
                        self.aggEndDate = self.$('#aggEndDate').val();

                        self.setDiffrenceBetween(self.aggStartDate, self.aggEndDate, self.$('#aggDiffDate'));
                        self.toggleCompareRangeOption();
                    }
                }
            });

            this.$('#aggEndDate').datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate: self.model.get('aggStartDate'),
                onClose: function( selectedDate ) {
                    if(selectedDate) {
                        self.aggStartDate = self.$('#aggStartDate').val();
                        self.aggEndDate = selectedDate;
                        self.setDiffrenceBetween(self.aggStartDate, self.aggEndDate, self.$('#aggDiffDate'));
                        self.toggleCompareRangeOption();
                    }
                }
            });

            this.$('#compareStartDate').datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose: function( selectedDate ) {
                    if(selectedDate) {
                        self.$('#compareEndDate').datepicker("option", "minDate", selectedDate);
                        var endDate = self.$('#compareEndDate').val();
                        self.setDiffrenceBetween(selectedDate, endDate, self.$('#compareDiffDate'));
                    }
                }
            });

            this.$('#compareEndDate').datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                minDate: self.model.get('compareStartDate'),
                onClose: function( selectedDate ) {
                    if(selectedDate) {
                        var startDate = self.$('#compareStartDate').val();
                        self.setDiffrenceBetween(startDate, selectedDate, self.$('#compareDiffDate'));
                    }
                }
            });
        },

        getDiffrenceBetween: function (start, end) {
            return GO.util.toMoment(start).diff(GO.util.toMoment(end), "day");
        },

        setDiffrenceBetween: function (start, end, wrap) {
            var diff = -this.getDiffrenceBetween(start, end) + 1
            wrap.html(diff + ' ' + worksLang["일"]);
        }
    });
});