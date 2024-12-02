define("timeline/views/user/history_popup", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var Tmpl = require("hgn!timeline/templates/user/history_popup_form");
    var CommonLang = require("i18n!nls/commons");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var HistoryModel = require("timeline/models/history");

    require("jquery.go-popup");

    var HistoryPopup = Backbone.View.extend({

        initialize: function () {
            this.targetUserId = this.options.targetUserId;
            this.dayInfo = this.options.dayInfo;
            this.historyId = this.options.historyId;
            this.data = this.options.data;
            this.isNew = _.isUndefined(this.data.id) ? true : false;
            console.log('day info : ' + this.dayInfo + ' userId : ' + this.targetUserId)
        },

        render: function () {
            var formView = new StatusFormView({
                targetUserId: this.targetUserId,
                dayInfo: this.dayInfo,
                data: this.data
            });
            var actions = getActions.call(this);
            var title = this.isNew ? TimelineLang["상태 등록"] : TimelineLang["상태 상세"];

            var popup = $.goPopup({
                header: title,
                pclass: "layer_normal layer_attend_status",
                modal: true,
                contents: formView.$el,
                buttons: actions
            });

            formView.render();
            popup.reoffset();

            function getActions() {
                var actions = [];

                if (!this.isNew) {
                    actions.push({
                        'btext': CommonLang["삭제"],
                        'btype': 'btn_caution_s',
                        'callback': _.bind(function (e) {
                            formView.delete();
                        }, this)
                    })
                }

                actions.push({
                        'btext': CommonLang["저장"],
                        'btype': 'confirm',
                        'callback': _.bind(function (e) {
                            formView.save();
                        }, this)
                    }
                    , {
                        'btext': CommonLang["취소"],
                        'btype': 'cancel',
                        'callback': function (e) {
                            popup.close();
                        }
                    });

                return actions;
            }
        }
    });

    var StatusCollection = Backbone.Collection.extend({
        url: GO.contextRoot + "api/timeline/status"
    });

    var MAX_HOUR = 24;
    var MAX_MINUTE = 60;
    var HOUR = _.range(0, MAX_HOUR).map(function (num) {
        return num < 10 ? "0" + num : num
    });
    var MINUTE = _.range(0, MAX_MINUTE).map(function (num) {
        return num < 10 ? "0" + num : num
    });

    var StatusFormView = Backbone.View.extend({
        events: {
            "click #isNightWork": "showNightWorkDescription",
        },
        initialize: function () {
            this.targetUserId = this.options.targetUserId;
            this.dayInfo = this.options.dayInfo;
            this.collection = new StatusCollection();
            this.collection.fetch()
                .done(_.bind(this.render, this));

            this.model = new HistoryModel(_.extend(this.options.data, {
                targetUserId: this.targetUserId,
                baseDate: this.dayInfo.day
            }));
        },

        render: function () {
            var self = this;
            this.$el.html(Tmpl({
                CommonLang: CommonLang,
                TimelineLang: TimelineLang,
                data: this.model.toJSON(),
                isNew: this.model.isNew(),
                status: this.collection.toJSON(),
                HOUR: HOUR,
                MINUTE: MINUTE,
                isSelected: function () {
                    if (self.model.isNew()) {
                        return false;
                    }

                    return self.model.getStatusId() == this.id;
                },
                isCheckTimeHour: function () {
                    return self.model.isCheckTimeHour(this);
                },
                isCheckTimeMinute: function () {
                    return self.model.isCheckTimeMinute(this);
                }

            }));
            this.initDatePicker();
        },

        initDatePicker: function () {
            var $datePicker = this.$el.find("#timelineDatePicker");
            if (this.model.get('isNightWork')) {
                $datePicker.val(this.model.checkTimeDate());
            } else {
                $datePicker.val(this.dayInfo.day);
            }
            $datePicker.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: ""
            });
        },

        getVariable: function () {
            var $el = this.$el;
            return {
                "checkTime": moment($el.find("#timelineDatePicker").val() + " " + $el.find("#checkTimeHour").val() + ":" + $el.find("#checkTimeMinute").val()).toISOString(),
                "content": $el.find("#content").val(),
                "reason": $el.find("#reason").val(),
                "isNightWork": $el.find("#isNightWork").is(':checked'),
                "timelineStatus": {id: $el.find("#status").val()}
            }
        },

        showNightWorkDescription: function () {
            this.$el.find("#nightWorkDescription").toggle();
        },


        save: function () {
            var isNew = this.model.isNew();
            if (!isNew) {
                var reason = this.$el.find("#reason").val();

                if (_.isEmpty(reason)) {
                    $.goError(TimelineLang["사유를입력해주세요"]);
                    throw new Error(TimelineLang["사유를입력해주세요"]);
                }
            }

            this.model.save(this.getVariable())
                .done(function () {
                    var message = CommonLang["저장되었습니다."];
                    if (!isNew) {
                        CommonLang["수정되었습니다."];
                    }
                    $.goMessage(message);
                    GO.EventEmitter.trigger("timeline", "change:data")
                })
                .fail(function (response) {
                    if (response.responseJSON && response.responseJSON.message) {
                        $.goMessage(response.responseJSON.message);
                    } else {
                        $.goMessage(CommonLang["저장에 실패 하였습니다."]);
                    }
                });
        },

        delete: function () {
            var reason = this.$el.find("#reason").val();

            if (_.isEmpty(reason)) {
                $.goError(TimelineLang["사유를입력해주세요"]);
                throw new Error(TimelineLang["사유를입력해주세요"]);
            }

            $.ajax({
                url: this.model.url(),
                data: JSON.stringify({reason: reason}),
                type: 'delete',
                async: true,
                dataType: 'json',
                contentType: "application/json",
                success: function () {
                    $.goMessage(CommonLang['삭제되었습니다.']);
                    GO.EventEmitter.trigger("timeline", "change:data")
                }
            });
        }
    });

    return HistoryPopup;
});