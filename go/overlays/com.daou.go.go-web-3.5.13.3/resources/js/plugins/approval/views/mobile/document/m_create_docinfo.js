define([
        "jquery",
        "underscore",
        "backbone",
        "app",
        "approval/models/doclist_item",
        "approval/views/mobile/document/m_apprflow_line",
        "hgn!approval/templates/mobile/document/m_create_docinfo",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ],
    function (
        $,
        _,
        Backbone,
        App,
        DocListItemModel,
        ApprFlowLineView,
        CreateDocInfoTpl,
        commonLang,
        approvalLang
    ) {

        var lang = {
            "문서번호": approvalLang['문서번호'],
            "본문보기": approvalLang['본문보기'],
            "기안자": approvalLang['기안자'],
            "기안일": approvalLang['기안일'],
            "기안부서": approvalLang['기안부서'],
            "문서함": approvalLang['문서함'],
            "소속된 부서가 없습니다": approvalLang["소속된 부서가 없습니다"],
            "미지정": approvalLang['미지정'],
            "접기": commonLang['접기'],
            "펼치기": commonLang['펼치기']
        };

        var DrafterDeptFolderCollection = Backbone.Collection.extend({
            url: function () {
                return '/api/approval/drafterdeptfolder';
            }
        });

        var CreateDocInfoView = Backbone.View.extend({
            events: {
                "change #draftDeptId": "changeDept",
                "vclick #docInfoFoldedBtn": "docInfoToggle",
                "change #formSelect": "changeForm",
                "vclick #copyUrl": "copyUrl"
            },
            initialize: function (options) {
                this.options = options || {};
                this.documentModel = this.options.documentModel;
                this.mobileDraftableFormCollection = this.options.mobileDraftableFormCollection;
                this.isCreate = this.options.isCreate;
                this.docInfo = this.options.docInfo;
                this.formId = this.options.formId;
                this.deptId = this.options.deptId;
                this.apprLineModel = this.options.apprLineModel;
            },
            isEdit: function () {
                return this.isCreate || this.documentModel.docStatus == "TEMPSAVE";
            },
            render: function () {
                var self = this;
                if (this.isEdit()) {
                    this.drafterDeptFolderInfos = new DrafterDeptFolderCollection();
                    this.drafterDeptFolderInfos.fetch({
                        async: false,
                        success: function (model) {
                            self.drafterDeptFolderInfos = model.toJSON();
                        }
                    });
                }
                this.renderInfo();
                return this;
            },
            renderInfo: function () {
                var docListItemModel = new DocListItemModel();
                docListItemModel.set(this.documentModel);
                var doc = {
                    draftedAt: docListItemModel.getBasicDateDraftedAt(),
                    title: docListItemModel.get('title'),
                    drafterName: docListItemModel.get('drafterName') ? docListItemModel.get('drafterName') + " " + docListItemModel.get('drafterPosionName') : "-",
                    docStatus: docListItemModel.getDocStatusName(),
                    statusClass: docListItemModel.getDocStatusClass(),
                    drafterDeptName: docListItemModel.get('drafterDeptName')
                };
                this.$el.html(CreateDocInfoTpl({
                    isEdit: this.isEdit(),
                    isCreate : this.isCreate,
                    lang: lang,
                    document: this.documentModel,
                    forms: this.mobileDraftableFormCollection ? this.mobileDraftableFormCollection.toJSON() : "",
                    docNum: this.docInfo.docNum ? this.docInfo.docNum : "",
                    formId: this.docInfo.formId ? this.docInfo.formId: "",
                    drafterDept: this.drafterDeptFolderInfos,
                    emptyDept: $.isEmptyObject(this.drafterDeptFolderInfos),
                    //firstDeptFolder : this.drafterDeptFolderInfos ? this.drafterDeptFolderInfos[0].deptFolders : "",
                    draftDate: GO.util.formatDatetime(GO.util.toISO8601(new Date()), null, "YYYY-MM-DD(ddd)"),
                    doc: doc,
                    isFolded: this.isApprLineFold()
                }));

                if (this.isEdit()) {
                    $('#formSelect').val(this.docInfo.formId);
                    $('#draftDeptId').val(this.documentModel.drafterDeptId);
                    this.setDeptFolder();
                }
                this.renderApprLine();
                return this;
            },
            isApprLineFold: function () {
                if (!this.isEdit()) {
                    var current = localStorage.getItem('apprline-fold');
                    if ("true" == current) {
                        return true;
                    }
                }
                return false;
            },
            renderApprLine: function () {
                var lineWrap = ApprFlowLineView.render({
                    apprLineModel: this.apprLineModel
                });
                this.$el.find("#apprflowline").html(lineWrap.$el.html());
            },
            changeForm: function (e) {
                var formId = $(e.currentTarget).val();
                var deptId = $('#draftDeptId').val();
                GO.util.appLoading(true);
                GO.router.navigate("approval/document/new/" + deptId + "/" + formId, true);
            },
            changeDept: function (e) {
                var deptId = $(e.currentTarget).val();
                var formId = $('#formSelect').val();
                GO.util.appLoading(true);
                GO.router.navigate("approval/document/new/" + deptId + "/" + formId, true);
            },
            setDeptFolder: function () {
                var self = this;
                var selectedDeptId = $('#draftDeptId').val();
                $.each(this.drafterDeptFolderInfos, function (idx, drafterDeptFolderInfo) {
                    if (drafterDeptFolderInfo.deptId == selectedDeptId) {
                        self.resetDeptDocFolders(drafterDeptFolderInfo);
                    }
                });
                if (this.docInfo.deptDocFolders.length > 0) {
                    $('#deptFolderId').val(this.docInfo.deptDocFolders[0].id);
                }
            },
            resetDeptDocFolders: function (deptFolderInfo) {
                $('#deptFolderId').find('option').remove();
                $('#deptFolderId').append('<option value="">' + approvalLang['미지정'] + '</option>');
                $.each(deptFolderInfo.deptFolders, function (idx, deptFolder) {
                    $('#deptFolderId').append('<option value="' + deptFolder.folderId + '">' + deptFolder.folderName + '</option>');
                });
            },
            docInfoToggle: function (e) {
                $("#document_view").css('visibility', 'hidden');
                if ($("#apprflowline").is(':visible')) {
                    this.closeInfoWrap();
                } else {
                    this.openInfoWrap();
                }

                if ($(document).width() < $("#document_view").width()) {
                    GO.util.initDetailiScroll('document_iscroll', 'document_hscroll', 'document_view');
                } else {
                    $("#document_view").css('visibility', 'visible');
                }
                $('#goBody').css('minHeight', $("#document_iscroll").height());
                return false;
            },
            openInfoWrap: function () {
                $("#apprflowline").show();
                $("#docInfoFoldedBtn span.ic_cmm").addClass('ic_dropdown_large_up').removeClass('ic_dropdown_large_down');
                localStorage.setItem('apprline-fold', false);
            },
            closeInfoWrap: function () {
                $("#apprflowline").hide();
                $("#docInfoFoldedBtn span.ic_cmm").addClass('ic_dropdown_large_down').removeClass('ic_dropdown_large_up');
                localStorage.setItem('apprline-fold', true);
            },
            copyUrl: function (e) {
                GO.util.copyUrl(e)
            }
        });
        return CreateDocInfoView;
    });
