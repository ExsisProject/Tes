define("todo/views/menus/duedate", [
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/duedate_menu",
    
    "i18n!todo/nls/todo",
    "i18n!nls/commons",

    "jquery.ui"
],

function(
    HistoryMenu,
    
    renderDeudateMenu, 
    
    TodoLang,
    CommonLang
) {

    var DuedateMenuView,
        HistoriableMenuView = HistoryMenu.HistoriableMenuView,
        OUTPUT_DATE_FORMAT = 'YYYY-MM-DD',
        OUTPUT_TIME_FORMAT = 'HH:mm',
        DEFAULT_TIME = '12:00';

    // this.model = todoItemModel
    DuedateMenuView = HistoriableMenuView.extend({
        id: 'duedate-menu',
        className: 'content',

        name: 'duedate-menu',
        title: TodoLang["기한일"],
        template: renderDeudateMenu,

        events: {
            "click .btn-confirm": "_save",
            "click .btn-cancel": "_remove",
            "keypress input[name=date]": "_getValidDate",
            "keypress input[name=time]": "_getValidTime"
        },

        initialize: function(options) {
            options = options || {};
            HistoriableMenuView.prototype.initialize.call(this, options);
        },

        render: function() {
            var duedate = getDuedate.call(this);

            this.$el.empty()
                .append(this.template({
                    "date": duedate.format(OUTPUT_DATE_FORMAT),
                    "time": duedate.format(OUTPUT_TIME_FORMAT),
                    "hasDuedate?": this.model.hasDuedate(),
                    "label": {
                        "confirm": TodoLang["기한일 지정"],
                        "cancel": TodoLang["기한일 해제"]
                    }
                }));

            this.setMenuClass('layer_calendar_mini');
            this.$el.find('.ui-datepicker-container').show();
            setDatepicker.call(this);
        },

        _save: function(e) {
            var datestr = getValidDate(this.$el.find('input[name=date]').val()),
                timestr = getValidTime(this.$el.find('input[name=time]').val()),
                fdatetime = datestr + 'T' + timestr + ':00',
                self = this;

            e.preventDefault();
            // ISO DATE 포맷 변환은 모델의 updateDueDate에서 하고 있음
            this.model.updateDueDate(fdatetime).then(function(todoItemModel) {
                self.back();
            });
        },

        _remove: function(e) {
            var self = this;
            e.preventDefault();
            this.model.removeDueDate().then(function(todoItemModel) {
                self.back();
            });
        },

        _getValidDate: function(e) {
            var $target = $(e.currentTarget);
            if ( e.which == 13 ) {
                $target.val(getValidDate($target.val()));
            }
        },

        _getValidTime: function(e) {
            var $target = $(e.currentTarget);
            if ( e.which == 13 ) {
                $target.val(getValidTime($target.val()));
            }
        }
    });

    function getDuedate() {
        var curDuedate = this.model.get('dueDate'),
            result;

        if(curDuedate) {
            result = moment(this.model.get('dueDate'));
        } else {
            result = getBaseDate();
        }

        return result;
    }

    function getBaseDate() {
        var baseTime = moment().format('YYYY-MM-DDT') + '12:00:00',
            result;

        if(moment().isBefore(baseTime)) {
            result = baseTime;
        } else {
            result = moment().format('YYYY-MM-DDT') + '23:59:00';
        }

        return moment(result);
    }

    /**
     * 날짜 검증 규칙
     * - 년: 1900 - 2050
     * - 출력포맷: YYYY-MM-DD
     * - 입력가능한 포맷: YYYY-MM-DD,YYYY.MM.DD,YYYY/MM/DD,YYYYMMDD
     */
    function getValidDate(datestr) {
        var output,
            testPatter1 = /^([1-3][0-9]{3})[\-\/\.](1[012]|0?[1-9])[\-\/\.]([123][0-9]|0?[1-9])/,
            testPatter2 = /^([1-3][0-9]{3})(0[1-9]|1[012])(0[1-9]|[1-3][0-9])/;

        if(testPatter1.test(datestr) && moment(datestr).isValid()) {
            output = moment(datestr);
        } else if(testPatter2.test(datestr) && moment(datestr, 'YYYYMMDD').isValid()) {
            output = moment(datestr, 'YYYYMMDD');
        } else {
            output = getBaseDate();
        }

        return output.format(OUTPUT_DATE_FORMAT);
    }

    /**
     * 시간 검증 규칙
     * - 출력포맷: HH:mm
     * - 입력가능한 포맷: HH:mm, H:m, HH:m, H:mm, Hm, Hmm, HHm, HHmm
     */
    function getValidTime(timestr) {
        var output;

        if(moment(timestr, 'HH:mm').isValid()) {
            output = moment(timestr, 'HH:mm');
        } else if(moment(timestr, 'H:m').isValid()) {
            output = moment(timestr, 'H:m');
        } else if(moment(timestr, 'HH:m').isValid()) {
            output = moment(timestr, 'HH:m');
        } else if(moment(timestr, 'H:mm').isValid()) {
            output = moment(timestr, 'H:mm');
        } else if(moment(timestr, 'Hm').isValid()) {
            output = moment(timestr, 'Hm');
        } else if(moment(timestr, 'Hmm').isValid()) {
            output = moment(timestr, 'Hmm');
        } else if(moment(timestr, 'HHm').isValid()) {
            output = moment(timestr, 'HHm');
        } else if(moment(timestr, 'HHmm').isValid()) {
            output = moment(timestr, 'HHmm');
        } else {
            output = getBaseDate();
        }

        return output.format(OUTPUT_TIME_FORMAT);
    }


    function setDatepicker() {
        var $datefield = this.$el.find('input[name=date]');

        $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
        this.$el.find('.ui-datepicker-container').datepicker({
            defaultDate: getDuedate.call(this).toDate(),
            changeMonth: true,
            changeYear: true,
            yearSuffix: "",
            onSelect: function(date) {
                $datefield.val(date);
            }
        });
    }

    return DuedateMenuView;

    // TODO: 테스트 코드 작성
});
