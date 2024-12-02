define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "models/user_profile",
    "hgn!approval/templates/document/doc_receive",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.go-sdk",
    "jquery.go-popup",

],

function(
    $,
    _,
    Backbone,
    App,
    UserProfileModel,
    DocReceiveTpl,
    commonLang,
    approvalLang
) {

    var lang = {
        '수신 부서 재지정' : approvalLang['수신 부서 재지정'],
        '소속된 부서가 없습니다' : approvalLang['소속된 부서가 없습니다'],
        '담당자를 지정할 수 없습니다' : approvalLang['담당자를 지정할 수 없습니다'],
        '담당부서' : approvalLang['담당부서'],
        '취소' : commonLang['취소'],
        '확인' : commonLang['확인'],
    };

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
            return '/api/approval/document/' + this.docId + "/receptiondept"
        }
    });

    /**
     * 수신자 지정 전체 뷰
     */
    var DocumentReceiverAssignView = Backbone.View.extend({

        el: '.layer_normal .content',

        initialize: function(options) {
            this.docId = options.docId;
            this.receiverDeptId = options.receiverDeptId;
            this.receiverUserId = options.receiverUserId;
            this.model = UserProfileModel.read(GO.session().id);
        },
        
        render : function(popup, targetQuery){
            var template = this._makeTemplate();
            var self = this;
            popup.find(targetQuery).html(template.render({
            	lang: lang,
            	deptMembers : this.model.get('deptMembers')
            }));
            
        },
        
        assignReceiver: function(successCallback, failCallback) {
        	if($('#ressignDept option:selected').val() == ""){
        		$.goMessage(lang["담당자를 지정할 수 없습니다"]);
        		return;
        	}
        	var promise = (new DocReceiverModel(this.docId)).save({
        		id: this.receiverUserId,
        		deptId: $('#ressignDept option:selected').val()
        	});
        	
        	promise.done(successCallback).fail(failCallback);
        },
        
        _makeTemplate: function() {
        	
            return Hogan.compile([
                '<p class="desc">{{lang.수신 부서 재지정}}</p>',
                '<br>',
                '<div id="receiverPopupArea">',
                '    <dl>',
                '        <dt>{{lang.담당부서}}</dt>',
                '        <dd>',
                '            <select id="ressignDept">',
                '                {{#deptMembers}}',
                '                <option value = "{{deptId}}"> {{deptName}}</option>',
                '                {{/deptMembers}}',
                '                {{^deptMembers}}',
                '                <option value = ""> {{lang.소속된 부서가 없습니다}}</option>',
                '                {{/deptMembers}}',
                '            </select>',
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