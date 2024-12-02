define(function (require) {
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var gotalkConfigTmpl = require("hgn!admin/templates/mobile_pcmessenger_gotalk_config");
    var emptyTmpl = require("hgn!admin/templates/list_empty");

    var MAX_HOUR = 24;
    var MAX_MINUTE = 60;

    require("jquery");
    require("jquery.go-grid");

    var ConfigView = Backbone.View.extend({
        events: {
            "click span#btn_ok": "_ConfigSave",
            "click span#btn_cancel": "_ConfigSaveCancel",
            "change input[data-type='maxUserCount']": "_numValidation",
        },

        initialize: function () {
            this.dataTable = null;
        },

        render: function () {
            this.$el.html(gotalkConfigTmpl({
                lang: {
                    "구매회의실개수": adminLang["구매 회의실 개수"],
                    "개": adminLang["개"],
                    "방이름안내": adminLang["방이름안내"],
                    "방이름": adminLang["방 이름"],
                    "참여인원안내": adminLang["참여인원안내"],
                    "참여자인원": adminLang["참여자 인원"],
                    "유효시간안내": adminLang["유효시간안내"],
                    "초대하기유효시간설정": adminLang["초대하기 유효시간 설정"],
                    "저장": commonLang["저장"],
                    "취소": commonLang["취소"]
                }
            }));
            this.renderRoomList();
        },

        HOUR: function (hr) {
            return _.range(0, MAX_HOUR).map(function (num) {
                return num < 10 ?
                    '<option' + (hr == num ? " selected " : " ") + 'value=' + "0" + num + '>' + "0" + num + "h" + '</option>' :
                    '<option' + (hr == num ? " selected " : " ") + 'value=' + num + '>' + num + "h" + '</option>'
            });

        },
        MINUTE: function (min) {
            return _.range(0, MAX_MINUTE).map(function (num) {
                return num < 10 ?
                    '<option' + (min == num ? " selected " : " ") + 'value=' + "0" + num + '>' + "0" + num + "m" + '</option>' :
                    '<option' + (min == num ? " selected " : " ") + 'value=' + num + '>' + num + "m" + '</option>'
            });
        },
        renderRoomList: function () {
            var self = this;
            if (this.dataTable != null) this.dataTable.tables.fnDestroy();

            this.dataTable = $.goGrid({
                el: self.$el.find("#roomList"),
                method: 'GET',
                url: GO.contextRoot + "ad/api/meeting/room",
                emptyMessage: emptyTmpl({
                    label_desc: adminLang["구매한 화상채팅방이 없습니다"]
                }),
                pageUse: false,
                sDomUse: false,
                columns: [
                    {
                        mData: "roomSeqName", sWidth: '80px', bSortable: false, fnRender: function (obj) {
                            return '<span class="roomSeqName" data-id="' + obj.aData.roomSeqName + '">' + (obj.iDataRow + 1) + '</span>';
                        }
                    },
                    {
                        mData: "title", sWidth: '400px', bSortable: false, fnRender: function (obj) {
                            return '<input data-type="title" class="w_full input titleInput" type="text" value="' + obj.aData.title + '">' +
                                '<p data-id="error" style="display: none" class="go_alert"></p>';
                        }
                    },
                    {
                        mData: "maxUserCount", sWidth: '200px', bSortable: false, fnRender: function (obj) {
                            return '<input data-type="maxUserCount" class="w_full input numInput" min=1 max=25 type="number" value=' + obj.aData.maxUserCount + '>' +
                                '<p data-id="error" style="display: none" class="go_alert"></p>';
                        }
                    },
                    {
                        mData: "validTime", sClass: "time", bSortable: false, fnRender: function (obj) {
                            var validTime = moment.duration(obj.aData.validTime);
                            var hour = validTime.hours();
                            var min = validTime.minutes();
                            return '<select data-type="validTimeH" class="attr_select" >' + self.HOUR(hour) + '</select>' +
                                '<select data-type="validTimeM" class="" value=' + min + '>' + self.MINUTE(min) + '</select>' +
                                '<p data-id="error" style="display: none" class="go_alert"></p>';
                        }
                    }
                ],
                fnDrawCallback: function (obj) {
                    if (!obj.isEmpty() && obj.find("tbody tr").length) {
                        self.$el.find('#totalNum').text(obj.find("tbody tr").length);
                    }
                }
            });
        },

        _ConfigSaveCancel: function (e) {
            var self = this;
            if(self._getMeetingRooms().length <= 0) {
                return false;
            }

            $.goMessage(commonLang["취소되었습니다."]);
            this.renderRoomList();
        },

        _getMeetingRooms: function () {
            var meetingRooms = [];

            this.dataTable.tables.fnGetNodes().forEach(function (row) {
                var meetingRoom = {};
                meetingRoom.title = $(row).find('td input.titleInput').val();
                meetingRoom.roomSeqName = $(row).find('td .roomSeqName').data('id');
                meetingRoom.maxUserCount = $(row).find('td input.numInput').val();
                var hour = $($(row).find('td.time option:selected')[0]).val();
                var min = $($(row).find('td.time option:selected')[1]).val();
                meetingRoom.validTime = (hour * 60 * 60 * 1000 + min * 60 * 1000);
                meetingRooms.push(meetingRoom);
            });
            return meetingRooms;
        },

        _titleValidation: function () {
            var valid = true;
            _.each(this.$el.find('input[data-type="title"]'), function (input) {
                var target = $(input);
                if (target.val().length < 2 || target.val().length > 20) {
                    target.parent().find('p').text(adminLang["2자 이상 20자 이하 입력 해주세요"]).show();
                    valid = false;
                } else {
                    target.parent().find('p').text("").hide();
                }
            })
            return valid;
        },

        _numValidation: function (e) {
            var target = $(e.currentTarget);
            if (!(target.val() >= 1 && target.val() <= 25)) {
                target.val(1);
            } else {
                target.parent().find('p').text("").hide();
            }
        },

        _validTimeValidation: function () {
            var valid = true;
            _.each(this.$el.find('select[data-type="validTimeH"]'), function (input) {
                var target = $(input);
                var h = target.closest('tr').find('[data-type=validTimeH]').find('option:selected').val();
                var m = target.closest('tr').find('[data-type=validTimeM]').find('option:selected').val();

                if (h <= 0 && m <= 0) {
                    target.parent().find('p').text(adminLang["1분 이상 시간을 설정해주세요"]).show();
                    valid = false;
                } else {
                    target.parent().find('p').text("").hide();
                }
            })
            return valid;
        },

        _ConfigSave: function (e) {
            var self = this;
            var titleValidation = self._titleValidation();
            var validTimeValidation = self._validTimeValidation();

            if(self._getMeetingRooms().length <= 0) {
                return false;
            }

            if (!titleValidation || !validTimeValidation) {
                return;
            }
            $.ajax({
                url: GO.contextRoot + "ad/api/meeting/rooms",
                type: 'PUT',
                data: JSON.stringify(self._getMeetingRooms()),
                dataType: 'json',
                contentType: 'application/json'
            }).success(function (data) {
                $.goMessage(commonLang["저장되었습니다."]);
            }).fail(function (data) {
                if (data.message) $.goAlert(data.message);
                else $.goMessage(commonLang["실패했습니다."]);
            }).done(function (data) {
                self.renderRoomList();
            });
        },

    });

    return ConfigView;
});