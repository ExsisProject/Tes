define('docs/views/docs_action', function(require) {
    var Backbone = require('backbone');
    
    var renderActionTpl = require('hgn!docs/templates/docs_action');
    var RejectFormTpl = require('hgn!docs/templates/reject_form');
    
    var SelectFolderPopup = require('docs/views/select_folder_popup');
    
    var BackdropView = require("components/backdrop/backdrop");

    var commonLang = require('i18n!nls/commons');
    var docsLang = require("i18n!docs/nls/docs");

    var BulkMoveList = Backbone.Model.extend({
        url : function(){
            var url = ['/api/docs/foler/' + this.folderId + '/docs/move/' + this.targetFolderId].join('/');
            return url;
        },
        setFolderId: function(folderId) {
            this.folderId = folderId;
        },
        setTargetFolderId : function(targetFolderId) {
            this.targetFolderId = targetFolderId;
        }
    });

	var lang = {
		"수정" : commonLang["수정"],
		"업데이트" : docsLang["업데이트"],
		"삭제" : commonLang["삭제"],
		"목록" : commonLang["목록"],
		"이동" : commonLang["이동"],
        "인쇄" : commonLang["인쇄"],
        "이전" : commonLang["위"],
        "다음" : commonLang["아래"],
        "복사": commonLang['URL 복사'],
        "요청취소" : docsLang["요청취소"],
        "승인" : docsLang["승인"],
        "반려" : docsLang["반려"],
        "반려의견" : docsLang["반려의견"],
        "의견작성" : docsLang["의견을 작성해 주세요"],
        "현재버전삭제" : docsLang["현재 버전 삭제"],
        "모든버전삭제" : docsLang["모든 버전 삭제"]
	};

	return Backbone.View.extend({
		initialize: function(options) {
			this.options = options || {};
			this.folderId = options.folderId;
            this.isManageable = options.isManageable;
            this.isEditable = options.isEditable;
            this.isDeletable = options.isDeletable;
            this.docsModel = options.docsModel;

            this.docsId = this.docsModel.id;
            this.printDocsId = this.docsModel.id;
            this.docsInfoId = this.docsModel.getDocsInfoId();
            this.isApproveWaiting = this.docsModel.getDocsStatus() == "APPROVEWAITING";
            this.isReject = this.docsModel.getDocsStatus() == "REJECT";
            this.PrevDocsId = this.docsModel.getPrevDocsId();
            this.NextDocsId = this.docsModel.getNextDocsId();
            this.isCreator = this.docsModel.getCreatorId() == GO.session("id");
		},
		
		events : {
			'click #btnEdit' : "goEdit",
			'click #totalDeleteBtn' : "doDelete",
			'click #totalDelete': 'doDelete',
			'click #currentDelete': 'doCurrentDelete',
			'click #goToListBtn' : "goFolderHome",
			'click #goToPrev' : "goToPrev",
			'click #goToNext' : "goToNext",
			'click #btnMove' : "moveDocs",
			'click #btnCancel' : "approveCancelDocs",
			'click #btnPermit' : "approvePermitDocs",
			'click #btnReject' : "showRejectPopup",
			'click #docsPrint' : "printPopup"
		},
		
		render : function() {
			this.$el.html(renderActionTpl({
				isEditable : this.isEditable,
				isDeletable: this.isDeletable,
                isApproveWaiting : this.isApproveWaiting,
                isCreator : this.isCreator,
                reject : this.isReject,
                isManageable : this.isManageable,
                needNavigator : this.getFolderId() != "registwaiting",
                hasPrev : this.PrevDocsId != undefined,
                hasNext : this.NextDocsId != undefined,
				lang : lang
			}));
			this.backdrop();
			return this;
		},
		
		backdrop : function() {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = this.$("#deleteBtn");
            backdropView.linkBackdrop(this.$("[el-backdrop-link]"));
            backdropView.bindBackdrop();

        },

        setPrintDocsId : function(docsId){
          this.printDocsId = docsId;
        },

		goEdit : function(){
            GO.router.navigate("docs/edit/" + this.printDocsId, true);
		},
		
		doDelete : function(){
			var self = this;
			$.goCaution(
				docsLang["모든 버전 삭제"],
				docsLang["이 문서를 삭제하시겠습니까?"],
				_.bind(function() {
					var model = new Backbone.Model();
					model.id = self.docsId;
					model.url = GO.config('contextRoot') + 'api/docs/' + self.docsId;
					model.save(null, {
						type : 'DELETE',
						contentType: 'application/json',
						success : function() {
                            GO.router.navigate("docs/folder/" + self.folderId, true);
						}
					});
				}, this)
			);
		},
		
		doCurrentDelete : function() {
			var self = this;
			$.goCaution(
				docsLang["현재 버전 삭제"],
				docsLang["현재 버전의 문서만 삭제하시겠습니까?"],
				_.bind(function() {
					var model = new Backbone.Model();
					model.id = self.printDocsId;
					model.url = GO.config('contextRoot') + 'api/docs/' + self.printDocsId + '/version/delete';
					model.save(null, {
						type : 'DELETE',
						contentType: 'application/json',
						success : function() {
                            GO.router.navigate("docs/folder/" + self.folderId, true);
						}
					});
				}, this)
			);
		},

        getFolderId: function(){
            if(this.docsModel.folderType == undefined || this.docsModel.folderType == "undefined"){
                return this.folderId;
            }
            return this.docsModel.folderType;
        },

        goFolderHome : function(){
			GO.router.navigate("docs/folder/" + this.getFolderId(), true);
		},

        goToPrev : function(){
			GO.router.navigate("docs/detail/" + this.PrevDocsId, true);
		},

        goToNext : function(e){
            GO.router.navigate("docs/detail/" + this.NextDocsId, true);
		},

		printPopup : function(){
			var url = GO.contextRoot + "app/docs/" + this.printDocsId + "/print";
			window.open(url, '', 'location=no, directories=no, resizable=yes, status=no, toolbar=no, menubar=no, width=1280, height=650, left=0, top=0, scrollbars=yes');
		},

        getRejectForm : function(){
            return RejectFormTpl({
            	lang : lang
            });
        },

        showRejectPopup : function(){
            var self = this;
            $.goPopup({
                "pclass" : "layer_normal",
                "header" : docsLang["반려"],
                "modal" : true,
                "draggable" : true,
                "width" : 500,
                "contents" :  self.getRejectForm(),
                "buttons" : [
                    {
                        'btext' : docsLang["반려"],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback' : function() {
                            self.approveRejectDocs();
                        }
                    },
                    {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });

        },

        validate : function(docs) {
            if (docs.get("str").length > 64 || docs.get("str").length < 2) {
                var errorMsg = GO.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {"arg0":docsLang["반려의견"], "arg1":"2","arg2":"64"});
                $.goError(errorMsg, $("#textarea-desc"), false, true);
                return false;
            }
            return true;
        },

        approveRejectDocs : function(rs){

            var self = this;
            var model = new Backbone.Model();
            model.id = self.docsId;
            model.url = GO.config('contextRoot') + 'api/docs/' + self.docsId + '/rejected';
            model.set("str" , $("#textarea-desc").val());

            if(this.validate(model) == false){
                return;
            }

            model.save(null, {
                type : 'PUT',
                contentType: 'application/json',
                success : function() {
                	GO.router.navigate("docs/folder/approvewaiting", true);
                }
            });

        },

        approvePermitDocs : function(){
            var self = this;
            $.goCaution(
                docsLang["승인"],
                docsLang["승인확인"],
                _.bind(function() {
                    var model = new Backbone.Model();
                    model.id = self.docsId;
                    model.url = GO.config('contextRoot') + 'api/docs/' + self.docsId + '/approved';
                    model.save(null, {
                        type : 'PUT',
                        contentType: 'application/json',
                        success : function() {
                            GO.router.navigate("docs/detail/"+self.docsId, true);
                        }
                    });
                }, this),commonLang["확인"]
            );
        },

        approveCancelDocs : function(){
            var self = this;
            $.goCaution(
                commonLang["취소"],
                commonLang["취소하시겠습니까?"],
                _.bind(function() {
                    var model = new Backbone.Model();
                    model.id = self.docsId;
                    model.url = GO.config('contextRoot') + 'api/docs/' + self.docsId + '/tempsave';
                    model.save(null, {
                        type : 'PUT',
                        contentType: 'application/json',
                        success : function() {
                            GO.router.navigate("docs/folder/registwaiting", true);
                        }
                    });
                }, this),commonLang["확인"]
            );
        },

        moveDocs : function(e) {
            var docsInfoIds = [];
            docsInfoIds.push(this.docsInfoId);
            var self = this;
            this.popup = $.goPopup({
                pclass : "layer_normal doc_layer",
                header : docsLang["문서이동"],
                width : 300,
                top : "40%",
                contents : "<div class='list_wrap'></div>",
                buttons : [{
                    btext : commonLang["확인"],
                    btype : "confirm",
                    callback : function(rs){
                        var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
                        if (!targetId) {
                            $.goMessage(docsLang["문서함을 선택해 주세요."]);
                            return false;
                        }

                        if(parseInt(targetId) == self.folderId){
                            $.goMessage(docsLang["다른문서함선택알림"]);
                            return false;
                        }

                        var bulkMoveList = new BulkMoveList();
                        bulkMoveList.setFolderId(self.folderId);
                        bulkMoveList.setTargetFolderId(targetId);

                        var preloader = $.goPreloader();
                        bulkMoveList.save({
                            'ids' : docsInfoIds
                        }, {
                            silent : true,
                            type : 'PUT',
                            beforeSend: function(){
                                preloader.render();
                            },
                            success : function(m, r) {
                                $.goMessage(docsLang['문서이동완료']);
                                rs.close();
                                self.goFolderHome();
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
                            },
                            complete: function() {
                                preloader.release();
                            }
                        });
                    }
                },
                    {
                        btext : commonLang["취소"],
                        btype : "normal"
                    }]
            });
            new SelectFolderPopup({
                "popupType" : "move"
            }).renderList().then($.proxy(function(){
                this.popup.reoffset();
            },this));
        }
	});
});