// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "app",

    "approval/views/doclist/doclist_item_info",
    "hgn!admin/templates/document/manage_doclist_item",
    "hgn!admin/templates/document/document_attach",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
    $,
    _,
    Backbone,
    GO,

    DocListItemInfoView,
    DocListItemTpl,
    DocumentAttachTpl,
    commonLang,
    approvalLang
) {

    var ApprDocumentModel = Backbone.Model.extend({
        url: function () {
            return '/ad/api/approval/manage/document/' + this.docId;
        },

        initialize: function (docId) {
            this.docId = docId;
        }
    });

    var ApprFileCollection = Backbone.Collection.extend({
        model: Backbone.Model.extend(),

        url: function () {
            return ['/ad/api/approval/manage/document', this.docId, 'attach'].join('/');
        },

        initialize: function (options) {
            this.docId = options.docId;
        }
    });

    var DocListView = Backbone.View.extend({
        tagName: 'tr',

        events: {
            'click .attach': 'showAttach',
            'click span.read': 'showApprFlow',
            'click span.notyet': 'showApprFlow',
            'click span.finish': 'showApprFlow',
            'click span.temp': 'showApprFlow'
        },

        initialize: function (options) {
            this.options = options || {};
            _.bindAll(this, 'render', 'showApprFlow', 'showAttach');
            this.columns = this.options.columns;
            this.deptId = this.options.deptId;
            this.files = [];
        },

        render: function () {
            var doc = {
                id: this.model.getDocumentId(),
                draftedAt: this.model.getDraftedAt(),
                formName: this.model.get('formName'),
                title: this.model.get('title'),
                hasAttach: this.model.hasAttach(),
                attachCount: this.model.get('attachCount'),
                drafterId: this.model.get('drafterId'),
                drafterName: this.model.get('drafterName'),
                docStatus: this.model.getDocStatusName(),
                isComplete: this.model.isCompleted(),
                statusClass: this.model.getDocStatusClass(),
                completedAt: this.model.getCompletedAt(),
                docNum: this.model.get('docNum'),
                docId: this.model.get('documentId'),
                createdAt: this.model.get('createdAt') ? GO.util.shortDate(this.model.get('createdAt')) : '-',
                useIntegration: this.model.get('useIntegration') == true ? 'Y' : 'N'
            };

            this.$el.html(DocListItemTpl({
                doc: doc,
                columns: this.columns,
                deptId: this.deptId,
                isActivePopup: this.isActivePopup(),
                isReceive: this.model.get('docType') == 'RECEIVE' ? true : false,
                lang: approvalLang
            }));

            return this;
        },

        isActivePopup: function () {
            if(this.model.get('docStatus') == 'DRAFT_WAITING' ||
                this.model.get('docStatus') == 'RECV_RETURNED' ||
                this.model.get('docStatus') == 'RECV_WAITING' ||
                (this.model.get('docStatus') == 'TEMPSAVE' && this.model.get('apprStatus') == 'CANCEL')) {
                return false;
            }

            return true;
        },

        // 첨부파일 팝업레이어
        showAttach: function (e) {
            e.stopPropagation();
            this.files = [];
            var self = this;
            var collection = new ApprFileCollection({docId: this.model.getDocumentId()});
            collection.fetch({async: false});

            if (!collection.length) {
                return false;
            }
            var dataset = collection.toJSON();

            $.each(dataset, function (k, v) {
                var reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)", "gi");
                var ext = v.extention.toLowerCase();
                v.size = GO.util.getHumanizedFileSize(v.size);
                v.extention = reExt.test(ext) ? ext : 'def';
                self.files.push(v);
            });

            var tpl = DocumentAttachTpl({
                dataset: this.files,
                contextRoot: GO.config("contextRoot")
            });

            $.goPopup({
                'pclass': 'layer_normal layer_list_attach',
                'header': approvalLang['첨부 파일 목록'],
                'modal': true,
                'width': "400px",
                'contents': tpl,
                'buttons': [{
                    'btext': commonLang['확인'],
                    'btype': 'confirm',
                    'callback': function () {
                    }
                }]
            });
        },

        // 결재상태 팝업레이어
        showApprFlow: function (e) {
            e.stopPropagation();
            e.preventDefault();

            if(! this.isActivePopup()) {
                return;
            }

            var docListItemInfoView = new DocListItemInfoView({
                docId: this.model.getDocumentId(),
                isAdmin: true
            });

            docListItemInfoView.render();
        }
    });

    return DocListView;
});