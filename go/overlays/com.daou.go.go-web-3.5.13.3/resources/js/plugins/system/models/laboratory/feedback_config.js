define(function (require) {
    var $ = require('jquery');
    var Backbone = require('backbone');
    var GO = require('app');

    require('GO.util');

    var DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssZ';
    var DISPLAY_DATE_FORMAT = 'YYYY-MM-DD';

    return Backbone.Model.extend({
        urlRoot: GO.contextRoot + "ad/api/laboratory/feedback/config",

        initialize: function () {
            this.oldUseConfig = false;
        },

        setData: function () {
            var startDate = GO.util.toMoment(new Date()).format(DATE_FORMAT);
            var endDate = GO.util.toMoment(startDate).add('days', +7).format(DATE_FORMAT);

            this.set({
                title: "",
                serverVersion: "",
                startDate: startDate,
                endDate: endDate,
                useConfig: false,
                simpleTitle: "",
                simpleDesc: ""
            });
        },

        getOldUseConfig: function () {
            return this.oldUseConfig;
        },

        setOldUseConfig: function (useConfig) {
            this.oldUseConfig = useConfig;
        },

        getDisplayStartDate: function () {
            var mdate = moment(this.get("startDate"), DISPLAY_DATE_FORMAT);
            return mdate.format(DISPLAY_DATE_FORMAT);
        },

        getDisplayEndDate: function () {
            var mdate = moment(this.get("endDate"), DISPLAY_DATE_FORMAT);
            return mdate.format(DISPLAY_DATE_FORMAT);
        },

        convertToSaveDate: function (date, hh, mm) {
            return GO.util.toMoment(date).hour(hh).minute(mm).format(DATE_FORMAT);
        },

    });
});