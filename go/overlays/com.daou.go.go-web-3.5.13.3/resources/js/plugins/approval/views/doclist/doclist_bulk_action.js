// 결재문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",

    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",
    "jquery.go-orgslide"
],
function(
    $,
    _,
    Backbone,
    GO,

    commonLang,
    adminLang,
    approvalLang
) {

    var ReaderModel = Backbone.Model.extend({
        initialize: function(docId) {
            this.docId = docId;
        },
        url: function() {
            return "/api/approval/manage/document/addreaders";
        }
    });

    var DocManageAuthModel = Backbone.Model.extend({
        url: "/api/approval/auth/docmanage",
        isDocDeletable: function () {
            return this.get('docDeletable');
        },
        isMultiCompanySupporting: function () {
            return this.get('multiCompanySupporting');
        },
    });

    return Backbone.View.extend({

        /**
         * @param {jQueryElement} options.appendTarget
         *  -뷰 append 대상 엘리먼트
         * @param {function} options.getSelectedDocs
         *  -문서 리스트에서 선택된 항목(DocListItemModel: /approval/models/doclist_item.js)들을 배열로 반환
         * @param {function} options.resetList
         *  -문서 리스트 갱신 (문서 일괄 삭제 후 삭제된 문서 보이지 않기 위함)
         */
        initialize: function(options) {
            this.$appendTarget = options.appendTarget;
            this.getSelectedDocs = options.getSelectedDocs;
            this.resetList = options.resetList;
            this.authModel = new DocManageAuthModel();
        },

        render: function() {
            this.authModel.fetch().done($.proxy(this._renderButtons, this));
        },

        _renderButtons: function() {
            var buttons = [{
                id: 'bulkReaderAdd',
                label: approvalLang['열람자 추가'],
                class: 'member',
                onClicked: $.proxy(this._onReaderAddClicked, this)
            }];

            if (this.authModel.isDocDeletable()) {
                buttons.push({
                    id: 'bulkDocDelete',
                    label: commonLang['일괄 삭제'],
                    class: 'del',
                    onClicked: $.proxy(this._onDocDeleteClicked, this)
                });
            }

            var template = [];
            template.push('{{#buttons}}');
            template.push('<a id="{{id}}" class="btn_tool" data-role="button">');
            template.push('  <span class="ic_toolbar {{class}}"></span> <span class="txt">{{label}}</span>');
            template.push('</a>');
            template.push('{{/buttons}}');

            this.$appendTarget.after(Hogan.compile(template.join('')).render({
                buttons: buttons
            }));

            _.each(buttons, function (button) {
                $('#' + button['id']).bind('click', button.onClicked);
            });
        },

        _onReaderAddClicked: function() {
            var selected = this.getSelectedDocs();
            var targets = this._selectReaderAddable(selected);
            if (!this._validateReaderAdd(selected, targets)) {
                return;
            }

            if (selected.length != targets.length) {
                $.goConfirm(
                    approvalLang["완료된 문서에만 열람자 추가?"], "",
                    $.proxy(this._showReaderAddOrgSlide, this, targets)
                );
                return;
            }

            this._showReaderAddOrgSlide(targets);
        },

        _selectReaderAddable: function (selected) {
            return _.select(selected, function (doc) {
                return doc.isCompleted();
            });
        },

        _validateReaderAdd: function(selected, targets) {
            if (targets.length < 1) {
                var message = approvalLang["선택된 대상이 없습니다."];
                if (selected.length > 0) {
                    message = approvalLang["선택된 대상에 완료된 문서가 없음"];
                }

                $.goMessage(message);
                return false;
            }

            return true;
        },

        _showReaderAddOrgSlide: function(docs) {
            var docIds = _.map(docs, function(doc) { return doc.get('id'); });
            $.goOrgSlide({
                header : approvalLang["열람자 추가"],
                contextRoot : GO.config("contextRoot"),
                callback : $.proxy(this._addReaders, this, docIds),
                memberTypeLabel : approvalLang["열람자"],
                externalLang : commonLang,
                isBatchAdd : true,
                useTag : true,
                type: 'node',
                multiCompanyVisible: this.authModel.isMultiCompanySupporting(),
            });
        },

        _addReaders : function(docIds, datas){
            var readers = _.map(datas, function(data){ return { reader: data }; });
            var model = new ReaderModel();

            if(_.isEmpty(readers)){
				$.goError(approvalLang["열람자를 추가해 주세요."]);
				return;
			}
            
            model.set({
                'docIds': docIds,
                'readers': readers
            });

            model.save(null,{
                type : 'POST',
                success : function(model, response) {
                    if(response.code == '200') {
                        $(".list_approval input[type=checkbox][data-id]").prop('checked', false);
                        $.goMessage(approvalLang["열람자 추가가 완료되었습니다."]);
                    }
                },
                error : function(model, response) {
                    $.goMessage(commonLang["저장에 실패 하였습니다."]);
                }
            });
        },

        _onDocDeleteClicked: function () {
            var selected = this.getSelectedDocs();
            var targets = this._selectDeletable(selected);

            if (selected.length == 0) {
                $.goAlert(approvalLang["선택된 대상이 없습니다."]);
                return;
            }

            if (selected.length > 0 && targets.length == 0) {
                $.goAlert(approvalLang["선택한 문서 중에 삭제 가능한 문서가 없습니다"]);
                return;
            }

            $.goConfirm(approvalLang["반려 / 반송 및 완료 상태의 문서만 삭제할 수 있습니다."], "",
                $.proxy(this._deleteDocs, this, targets));
        },

        _selectDeletable: function (selected) {
            return _.select(selected, function (doc) {
                return (doc.isCompleted() && !doc.get('hasNotReturnedReceive') && !doc.get('useIntegration')) ||
                    doc.isReturn() || doc.isRecvReturned();
            });
        },

        _deleteDocs: function(targets) {
            var url = GO.contextRoot + 'api/approval/manage/document/delete';
            var targetIds = _.map(targets, function(target) { return target.get('id') });
            var data = JSON.stringify({ ids: targetIds });
            var context = this;

            var promise = $.ajax({
                contentType : "application/json",
                dataType: 'json',
                type: 'DELETE',
                url: url,
                data : data
            });

            promise.done(function(response) {
                var deletedCount = response.data.ids.length;
                var selectedCount = targetIds.length;

                if (deletedCount == 0) {
                    $.goAlert(approvalLang["선택한 문서의 삭제 권한이 없습니다"]);
                } else if (deletedCount != selectedCount) {
                    var title = GO.i18n(approvalLang["{{arg1}}개의 문서가 삭제되었습니다"], { "arg1": deletedCount });
                    var desc = GO.i18n(approvalLang["삭제 안된 {{arg1}}개의 문서 권한 안내"], { "arg1" : selectedCount - deletedCount });
                    $.goAlert(title, desc);
                } else {
                    $.goAlert(approvalLang["선택한 항목이 삭제되었습니다"]);
                }

                context.resetList();
            });

            promise.fail(function(xhr, status, err) {
            	var responseObj = JSON.parse(xhr.responseText);
            	if (!_.isUndefined(responseObj) && responseObj.message) {
            		$.goAlert(responseObj.message);
            	} else {
            		$.goAlert(commonLang["500 오류페이지 타이틀"]);
            	}
            });
        }
    });
});