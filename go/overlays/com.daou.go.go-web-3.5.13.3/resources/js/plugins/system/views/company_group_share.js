define(function(require) {
	var $ =  require("jquery"); 
	var Backbone = require("backbone"); 
	var when =  require("when"); 
	var App =  require("app");
	var BoardCompanyShareView = require("system/views/board_company_share");
	var AssetCompanyShareView = require("system/views/asset_company_share");
	
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var boardLang = require("i18n!board/nls/board");
	
	var lang = {
		'company_board_add' : commonLang['추가'],
		'board_save' : commonLang['저장'],
		'board_cancel' : commonLang['취소'],
		'board_modify' : commonLang['수정'],
		'board_delete' : commonLang['삭제'],
		'board_stop' : commonLang['중지'],
		'board_normal' : commonLang['정상 상태로 변경'],
		'board_exposure' : adminLang['게시판 홈 노출'],
		'company_share_board' : adminLang['전사 게시판 공유'],
		'company_share_asset' : adminLang['전사 예약/자산 공유'],
		'closed_board' :  adminLang['중지된 게시판'],
		'not_selected_board' : boardLang["게시판을 선택해 주세요."],
        'stop_confirm' : boardLang["게시판 중지 확인"],
        'stop_board' : boardLang["게시판 중지"],
        'delete_confirm' : boardLang["게시판 삭제 확인"],
        'delete_title' : boardLang["게시판 삭제"],
        'delete_success' : commonLang["삭제되었습니다."]
        
	};
	
	var Tpl = ['<div class="tab_menu_wrap">',
	           	'<ul class="tab_menu" id="tabControll">',
		           	'<li {{#isBoard}}class="active"{{/isBoard}} data-type="BOARD" evt-role="navi"><span class="txt ">{{lang.company_share_board}}</span></li>',
		           	'<li {{#isAsset}}class="active"{{/isAsset}} data-type="ASSET" evt-role="navi"><span class="txt">{{lang.company_share_asset}}</span></li>',
	           	'</ul>',
	           	'</div>',
	           	'<div class="dataTables_wrapper container" id="companyGroupShareContent"></div>'].join('');
	
	var instance = null;

	/**
	 * 중복 액션을 막기 위함
	 */
	var _depFlag = false;
	
	var CompanyGroupShareView = Backbone.View.extend({
		el:'#companySharePage',
		boardCompanyShareView : null,
		assetCompanyShareView : null,
		events : {
			'click li[evt-role="navi"]' : 'onClickTabItem'
		},
		initialize: function(options) {
			this.options = options || {};
			this.companies = this.options.companies;
			this.companyGroupId = this.options.companyGroupId;
			this.type = this.options.type;
		},
		
		onClickTabItem : function(e){
			var type = $(e.currentTarget).attr('data-type');
			this.render(type);
		},
		
		render: function(type) {
			var self = this;
			var isBoard = type === 'BOARD' ? true : false;
			var isAsset = type === 'ASSET' ? true : false;
			this.$el.html(Hogan.compile(Tpl).render({isBoard : isBoard, isAsset : isAsset, lang : lang}));
			if(type === 'BOARD'){
				this.boardCompanyShareView = BoardCompanyShareView.render({
					status : 'ACTIVE',
					companyGroupId : this.companyGroupId,
					companies : this.companies
					});
			}else{
				this.assetCompanyShareView = AssetCompanyShareView.render({
					status : 'ACTIVE',
					companyGroupId : this.companyGroupId,
					companies : this.companies
					});
			}
		}		
	},{
		create: function(options) {
			instance = new CompanyGroupShareView(options);
			return instance.render(options.type);
		}
	});
	
	return {
		render: function(options) {
			var layout = CompanyGroupShareView.create(options);
			return layout;
		}		
	};
});