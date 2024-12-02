define([
        "backbone",
        "i18n!report/nls/report",
        "GO.util"

    ],

    function (
        Backbone,
        ReportLang
    ) {
        var Report = Backbone.Model.extend({
            urlRoot: GO.contextRoot + "api/report",
            save: function (attrs, options) {
                if (Report.__lockFlag__) {
                    return;
                }
                ajaxBeforeSend = options.hasOwnProperty('beforeSend') ? options.beforeSend : function () {
                };
                ajaxComplete = options.hasOwnProperty('complete') ? options.complete : function () {
                };

                options.beforeSend = function () {
                    ajaxBeforeSend.apply(undefined, arguments);
                    Report.__lockFlag__ = true;
                };

                options.complete = function () {
                    ajaxComplete.apply(undefined, arguments);
                    Report.__lockFlag__ = false;
                }
                return Backbone.Model.prototype.save.call(this, attrs, options);
            },
            submittedAtBasicDate: function () {
                return GO.util.basicDate(this.get("submittedAt"));
            },
            createdAtBasicDate: function () {
                return GO.util.basicDate(this.get("createdAt"));
            },
            attachesCount: function () {
                return this.get("attaches").length;
            },
            setAttacheUrl: function () {
                var reportId = this.get("id");

                $.each(this.get("attaches"), function () {
                    this.url = GO.contextRoot + "api/report/" + reportId + "/download/" + this.id;
                });
            },
            setAttacheSizeByKb: function () {
                $.each(this.get("attaches"), function () {
                    this.sizeByKb = GO.util.getHumanizedFileSize(this.size);
                });
            },
            attachesSize: function () {
                var attaches = this.get("attaches"),
                    totalSize = 0;

                if (attaches.length == 0) {
                    return totalSize;
                } else {
                    $.each(attaches, function (index, data) {
                        totalSize += parseFloat(data.size);
                    });
                    return totalSize;
                }
            },
            getSeriesStr: function () {
                var series = GO.util.parseOrdinaryNumber(this.get("series").series, GO.config("locale"));
                return GO.i18n(ReportLang['제 {{arg1}}회차'], {"arg1": series});
            }
        }, {
            init: function () {
                return new Report();
            },
            get: function (id, refresh) {
                var instance = new Report();
                instance.set({"id": id}, {silent: true});
                instance.fetch({
                    async: false,
                    error: function (data, error) {
                        if (GO.util.isMobile()) {
                            GO.util.linkToErrorPage(error);
                        } else {
                            var _error = JSON.parse(error.responseText);
                            GO.util.error(_error.code, _error.code === "500" ? {} : {"msgCode": "400-report"})
                        }
                    }
                });
                instance.setAttacheUrl();
                return instance;
            },
            __lockFlag__: false
        });
        return Report;
    });