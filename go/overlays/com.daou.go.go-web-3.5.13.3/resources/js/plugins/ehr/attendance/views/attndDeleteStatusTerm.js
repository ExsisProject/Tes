define([
        "backbone",
        "hgn!attendance/templates/popup_delete_status_term",
        "attendance/collections/companyStatuses",
        "i18n!nls/commons",
        "i18n!attendance/nls/attendance",
        "app"
    ],

    function(
        Backbone,
        PopupTpl,
        CompanyStatuses,
        commonLang,
        attendanceLang,
        GO
    ) {
        var lang = {
            label_delete_status_term : attendanceLang['상태일괄삭제'],
            label_delete: commonLang['삭제'],
            label_cancel: commonLang['취소'],
            label_status: commonLang['상태'],
            label_select: commonLang['선택'],
            label_date: attendanceLang['날짜'],
            label_time: attendanceLang['시간'],
            label_delete_description: attendanceLang['등록된 상태를 선택하면 개별 삭제가 가능합니다.']
        };

        var PopupView = GO.BaseView.extend({
            tagName: 'table',
            className: 'form_type go_form_basic',
            initialize: function(params) {
                if (params || 0) {
                    this.firstDate = params.firstDate;
                    this.userid = params.userid;
                    this.option = params.option;
                }
                this.companyStatuses = new CompanyStatuses();
                this.companyStatuses.fetch({
                    async: false
                });
            },

            render: function() {
                var tpl = PopupTpl({
                    id: this.option,
                    status: this.companyStatuses.toJSON(),
                    lang: lang
                });
                this.$el.html(tpl);
                this.$el.find("#startDate").val(moment(this.firstDate.getLogDate()).format('YYYY-MM-DD'));
                this.$el.find("#endDate").val(moment(this.firstDate.getLogDate()).format('YYYY-MM-DD'));
                this.$el.find('#startDate').datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: false,
                    changeYear: false,
                    yearSuffix: "",
                    stepMonths: 0,
                    onSelect: function(selectedDate) {
                        $('#startDate').val(selectedDate);
                    }
                }).focus(function() {
                    $(".ui-datepicker-prev, .ui-datepicker-next").remove();
                });

                this.$el.find('#endDate').datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: false,
                    changeYear: false,
                    yearSuffix: "",
                    stepMonths: 0,
                    onSelect: function(selectedDate) {
                        $('#endDate').val(selectedDate);
                    }
                }).focus(function() {
                    $(".ui-datepicker-prev, .ui-datepicker-next").remove();
                });

                return this;
            },

            deleteStatusTermReqest: function() {
                var model = new Backbone.Model();
                var status = this.$el.find('#AttendStatusSelect option:selected');
                var statusType = status.attr('data-type'); //DATE, TIME, ''
                var statusId = status.attr('data-id'); //1 , 2 , ''
                var statusName = status.val(); //휴가, 외근, ''
                model.set('startDate', GO.util.toISO8601(moment(this.$el.find('#startDate').val(), 'YYYY-MM-DD')), {silent:true});
                model.set('endDate', GO.util.toISO8601(moment(this.$el.find('#endDate').val(), 'YYYY-MM-DD')), {silent:true});
                model.set('companyStatus', {'name' : statusName , 'type' : statusType, 'id' : statusId }, {silent:true});
                model.url = GO.contextRoot + 'api/ehr/attnd/user/' + this.userid + '/status/term';
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                model.save({},
                    {
                        type : 'DELETE',
                        success : function(model, resp) {
                            if(resp.code == '200') {
                                $.goMessage(commonLang['삭제되었습니다.']);
                                GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
                                GO.EventEmitter.trigger("attnd", "change:clockInOutStatusSide");
                            }
                        },
                        error: function(model, response) {
                            if(response.status == 403){
                                $.goMessage(commonLang['권한이 없습니다.']);
                            } else {
                                $.goMessage(response.responseJSON.message);
                            }
                        },
                        complete: function(model, response) {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        }
                    });
            }
        });
            return PopupView;
    });