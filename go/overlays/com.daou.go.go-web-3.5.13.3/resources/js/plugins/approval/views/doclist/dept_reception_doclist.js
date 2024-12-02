// 부서수신함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/views/doclist/reception_doclist",
    "approval/views/doclist/dept_doc_folder",
    "approval/models/all_documents_action",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
    $,
    _,
    Backbone,
    GO,
    ReceptionListView,
    DeptDocFolderView,
    DeptAllDocsActionModel,
    commonLang,
    approvalLang
) {
	var DeptDocCopyModel = Backbone.Model.extend({
		url : function(){
			var url = ['/api/approval/deptfolder/' + this.folderId + '/document/add'].join('/');
			return url;
		},
		setFolderId: function(folderId) {
			this.folderId = folderId;
		}
	});
	var DeptReceptionListView = ReceptionListView.extend({
		columns: {
			'선택' : commonLang['선택'],
            '접수일' : approvalLang['접수일'],
            '결재양식': approvalLang['결재양식'],
			'긴급': approvalLang['긴급'], 
            '제목': commonLang['제목'],
            '첨부': approvalLang['첨부'],
            '기안자': approvalLang['기안자'],
            '담당자': approvalLang['담당자'],
            '결재상태': approvalLang['결재상태'],
            '부서 문서함': approvalLang['부서 문서함'],
            '문서번호': approvalLang['문서번호'],
            '원문번호': approvalLang['원문번호'],
            'count': 12
        },
        events: function() {
			return _.extend({}, ReceptionListView.prototype.events, {
				'click #deptDocCopy' : 'deptDocCopy'
			});
        },
        buttons: {
        	copy: true
        },
        deptDocCopy: function() {
			var self = this;
    		var docIds = [];
			var target = $('input[name=checkbox]:checked');
			target.each(function(){
				docIds.push($(this).attr('data-id'));
			});
			if ($.isEmptyObject(docIds)) {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return;
			}
			var deptName = this.deptName;
			var deptId = this.deptId;
			var model;
			var deptDocCopyLayer = $.goPopup({
				"pclass" : "layer_normal layer_doc_type_select",
                "header" : approvalLang['부서 문서함 분류'],
                "modal" : true,
                "width" : 300,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback': function(rs) {
                            var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
                            if (!targetId) {
                                $.goError(approvalLang["이동하실 문서함을 선택해주십시요."], $('.list_wrap '));
                                return false;
                            }
                            if(rs.parent().find('#allSelectTr').is(':visible') && rs.parent().find('#allSelectMsg3').attr('data-value') == 'folder'){

                                model = new DeptAllDocsActionModel({folderType : 'deptreceivefolder'});
                                if(!_.isUndefined(self.collection.keyword) && self.collection.keyword.trim().length > 0){
                                    model.setSearch(self.collection.searchtype, self.collection.keyword);
                                    if(self.collection.duration == "period"){
                                        model.setDuration({
                                            duration : self.collection.duration,
                                            fromDate : GO.util.toISO8601(self.collection.fromDate),
                                            toDate : GO.util.searchEndDate(self.collection.toDate)
                                        });
                                    }
                                }
                                model.set({ 'deptId' : deptId });
                            }else{
                                model = new DeptDocCopyModel({'ids' : docIds});
                            }
                        	model.setFolderId(targetId);
                        	model.save({

							}, {
                                silent : true,
                                type : 'PUT',
                                success : function(m, r) {
                                    $.goMessage(approvalLang["선택한 항목이 복사되었습니다"]);
                                    rs.close();
                                    self.$el.find('#checkedAllDeptDoc').attr('checked', false);
									self.collection.fetch();
                                },
                                error : function(model, rs) {
                                    var responseObj = rs.responseJSON;
                                    if (!_.isUndefined(responseObj) && responseObj.message) {
                                        $.goError(responseObj.message);
                                        return false;
                                    } else {
                                        $.goError(commonLang['저장에 실패 하였습니다.']);
                                        return false;
                                    };
                                }
                            });
                        }
                    },
                    {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });
			
			var deptDocFolderView = new DeptDocFolderView({
				docIds : docIds,
				deptId : deptId,
				deptName : deptName
			});
			
			deptDocFolderView.render();
			if(docIds!=''){
				deptDocCopyLayer.reoffset();
			}
    	},

        makeCompleteDocumentCountingUrl: function(){
            var url = GO.contextRoot + "api/approval/deptfolder/"+this.deptId+"/reception/complete/count?";
            return url + this.makeParams();
        }
	});
	
	return DeptReceptionListView;
});