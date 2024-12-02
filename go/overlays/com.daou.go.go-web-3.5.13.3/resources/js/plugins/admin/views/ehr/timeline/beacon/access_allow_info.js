define("admin/views/ehr/timeline/beacon/access_allow_info", function (require) {
    require("jquery.go-orgslide");
    require("jquery.go-grid");
    require("jquery.go-sdk");
    var BeaconInfoTmpl = require('hgn!admin/templates/ehr/timeline/beacon/access_allow_info');
    var BeaconEditTmpl = require("hgn!admin/templates/ehr/timeline/beacon/edit");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var BeaconInfoView = Backbone.View.extend({
        lang : {
            label_all : CommonLang["모두 허용"],
            label_part : CommonLang["부분 허용"],
        },
        events : {
            "click #beaconAddBtn" : "addAccessBeacon",
            "click .beacon_del_btn" : "delAccessBeacon",
            "click .beacon_model" : "modifyAccessBeacon",
            "click .title_sort" : "onSortClicked",
            "click #allOfBeacon" : "toggleBeaconInfo",
            "click #partOfBeacon" : "toggleBeaconInfo",
        },

        initialize : function (options) {
            this.workPlace = options.workPlace;
            this.useBeacon = this.workPlace.get('useBeacon');
            this.beaconModels = this.workPlace.get('beaconModels');
            if (!this.workPlace.get('beaconModels')) {
                this.beaconModels = new Array();
            } else {
                this.beaconModels = this.workPlace.get('beaconModels').slice();
            }
            this.updated = false;
        },

        render : function() {
            this.$el.html(BeaconInfoTmpl({
                adminLang : AdminLang,
                commonLang : CommonLang,
                lang : this.lang,
                beaconModels : this.beaconModels,
                useBeacon : this.useBeacon
            }));
        },

        saved : function() {
            this.updated = false;
        },

        toggleBeaconInfo : function(e) {
            if ($(e.currentTarget).val() === 'all') {
                this.$el.find("#accessBeaconsContainer").css('display', 'none');
            } else {
                this.$el.find("#accessBeaconsContainer").css('display', '');
            }
        },

        addAccessBeacon : function (e) {
            this.updated = true;
            this._callPopupEditBeacon()
        },

        modifyAccessBeacon : function(e) {
            this.updated = true;
            this._callPopupEditBeacon($(e.currentTarget), true);
        },

        delAccessBeacon : function(e) {
            var callback = function() {
                var location = $(e.currentTarget).attr("data-location");
                var uuid = $(e.currentTarget).attr("data-uuid");
                this.beaconModels.splice(this.beaconModels.findIndex(function (item) {
                    return item.uuid === uuid && item.location === location;
                }), 1);
                this.refresh();
                this.updated = true;
            };

            $.goPopup({
                title: AdminLang["선택한 비콘 삭제 알림"],
                modal: true,
                buttons: [{
                    btype: 'confirm',
                    btext: CommonLang["삭제"],
                    callback: $.proxy(callback, this)
                }, {
                    btype: 'close', btext: CommonLang["취소"]
                }]
            });
            e.stopPropagation();
        },

        isCheckedUseBeacon : function() {
            return this.$el.find('#partOfBeacon').prop('checked');
        },

        _callPopupEditBeacon : function($target, isModify) {
            var beaconModel = {};
            if (isModify) {
                var id = $target.data('id');
                var location = $target.data('location');
                var uuid = $target.data('uuid');
                var selectedBeacon = this.beaconModels.find(function(item) {
                    if(id) {
                        return item.id == id
                    }
                    return location == item.location && uuid == item.uuid;
                });
                beaconModel = selectedBeacon;
            }
            var self = this,
                TmplCode = BeaconEditTmpl({
                    adminLang : AdminLang,
                    commonLang : CommonLang,
                    model : beaconModel
                });

            this.editPopup = $.goPopup({
                pclass : 'layer_normal layer_ehr_kind',
                header : id == null ? AdminLang["접속 허용 비콘 추가"] : AdminLang["접속 허용 비콘 수정"],
                modal : true,
                width : '320px',
                contents : TmplCode,
                buttons : [{
                    btext : CommonLang["저장"],
                    btype : "confirm",
                    autoclose : false,
                    callback : function(popupEl) {

                        var validate = true;
                        var block = $('#accessBeaconBlock');

                        var beaconLocation = block.find("#beaconLocation").val();
                        var beaconUuid = block.find("#beaconUuid").val();
                        var beaconMajor = block.find("#beaconMajor").val();
                        var beaconMinor = block.find("#beaconMinor").val();
                        var description = block.find("#beaconDescription").val();

                        self.initAlertEl();

                        var regType = /^[A-Za-z0-9+]*$/;
                        if (!beaconLocation) {
                            block.find('#beaconLocationAlert').html(AdminLang['설치장소를 입력해주세요']);
                            return false;
                        } else if (!beaconUuid) {
                            block.find('#beaconUuidAlert').html(AdminLang['UUID를 입력해주세요']);
                            return false;
                        } else if(!regType.test(beaconUuid)) {
                            block.find('#beaconUuidAlert').html(AdminLang['영어,숫자만 입력 가능']);
                            return false;
                        } else if (!beaconMajor) {
                            block.find('#beaconMajorAlert').html(AdminLang['Major 값을 입력해주세요']);
                            return false;
                        } else if (beaconMajor < 1 || beaconMajor > 65335) {
                            block.find('#beaconMajorAlert').html(AdminLang['1~65335 사이의 값을 입력해주세요']);
                            return false;
                        } else if (!beaconMinor) {
                            block.find('#beaconMinorAlert').html(AdminLang['Minor 값을 입력해주세요']);
                            return false;
                        } else if (beaconMinor < 1 || beaconMinor > 65335) {
                            block.find('#beaconMinorAlert').html(AdminLang['1~65335 사이의 값을 입력해주세요']);
                            return false;
                        }

                        self.beaconModels.filter(function (value) { return value != beaconModel })
                            .forEach(function (value) {
                                if (beaconLocation == value.location) {
                                    block.find('#beaconLocationAlert').html(AdminLang["중복된 이름이 존재합니다."]);
                                    validate = false;
                                    return;
                                }
                                if (beaconUuid == value.uuid) {
                                    block.find('#beaconUuidAlert').html(AdminLang["중복된 UUID가 존재합니다"]);
                                    validate = false;
                                    return;
                                }

                            });

                        if (!validate) {
                            return false;
                        }

                        beaconModel.location = beaconLocation;
                        beaconModel.description = description;
                        beaconModel.uuid = beaconUuid;
                        beaconModel.major = beaconMajor;
                        beaconModel.minor = beaconMinor;

                        if (!isModify) {
                            self.beaconModels.push(beaconModel);
                        }
                        self.useBeacon = self.isCheckedUseBeacon();
                        self.refresh();
                        popupEl.close();
                    }
                },{
                    btext : CommonLang["취소"],
                    btype : "cancel"
                }]
            }, this);

        },

        initAlertEl : function() {
            var block = $('#accessBeaconBlock');
            block.find('#beaconLocationAlert').html("");
            block.find('#beaconUuidAlert').html("");
            block.find('#beaconMajorAlert').html("");
            block.find('#beaconMinorAlert').html("");
        },

        refresh : function() {
            this.remove();
            this.render();
            this.delegateEvents();
        },

        remove : function () {
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.$el.html("");
        },

        onSortClicked : function (e) {
            var sortKey = $(e.currentTarget).data('sortkey');
            var desc = sortKey == this.sortKey ? !this.desc : false;
            this.sortKey = sortKey;
            this.desc = desc;
            this.sortBeacons(sortKey, desc);
            this.refresh();
        },

        sortBeacons : function (sortKey, desc) {
            this.beaconModels.sort(function (a, b) {
                var val = 0;
                if (!a[sortKey] && b[sortKey]) {
                    val = -1;
                } else if (a[sortKey] && !b[sortKey]) {
                    val = 1;
                } else if (a[sortKey] > b[sortKey]) {
                    val = 1;
                } else if (a[sortKey] < b[sortKey]) {
                    val = -1;
                }

                return desc ? -(val) : val;
            });
        }
    });

    return BeaconInfoView;
});