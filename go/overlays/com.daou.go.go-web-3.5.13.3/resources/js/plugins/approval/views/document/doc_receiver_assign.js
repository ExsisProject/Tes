define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "hgn!approval/templates/document/doc_receive",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",
    "jquery.go-sdk",
    "jquery.jstree",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.go-orgtab",
    "jquery.go-validation",
    "jquery.go-orgslide"

],

function(
    $,
    _,
    Backbone,
    App,
    DocReceiveTpl,
    commonLang,
    adminLang,
    approvalLang
) {

    /**
     * 수신자 모델
     */
    var DocReceiverModel = Backbone.Model.extend({

        defaults: {
            id: 0, // 사용자 아이디
            deptId: 0 // 사용자 소속 부서 아이디
        },

        initialize: function(docId) {
            this.docId = docId;
        },

        url: function() {
            return '/api/approval/document/' + this.docId + "/receiver"
        }
    });

    /**
     * 수신자 지정 전체 뷰
     */
    var DocumentReceiverAssignView = Backbone.View.extend({

        el: '.layer_normal .content',

        initialize: function(options) {
        	this.type = options.type ? options.type : 'normal';
        	this.docIds = options.docIds;
            this.docId = options.docId;
            this.receivedDocOwnerDeptId = options.receivedDocOwnerDeptId;
            this.receiverDeptId = options.receiverDeptId;
            this.receiverDeptName = options.receiverDeptName;
            this.receiverUserId = options.receiverUserId;
            this.receiverUserName = options.receiverUserName;
            this.receiverUserPositionName = options.receiverUserPositionName;
        },
        
        render : function(popup, targetQuery){
            var template = this._makeTemplate();
            var self = this;
            popup.find(targetQuery).html(template.render());
            if(self.receiverUserId){
            	this.renderReceiverTag({
            		displayName : self.receiverUserName + ' ' +self.receiverUserPositionName
            	})
            }
            
            popup.find('#addBtnReceiver').on('click', $.proxy(this.showOrgTree, this))
        },
        
        renderReceiverTag : function(member){
        	var tpl = Hogan.compile([
        	                         '                <li>',
        	                         '                    <span class="btn_wrap">',
        	                         '                        <span class="txt">'+member.displayName +'</span>',
        	                         '                    </span>',
        	                         '                </li>',
        	                     ].join('\n'));
        	$('#receiverPopupArea').find('ul.name_tag li').not('.creat').remove();
        	$('#receiverPopupArea').find('ul.name_tag li.creat span.txt').text(commonLang['변경']);
        	$('#receiverPopupArea').find('ul.name_tag').prepend(tpl.render());
        },
        
        assignReceiver: function(successCallback, failCallback) {
        	if(!this.receiverUserId || !this.receiverDeptId){
        		$.goMessage(approvalLang['담당자를 지정해주세요']);
        		return false;
        	}
        	
        	if(this.type == "normal"){
        		var promise = (new DocReceiverModel(this.docId)).save({
        			id: this.receiverUserId,
        			deptId: this.receiverDeptId
        		});
        		
        		promise.done(successCallback).fail(failCallback);
        		if(this.slide){
        			this.slide.close()
        		}
        	}else{
        		var self = this;
        		$.ajax(GO.contextRoot + "api/approval/document/bulkreceiver", {
                    type : 'PUT',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        'docIds': self.docIds,
                        'approverUser' : {
                        	id: self.receiverUserId,
                			deptId: self.receiverDeptId
                        }
                    })
                }).
	            done(function(data, status, xhr) {
	            	successCallback(data);
	            }).
	            fail(function(data, status, xhr) {
	            	failCallback(data);
	            });
        		
        		if(this.slide){
        			this.slide.close()
        		}
        	}
        },
        
        showOrgTree : function(e){
        	var self = this;
			this.slide = $.goOrgSlide({
                header : approvalLang['담당자 지정'],
                desc : '',
				loadId : self.receivedDocOwnerDeptId,
				isOnlyOneMember : true,
                isCustomType : true,
				hideOrg : false,
				target : e,
				zIndex : 200,
                contextRoot : GO.config("contextRoot"),
                callback : function(member){
                	self.renderReceiverTag(member)
                	self.receiverUserId = member.id;
                	self.receiverDeptId = member.deptId;
                }
			});
        },
        
        _makeTemplate: function() {
        	var guide = this.type == 'normal' ? approvalLang['수신 문서 접수자 지정 가이드'] : approvalLang['담당자 일괄지정 팝업설명'];
        	
            return Hogan.compile([
                '<p class="desc">' + guide + '</p>',
                '<br>',
                '<div id="receiverPopupArea">',
                '    <dl>',
                '        <dt>' + approvalLang['담당자'] + '</dt>',
                '        <dd>',
                '            <ul class="name_tag">',
                '                <li class="creat">',
                '                    <span class="btn_wrap" id="addBtnReceiver">',
                '                        <span class="ic_form ic_addlist"></span>',
                '                        <span class="txt">'+approvalLang['지정']+'</span>',
                '                    </span>',
                '                </li>',
                '            </ul>',
                '        </dd>',
                '    </dl>',
                '</div>',
            ].join('\n'));
        },

        release: function() {
            this.$el.off();
            this.$el.empty();
        }
    });

    return DocumentReceiverAssignView;
});