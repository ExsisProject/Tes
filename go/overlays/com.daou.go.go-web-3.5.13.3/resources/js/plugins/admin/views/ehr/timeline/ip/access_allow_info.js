define("admin/views/ehr/timeline/ip/access_allow_info", function (require) {
    require("jquery.go-orgslide");
    require("jquery.go-grid");
    require("jquery.go-sdk");
    var IpInfoTmpl = require('hgn!admin/templates/ehr/timeline/ip/access_allow_info');
    var IpEditTmpl = require("hgn!admin/templates/ehr/timeline/ip/edit");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var IpInfoView = Backbone.View.extend({

        lang : {
            label_access_allow_ip_info : AdminLang["접속 허용 IP"],
            label_ip_name : AdminLang["접속 IP 이름"],
            label_ip : AdminLang["IP"],
            label_use : AdminLang["사용"],
            label_not_use : AdminLang["사용안함"],
            label_save : CommonLang["저장"],
            label_cancel : CommonLang["취소"],
            label_add : CommonLang["추가"],
            label_delete : CommonLang["삭제"],
            label_description : AdminLang["설명"],
            ips_empty_message : AdminLang['등록된 접속 허용 IP가 없습니다.'],
            label_all : CommonLang["모두 허용"],
            label_part : CommonLang["부분 허용"],
        },

        events : {
            "click #accessIpAddBtn" : "addAccessIp",
            "click .ip_model" : "modifyAccessIp",
            "click .ip_del_btn" : "delAccessIp",
            "click .title_sort" : "onSortClicked",
            "click #allOfIp" : "toggleIpInfo",
            "click #partOfIp" : "toggleIpInfo",
        },

        initialize : function (options) {
            this.workPlace = options.workPlace;
            this.useIp = this.workPlace.get('useIp');
            if (!this.workPlace.get('ipModels')) {
                this.ipModels = new Array();
            } else {
                this.ipModels = this.workPlace.get('ipModels').slice();
            }
            this.updated = false;
        },

        render : function() {
            this.$el.html(IpInfoTmpl({
                adminLang : AdminLang,
                commonLang : CommonLang,
                lang : this.lang,
                ipModels : this.ipModels,
                useIp : this.useIp,
            }));
        },

        toggleIpInfo : function (e) {
            if ($(e.currentTarget).val() === 'all')
                this.$el.find("#accessIpsContainer").css('display', 'none');
            else
                this.$el.find("#accessIpsContainer").css('display', '');
        },

        addAccessIp : function(e) {
            this.updated = true;
            this._callPopupEditIp();
        },

        modifyAccessIp : function(e) {
            this.updated = true;
            this._callPopupEditIp($(e.currentTarget), true);
        },

        delAccessIp : function(e) {
            var callback = function() {
                var ipName = $(e.currentTarget).attr("data-name");
                var ipRange = $(e.currentTarget).attr("data-range");
                this.ipModels.splice(this.ipModels.findIndex(function (item) {
                    return item.ipName === ipName && item.ipRange === ipRange;
                }), 1);
                this.refresh();
                this.updated = true;
            };

            $.goPopup({
                title: AdminLang["선택한 IP 삭제 알림"],
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

        isCheckedUseIp : function() {
            return this.$el.find('#partOfIp').prop('checked');
        },

        _callPopupEditIp : function($target, isModify) {
            var ipModel = {};
            if (isModify) {
                var id = $target.data('id');
                var name = $target.data('name');
                var ipRange = $target.data('range');
                var selectedIp = this.ipModels.find(function(item) {
                    if (id) {
                        return id == item.id;
                    }
                    return item.ipName == name && item.ipRange == ipRange
                });
                ipModel = selectedIp;
                var range = ipModel.ipRange.split("-");
                ipModel.ip1=range[0].split(".")[0];
                ipModel.ip2=range[0].split(".")[1];
                ipModel.ip3=range[0].split(".")[2];
                ipModel.ip4=range[0].split(".")[3];
                ipModel.ip5=range[1];
            }

            var self = this,
                TmplCode = IpEditTmpl({
                    adminLang : AdminLang,
                    commonLang : CommonLang,
                    model : ipModel,
                });

            this.editPopup = $.goPopup({
                pclass : 'layer_normal layer_ehr_kind',
                header : id == null ? AdminLang["접속 허용 IP 추가"] : AdminLang["접속 허용 IP 수정"],
                modal : true,
                width : '320px',
                contents : TmplCode,
                buttons : [{
                    btext : CommonLang["저장"],
                    btype : "confirm",
                    autoclose : false,
                    callback : function(popupEl) {

                        var validate = true;
                        var form = $('#accessIpEditBlock');

                        var ipName = form.find("#ipName").val();
                        var description = form.find("#ipDescription").val();

                        var ip1 = form.find("#ip1").val(),
                            ip2 = form.find("#ip2").val(),
                            ip3 = form.find("#ip3").val(),
                            ip4 = form.find("#ip4").val(),
                            ip5 = form.find("#ip5").val();

                        self.initAlertEl();
                        if(!$.goValidation.isCheckLength(2,10,ipName)){
                            validate = false;
                            form.find('#ipNameAlert').html(GO.i18n(AdminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"10"}));
                            form.find('#ipName').focus();
                        }else if(!$.goValidation.isNumber(ip1) || !$.goValidation.isNumber(ip2) || !$.goValidation.isNumber(ip3)
                            || !$.goValidation.isNumber(ip4) || !$.goValidation.isNumber(ip5)) {
                            validate = false;
                            form.find('#ipAlert').html(AdminLang['숫자만 입력하세요.']);
                        }else if((ip1 < 0 || ip1 > 255) || (ip2 < 0 || ip2 > 255) || (ip3 < 0 || ip3 > 255)
                            || (ip4 < 0 || ip4 > 255) || (ip5 < 0 || ip5 > 255)){
                            validate = false;
                            form.find('#ipAlert').html("0~255 사이의 값을 입력해주세요.");
                        }
                        var ipRange = ip1 + "." + ip2 + "." + ip3 + "." + ip4 + "-" + ip5;

                        self.ipModels.filter(function (value) { return value != ipModel })
                            .forEach(function (value) {
                                if (ipName == value.ipName) {
                                    form.find('#ipNameAlert').html(AdminLang["중복된 이름이 존재합니다."]);
                                    validate = false;
                                }
                            });

                        if(!validate){
                            return false;
                        }

                        ipModel.ipName = ipName;
                        ipModel.ipRange = ipRange;
                        ipModel.description = description;

                        if(!isModify) {
                            self.ipModels.push(ipModel);
                        }
                        self.useIp = self.isCheckedUseIp();
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
            var block = $('#accessIpEditBlock');
            block.find("#ipAlert").html("");
            block.find("#ipNameAlert").html("");
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

        onSortClicked : function(e) {
            var sortKey = $(e.currentTarget).data('sortkey');
            var desc = sortKey == this.sortKey ? !this.desc : false;
            this.sortKey = sortKey;
            this.desc = desc;
            this.sortIps(sortKey, desc);
            this.refresh();
        },

        saved : function() {
            this.updated = false;
        },

        sortIps : function (sortKey, desc) {
            this.ipModels.sort(function (a, b) {
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

    return IpInfoView;
});