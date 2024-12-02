/**
 * 데이터 목록 다운로드 관리 메인 뷰
 */

define("works/views/app/download_manager", function (require) {

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "진행중": commonLang["진행중"],
        "다운로드": commonLang["다운로드"],
        "관리": worksLang["관리"],
        "페이지 제목": worksLang["데이터 목록 다운로드"],
        "페이지 설명": worksLang["데이터 목록 다운로드 설명"],
        "연결된 앱": worksLang["연결된 앱"],
        "연결 컴포넌트": worksLang["연결 컴포넌트"],
        "신청자": worksLang["신청자"],
        "연결 권한": worksLang["연결 권한"],
        "보기 권한": worksLang["보기 권한"],
        "참조목록 설명": worksLang["참조목록 설명"],
        "목록이 없습니다": worksLang["목록이 없습니다."],
        "신청일": worksLang["신청일"],
        "필터": worksLang["필터"],
        "데이터 수": worksLang["데이터 수"],
        "다운로드 상태": worksLang["다운로드 상태"],
        "비고": worksLang["비고"],
        "목록 다운로드 이력": worksLang["목록 다운로드 이력"],
        "다운로드 목록 삭제 알림": worksLang["다운로드 목록 삭제 알림"],
        "대기": worksLang["대기"],
        "파일삭제": worksLang["파일삭제"],
        "파일 삭제": worksLang["파일 삭제"],
        "첨부파일을 삭제하시겠습니까?": worksLang["첨부파일을 삭제하시겠습니까?"],
        "진행 취소": worksLang["진행 취소"],
        "진행 취소 설명": worksLang["진행 취소 설명"]
    };

    var DOWNLOAD_STATE_TYPE = require("works/constants/download_state_type");

    var GridView = require("grid");
    var BaseSettingView = require("works/views/app/base_setting");
    var Template = require("hgn!works/templates/app/download_manager");

    var FilterConditions = require('works/components/filter/collections/filter_conditions');
    var PaginatedCollection = require("collections/paginated_collection");
    var DownloadHistoryCollection = PaginatedCollection.extend({
        url: function () {
            return GO.config("contextRoot") + "api/works/applets/" + this.appletId + "/docs/export?" + this.makeParam();
        },

        setAppletId: function (appletId) {
            this.appletId = appletId;
        }
    });

    return BaseSettingView.extend({
        className: "go_content go_renew go_works_home app_temp",

        events: _.extend(BaseSettingView.prototype.events, {
            'click [el-cancel-btn]': '_onClickCancel',
            'click [el-download-btn]': '_onClickFileDownload',
            'click [el-fileDelete-btn]': '_onClickFileDelete'
        }),

        initialize: function (options) {
            this.lang = lang;
            this.appletId = options.appletId;
            options.isPageActionUse = false;
            BaseSettingView.prototype.initialize.call(this, options);

            this.collection = new DownloadHistoryCollection();
            this.collection.setAppletId(this.appletId);

            this.listView = new GridView({
                tableClass: "type_normal",
                useToolbar: false,
                checkbox: false,
                collection: this.collection,
                columns: [{
                    name: "requester",
                    className: "name",
                    label: worksLang["신청자"],
                    sortable: true,
                    render: function (model) {
                        return model.get("requester").name;
                    }
                }, {
                    name: "createdAt",
                    className: "date",
                    label: worksLang["신청일"],
                    sortable: true,
                    render: function (model) {
                        return GO.util.basicDate2(model.get("createdAt"));
                    }
                }, {
                    name: "filter",
                    className: "filter",
                    label: worksLang["필터"],
                    sortable: false,
                    render: function (model) {
                        var conditionText = "";
                        var conditions = new FilterConditions(model.get('conditions'));

                        if (model.get('conditionText')) {
                            conditionText = model.get('conditionText');
                        } else if (conditions.length > 0) {
                            conditionText = conditions.getLabelTexts();
                        }

                        return '<span class="txt" data-condition-label>' + conditionText + '</span>';
                    }
                }, {
                    name: "totalCount",
                    className: "data_num",
                    label: worksLang["데이터 수"],
                    sortable: true,
                    render: function (model) {
                        if (model.toJSON().hasOwnProperty('totalCount') && model.toJSON().hasOwnProperty('progressCount')) {
                            var statusType = model.get("status");
                            // 서버에서 다운로드파일을 생성을 완료 했을떄 totalCount 표시
                            if ((statusType == DOWNLOAD_STATE_TYPE.DONE || statusType == DOWNLOAD_STATE_TYPE.FILE_DELETED) && model.get("totalCount") == model.get("progressCount")) {
                                return GO.util.numberWithCommas(model.get("totalCount"));
                            }
                        }
                        return "-";
                    }
                }, {
                    name: "download_status",
                    className: "downloading",
                    label: worksLang["다운로드 상태"],
                    render: function (model) {
                        var statusType = model.get("status");
                        var requestId = model.get("id");

                        var html = "";
                        switch (statusType) {
                            case DOWNLOAD_STATE_TYPE.READY :
                                html = '<span class="txt">' + worksLang["대기"] + '</span>' +
                                    '<span class="btn_fn7" el-cancel-btn id="' + requestId + '">' +
                                    '<span class="txt">' + commonLang["취소"] + '</span>' +
                                    '</span>';
                                break;
                            case DOWNLOAD_STATE_TYPE.PROGRESS :
                                var totalCount = model.toJSON().hasOwnProperty('totalCount') ? model.get("totalCount") : -1;
                                var progressCount = model.toJSON().hasOwnProperty('progressCount') ? model.get("progressCount") : 0;
                                if (totalCount >= 0 && progressCount >= 0) {
                                    var num = Math.round(progressCount / totalCount * 100);	// 진행률 소수점 버림
                                    html = '<span class="txt">' + commonLang["진행중"] + '(' + num + '%)</span>' +
                                        '<span class="btn_fn7" el-cancel-btn id="' + requestId + '">' +
                                        '<span class="txt">' + commonLang["취소"] + '</span>' +
                                        '</span>';
                                } else {
                                    html = '<span class="txt">-</span>';
                                }
                                break;
                            case DOWNLOAD_STATE_TYPE.DONE :
                                html = '<span class="btn_fn7" el-download-btn id="' + requestId + '">' +
                                    '<span class="txt">' + commonLang["다운로드"] + '</span>' +
                                    '</span>' +
                                    '<span class="btn_fn7" el-fileDelete-btn id="' + requestId + '">' +
                                    '<span class="txt">' + worksLang["파일삭제"] + '</span>' +
                                    '</span>';
                                break;
                            case DOWNLOAD_STATE_TYPE.FILE_DELETED :
                                html = '<span class="txt">' + worksLang["파일 삭제"] + '</span>';
                                break;
                            case DOWNLOAD_STATE_TYPE.CANCELED :
                                html = '<span class="txt" >' + commonLang["취소"] + '</span>';
                                break;
                            default:
                                html = '<span class="txt">--</span>';
                        }
                        return html;
                    }
                }]
            });

            this.collection.fetch();
        },

        render: function () {
            BaseSettingView.prototype.render.call(this);
            this.$('[el-content]').prepend(Template({lang: lang, model: this.model}));
            this.renderList();
        },

        renderList: function () {
            this.$('#histories').html(this.listView.render().el);
            this.autoReload();
        },

        _onClickCancel: function (e) {
            // 다운로드 취소 팝업 출력
            var self = this;
            var requestId = $(e.currentTarget).attr('id');
            $.goPopup({
                "pclass": 'layer_normal new_layer layer_works_new new_wide',
                "header": worksLang["진행 취소"],
                "modal": true,
                "contents": '<p class="desc">' + worksLang["진행 취소 설명"] + '</p>',  //'<p class="desc">' + lang['앱 검색 설명'] + '</p><hr>',
                "buttons": [{
                    'btext': worksLang["진행 취소"],
                    'autoclose': false,
                    'btype': 'confirm',
                    'callback': function (e) {
                        self.deleteDownloadItem(requestId, commonLang["취소되었습니다."]);
                        e.close();
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }
                ]
            })
        },

        _onClickFileDownload: function (e) {
            // 파일 다운로드
            var requestId = $(e.currentTarget).attr('id');
            window.location.href = GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/export/" + requestId + "/download";
        },

        _onClickFileDelete: function (e) {
            // 파일 삭제
            var requestId = $(e.currentTarget).attr('id');
            $.goConfirm(worksLang["첨부파일을 삭제하시겠습니까?"], "", $.proxy(function () {
                this.deleteDownloadItem(requestId, commonLang["삭제되었습니다."]);
            }, this));
        },

        deleteDownloadItem: function (requestId, succMsg) {
            GO.util.preloader($.ajax({
                type: "DELETE",
                contentType: "application/json",
                url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/export/" + requestId,
                success: $.proxy(function () {
                    $.goMessage(succMsg);
                    this.collection.fetch();
                }, this),
                error: function () {
                    $.goError(commonLang["관리 서버에 오류가 발생하였습니다"]);
                }
            }));
        },

        autoReload: function () {
            var self = this;
            var autoReload = setInterval(function () {
                if (self.$el.parent().length > 0) {
                    self.collection.fetch();
                } else {
                    clearInterval(autoReload);
                }
            }, 5000); // 5초에 한번씩 받아온다.
        }

    });
});
