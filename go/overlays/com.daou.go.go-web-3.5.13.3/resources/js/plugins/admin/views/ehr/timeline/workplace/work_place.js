define('admin/views/ehr/timeline/workplace/work_place', function (require) {
    var Backbone = require("backbone");

    require("jquery.go-orgslide");
    require("jquery.go-grid");
    require("jquery.go-sdk");
    require("go-map");
    var WorkPlaceTmpl = require('hgn!admin/templates/ehr/timeline/workplace/work_place');
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var WorkPlaceModel = require("admin/models/ehr/timeline/work_place");
    var AccessIpsInfoView = require("admin/views/ehr/timeline/ip/access_allow_info");
    var AccessGpsEditView = require("admin/views/ehr/timeline/gps/edit");
    var AccessBeaconsInfoView = require("admin/views/ehr/timeline/beacon/access_allow_info");

    var WorkPlaceView = Backbone.View.extend({
        id: 'workPlace',
        className: "wrap_container_right",
        events : {
            "click #btn_save" : "save",
            "click #btn_cancel" : "cancel",
            "keyup input" : "update"
        },

        initialize : function (options) {
            this.removed = false;
            this.updated = false;
            if (options.workPlace) {
                this.workPlace = options.workPlace;
            } else {
                this.workPlace = new WorkPlaceModel();
            }
        },

        render : function () {
            this.$el.html(WorkPlaceTmpl({
                adminLang : AdminLang,
                commonLang : CommonLang,
                model : this.workPlace
            }));

            this.createAccessIpsInfoView();
            this.createAccessGpsEditView();
            this.createAccessBeaconsInfoView();
        },

        createAccessIpsInfoView : function () {
            this.accessIpsInfoView = new AccessIpsInfoView({
                el : '#accessIpsInfoView',
                workPlace : this.workPlace
            });
            this.accessIpsInfoView.render();
        },

        createAccessGpsEditView : function () {
            var self = this;
            self.accessGpsEditView = new AccessGpsEditView({
                el : '#accessGpsEditView',
                workPlace : this.workPlace
            });

            GO.util.kakaoMap.scriptLoad(function() {
                kakao.maps.load(function () {
                    self.accessGpsEditView.render();
                })
            }, function() {
                self.accessGpsEditView.notSupportViewRender();
            });
        },

        createAccessBeaconsInfoView : function () {
            this.accessBeaconsInfoView = new AccessBeaconsInfoView({
                el : '#accessBeaconsInfoView',
                workPlace : this.workPlace
            });

            this.accessBeaconsInfoView.render();
        },

        update : function(e) {
            this.updated = true;
        },

        isUpdated : function() {
            return this.updated
                || this.accessGpsEditView.updated
                || this.accessIpsInfoView.updated
                || this.accessBeaconsInfoView.updated;
        },

        saved : function() {
            this.updated = false;
            this.accessGpsEditView.saved();
            this.accessIpsInfoView.saved();
            this.accessBeaconsInfoView.saved();
        },

        cancel : function() {
            $.goMessage(CommonLang["취소되었습니다."]);
            this.updated = false;
            this.render();
        },

        save : function() {
            var self = this;
            var name = $('#workPlaceName').val();

            if (!this.validate()) {
                return;
            }
            this.workPlace.set('name', name);

            this.setWorkPlace();
            return this.workPlace.save({}, {
                success : function(response) {
                    $.goMessage(CommonLang["저장되었습니다."]);
                    self.$el.trigger('addComplete', self.workPlace);
                    self.$el.trigger('activeWorkPlace', self.workPlace);
                    self.saved();
                },
                error : function(model, response) {
                    if (response && response.responseJSON && response.responseJSON.message) {
                        $.goMessage(response.responseJSON.message);
                    } else {
                        $.goMessage(CommonLang["저장에 실패 하였습니다."]);
                    }
                }
            });
        },

        validate : function() {
            if (!$('#workPlaceName').val()) {
                $.goMessage(AdminLang['근무지 이름을 입력해주세요']);
                return false;
            } else if(!this.accessIpsInfoView.isCheckedUseIp()
                && !this.accessGpsEditView.isCheckedUseGps()
                && !this.accessBeaconsInfoView.isCheckedUseBeacon()) {
                $.goMessage(AdminLang["근태수단 정보 선택 알림"]);
                return false;
            } else if (!this.accessGpsEditView.validate()) {
                return false;
            }
            return true;
        },

        setWorkPlace : function() {
            var gpsModel = this.accessGpsEditView.getGpsModel();
            var gpsModels = new Array();
            if (gpsModel) {
                gpsModels = new Array(gpsModel);
            }
            this.workPlace.set('useIp', this.accessIpsInfoView.isCheckedUseIp());
            this.workPlace.set('useGps', this.accessGpsEditView.isCheckedUseGps());
            this.workPlace.set('useBeacon', this.accessBeaconsInfoView.isCheckedUseBeacon());
            this.workPlace.set('ipModels', this.accessIpsInfoView.ipModels);
            this.workPlace.set('gpsModels', gpsModels);
            this.workPlace.set('beaconModels', this.accessBeaconsInfoView.beaconModels);
        },

        remove : function () {
            Backbone.View.prototype.remove.apply(this, arguments);
            this.accessIpsInfoView.remove();
            this.accessGpsEditView.remove();
            this.accessBeaconsInfoView.remove();
        },

        isRemoved : function () {
            return this.removed;
        }
    });
    return WorkPlaceView;
});