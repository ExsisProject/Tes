define([
        "underscore",
        "backbone",
        "i18n!report/nls/report",
        "GO.util",
    ],

    function (
        _,
        Backbone,
        ReportLang
    ) {
        var ReportSeriesModel = Backbone.Model.extend({
            urlRoot: GO.contextRoot + "api/report/series/",
            closedAtBasicDate2: function () {
                return GO.util.basicDate2(this.get("closedAt"));
            },
            excludeReportsStr: function () {
                var str = [];

                if (this.hasExcludeReport()) {
                    $.each(this.get("exclusion"), function (index, data) {
                        str.push(data.name + " " + data.position);
                    });

                    return str.join(", ");
                } else {
                    return ReportLang["없음"];
                }

            },

            hasExcludeReport: function () {
                return this.get("exclusion").length > 0;
            },

            changeStatus: function (userId, targetStatus) {
                var reporter = this.findReporterByUserId(userId);

                if (reporter.status != targetStatus) {
                    //add new status
                    this.get(targetStatus).push(reporter.user);

                    //remove old status
                    this.get(reporter.status).splice(reporter.index, 1);

                    if (targetStatus == "dones") {
                        this.setDoneClickable(reporter.user);
                    } else {
                        this.setUndoneClickable(reporter.user);
                    }
                }

                reporter.status = targetStatus;
                return reporter;
            },
            /*
             * param : userId
             * return : {
             *      user : {id, name, position, reportId, action ....}
             *      status : done/undone/exclude
             *      index : done/undone/exclude array index
             * }
             */
            isUndoneReporter: function (userId) {
                var flag = false;
                $.each(this.get("undones"), function (index, data) {
                    if (data.id == userId) {
                        flag = true;
                        return false;
                    }
                });
                return flag;
            },
            isExistReport: function (reportId) {
                var statusArr = ["dones", "undones", "exclusion"],
                    returnFlag = false;

                _.each(statusArr, function (data) {
                    _.each(this.get(data), function (user) {
                        if (user.reportId == reportId) {
                            returnFlag = true;
                            return false;
                        }
                    }, this);
                    if (returnFlag) {
                        return false;
                    }
                }, this);
                return returnFlag;
            },
            findReporterByUserId: function (userId, status) {
                var statusArr = [],
                    returnData = {
                        status: "",
                        user: {},
                        index: ""
                    },
                    self = this,
                    breakFlag = false;

                if (status == undefined) {
                    statusArr = ["dones", "undones", "exclusion"];
                } else {
                    statusArr = [status];
                }

                $.each(statusArr, function (index, data) {
                    $.each(self.get(data), function (idx, user) {
                        if (user.id == userId) {

                            returnData.status = data;
                            returnData.user = user;
                            returnData.index = idx;

                            breakFlag = true;
                            return false;
                        }
                    });
                    if (breakFlag) {
                        return false;
                    }
                });
                return returnData;
            },
            isDoneClickable: function (actions) {
                return actions.readable == true;
            },
            isUndoneClickable: function (actions) {
                return actions.writable == true;
            },
            setDonesClickable: function () {
                var self = this;

                $.each(this.get("dones"), function (index, data) {
                    $.proxy(self.setDoneClickable(data), self);
                });
            },
            setDoneClickable: function (user) {
                user["isCommentCountShow"] = true;
                user["isWritable"] = false;
                user["isNewReport"] = false;

                if (GO.util.calDate(user.submittedAt, 'hours', 24) > GO.util.toISO8601(new Date())) { //최근 24시간 안에 작성된 보고
                    user["isNewReport"] = true;
                }

                if (this.isDoneClickable(user.actions)) {
                    user["isClickable"] = true;
                } else {
                    user["isPrivateShow"] = true;
                }
                return user;
            },
            setUndonesClickable: function () {
                var self = this;

                $.each(this.get("undones"), function (index, data) {
                    self.setUndoneClickable.call(self, data);
                });
            },
            setUndoneClickable: function (user) {
                user["isCommentCountShow"] = false;
                user["isWritable"] = false;

                if (this.isUndoneClickable(user.actions) && this.get("folder").status == "ACTIVE") {
                    user["isClickable"] = true;
                    user["isWritable"] = true;
                }

                return user;
            },
            getCompleteCount: function () {
                return this.get("dones").length;
            },
            getIncompleteCount: function () {
                return this.get("undones").length;
            },
            getCompleteUserName: function () {
                var userNames = [];
                $.each(this.get("dones"), function () {
                    userNames.push(this.name + " " + this.position);
                });
                return userNames.join(", ");
            },
            getIncompleteUserName: function () {
                var userNames = [];
                $.each(this.get("undones"), function () {
                    userNames.push(this.name + " " + this.position);
                });
                return userNames.join(", ");
            },
            isActive: function () {
                return this.get("folder").status == "ACTIVE";
            },
            isInactive: function () {
                return this.get("folder").status == "INACTIVE";
            },
            getSeriesStr: function () {
                var series = GO.util.parseOrdinaryNumber(this.get("series"), GO.config("locale"));
                return GO.i18n(ReportLang['제 {{arg1}}회차'], {"arg1": series});
            }
        }, {
            get: function (id) {
                var instance = new ReportSeriesModel();
                instance.set({"id": id}, {silent: true});
                instance.fetch({
                    async: false,
                    error: function (data, error) {
                        if (GO.util.isMobile()) {
                            GO.util.linkToErrorPage(error)
                        } else {
                            var _error = JSON.parse(error.responseText);
                            GO.util.error(_error.code, _error.code === "500" ? {} : {"msgCode": "400-report"})
                        }
                    }
                });

                instance.setDonesClickable();
                instance.setUndonesClickable();

                return instance;
            }
        });
        return ReportSeriesModel;
    });