define([
    "backbone",
    "app",
    "when",    
    "approval/views/content_top",
    "approval/views/official_document/toolbar",
    "approval/views/official_document/document",
    "approval/views/document/official_doc_receiver_list",
    "approval/models/document",
	"approval/models/official_preview",
    "approval/views/document/apprflow_editor",
    "approval/views/side",
    "hgn!approval/templates/official_document/main",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function(
    Backbone,
    App,
    when,
    ContentTopView,
    ToolbarView,
    DocumentView,
    OfficialDocReceiverListView,
    ApprDocumentModel,
    OfficialPreviewModel,
    ApprFlowEditor,
    SideView,
    MainTpl,
    commonLang,
    approvalLang
) {
	
    var lang = {
            "결재문서명" : approvalLang['결재문서명'],
            "기안자" : approvalLang['기안자'],
            "결재자" : approvalLang['결재자'],
            "기안의견" : approvalLang['기안의견'],
            "결재의견" : approvalLang['결재의견'],
            "결재비밀번호" : approvalLang['결재비밀번호'],
            "전결" : approvalLang['전결'],
            "전결설명" : approvalLang['전결설명'],
            "결재옵션" : approvalLang['결재옵션'],
            "결재선" : approvalLang['결재선'],
            "문서정보" : approvalLang['문서정보'],
            "변경이력" : approvalLang['변경이력'],
            "공문발송" : approvalLang['공문발송'],
            "열람자 추가" : approvalLang['열람자 추가'],
            "의견을 작성해 주세요" : approvalLang['의견을 작성해 주세요'],
            '목록으로 이동합니다' : approvalLang['목록으로 이동합니다'],
            '수신' : approvalLang['수신'],
            "의견" : "의견",
            "공문 발송 취소 여부" : "공문 발송을 취소하시겠습니까?",
            "공문 재발송 여부" : "공문을 재발송 하시겠습니까?"
        };
    
    
    var ActTpl = ['<form onsubmit="return false;">',
                  	'<fieldset>',
                  		'<table class="form_type">',
                  			'<tbody>',
                  				'<tr>',
                  					'<th><span class="title">{{lang.의견}}</span></th>',
                  					'<td>',
                  						'<div class="wrap_txtarea">',
                  							'<textarea class="w_max textarea" id="textarea-desc" name="description" placeholder="{{lang.의견을 작성해 주세요}}" rows="7"></textarea>',
                  						'</div>',
                  					'</td>',
                  				'</tr>',
                  			'</tbody>',
                  		'</table>',
                  	'</fieldset>',
                  '</form>'].join('');
    var OfficialModel = Backbone.Model.extend({
        url: function() {
            return ['/api/approval/official', this.officialId].join('/');
        },

        initialize: function(options) {
            this.officialId = options.officialId;
        },
        
        getShowUrl : function(){
        	var officialId = this.officialId.split("?")[0];

        	return "/approval/official/" + officialId;
        },

        getFullShowUrl : function(){
        	return window.location.protocol + "//" +window.location.host + GO.contextRoot +"app" + this.getShowUrl();
        },
        
        getOfficialId : function(){
        	return this.get('officialVersion').id;
        },
        
        convertToApprDocModel : function(){
        	var newApprDocModel = new ApprDocumentModel({
        		document : {
        			documentId : this.get('officialVersion').documentId,
        			title : this.get('title')
        		}, //미리보기시에  documentId가 필요하기 떄문에 셋팅해준다
        		actionCheck : {},
        		docInfo : {
        			'officialVersions' : this.getOfficialVersions()	
        		},
        		approvable : this.get('approvable'),
        		reRequestable : this.get('reRequestable'),
        		retractable : this.get('retractable')
        	});
        	return newApprDocModel;
        },
        
        getOfficialVersions : function(){
        	return [this.get('officialVersion')];
        }
    });
    
    var OfficialVersionModel = Backbone.Model.extend({
    	
    });


    var MainView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {
            this.options = options || {};
            this.officialId = this.options.officialId;
            this.allowAction = true;
            this.isPopup = this.options.isPopup || false;
            this.model = new OfficialModel({officialId : this.officialId});
            this.selectSideMenu();
        },
        
        render : function(){
        	when(this.fetchModel())
			.then(_.bind(function renderMe(){
	            this.$el.html(MainTpl({
	                lang : lang
	            }));
	            this.renderContentTop();
	            this.renderSubView();
	            this.bindEvent();
			}, this))
			.otherwise(function printError(err) {
                console.log(err.stack);
            });
        },
        
        renderSubView : function(){
            this.toolbarView = new ToolbarView({
            	model : this.model,
            	isPopup : this.isPopup
            });
            this.documentView = new DocumentView({
            	model : this.model,
            	isPopup : this.isPopup
            });
            this.officialDocReceiverView = new OfficialDocReceiverListView({
                dataList: this.model.getOfficialVersions(),
                type : 'official',
                isAdmin : false
            });
            this.assign(this.toolbarView, 'div.tool_bar');
            this.assign(this.documentView, 'div.approval_type');
            this.append(this.officialDocReceiverView, 'div.doc-meta-container');
        },
        
        bindEvent : function(){
            this.toolbarView.bind('officialFlow', this.officialFlow, this);
            this.toolbarView.bind('showPopup', this.showPopup, this);
            this.toolbarView.bind('showDocumentPopup', this.showDocumentPopup, this);
            this.toolbarView.bind('doPrint', this.doPrint, this);
        	this.toolbarView.bind('actList', this.navigateToBackList, this);
            this.toolbarView.bind('actReturn', this.actReturn, this);
            this.toolbarView.bind('actApprove', this.actApprove, this);
            this.toolbarView.bind('actRetractable', this.actRetractable, this);
            this.toolbarView.bind('actReRequestable', this.actReRequestable, this);
        },
        
        renderContentTop : function(){
            this.contentTop = ContentTopView.getInstance();
            this.contentTop.setTitle(this.model.get('title'));
            this.contentTop.render();
            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
            if(this.isPopup){ //팝업일때는 검색창을 remove한다.
            	this.$el.find('header.content_top .combine_search').remove();
            }
        },
        
        selectSideMenu : function(){
            // 임시조치: 패키지명이 docfolder(전사문서함)일 경우는 아래 조건을 실행하면 안됨
            // 아래 조건은 전자결재의 사이드를 그리는 부분...
            if (GO.router.getPackageName() === 'approval' && this.docId !== sessionStorage.getItem('list-history-doc-id')) {
                SideView.apprSelectSideMenu(sessionStorage.getItem('list-history-baseUrl'));
            } 
        },
        
        officialFlow : function(option){
            var apprFlowEditor = new ApprFlowEditor({
            	// readonly
            	apprDocumentModel: this.model.convertToApprDocModel(),
            	viewerType : 'official_document',
                saveCallback: $.proxy(function(apprDocModel) {
                	if(apprDocModel.get('docInfoChanged')){ //변경된 사항이 있으면
                    	this.model.set('officialVersion', _.first(apprDocModel.get('docInfo').officialVersions)); //officialVersions만 set한다
                		this.updateOfficialInfo();
                		//api
                	}
                }, this)
            });
            apprFlowEditor.render();            
        },
        
        updateOfficialInfo : function(){
        	var self = this;
        	var versionModel = new OfficialVersionModel(this.model.get('officialVersion'));
        	versionModel.save({},{
                type : 'PUT',
                url : ['/api/approval/official/addreceiver', this.model.getOfficialId()].join('/'),
                success: function(model, result) {
                    if (result.code == 200){
                        self.render();
                    }
                },
                error : function(model, rs){
                    var responseObj = JSON.parse(rs.responseText);
                    $.goAlert(data.responseJSON.message);
                }
        	});
        },
        
        //시행문 팝업보기
        showPopup : function(){
            var url = this.model.getFullShowUrl() + "/popup";
            window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
        },
        
        //원문 팝업보기
        showDocumentPopup : function(){
        	var url = window.location.protocol + "//" +window.location.host + GO.contextRoot +"app" + '/approval/document/' + this.model.get('officialVersion').documentId + "/popup";
            window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
        },
        
        doPrint : function(){
        	var officialVersionModel = this.model.get('officialVersion'),
        		title = this.model.get('title');
        	var data = {
        			docInfo : {
              		   officialVersions : [officialVersionModel]            				
        			},
        			document : {
        				documentId : officialVersionModel['documentId'],
        				docBodyContent : officialVersionModel['docBody'],
        				title : title
        			}
        	}
        	
     	   var previewModel = new OfficialPreviewModel(data);
     	   /**
     	    * 공문서 미리보기는 팝업으로 열리는데 opener에 대한 접근이 필요하므로 세션에 저장해둔다.
     	    * store을 이용하여 Backbone의 MOdel을 저장할때 테스트 결과 instance는 Backbone.Model로 저장이 되지 않는다.
     	    * (previewModel을 store에 set 하더라도 get해보면 단순 json데이터만 반환된다.) 
     	    * 그래서 그냥 toJSON()을 저장하고 받아쓰는 쪽에서 new Model하여 instance를 다시 생성하는 방식으로 함.
     	    *         	    */
     	   GO.util.store.set('official-preview-data', previewModel.toJSON()); 
           var url = previewModel.getFullShowUrl();
            
           window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
        },
        
        actReturn : function(){
            var self = this;
            var buttons = [];

            buttons.push({
                'btext' : approvalLang['반려'],
                'btype' : 'confirm',
                'autoclose' : false,
                'callback' : function(rs) {
                    self.saveApprAction(rs, 'RETURN');
                }
            });

            buttons.push({
                'btext' : commonLang["취소"],
                'btype' : 'cancel'
            });
            
            $.goPopup({	
                "pclass" : "layer_normal layer_approval",
                "header" : approvalLang['반려'],
                "modal" : true,
                "draggable" : true,
                "width" : 500,
                "contents" : self.getActDocument(),
                "buttons" : buttons
            });
        },
        
        actApprove : function(){
            var self = this;
            var buttons = [];

            buttons.push({
                'btext' : approvalLang['승인'],
                'btype' : 'confirm',
                'autoclose' : false,
                'callback' : function(rs) {
                    self.saveApprAction(rs, 'APPROVE');
                }
            });

            buttons.push({
                'btext' : commonLang["취소"],
                'btype' : 'cancel'
            });
            
            $.goPopup({	
                "pclass" : "layer_normal layer_approval",
                "header" : approvalLang['승인'],
                "modal" : true,
                "draggable" : true,
                "width" : 500,
                "contents" : self.getActDocument(),
                "buttons" : buttons
            });
        },
        
        actRetractable : function(){
            var self = this;
            var rs = $.goConfirm(lang['공문 발송 취소 여부'], '', function(rs) {
            	self.saveApprAction(rs, 'RETRACT');
            });
        },
        
        actReRequestable : function(){
            var self = this;
            var rs = $.goConfirm(lang['공문 재발송 여부'], '', function(rs) {
            	self.saveApprAction(rs, 'REREQUEST');
            });
        },
        
        /**
         * 각 결재 액션의 공통된 처리를 진행한다.
         */
        saveApprAction:function(rs, actionName){
            var self = this;
            if (!this.allowAction) {
                return;
            }
            var url = '';
			var property = "document.draftedAt";
			var direction = "desc";
			var searchtype = sessionStorage.getItem('list-history-searchtype');
			var keyword = sessionStorage.getItem('list-history-keyword') && sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
			var duration = "all";
			var fromDate = "";
			var toDate = "";
			var description = "";
			var param = "";
			var navigateFlag = false;
			
			if(sessionStorage.getItem('list-history-keyword') && sessionStorage.getItem('list-history-property') != "") {
				property = sessionStorage.getItem('list-history-property');
			}
			if(sessionStorage.getItem('list-history-direction') && sessionStorage.getItem('list-history-direction') != "") {
				direction = sessionStorage.getItem('list-history-direction');
			}
			if(sessionStorage.getItem('list-history-duration') && sessionStorage.getItem('list-history-duration') != "") {
				duration = sessionStorage.getItem('list-history-duration');
			}
			if(duration == "period" && sessionStorage.getItem('list-history-fromDate') && sessionStorage.getItem('list-history-fromDate') !="") {
				fromDate = sessionStorage.getItem('list-history-fromDate');
				toDate = sessionStorage.getItem('list-history-toDate');
			}
			if(_.contains(['APPROVE', 'RETURN'], actionName)){ //승인과 반려시에만 의견란이 있다.
	            description = $("#textarea-desc").val();
	            if (!this.actionApprValidate('#textarea-desc', rs, actionName)) {
	                return false;
	            }
			}
			param = $.param({comment : description});
            if(actionName == 'APPROVE'){
            	url = ['/api/approval/official/approve', this.model.getOfficialId()].join('/');
            	navigateFlag = true;
            }else if(actionName == 'RETURN'){
            	url = ['/api/approval/official/return', this.model.getOfficialId()].join('/');
            	navigateFlag = true;
            }else if(actionName == 'RETRACT'){
            	url = ['/api/approval/official/cancel', this.model.getOfficialId()].join('/');            	
            }else if(actionName == 'REREQUEST'){
            	url = ['/api/approval/official/rerequest', this.model.getOfficialId()].join('/');            	
            }
        	
        	var preloader = $.goPreloader();
        	this.allowAction = false;
            $.ajax({
                url: _.isEmpty(param) ? url : url + '?' + param, 
                type: 'PUT',
                beforeSend: function(){
			        preloader.render();
			    },
                dataType: 'json',
                contentType: 'application/json'
            }).
            done(function(data, status, xhr) {
            	if(self.isPopup){
            		window.close();
            	}else{
                    if(navigateFlag){
                		self.navigateToBackList();                		
                    }else{
                    	self.navigateToShow(self.model.getOfficialId());
                    }            		
            	}
            }).
            fail(function(data, status, xhr) {
                $.goAlert(data.responseJSON.message);
            }).
            complete(function() {
            	preloader.release();
            	self.allowAction = true;
            	rs.close();
            });
        },
        
        getActDocument: function(options) {
            return Hogan.compile(ActTpl).render({
            	lang: lang
            });
        },
        
        actionApprValidate : function(descEl, popEl, actionName){
            var checked = true;
            $(descEl).removeClass('enter error');
            popEl.find('span.go_error').remove();
            var description = $(descEl).val();
            
            if ($.trim(description) == '' && _.isEqual('RETURN', actionName)) {
            	$.goError(approvalLang['의견을 작성해 주세요'], $(descEl));
                $(descEl).addClass('enter error').select();
                checked = false;
            }
            
            if(description && description.length > 1000){
                $.goError(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': 1000}), $(descEl));
                $(descEl).addClass('enter error').select();
                checked = false;
            }
            return checked;
        },
        
        fetchModel : function(){
    		var defer = when.defer();
    		this.model.fetch({
    			success : defer.resolve,
    			error : defer.reject
    		});
    		return defer.promise;
        },
        
        // 제거
        release: function() {
            this.$el.off();
            this.$el.empty();
        },
        
        assign: function(view, selector) {
            view.setElement(this.$(selector)).render();
        },

        append: function(view, selector) {
            this.$(selector).append(view.render().el);
        },
        
        navigateToBackList: function(){
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            if ( baseUrl ) {
            	var search = $.param(GO.router.getSearch());
            	var url = search ? "?" + search : "";
                GO.router.navigate(baseUrl + url ,{ trigger: true });
            } else {
                GO.router.navigate('approval' ,{ trigger: true });
            }
        },
        
        navigateToShow: function(id) {
        	if(!this.options.isPopup){
        		GO.router.navigate("/approval/official/" + id, {trigger: true});
        	}else{
        		GO.router.navigate("/approval/official/" + id + "/popup", {trigger: true});
        	}
        },
    });

    return MainView;

});
