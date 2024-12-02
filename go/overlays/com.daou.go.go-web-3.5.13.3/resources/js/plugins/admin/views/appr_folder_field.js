//서명 일괄등록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "admin/views/appr_folder_field_help_layer",
    "hgn!admin/templates/appr_folder_field",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin"

], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	ApprFolderFieldHelpLayerView,
	FolderFieldTpl,
    commonLang,
    approvalLang,
    adminLang
) {

	
	
	var configModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/approval/admin/basefieldconfig";
		}
	}); 
	
	var lang = {
            "저장" : commonLang["저장"],
			'취소' : commonLang['취소'],
			'설정' : commonLang['설정'],
			'useManagerSetting' : approvalLang['관리자가 지정한 목록 사용'],
			'useUserSetting' : approvalLang['사용자 별 목록 사용'],
			'문서함 필드 설정' : approvalLang['문서함 필드 설정'],
			'기안일' : approvalLang['기안일'],
			'완료일' : approvalLang['완료일'],
			'접수일' : approvalLang['접수일'],
			'생성일' : approvalLang['생성일'],
			'구분' : approvalLang['구분'],
			'결재양식' : approvalLang['결재양식'],
			'긴급' : approvalLang['긴급'],
			'제목' : approvalLang['제목'],
			'첨부' : approvalLang['첨부'],
			'기안자' : approvalLang['기안자'],
			'기안부서' : approvalLang['기안부서'],
			'현재결재자' : approvalLang['현재결재자'],
			'최종결재자' : approvalLang['최종결재자'],
			'담당자' : approvalLang['담당자'],
			'문서번호' : approvalLang['문서번호'],
			'원문번호' : approvalLang['원문번호'],
			'발송일' : approvalLang['발송일'],
			'결재상태' : approvalLang['결재상태'],
			'수신부서' : approvalLang['수신부서'],
			'개인 문서함' : approvalLang['개인문서함'],
			'부서문서함' : approvalLang['부서문서함'],
			'결재 대기 문서' : approvalLang['결재 대기 문서'],
			'참조/열람 대기 문서' : approvalLang['참조/열람 대기 문서'],
			'결재 수신 문서' : approvalLang['결재 수신 문서'],
			'결재 예정 문서' : approvalLang['결재 예정 문서'],
			'기안 문서함' : approvalLang['기안 문서함'],
			'결재 문서함' : approvalLang['결재 문서함'],
			'참조 문서함' : approvalLang['참조 문서함'],
			'참조/열람 문서함' : approvalLang['참조/열람 문서함'],
			'수신 문서함' : approvalLang['수신 문서함'],
			'발송 문서함' : approvalLang['발송 문서함'],
			'임시 저장함' : approvalLang['임시 저장함'],
			'기안 완료함' : approvalLang['기안 완료함'],
			'부서 참조함' : approvalLang['부서 참조함'],
			'부서 수신함' : approvalLang['부서 수신함'],
			'공문 발송함' : approvalLang['공문 발송함'],
			'추가된 문서함' : approvalLang['추가된 문서함'],
			'개인/부서 공통' : approvalLang['개인/부서 공통'],
			'양식별 문서조회' : approvalLang['양식별 문서조회'],
			'전사 공문 발송함' : approvalLang['전사 공문 발송함'],
			'관리자 작업기록' : approvalLang['관리자 작업기록'],
			'상태' : approvalLang['상태'],
			'필드 설명' : approvalLang['필드 설명'],
			'각 필드명 설명' : approvalLang['각 필드명 설명'],
			'공문 대기 문서' : approvalLang['공문 대기 문서'],
			'공문 문서함' : approvalLang['공문 문서함'],
			'승인자' : approvalLang['승인자'],
			'승인상태' : approvalLang['승인상태'],
			'원문기안일' : approvalLang['원문기안일'],
			'원문완료일' : approvalLang['원문완료일'],
			'원문기안부서' : approvalLang['원문기안부서']
		};
    
	
	var ConfigFolderFieldView = Backbone.View.extend({
		el : '#layoutContent',
		initialize: function() {
			this.model = new configModel();
			this.model.fetch({
				async:false,
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.sign", "input[name=configType]", $.proxy(this.configDocFieldType, this));
            this.$el.on("click.sign", "input[type=checkbox]", $.proxy(this.configDocListFields, this));
            this.$el.on("click.sign", "span#btn_save_appr_config", $.proxy(this.save, this));
            this.$el.on("click.sign", "span#btn_cancel_appr_config", $.proxy(this.cancel, this));
            this.$el.on("click.sign", "#btnFolderFieldHelpLayer", $.proxy(this.popupLayer, this));
        }, 
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".sign");
            return this;
        },
        
        render : function(option) {
			var config = {
				isBaseType : this.model.get("docFieldType") == "BASE" ? true : false,
				APPR_TODO : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "APPR_TODO"}),'seq'),
				APPR_RECEPTION : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "APPR_RECEPTION"}),'seq'),
				OFFICIAL_TODO : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "OFFICIAL_TODO"}),'seq'),
				TODO_REF : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "TODO_REF"}),'seq'),
				APPR_WAIT : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "APPR_WAIT"}),'seq'),
				USER_DRAFT : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_DRAFT"}),'seq'),
				USER_TEMP : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_TEMP"}),'seq'),
				USER_APPROVAL : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_APPROVAL"}),'seq'),
				USER_REF : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_REF"}),'seq'),
				USER_RECEPTION : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_RECEPTION"}),'seq'),
				USER_SEND : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_SEND"}),'seq'),
				USER_OFFICIAL : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "USER_OFFICIAL"}),'seq'),
				DEPT_COMPLETE : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "DEPT_COMPLETE"}),'seq'),
				DEPT_REF : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "DEPT_REF"}),'seq'),
				DEPT_RECEPTION : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "DEPT_RECEPTION"}),'seq'),
				DEPT_OFFICIAL : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "DEPT_OFFICIAL"}),'seq'),
				CUSTOM_ADD : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "CUSTOM_ADD"}),'seq'),
				MANAGE_FORM : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "MANAGE_FORM"}),'seq'),
				MANAGE_OFFICIAL : _.sortBy(_.where(this.model.get("docListFields"), {docFolderType : "MANAGE_OFFICIAL"}),'seq')
			};
			this.$el.empty();
			this.$el.html(FolderFieldTpl({
				config : this.setConfig(config),
				lang: lang
			}));
    		return this.$el;
		},
		
		setConfig: function(config){
			for (var property in config) {
				if(_.isArray(config[property])){
					_.each(config[property], function(field){
						field["columnName"] = approvalLang[field["columnMsgKey"]];
					});
				}
			}
			return config;
		},
		
        popupLayer : function(e){
			var popup = $.goPopup({
				'header' : lang['필드 설명'],
				'modal' : true,
				"width" : "600px",
				'offset' : $(e.currentTarget).offset(),
				'pclass' : 'layer_normal layer_fieldName',
				'contents' : '',
				"buttons" : [{
							  'btext' : commonLang["닫기"],
							  'btype' : 'cancel'
						     }]
		    });
			
			var view = new ApprFolderFieldHelpLayerView({
				el: popup.find('.content')
		    });
			view.render();
        },
		
		configDocFieldType: function(e){
			var target = $(e.currentTarget);
			if($(target).attr('id') == "isBaseType"){
				this.model.set("docFieldType","BASE");
			}else if($(target).attr('id') == "isNotBaseType"){
				this.model.set("docFieldType","USER");
			}
		},
		
		configDocListFields: function(e){
			var target = $(e.currentTarget);
			_.each(this.model.get('docListFields'), function(m){
				if(m['docFolderType'] == $(target).attr("docfoldertype") && m['columnType'] == $(target).attr("columntype")){
					m['useColumn'] =  $(target).is(":checked")? true : false;
				}
    		});
		},
		
		save: function(){
			var self = this;
			this.model.save({},{
				type : 'PUT',
				success : function(model, response) {
					if(response.code == '200') {
						self.model = new configModel();
						self.model.fetch({async:false});
						$.goMessage(commonLang["저장되었습니다."]);
					}
				},

				error : function(model, rs) {
					var responseObj = JSON.parse(rs.responseText);
					if (responseObj.message) {
						$.goError(responseObj.message);
						return false;
					} else {
						$.goError(commonLang['저장에 실패 하였습니다.']);
						return false;
					}
				}
			});
		},
		
		cancel: function(){
			var self = this;
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function(){
				self.model = new configModel();
				self.model.fetch({async:false});
				self.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, commonLang["확인"]);
		},
		
        // 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	return ConfigFolderFieldView;
});
