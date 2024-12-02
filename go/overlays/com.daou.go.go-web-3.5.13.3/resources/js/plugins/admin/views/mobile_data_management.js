define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",

        "collections/paginated_collection",

        "hgn!admin/templates/chat_attach_config",
        "hgn!admin/templates/list_empty",
        "hgn!admin/templates/chat_attach_error_list",

        "grid",

        "jquery.go-validation",
        "jquery.go-grid",
        "jquery.go-popup",
        "jquery.go-sdk",
        "GO.util"
    ],
    function (
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        PaginatedCollection,
        MobileChatAttachConfigTmpl,
        EmptyTmpl,
        MobileChatAttachErrorListTmpl,
        GridView
    ) {
        var tmplVal = {
            label_ok: commonLang["저장"],
            label_cancel: commonLang["취소"],
            label_mb: adminLang["MB"],
            label_chat_keep_setting: adminLang["보관기간 설정"],
            label_chat_delete_period: adminLang["대화내용 보관 기간"],
            label_chat_delete_setting: adminLang["대화내용 삭제 설정"],
            label_delete_all: adminLang["모두 삭제 첨부파일 및 대화 메세지"],
            label_delete_attaches: adminLang["첨부파일만 삭제"],
            label_delete_desc: adminLang["기간이 지나면 설정에 따라 자동으로 삭제되며 복구되지 않습니다"],
            label_attach_info: adminLang["첨부파일 현황"],
            label_total_attach_size: adminLang["메신저 앱 대화 총 첨부파일 용량"],
            label_delete_attach: adminLang["첨부파일 삭제"],
            label_attach_name: adminLang["첨부파일명"],
            label_size: commonLang["용량"],
            label_created_at: adminLang["등록일"],
            label_creator: adminLang["등록자"],
            label_validation_input: adminLang['(1~999 입력가능)'],
            label_direct_input: adminLang['직접 입력'],
            label_months: adminLang['개월'],
            label_days: adminLang['일단위'],
            label_years: adminLang['년단위'],
            label_none: adminLang['선택안함'],
            label_period: adminLang['기간'],
            label_delete_caution_desc: adminLang["임직원에게 필요한 파일 일수 있으니 삭제 시 주의하시기 바랍니다"],
            label_sync_caution_desc: adminLang["첨부파일 삭제 후 용량 변경사항을 적용하기 위해서는 용량 관리에서 동기화를 수행해야 합니다."],
            label_attach_error_delete: adminLang["오류파일 삭제"],
            label_attach_error_delete_desc: adminLang["전송 오류가 발생한 파일을 삭제합니다."],
            label_unlimited_archive: adminLang["무제한 보관"],
            label_attach_delete_period: adminLang["첨부파일 보관 기간"],
            label_tool_tip: adminLang["보관 기간 설정 도움말"],
            label_unfold: commonLang["펼치기"],
            label_fold: commonLang["접기"],
            label_message_delete: adminLang["대화 삭제 기능"],
            label_message_delete_desc: adminLang["대화 삭제 기능 설명"],
            label_message_delete_subtitle: adminLang["대화 삭제 기능 사용"],
            label_used: commonLang["사용"],
            label_unused: commonLang["사용안함"]
        };

        var ChatAttachCollection = PaginatedCollection.extend({

            url: function () {
                return GO.contextRoot + "ad/api/chat/attach/list?" + this.makeParam();
            },

            setDuration: function (durationInput, params) {
                if (!params) {
                    params = {};
                }
                var duration = durationInput || "";

                if (duration == "period") {
                    this.fromDate = GO.util.toISO8601(params.fromDate);
                    this.toDate = GO.util.searchEndDate(params.toDate);
                } else if (duration != "" && duration != "all") {
                    var currentDate = GO.util.shortDate(new Date());
                    var startAt = GO.util.calDate(currentDate, "months", duration);
                    this.fromDate = GO.util.toISO8601(startAt);
                    this.toDate = GO.util.searchEndDate(currentDate);
                } else {
                    this.fromDate = null;
                    this.toDate = null;
                }
            },

            makeParam: function () {
                var param = {};
                var queryString = $.param({
                    page: this.pageNo,
                    offset: this.pageSize
                });

                if (this.keyword) queryString += "&keyword=" + encodeURIComponent(this.keyword);
                if (this.property) param["property"] = this.property;
                if (this.direction) param["direction"] = this.direction;
                if (this.searchType) param["searchType"] = this.searchType;

                if (this.fromDate) param["fromDate"] = this.fromDate;
                if (this.toDate) param["toDate"] = this.toDate;

                if (!_.isEmpty(param)) queryString += "&" + $.param(param);

                return queryString;
            },

            _getParam: function () {
                var param = {
                    pageNo: this.pageNo,
                    pageSize: this.pageSize,
                    keyword: this.keyword,
                    property: this.property,
                    direction: this.direction,
                    searchType: this.searchType,
                    fromDate: this.fromDate,
                    toDate: this.toDate
                };

                return param;
            }
        });

        var ErrorAttachModel = Backbone.Model.extend({
            url: GO.contextRoot + "ad/api/chat/attach/error/list"
        });

        var MobileChatConfigView = Backbone.View.extend({
            initialize: function () {
                this.model = new Backbone.Model();
                this.model.url = GO.contextRoot + "ad/api/chat/attach/config";
                this.model.fetch({async: false});

                this.chatMessageConfigModel = new Backbone.Model();
                this.chatMessageConfigModel.url = GO.contextRoot + "ad/api/chat/message/config";
                this.chatMessageConfigModel.fetch({async: false});

                this.chatAttachConfigModel = new Backbone.Model();
                this.chatAttachConfigModel.url = GO.contextRoot + "ad/api/storagePeriod";
                this.chatAttachConfigModel.fetch({async: false});

                this.listEl = '#chatAttachList';
                this.collection = new ChatAttachCollection();
                this.collection.setDuration();
            },
            events: {
                "click #saveChatAttachConfig": "saveChatAttachConfig",
                "click .deleteAttaches": "deleteAttaches",
                "keydown #chatAttachSearchInput": "searchKeyboardEvent",
                "click #searchChatAttach": "search",
                "click #deleteErrorAttaches": "deleteErrorAttaches",
                "click #checkErrorlistAll": "_checkErrorlistAll",
                "click #unlimitedChat": "togglePeriodCheckbox",
                "click #unlimitedChatAttach": "togglePeriodCheckbox",
                "click .wrap_action": "onClickedWrapAction"
            },

            render: function () {
                this.$el.html(MobileChatAttachConfigTmpl({
                    lang: tmplVal,
                    model: this.model.toJSON(),
                    chatMessageConfigModel: this.chatMessageConfigModel.toJSON(),
                    isDeleteAll: function () {
                        if (this.model.deleteType == "ALL") {
                            return true;
                        }
                        return false;
                    }
                }));

                this.selectedValueFromModel();
                this._renderDataTables();
                this.renderButton();
            },

            _renderErrorAttachList: function () {
                var _this = this;
                var errorAttachListModel = new ErrorAttachModel();
                errorAttachListModel.fetch({
                    async: false,
                    success: function (model, result) {
                        var data = result.data;
                        if (_.size(data) > 0) {
                            _this._drawErrorList(data);
                        }
                    }
                });
            },

            _getUnique: function (data) {
                var dataArray = _.uniq(data, 'id');
                return dataArray;
            },

            _drawErrorList: function (data) {
                var _this = this;
                var data = this._getUnique(data);
                this.$el.append(MobileChatAttachErrorListTmpl({
                    lang: tmplVal,
                    data: data,
                    sizeCal: function () {
                        return GO.util.getHumanizedFileSize(this.size);
                    },
                    created: function () {
                        return GO.util.basicDate3(this.createdAt);
                    }
                }));
            },

            _checkErrorlistAll: function (e) {
                var $target = $(e.currentTarget);
                var $list = $("#chatErrorAttachList input");
                if ($target.is(":checked")) {
                    $list.attr("checked", true);
                } else {
                    $list.attr("checked", false);
                }
            },

            togglePeriodCheckbox: function (e) {
                var $target = $(e.currentTarget);
                var inputId = ($target.attr("id") == "unlimitedChat") ? "chatPeriod" : "chatAttachPeriod";

                $("#" + inputId).val("");

                if ($target.is(":checked")) {
                    $("#" + inputId).attr("disabled", true);
                } else {
                    $("#" + inputId).attr("disabled", false);
                }
            },

            saveChatAttachConfig: function () {
                var self = this;

                var chatPeriod = Number(self.$('#chatPeriod').val());
                var chatAttachPeriod = Number(self.$('#chatAttachPeriod').val());
                var brandName = self.model.attributes.brandName;
                var maxChatPeriod = (brandName == "DO_INSTALL") ? 999 : 180;
                var maxChatAttachPeriod = (brandName == "DO_INSTALL") ? 999 : 180;
                var unlimitedPeriod = 99999;
                var deleteChatMessage = self.$('input[name="messageDeleteOption"]:checked').val();

                if (brandName == "DO_INSTALL") {
                    if (self.$('#unlimitedChat').is(":checked")) {
                        chatPeriod = unlimitedPeriod;
                        maxChatPeriod = unlimitedPeriod;
                    }

                    if (self.$('#unlimitedChatAttach').is(":checked")) {
                        chatAttachPeriod = unlimitedPeriod;
                        maxChatAttachPeriod = unlimitedPeriod;
                    }
                }

                if (isNaN(chatPeriod) || isNaN(chatAttachPeriod)) {
                    $.goError(App.i18n(adminLang["숫자만 입력하세요."]));
                    return false;
                }

                if (!chatPeriod || chatPeriod > maxChatPeriod) {
                    $.goError(App.i18n(adminLang["입력값은 0~0이어야 합니다."], {"arg1": "1", "arg2": maxChatPeriod}));
                    return false;
                }

                if (!chatAttachPeriod || chatAttachPeriod > maxChatAttachPeriod) {
                    $.goError(App.i18n(adminLang["입력값은 0~0이어야 합니다."], {"arg1": "1", "arg2": maxChatAttachPeriod}));
                    return false;
                }

                if (chatAttachPeriod > chatPeriod) {
                    $.goError(App.i18n(adminLang["대화내용 ge 첨부파일 보관기간"]));
                    return false;
                }

                self.model.set("chatPeriod", chatPeriod, {silent: true});
                self.model.set("chatAttachPeriod", chatAttachPeriod, {silent: true});
                self.model.save({}, {
                    type: 'PUT',
                    success: function (response) {
                        self.chatMessageConfigModel.set("messageDelete", deleteChatMessage, {silent: true});
                        self.chatMessageConfigModel.save({}, {
                            type: 'PUT',
                            success: function (model, response) {
                                $.goMessage(commonLang["저장되었습니다."]);
                            },
                            error: function (model, response) {
                                var responseData = JSON.parse(response.responseText);
                                if (responseData.message != null) {
                                    $.goMessage(responseData.message);
                                } else {
                                    $.goMessage(commonLang["실패했습니다."]);
                                }
                            }
                        });
                    },
                    error: function (response) {
                        $.goMessage(responseData.message);
                    }
                });
            },

            selectedValueFromModel: function () {
                var self = this;
                var chatPeriod = this.model.attributes.chatPeriod;
                var chatAttachPeriod = this.model.attributes.chatAttachPeriod;
                var brandName = this.model.attributes.brandName;
                var unlimitedPeriod = 99999;
                var messageDelete = this.chatMessageConfigModel.attributes.messageDelete;

                if (messageDelete) {
                    self.$("#messageDelete_true").attr("checked", true);
                } else {
                    self.$("#messageDelete_false").attr("checked", true);
                }

                self.$("#chatPeriod").val(chatPeriod);
                self.$("#chatAttachPeriod").val(chatAttachPeriod);

                if (brandName == "DO_SAAS") {
                    self.$("#unlimitedChat").closest("span").hide();
                    self.$("#unlimitedChatAttach").closest("span").hide();
                } else {
                    if (chatPeriod == 0 || chatPeriod == unlimitedPeriod) {
                        self.$("#chatPeriod").val("");
                        self.$("#chatPeriod").attr("disabled", true);
                        self.$("#unlimitedChat").attr("checked", true);
                    }

                    if (chatAttachPeriod == 0 || chatAttachPeriod == unlimitedPeriod) {
                        self.$("#chatAttachPeriod").val("");
                        self.$("#chatAttachPeriod").attr("disabled", true);
                        self.$("#unlimitedChatAttach").attr("checked", true);
                    }
                }

                // 시스템 설정일 경우, 사이트 어드민에서 보관기간 메뉴 설정 숨기기
                var useApplySite = this.chatAttachConfigModel.attributes.applyType;
                if (useApplySite == "ALL") {
                    $('form[name="formChatAttachConfig"]').hide();
                }
            },
            _renderDataTables: function () {
                var self = this;
                this.gridView = new GridView({
                    el: this.listEl,
                    collection: this.collection,
                    tableClass: "chart size",
                    checkbox: true,
                    usePeriod: true,
                    useToolbar: true,
                    isAdmin: true,
                    useBottomButton: false,
                    columns: [{
                        name: "fileName",
                        className: "title",
                        label: adminLang["첨부파일명"],
                        sortable: true,
                        render: function (model) {
                            return model.get("fileName");
                        }
                    }, {
                        name: "fileSize",
                        className: "num",
                        label: commonLang["용량"],
                        sortable: true,
                        render: function (model) {
                            return GO.util.getHumanizedFileSize(model.get("fileSize"));
                        }
                    }, {
                        name: "createdAt",
                        className: "align_c",
                        label: adminLang['등록일'],
                        sortable: true,
                        render: function (model) {
                            return GO.util.basicDate3(model.get("createdAt"));
                        }
                    }, {
                        name: "userName",
                        className: "align_c sorting_disabled",
                        label: adminLang["등록자"],
                        sortable: false,
                        render: function (model) {
                            if (model.get("positionName")) {
                                return model.get("userName") + " " + model.get("positionName");
                            }
                            return model.get("userName");
                        }
                    }],
                    drawCallback: function (collection) {
                    },
                    searchOptions: [{
                        value: "userName",
                        label: adminLang["등록자"]
                    }, {
                        value: "fileName",
                        label: adminLang["첨부파일명"]
                    }]
                });
                this.gridView.render();
                this.collection.fetch();
            },

            renderButton: function () {
                this.$("div.tool_bar").first().removeClass("toolbar").addClass("toolbar_top header_tb");
                this.$("div.custom_header").append('<span class="btn_tool txt_caution deleteAttaches" data-type="deleteAttaches">' + adminLang["첨부파일 삭제"] + '</span>');
            },

            deleteAttaches: function (e) {

                var self = this;
                var deleteIds = [];

                var $target = $(e.currentTarget);

                //pc메신저/모바일 첨부파일 삭제
                var deleteParam = {
                    targetId: "#chatAttachList",
                    apiUrl: "ad/api/chat/attach/delete"
                }

                //전송이 실패한 파일삭제일 경우
                if ($target.attr("data-type") == "deleteErrorAttaches") {
                    deleteParam = {
                        targetId: "#chatErrorAttachList",
                        apiUrl: "ad/api/chat/attach/error/delete"
                    }
                }

                $(deleteParam.targetId + ' :checkbox:checked').each(function () {
                    if ($(this).attr('data-id') != undefined) {
                        deleteIds.push($(this).attr('data-id'));
                    }
                });
                if (deleteIds.length < 1) {
                    $.goMessage(adminLang["삭제할 항목을 선택하세요."]);
                    return false;
                }

                $.goCaution(adminLang['파일 삭제 시 복구되지 않습니다. 삭제하시겠습니까'], "", function () {
                    $.go(GO.config("contextRoot") + deleteParam.apiUrl, JSON.stringify({ids: deleteIds}), {
                        qryType: 'DELETE',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            if (response.code == 200) {
                                $.goMessage(commonLang["삭제되었습니다."]);
                                self.render();
                            }
                        },
                        error: function (response) {
                            var responseData = JSON.parse(response.responseText);
                            if (responseData != null) {
                                $.goAlert(responseData.message);
                            } else {
                                $.goMessage(commonLang["실패했습니다."]);
                            }
                        }
                    });
                });
            },

            search: function () {
                var searchEl = this.$el.find(".table_search input[type='text']"),
                    keyword = searchEl.val();

                if (keyword.length > 64) {
                    $.goAlert(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1": "1", "arg2": "64"}));
                    return;
                }
                this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchEl);
            },

            searchKeyboardEvent: function (e) {
                if (e.keyCode == 13) {
                    this.search();
                }
            },
            onClickedWrapAction: function () {
                this.$el.find('.wrap_action').toggle();
                this.$el.find('.info_summary li').not('.first').toggle();
            },

        }, {
            attachTo: function (targetEl) {
                var contentView = new MobileChatConfigView();

                targetEl
                    .empty()
                    .append(contentView.el);

                contentView.render();

                return contentView;
            }
        });

        return MobileChatConfigView;
    });