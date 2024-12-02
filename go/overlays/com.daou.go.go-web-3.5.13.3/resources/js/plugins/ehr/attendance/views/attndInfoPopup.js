define([
        "backbone",
        "hgn!attendance/templates/popup",
        "app"
    ],

    function(
        Backbone,
        PopupTpl,
        GO
    ) {
        var PopupView = GO.BaseView.extend({
            tagName: 'table',
            className: 'form_type go_form_basic',
            initialize: function(params) {
                if (params || 0) {
                    this.record = params.record;
                    this.action = params.action; // 'attndinfo'
                    this.option = params.option; // ex: statusId 값, in, out
                }
            },
            render: function() {
                var tpl = PopupTpl({
                    isInfoAction : this.action == 'attndinfo',
                    ip : this.option == 'in' ? this.record.getUserClockInIP() : this.record.getUserClockOutIP(),
                    gps : this.option == 'in' ? this.record.getUserClockInGPS() : this.record.getUserClockOutGPS(),
                    hasGps : this.option == 'in' ? this.record.getUserClockInGPS().indexOf('null') == -1 : this.record.getUserClockOutGPS().indexOf('null') == -1
                });
                this.$el.html(tpl);
                return this;
            }
        });

        return PopupView;
    });