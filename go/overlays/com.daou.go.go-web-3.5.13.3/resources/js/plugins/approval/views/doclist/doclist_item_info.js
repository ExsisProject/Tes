define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    
    "hgn!approval/templates/add_org_member",
    
    "views/profile_card",
    "approval/models/doclist_item",
    "approval/models/appr_flow",
    
    "approval/views/document/apprflow",
    "approval/views/document/docinfo",
    "approval/views/document/dochistory",
    "approval/views/document/reader_history_list",
    "approval/views/document/reception_document_list",
    "approval/views/document/official_doc_receiver_list",
    
    "approval/views/document/doc_type_select",
    "approval/views/document/document_print",
    
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
    $,
    _,
    Backbone,
    GO,
    
    tplAddMember,
    
    ProfileCardView,
    DocListItemModel,
    ApprFlowModel,
    
    ApprovalFlowView,
    DocInfoView,
    DocHistoryView,
    ReaderHistoryListView,
    ReceptionDocumentListView,
    OfficialDocReceiverListView,
    
    DocTypeSelectView,
    DocumentPrintView,
    
    commonLang,
    approvalLang
) {

    var DocListItemInfoModel = Backbone.Model.extend({
        initialize: function (options) {
            this.docId = options.docId;
            if (_.isBoolean(options.isAdmin)) {
                this.isAdmin = options.isAdmin;
            }
        },

        url: function () {
            if (this.isAdmin) {
                return ['/ad/api/approval/document', this.docId, 'approvalinfo'].join('/');
            } else {
                return ['/api/approval/document', this.docId, 'approvalinfo'].join('/');
            }
        }
    });

    /**
     * 문서 목록에서 각 문서의 부가 정보를 레이어로 표현하는 통합 View
     */
    var DocListItemInfoView = Backbone.View.extend({
        initialize: function (options) {
            this.docId = options.docId;

            // 어드민 화면에서 사용되는지 여부
            this.isAdmin = false;
            if (_.isBoolean(options.isAdmin)) {
                this.isAdmin = options.isAdmin;
            }

            this.model = new DocListItemInfoModel({
                docId: this.docId,
                isAdmin: this.isAdmin
            });
            this.model.fetch({async: false});
        },

        render: function () {
            var popupEl = $.goPopup({
                'modal': true,
                'width': 400,
                'pclass': 'layer_normal layer_reading',
                'contents': this._makeContentHTML(),
                'headerHtml': this._makeHeaderHTML(),
                'closeIconVisible': false,
                'autoclose': true,
                'buttons': [{
                    'btype': 'confirm',
                    'btext': commonLang["확인"],
                    'callback': function () {
                    }
                }]
            });

            // 결재선
            var approvalFlowView = new ApprovalFlowView({
                el: '#tab1 div.reply_wrap',
                isAdmin: this.isAdmin,
                docId: this.docId,
                model: new ApprFlowModel(this.model.get('apprFlow'))
            });

            //문서정보
            var docInfoView = new DocInfoView({
                el: '#tab2 div.reply_wrap',
                isAdmin: this.isAdmin,
                docId: this.model.get('document').documentId,
                docStatus: this.model.get('document').docStatus,
                docInfoModel: this.model.get('docInfo'),
                actionModel: this.model.get('actionCheck'),
                isComplete: this.model.get('document').docStatus == "COMPLETE" ? true : false,
                isActivityUser: this.model.get('actionCheck').isActivityUser,
                isReader: this.model.get('actionCheck').isReader,
                isReceptionDocument: this.model.get('document')['isReceptionDocument'],
            });

            docInfoView.bind('docTypeSelect', this.docTypeSelect, this);
            docInfoView.bind('readingDeleteItem', this.readingDeleteItem, this);
            docInfoView.bind('showReadingOrgSlider', this.showReadingOrgSlider, this);
            docInfoView.bind('showReceptionOrgSlider', this.showReceptionOrgSlider, this);
            docInfoView.bind('saveDocReaderAndReception', this.saveDocReaderAndReception, this);

            //변경이력
            var docHistoryView = new DocHistoryView({
                el: '#tab3 div.reply_wrap',
                model: this.model
            });
            docHistoryView.bind('showApprChangeLog', this.showApprChangeLog, this);

            // 열람 목록
            var readHistoryView = new ReaderHistoryListView({
                el: '#tab4 div.reply_wrap',
                isAdmin: this.isAdmin,
                docId: this.docId,
                collection: this.model.get('readingHistory')
            });

            // 수신 목록
            var receptionView = new ReceptionDocumentListView({
                el: '#tab5 div.reply_wrap',
                isAdmin: this.isAdmin,
                docId: this.docId,
                collection: this.model.get('receptionList')
            });

            //공문발송
            var officialReceiverView = new OfficialDocReceiverListView({
                el: '#tab6 div.item',
                isAdmin: this.isAdmin,
                docId: this.docId,
                docStatus: this.model.get('document').docStatus,
                dataList: this.model.get('docInfo').officialVersions
            });

            approvalFlowView.render();
            approvalFlowView.show();
            docInfoView.render();
            docHistoryView.render();
            readHistoryView.render();
            receptionView.render();
            officialReceiverView.render();

            // 탭 선택 이벤트
            var $tabs = popupEl.find('li.docinfo_tab');
            $tabs.click(function (e) {
                // 탭 처리
                $tabs.removeClass('selected');
                var $target = $(e.target);
                if (!$target.hasClass('docinfo_tab')) {
                    $target = $target.parents('li.docinfo_tab');
                }
                $target.addClass('selected');

                approvalFlowView.hide();
                docInfoView.hide();
                docHistoryView.hide();
                readHistoryView.hide();
                receptionView.hide();
                officialReceiverView.hide();

                // 컨텐츠 처리
                switch ($target.find('a').attr('id')) {
                    case 'docinfo_approval_status_tab':
                        approvalFlowView.show();
                        break;
                    case 'docinfo_approval_docinfo_tab':
                        docInfoView.show();
                        break;
                    case 'docinfo_approval_dochistory_tab':
                        docHistoryView.show();
                        break;
                    case 'docinfo_approval_read_histories_tab':
                        readHistoryView.show();
                        break;
                    case 'docinfo_approval_receivers_tab':
                        receptionView.show();
                        break;
                    default:
                        officialReceiverView.show();
                        break;
                }
            });
        },

        docTypeSelect: function () {
            var self = this;
            var docTypeSelectViewLayer = $.goPopup({
                "pclass": "layer_normal layer_doc_type_select",
                "header": approvalLang['전사문서함 선택'],
                "modal": true,
                "width": 300,
                "contents": "",
                "buttons": [{
                    'btext': commonLang['추가'],
                    'autoclose': false,
                    'btype': 'confirm',
                    'callback': function (rs) {
                        var check = docTypeSelectView.doc_type_confirm();
                        if (check) {
                            self.docFolderSelect(true);
                        } else {
                            return false;
                        }
                    }
                }, {
                    'btext': commonLang["닫기"],
                    'btype': 'cancel'
                }]
            });

            var docTypeSelectView = new DocTypeSelectView({});
            docTypeSelectView.render();
            docTypeSelectViewLayer.reoffset();
        },

        showReadingOrgSlider: function (e) {
            var self = this;
            return $.goOrgSlide({
                header: approvalLang["열람자 선택"],
                type: 'list',
                contextRoot: GO.contextRoot,
                callback: self.addReading,
                multiCompanyVisible: self.model.get('actionCheck').multiCompanySupporting
            });
        },

        showReceptionOrgSlider: function (e) {
            var self = this;
            return $.goOrgSlide({
                header: approvalLang["수신자 선택"],
                type: 'list',
                contextRoot: GO.contextRoot,
                callback: self.addReception
            });
        },

        addReading: function (data) {
            var targetEl = $('#addReading');
            if (data && !targetEl.find('li[data-id="' + data.id + '"]').length) {
                targetEl.find('li.creat').before(tplAddMember($.extend(data, {lang: lang})));
            } else {
                $.goMessage(approvalLang["이미 선택되었습니다."]);
            }
        },

        addReception: function (data) {
            var targetEl = $('#addReceive');
            if (data && !targetEl.find('li[data-id="' + data.id + '"]').length) {
                targetEl.find('li.creat').before(tplAddMember($.extend(data, {lang: lang})));
            } else {
                $.goMessage(approvalLang["이미 선택되었습니다."]);
            }
        },

        readingDeleteItem: function (e) {
            $(e.currentTarget).parents('li').remove();
        },

        showApprChangeLog: function (model) {
            var docBody = model.docBody;
            var docAttaches = model.attaches;
            var docReferences = model.references;

            // 전사 문서함 관련 설정 처리
            var action = this.model.get("actionCheck");
            if (!action.companyDocFolderUseFlag) {
                docReferences = null;
            }

            var printLayer = $.goPopup({
                "pclass": "layer_normal layer_approval_preview",
                "header": approvalLang['결재문서 보기'],
                "modal": true,
                "width": 900,
                "contents": "",
                "buttons": [{
                    'btext': commonLang['인쇄'],
                    'btype': 'confirm',
                    'callback': function () {
                        GO.util.print($("#printArea"));
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });

            var documentPrintView = new DocumentPrintView({
                docId: this.model.docId,
                popup: printLayer,
                docBody: docBody,
                attaches: docAttaches,
                references: docReferences
            });

            documentPrintView.render();
            printLayer.reoffset();
        },

        _makeHeaderHTML: function () {
            return [
                '<ul class="tab_type3 tab_type3_column6">',
                '    <li class="docinfo_tab first selected">',
                '        <a id="docinfo_approval_status_tab" onclick="return false">',
                '            <span class="txt">' + approvalLang['결재선'] + '</span>',
                '        </a>',
                '    </li>',
                '    <li class="docinfo_tab">',
                '        <a id="docinfo_approval_docinfo_tab" onclick="return false">',
                '            <span class="txt">' + approvalLang['문서정보'] + '</span>',
                '        </a>',
                '    </li>',
                '    <li class="docinfo_tab">',
                '        <a id="docinfo_approval_dochistory_tab" onclick="return false">',
                '            <span class="txt">' + approvalLang['변경이력'] + '</span>',
                '        </a>',
                '    </li>',
                '    <li class="docinfo_tab">',
                '        <a id="docinfo_approval_read_histories_tab" onclick="return false">',
                '            <span class="txt">' + approvalLang['열람기록'] + '</span>',
                '        </a>',
                '    </li>',
                '    <li class="docinfo_tab">',
                '        <a id="docinfo_approval_receivers_tab" onclick="return false">',
                '            <span class="txt">' + approvalLang['수신'] + '</span>',
                '        </a>',
                '    </li>',
                '    <li class="docinfo_tab last">',
                '        <a id="docinfo_approval_officialreceivers_tab" onclick="return false">',
                '            <span class="txt">' + approvalLang['공문발송'] + '</span>',
                '        </a>',
                '    </li>',
                '</ul>'
            ].join('\n');
        },

        _makeContentHTML: function () {
            return [
                '<div class="wrap_tab_item div_scroll">',
                '    <div id="tab1" class="tab_item">',
                '        <div class="item">',
                '            <div class="reply_wrap" style="display:none">',
                '            <!-- 결재상태 -->',
                '            </div>',
                '        </div>',
                '    </div>',
                '    <div id="tab2" class="tab_item">',
                '        <div class="item">',
                '            <div class="reply_wrap" style="display:none">',
                '            <!-- 문서정보 -->',
                '            </div>',
                '        </div>',
                '    </div>',
                '    <div id="tab3" class="tab_item">',
                '        <div class="item">',
                '            <div class="reply_wrap" style="display:none">',
                '            <!-- 변경이력 -->',
                '            </div>',
                '        </div>',
                '    </div>',
                '    <div id="tab4" class="tab_item">',
                '        <div class="item">',
                '            <div class="reply_wrap" style="display:none">',
                '            <!-- 열람기록 -->',
                '            </div>',
                '        </div>',
                '    </div>',
                '    <div id="tab5" class="tab_item">',
                '        <div class="item">',
                '            <div class="reply_wrap" style="display:none">',
                '            <!-- 수신 -->',
                '            </div>',
                '        </div>',
                '    </div>',
                '    <div id="tab6" class="tab_item">',
                '        <div class="item" style="display:none">',
                '            <!-- 공문발송 -->',
                '        </div>',
                '    </div>',
                '</div>',
            ].join('\n');
        }
    });

    return DocListItemInfoView;

});