define(function(require) {

    var Backbone = require("backbone");
    var Tpl = require("hgn!admin/templates/ip_access_config");
    var IpListPoupupTpl = require("hgn!admin/templates/ip_list_import_popup");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");
    require("jquery.filedownload");
    require("jquery.fileupload");

    return Backbone.View.extend({

        el : '#ipAccessConfig',

        events : {
            "click #addBtn" : "onAddBtnClicked",
            "click #delBtn" : "onDelBtnClicked",
            "click #exportBtn" : "onExportBtnClicked",
            "click #importBtn" : "onImportBtnClicked",
            "click #searchBtn" : "onSearchBtnClicked",
            "click #saveBtn" : "onSaveBtnClicked",
            "click #cancelBtn" : "onCancelBtnClicked",
            "click #ipListSelectBox option" : "onIpListSelected",
            "change #ipInputType" : "onIpInputTypeChanged",
            "change .webAccessType" : "onWebAccessTypeChanged",
            "keyup .inputStr" : "onKeyUpInInputBox"
        },

        initialize : function() {
            this.bindCtrlKeyEvent();
        },

        render : function() {
            var _self = this;
            this.$el.html(Tpl({
                adminLang : AdminLang,
                commonLang : CommonLang
            }));

            $.ajax({
                url : GO.contextRoot + 'ad/api/access/site/config',
                type : 'GET',
            }).done(function(response) {

                (function __asyncRenderWebAccessType() {
                    var webAccessType = response.data.webAccessType;

                    _self.$el.find('.webAccessType').prop('checked', false);
                    _self.$el.find('.webAccessType[data-type="' + webAccessType + '"]').prop('checked', true);

                    if (webAccessType != 'ALL') {
                        _self.$el.find('#ipAccessConfigDetailOption').show();
                    }
                })();

                (function __asyncRenderAllowedIps(){
                    var allowedIps = response.data.allowedIps;

                    _.each(allowedIps, function (allowedIp) {
                        var strArr = allowedIp.split(":");
                        var type = strArr[0];
                        var ip = strArr[1];
                        _self.appendAllowedIp(type, ip);
                    })
                })();

            });
        },

        bindCtrlKeyEvent : function() {
            $(document).keyup($.proxy(this.onCtrlKeyUp, this));
            $(document).keydown($.proxy(this.onCtrlKeyDown, this));
        },

        onCtrlKeyUp : function(e) {
            var _self = this;
            if(e.keyCode === 17) {
                _self.ctrlKeyIsDown = false;
            }
        },

        onCtrlKeyDown : function(e) {
            var _self = this;
            if(e.keyCode === 17) {
                _self.ctrlKeyIsDown = true;
            }
        },

        onKeyUpInInputBox : function(e) {
            var target = $(e.currentTarget);
            var hasNext = target.hasClass('inputStr') && !target.hasClass('inputStrEnd');
            var isFullFill = target.val().length > 2;
            if (hasNext && isFullFill) {
                target.next().next().focus();
            }
        },

        onAddBtnClicked : function() {
            var ipInputArea = $('.ipInputArea:visible');
            var type = ipInputArea.data('type');

            var ip = _.chain(ipInputArea.find('.inputStr'))
                .map(function __getElementValue(element) {
                    return $(element).is('input') ? $(element).val() : $(element).text();
                })
                .map(function __removeLeftZero(str) {
                    return str == 0 ? 0 : str.replace(/(^0+)/, "");
                })
                .value()
                .join("");

            if (!this.validateIpPattern(type, ip)) {
                $.goMessage(AdminLang['유효하지 않은 IP 형식입니다.']);
                return;
            }

            this.appendAllowedIp(type, ip);
        },

        onDelBtnClicked : function() {
            var selectedIpList = $('#ipListSelectBox option:selected');
            return _.forEach(selectedIpList, function removeIpElement(ipOption) {
                $(ipOption).remove();
            });
        },

        onExportBtnClicked : function() {
            var url = GO.contextRoot + 'ad/api/access/site/config/export';
            $.fileDownload(url, {
                httpMethod: "POST",
                data : { allowedIps : this.getAllowedIps().join() }
            });
        },

        onImportBtnClicked : function() {
            var self = this;
            (function __popupImportLayout() {
                $.goPopup({
                    title : AdminLang['IP 목록 가져오기'],
                    contents : IpListPoupupTpl({ adminLang : AdminLang }),
                    buttons : [{
                        btype : 'confirm',
                        btext: CommonLang["추가"],
                        callback: $.proxy(self.importIpAccessList, self)
                    }, {
                        btype : 'close', btext: CommonLang['취소']
                    }]
                });
            })();

            (function __bindFileUploadEvent() {
                $('#fileupload').fileupload({
                    url: GO.contextRoot + 'ad/api/access/site/config/import',
                    dataType: 'json',
                    singleFileUploads: true,
                    add : function(e, data) {
                        var fileName = data.originalFiles[0].name;
                        var fileExt = fileName.substring(fileName.lastIndexOf('.'), fileName.length);

                        if (fileExt != '.txt') {
                            $.goMessage(CommonLang["첨부할 수 없는 파일 입니다."]);
                            return;
                        }
                        $('#importFileName').val(fileName);
                        data.paramName = 'file';
                        data.submit();
                    },
                    done : function(e, data) {
                        if (data.result && data.result.data) {
                            var ipList = data.result.data;
                            _.each(ipList, function(ipStr) {
                                var ipStrArr = ipStr.split(':');
                                var element = '<option value="' + ipStr + '">' + ipStrArr[1] + '</option>';
                                $('#importedIpListArea').html();
                                $('#importedIpListArea').append(element);
                            })
                        }
                    },
                    fail : function() {
                        $.goMessage(AdminLang["요청 처리 중 오류가 발생하였습니다."]);
                    }
                });
            })();
        },

        importIpAccessList : function() {
            var self = this;
            _.each($('#importedIpListArea option'), function appendImportedIp(element) {
                var type = $(element).val().split(':')[0];
                var ip = $(element).text();
                if(self.validateIpPattern(type, ip)) {
                    self.appendAllowedIp(type, ip);
                }
            });
        },

        onSearchBtnClicked : function() {
            var searchVal = this.$el.find('#searchInput').val();
            if (searchVal) {
                var ipList = $('#ipListSelectBox option');
                ipList.prop('selected', false);

                _.forEach(ipList, function searchIp(ipEl) {
                    var ip = $(ipEl).val();
                    if (ip.includes(searchVal)) {
                        $(ipEl).prop('selected', true);
                    }
                })
            }
        },

        onIpListSelected : function(e) {
            if (!this.ctrlKeyIsDown) {
                $('#ipListSelectBox option').prop('selected', false);
            }
            $(e.currentTarget).prop('selected', true);
        },

        onIpInputTypeChanged : function(e) {
            var type = $(e.currentTarget).find('option:selected').data('type');

            this.$el.find('.ipInputArea').hide();
            // 디자인이슈로 inline-block처리를 위해 css를 직접 사용합니다.
            this.$el.find('.ipInputArea[data-type="' + type + '"]').css('display', 'inline-block');
        },

        onWebAccessTypeChanged : function(e) {
            var webAccessType = $(e.currentTarget).data('type');
            if (webAccessType != 'ALL') {
                this.$el.find('#ipAccessConfigDetailOption').show();
            } else {
                this.$el.find('#ipAccessConfigDetailOption').hide();
            }
        },

        appendAllowedIp : function(type, ip) {
            var allowedIps = this.getAllowedIps();
            var ipStr = type + ':' + ip;
            if (allowedIps.includes(ipStr)) {
                return;
            }
            var ipListSelectBox = this.$el.find('#ipListSelectBox');
            ipListSelectBox.append(__makeIpTemplate(type, ip));

            function __makeIpTemplate() {
                return '<option value="' + ipStr + '">' + ip + '</option>';
            }
        },

        validateIpPattern : function(type, ipStr) {
            var ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

            if (type == 'ip') {
                return __validateIpType(ipStr)
            } else if (type == 'range') {
                return __validateRangeType(ipStr)
            } else if (type == 'sub') {
                return __validateSubType(ipStr)
            } else {
                return false;
            }


            function __validateIpType(ipStr) {
                return ipRegex.test(ipStr);
            }

            function __validateRangeType(ipStr) {
                var strArr = ipStr.split('-');
                var checkIpPattern = ipRegex.test(strArr[0]) && ipRegex.test(strArr[1]);
                var checkRange = strArr[0].replace(/\./g, "") < strArr[1].replace(/\./g, "");
                return checkIpPattern && checkRange;
            }

            function __validateSubType(ipStr) {
                var strArr = ipStr.split('/');
                var cidrBitRegex = /^([0-9]|[0-2][0-9]|3[0-2])$/;

                var checkIpPattern = ipRegex.test(strArr[0]);
                var checkCidrBit = cidrBitRegex.test(strArr[1]);
                return checkIpPattern && checkCidrBit;
            }
        },

        onSaveBtnClicked : function() {
            GO.util.preloader(
                $.ajax({
                    url : GO.contextRoot + 'ad/api/access/site/config',
                    type : 'POST',
                    contentType : 'application/json',
                    data : JSON.stringify({ webAccessType : this.getWebAccessType(), allowedIps : this.getAllowedIps()})
                })
                .done(function(){
                    $.goMessage(CommonLang["저장되었습니다."]);
                })
                .fail(function(response) {
                    if (response.responseJSON && response.responseJSON.message) {
                        $.goMessage(response.responseJSON.message);
                    } else {
                        $.goMessage(AdminLang["요청 처리 중 오류가 발생하였습니다."]);
                    }
                })
            );
        },

        onCancelBtnClicked : function() {
            var self = this;
            $.goCaution(CommonLang["취소"], CommonLang["변경한 내용을 취소합니다."], function() {
                self.render();
                $.goMessage(CommonLang["취소되었습니다."]);
            }, CommonLang["확인"]);
        },

        getAllowedIps : function() {
            var allowedIps = $('#ipListSelectBox option');
            return _.map(allowedIps, function convertElementValue(ipOption) {
                return $(ipOption).val();
            });
        },

        getWebAccessType : function() {
            return this.$el.find('.webAccessType:checked').data('type');
        }

    });
});