define([
    "jquery", 
    "backbone", 
    "app",  
    "i18n!admin/nls/admin",
    "i18n!nls/commons", 
    "hgn!admin/templates/board_manage_wrap",
    "admin/models/board_base_config",
    "admin/views/board_company_list"
], 

function(
	$, 
	Backbone,
	App, 
	adminLang,
	commonLang,
	layoutTpl,
	BoardBaseConfigModel,
	CompanyBoardList
) {
	var lang = {
		'label_ok': commonLang['저장'],
		'label_cancel': commonLang['취소'],
		'company_manager' : adminLang['전사 게시판 관리'],
		'board_active' : adminLang['사용중인 게시판'],
		'board_closed' : adminLang['중지된 게시판'],
		'label_title' : adminLang['기본 설정'],
		'display_closed_board' : adminLang['중지된 게시판 조회 메뉴'],
		'show_closed_board' : adminLang['보이기'],
		'hide_closed_board' : adminLang['숨기기'],
	};
	var instance = null;
	var _savingFlag = false;
	var boardManageWrap = Backbone.View.extend({
		unbindEvent: function() {
			this.$el.off("click", ".tab_menu li");
			this.$el.off("click", "span#ok");
			this.$el.off("click", "span#cancel");
			this.$el.off("submit", "form");
		}, 
		bindEvent : function() {
			this.$el.on("click", ".tab_menu li", $.proxy(this.moveCompanyBoardTab, this));
			this.$el.on("click", "span#ok", $.proxy(this.configSave, this));
			this.$el.on("click", "span#cancel", $.proxy(this.configCancel, this));
			this.$el.on("submit", "form", $.proxy(this.formSubmit, this));
		},
		initialize: function() {
			this.unbindEvent();
			this.bindEvent();
			this.model = BoardBaseConfigModel.read({admin:true});
		},
		formSubmit : function(e) {
			e.preventDefault();
			return;
		},
		render : function(args) {
			var data = this.model.toJSON();
			var tmpl = layoutTpl({
				model : data,
				lang : lang
				});			
			this.$el.html(tmpl);
			CompanyBoardList.render('ACTIVE');
		},
		moveCompanyBoardTab : function(e){
			var targetEl = $(e.currentTarget); 
			if(targetEl.hasClass('active')){
				return;
			}else{
				targetEl.siblings('li').removeClass('active');
				targetEl.addClass('active');
				if(targetEl.attr('data-type') == 'activeBoard'){
					CompanyBoardList.render('ACTIVE');
				}else{
					CompanyBoardList.render('CLOSED');
				}
			}
		},
		configSave: function() {
			var self = this,
				form = this.$el.find('form[name=boardConfig]');
			
			if(_savingFlag) {
				return;
			}
			
			// 저장 중 플래그 설정
			_savingFlag = true;
			
			$.each(form.serializeArray(), function(k,v) {console.log(v.name);
				self.model.set(v.name, v.value, {silent: true});
			});
			self.model.save({}, {
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.render();
					}
				},
				error : function(model, response) {
					var responseData = JSON.parse(response.responseText);
					if(responseData.message != null){
						$.goMessage(responseData.message);
					}else{
						$.goMessage(commonLang["실패했습니다."]);
					}
				}, 
				complete: function() {
					_savingFlag = false;
				}
			});
			
		},
		configCancel : function(){
			var self = this;
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
				self.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, commonLang["확인"]);
		}
	});
	return boardManageWrap;
});