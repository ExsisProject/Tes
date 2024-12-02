(function() {
	define([
    	"jquery",
		"underscore",
        "backbone",
        "app",
        "approval/views/content_top",
        "approval/views/document/document_print",
        "hgn!approval/templates/document/actcopy",
        "hgn!approval/templates/document/actcopy_document",
        "hgn!approval/templates/add_org_member",
		"i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.jstree",
    	"jquery.go-popup",
    	"jquery.go-orgslide",
    	"jquery.go-validation"
    ],

    function(
        $,
		_,
        Backbone,
        App,
    	ContentTopView,
    	DocumentPrintView,
        ActCopyTpl,
    	ActCopyDocumentTpl,
        tplAddMember,
        commonLang,
		approvalLang
    ) {
		var lang = {
			'발송' : approvalLang['발송'],
			'취소' : commonLang['취소'],
			'목록' : commonLang['목록'],
			'검색' : commonLang['검색'],
			'인쇄' : commonLang['인쇄'],
			'수신처' : approvalLang['수신처'],
			'수신처 추가' : approvalLang['수신처 추가'],
			'문서정보' : approvalLang['문서정보'],
			'시행문 발송' : approvalLang['시행문 발송'],
			'발신자' : approvalLang['발신자'],
			'시행문 제목' : approvalLang['시행문 제목'],
			'수신처를 지정해주세요' : approvalLang['수신처를 지정해주세요'],
			'문서열람' : approvalLang['문서열람'],
			'열람자 추가' : approvalLang['열람자 추가'],
			'문서열람 저장' : approvalLang['문서열람 저장']
		};

		var ActCopyModel = Backbone.Model.extend({
			initialize: function(options) {
			    this.options = options || {};
			},
			url: function() {
				return "/api/approval/document/" + this.docId + "/actcopy/" + this.actCopyFormId;
			},
			getYear: function() {
				var preserveDurationInYear = this.attributes.preserveDurationInYear;
				if (preserveDurationInYear == 0) {
					return approvalLang['영구'];
				} else {
					return App.i18n(CommonLang["{{arg1}}년"],{arg1 : preserveDurationInYear});
				}
			},
			setId: function(opt){
				this.docId = opt.docId;
				this.actCopyFormId = opt.actCopyFormId;
			}
		});

		var ActCopyView = Backbone.View.extend({
			el : '.report_detail',

			initialize: function(opt) {
				this.model,this.apprFlow;

				this.docId = opt.docId;
				this.actCopyFormId = opt.actCopyFormId;
				this.infoModel = opt.infoModel;
				this.contentTop = ContentTopView.getInstance();
				this.apprFlow = opt.apprFlow;
    		},

			events: {
				'click a.btnSend' : 'actSend',
				'click a.btnCancel' : 'actCancel',
				'click a.btnList' : 'actList',
				'click a.btnPrint' : 'actPrint',
				'click span#addAddress' : 'addAddress',
				'click span.ic_del' : 'deleteItem'
			},
	    	render : function(opt){
	    		this.model = new ActCopyModel();
    			this.model.setId({docId : this.docId, actCopyFormId : this.actCopyFormId});
    			this.model.fetch({async:false});

    			var documentModel = this.model.attributes.document;
    			var apprActivitesModel = this.apprFlow.activityGroups;

    			var orgBodyContent = documentModel.orgDocBodyContent;
    			var actBodyContent = documentModel.docBodyContent;

    			this.orgContentEl = $(orgBodyContent);
    			var actContentEl = $(actBodyContent);
    			actContentEl.setApprovalContent( $(orgBodyContent).getApprovalContent());

    			this.docStatus = documentModel.docStatus;

				var tpl = ActCopyTpl({
				    dataset: documentModel,
				    content: actContentEl.html(),
				    infoData : this.model.attributes.docInfo,
				    action : {isActCopy : false},
				    sender : this.getSender(apprActivitesModel),
					lang : lang,
					isActivityUser : false
				});

				this.$el.html(tpl);
				$('#addressList').hide();

				this.setActDocument();

				if(!this.options.isPopup){
					this.title = approvalLang["시행문 전환 및 발송"] + ' > ' + this.model.get('document').formName;
					this.contentTop.setTitle(this.title);
					this.contentTop.render();
					this.$el.find('header.content_top').replaceWith(this.contentTop.el);
				}else{
					this.$el.find('header.content_top').remove();
				}
    		},
    		setActDocument: function(){
    			var actTargetEl = $(".approval_import");
    			var setInitdata = {
    					docNo : this.orgContentEl.getDocNo(),
    	    			recipient : this.orgContentEl.getRecipient(),
    	    			preserveDuration : this.orgContentEl.getPreserveDuration(),
    	    			securityLevel : this.orgContentEl.getSecurityLevel(),
    	    			docClassification : this.orgContentEl.getDocClassification(),
    	    			docReference : this.orgContentEl.getDocReference()
    			};
    			actTargetEl.setApprovalData(setInitdata);
    			actTargetEl.setApprovalSubject(this.orgContentEl.getApprovalSubject());
    		},
    		getSender: function(model){
    			var sender = [];

    			$.each(model, function(k, v){
    				$.each(v.activities, function(k, v){
	    				if(v.type=="DRAFT"){
	    					sender.push({
	    						deptId : v.deptId,
		    					deptName : v.deptName,
		    					userId : v.userId,
		    					userName : v.userName,
		    					userPosition : v.userPosition
	    					});
	    				}
    				});
    			});

    			return sender;
    		},

    		addAddress: function(e) {
    			var self = this;
    			var popup = $.goPopup({
    				"pclass" : "layer_normal",
    				"header" : approvalLang['수신처 추가'],
    				"modal" : true,
    				"width" : 300,
    				"contents" : '<div id="orgtab" class="content_tab_wrap"></div>',
    				"buttons" : [{
    								'btext' : approvalLang['추가'],
    								'btype' : 'confirm',
    								'autoclose' : false,
    								'callback' : function(rs){
    									self.addReceive(rs);
    								}
    							},
    							{
    								'btext' : commonLang["닫기"],
    								'btype' : 'cancel'
    							}]
    			});
    			this.orgTab = $.goOrgTab({
    	               elId : "orgtab",
    	               css : {
							'minHeight' : 310,
							'maxHeight' : 310,
							'overflow-y' : 'auto'
	               		}
    	         });
    			popup.reoffset();
    		},

    		addReceive : function(rs) {
    			var data = this.orgTab.getSelectedData();
    			var targetEl = $('#addressNameTag');
    			var deptType = ( data.type === 'org' ) ? 'true' : 'false';
    			if(data && deptType == 'false' && (GO.session("id") === data.id)){
    				$.goError(approvalLang["발신자는 추가할 수 없습니다"]);
    			}else{
    				if(data && !targetEl.find('li[data-id="'+data.id+'"][data-deptType="'+deptType+'"]').length) {
    					targetEl.find('li.creat').before(tplAddMember($.extend(data, { lang : lang  , deptType : deptType })));
    					this.setRecipient();
    				} else {
    					$.goMessage(approvalLang["이미 선택되었습니다."]);
    				}
    			}
    		},
    		setRecipient: function() {
    			var receiveData = [];
    			var receivePart = $("#addressNameTag").find('li[data-id]');
    			receivePart.each(function(){
    				var position = $(this).attr("data-userposition") ? " " + $(this).attr("data-userposition") : "" ;
    				receiveData.push($(this).attr("data-username") + position);
    			});
    			$(".approval_import").setRecipient( receiveData.join(','));
    		},
    		deleteItem: function(e){
    			$(e.currentTarget).parents('li[data-userid]').remove();
    			this.setRecipient();
    		},

    		actSend: function(){
    			var self = this;
    			var addressIds = this.getAddressIds();

    			if ( addressIds.length == 0 ){
    				$.goError(approvalLang["수신처를 지정해주세요"]);
    			}else{
	    			$.goPopup({
	    				"pclass" : "layer_normal",
	    				"header" : approvalLang['발송하기'],
	    				"modal" : true,
	    				"width" : 450,
	    				"contents" : self.getActDocument(),
	    				"buttons" : [{
	    								'btext' : approvalLang['발송'],
	    								'btype' : 'confirm',
	    								'autoclose' : false,
	    								'callback' : function() {
	    				    				var title = $('#docTitle').val();
	    				    				if(!title) {
	    				    					$.goError(commonLang['제목을 입력하세요.']);
	    				    					return false;
	    				    				};

	    									self.actCopySave(addressIds, title);
	    								}
	    							},
	    							{
	    								'btext' : commonLang["취소"],
	    								'btype' : 'cancel'
	    							}]
	    			});
    			}
    		},

    		getActDocument: function(){
    			var docModel = this.model.attributes.document;
    			var userInfo = this.getSender(this.apprFlow.activityGroups);
    			var formName = docModel.formName;
    			var userName = userInfo[0].userName + " " + userInfo[0].userPosition;
    			var userDept = userInfo[0].deptName;

    			return contents = ActCopyDocumentTpl({
    				lang: lang ,
    				documentTitle : formName,
    				userName : userName,
    				userDept : userDept
    			});
    		},

    		getAddressIds: function(){
    			var addressIds = [];
    		    var addressPart = $("#addressNameTag").find('li[data-id]');
    		    addressPart.each(function(){
    		    	addressIds.push({ id:$(this).attr("data-sid") , reader: {id:$(this).attr("data-userid"),name:$(this).attr("data-username"),position:$(this).attr("data-userposition"),deptType:$(this).attr("data-deptType")}});
    			});
    			return addressIds;
    		},

    		actCopySave: function(Ids, title){
    			var addressIds = Ids;
    			var docTitle = title;
    			var docModel = this.model.attributes.document;
    			var docInfoModel = this.model.attributes.docInfo;
    			this.model.setId({docId : this.docId, actCopyFormId : this.actCopyFormId});

    			this.model.set({
    			    'document': this.getDocumentData(this.docId, docModel, docTitle),
    			    'docInfo': this.getDocInfoData(this.docId, addressIds, docInfoModel),
    			    'apprFlow' : this.apprFlow
			    }, {
			        silent : true
		        });

    			this.model.save({}, {
    				type : 'POST',
    	            success: function(model, result){
    	            	if (result.code == 200){
    	            		GO.router.navigate("/approval/doclist/draft/all", { trigger: true });
    	            	}
    	            }
    			});
    		},
    		getDocumentData: function(docId, docModel, docTitle){
    			var actCopyTitle = docTitle;
    			return documentData = {
    				"id" : docModel.id,
    				"documentId" : docModel.documentId,
    				"docStatus" : docModel.docStatus,
    				"attachCount" : docModel.attachCount,
    			    "attaches" : docModel.attaches,
    			    "comments" : docModel.comments,
    			    "references" : docModel.references,
    			    "docBodyContent" : $('.approval_import').html(),
    			    "title" : actCopyTitle
    			};
    		},
    		getDocInfoData: function(docId, Ids, docInfoModel){
    			return docInfoData = {
					"id" : docInfoModel.id,
					"securityLevel" : docInfoModel.securityLevel,
					"docYear" : docInfoModel.docYear,
					"folderId" : docInfoModel.folderId,
					"folderName" : docInfoModel.folderName,
    				"docReceptionReaders" : Ids,
    				"docReferenceReaders" : docInfoModel.docReferenceReaders
    			};
    		},
    		actCancel: function(e){
				var url = "";

    			var searchCheck = GO.router.getUrl().indexOf("docfolder");
            	if ( searchCheck == -1 ) {
            		url = "approval/document/" + this.docId;
            	} else {
            		url = "docfolder/document/" + this.docId;
            	}

				GO.router.navigate(url, true);

    		},
    		actList: function(){
    			//history.back(1);
    			var baseUrl = sessionStorage.getItem('list-history-baseUrl');
    			if ( baseUrl ) {
    				GO.router.navigate(baseUrl ,{ trigger: true });
    			} else {
    				GO.router.navigate('approval' ,{ trigger: true });
    			}
    		},
    		actPrint: function(e){
    			var printLayer = $.goPopup({
    				"pclass" : "layer_normal",
    				"header" : commonLang['인쇄'],
    				"modal" : true,
    				"width" : 900,
    				"contents" :  "",
    				"buttons" : [{
    								'btext' : commonLang['인쇄'],
    								'btype' : 'confirm',
    								'callback' : function(){
    									GO.util.print($("#printArea"));
    								}
    							},
    							{
    								'btext' : commonLang["취소"],
    								'btype' : 'cancel'
    							}]
    			});
    			var actContentBody = $(".approval_import").html();
    			var documentPrintView = new DocumentPrintView({
    			    docBody : actContentBody
			    });
    			documentPrintView.render();
    			printLayer.reoffset();
    		},
	    	release: function() {
				this.$el.off();
				this.$el.empty();
			}
		});

		return ActCopyView;

	});

}).call(this);