define(function(require) {
	var $ =  require("jquery"); 
	var Backbone = require("backbone"); 
	var when =  require("when"); 
	var App =  require("app");  

	var CompanyCollection = require("system/collections/companies");
	var CompanyAssetShareModel = require("system/models/asset_share_model");
	var CompanyAssetShareCollection = require("system/collections/company_asset_shares");	
	var AssetCompanyShareLayer = require("system/views/asset_company_share_layer");

	var TplCompanyAssetShare = require("hgn!system/templates/asset_company_share");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var boardLang = require("i18n!board/nls/board");
	var worksLang = require("i18n!works/nls/works");

	// 트리형 게시판 지원
	var BoardTree = require('board/components/board_tree/board_tree');
	var CompanyBoardTreeNode = require("board/models/company_board_tree_node"); 
	var Constants = require('board/constants');

	require("jquery.go-sdk");
	require("GO.util");
	require("jquery.go-popup");
	
	var lang = {
		'company_board_add' : commonLang['추가'],
		'board_save' : commonLang['저장'],
		'board_cancel' : commonLang['취소'],
		'board_modify' : commonLang['수정'],
		'board_delete' : commonLang['삭제'],
		'board_stop' : commonLang['중지'],
		'board_normal' : commonLang['정상 상태로 변경'],
		'board_exposure' : adminLang['게시판 홈 노출'],
		'closed_board' :  adminLang['중지된 게시판'],
		'not_selected_board' : boardLang["게시판을 선택해 주세요."],
        'stop_confirm' : boardLang["게시판 중지 확인"],
        'stop_board' : boardLang["게시판 중지"],
        'delete_confirm' : boardLang["게시판 삭제 확인"],
        'delete_title' : boardLang["게시판 삭제"],
        'delete_success' : commonLang["삭제되었습니다."],
        'board_title' : adminLang['자산명'],
        'share_site' : adminLang['공유된 사이트'],
        'board_no_list' : worksLang['데이터가 없습니다']
        
	};
	
	var instance = null;

	/**
	 * 중복 액션을 막기 위함
	 */
	var _depFlag = false;
	
	var AssetCompanyShareView = Backbone.View.extend({
		el : '#companyGroupShareContent',
		events : {
			'click span[data-btntype="add"]' : 'popShareLayer',
			'click span[data-btntype="delete"]' : 'onDelete',
			'click #checkedShareAll' : 'checkedAll',
			'click td.b_name span': 'popShareLayerByTitleClick'
		},
		initialize: function(options) {
			this.options = options || {};
			this.companyGroupId = this.options.companyGroupId;
			this.companies = this.options.companies || new CompanyCollection(); //이때 넘겨오는 companies는 siteGroup에 묶여있는 companies.화면에서 받아옴
			this.shares = new CompanyAssetShareCollection(this.companyGroupId);
		},
		
		render: function(status) {
			var self = this;
			console.log('[asset] AssetCompanyList:render call');
			this.shares.fetch({
                success: function() {
                	self._initRender(status);
                	return self;
                },
            });
		},
		
		_initRender: function(status) {
			if(status === Constants.STATUS_ACTIVE) {
				var tmpl = TplCompanyAssetShare({
					isActive:true,
					lang:lang,
					isActiveBoard : true,
					dataset : this.makeTemplateData(this.shares.toJSON())
				});			
				this.$el.html(tmpl);
			}
		},
		
		makeTemplateData : function(dataSet){
			var _this = this;
			return _.map(dataSet, function(data){

				return {
					id : data['id'],

					companyId : data['companyId'],
					name : data['companyName'] + ' > ' + data['name'],
					data: data
                    //shareSiteName : [share['nodeValue'], ' - ', share['nodeCompanyName'], '[', _this.getActionName(share['actions']), ']'].join("")
				}
			});
		},
		
		popShareLayer : function(e, toSelectObj){
			if(this.companies.length < 1){
				$.goMessage(adminLang['1개 이상의 매칭 사이트를 선택해주세요.']);
				return false;
			}
			 this.layer = $.goPopup({
                header : adminLang['전사 자산 공유 설정'],
                'pclass' : 'layer_normal layer_system_board layer_share',
                width : 800,
				'modal' : false,
                'allowPrevPopup' : false,
                'forceClosePopup' : false,
                buttons : [{
					btext : commonLang["확인"],
					btype : "confirm",
					autoclose : false,
					callback: $.proxy(this.saveShareAsset, this)
				}, {
					btext : commonLang["취소"]
				}],
                contents : ""
            });
			 var opts = {
					 companies : this.companies,
					 shares : this.shares, //공유된 게시판 리스트를 layer에 넘긴다
					 layer : this.layer
				 };
			 if(toSelectObj){
				 opts['toSelectCompanyId'] =  toSelectObj['companyId'];
				 opts['toSelectAssetId'] =  toSelectObj['assetId'];
			 }
			 this.assetCompanyShareLayer = null;
			 this.assetCompanyShareLayer = new AssetCompanyShareLayer(opts);
			 this.assetCompanyShareLayer.render();
		},
		
		popShareLayerByTitleClick : function(e){
			var companyId = $(e.currentTarget).closest('tr').find('input:checkbox').attr('data-assetcompanyid');
			var assetId = $(e.currentTarget).closest('tr').find('input:checkbox').attr('data-assetid');
			this.popShareLayer(e, {companyId : companyId, assetId : assetId});
		},
		
		checkedAll : function(e){
			this.$el.find('#tableBorderList tbody input:checkbox').prop('checked', $(e.currentTarget).is(':checked'));
		},
		
		onDelete : function(){
			var self = this;
			var els = this.$el.find('#tableBorderList tbody input:checkbox:checked');
			if(els.length < 1){
				$.goError(commonLang['선택된 항목이 없습니다.']);
				return false;
			}
			var datas = [];
			var sharesData = self.shares.toJSON();
			$(els).each(function(idx, el){
				var targetModel = _.findWhere(sharesData, {

						id : parseInt($(el).val())

				});
				datas.push(targetModel);
			});

            var url = GO.contextRoot + 'ad/api/system/companygroup/' + this.companyGroupId + '/asset/shares';
            $.ajax(url, {
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(datas),
                success: function () {
                    $.goMessage(commonLang['저장되었습니다.']);
                    self.render('ACTIVE');
                },
                error: function (resp) {
                    $.goError(commonLang["실패했습니다."]);
                }
            });

        },

        saveShareAsset: function () {
            var self = this;
            var data = this.assetCompanyShareLayer.getData();
            if (!this.validateData(data)) {
                return false;
            }
            ;
            var model = new CompanyAssetShareModel(this.companyGroupId);
            model.set(data);
            model.save({}, {
            	type : 'POST',
				success : function(model, response) {
					$.goMessage(commonLang['저장되었습니다.']);
					self.render('ACTIVE');
					if(self.layer){
						self.layer.close();
					}
				},
				error : function(model, response) {
					var result = JSON.parse(response.responseText);
					$.goMessage(result.message);
				},
                complete: $.proxy(function() {
                }, this)
            });
		},
		
		validateData : function(data){
			if(!data['id']){
				$.goError(commonLang['선택된 항목이 없습니다.'])
				return false;
			}
			return true;
		},
		
		
		/**
		 * 체크된 체크박스의 게시판 ID를 배열로 반환
		 */
        _getCheckedBoardIds: function() {
        	var ids = [];
        	this.$('input:checkbox[name=board_id]:checked').each(function(i, el) {
        		ids.push($(el).val());
        	});
        	
        	return ids;
        },
        
        /**
		 * 사이트 관리자에 들어올 수 있는 관리자는 누구나 게시판 설정을 할수 있다.
		 */
		_convertBoardsAction: function(boardTreeNodes) {			
			boardTreeNodes.map(function(boardTreeNode) {
				if(boardTreeNode.isBoardNode()) {
					boardTreeNode.set('actions', {
						"managable": true
					});
				}
			});
			
			return boardTreeNodes;
		}, 
        
        /**
		 * 전체 선택 체크박스 클릭 이벤트 핸들러
		 */
		_onClickCheckAll : function (e){
			this.$("input:checkbox[name=board_id]").attr('checked', $(e.currentTarget).is(':checked'));
        }, 
        
		_onClickBoardDelete : function(e){
			var ids = this._getCheckedBoardIds();
		    var self = this;
		    
		    e.preventDefault();
            
            if(_depFlag === true) {
            	$.goSlideMessage(commonLang['잠시만 기다려주세요']);
            	return;
            }
            
            if(ids.length == 0){
                $.goMessage(lang.not_selected_board);
                return;
            }
            
            $.goConfirm(lang.delete_title,  lang.delete_confirm, function() {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/deleted'
                }).
                done(function(response){
                    $.goMessage(lang.delete_success);
                    self.render(self.type);
                }).
                complete(function() {
                	_depFlag = false;
                });
            });
		},
        
		// 사용중인 게시판 탭을 제외한 나머지 부분에서 사용되고 있는 함수들임
		/**
		 * 중지된 게시판에서 사용되는 체크박스 전체 선택
		 */
		checkAllToggle : function(e){
		    var currentEl = $(e.currentTarget);
		    
		    if(currentEl.is(":checked")){
		        this.$el.find("#tableBorderList input:checkbox").attr("checked", "checked");
		    }else{
		        this.$el.find("#tableBorderList input:checkbox").attr("checked", null);
		    };
		}
		
	},{
		create: function(options) {
			instance = new AssetCompanyShareView({companyGroupId : options.companyGroupId, companies : options.companies});
			return instance.render(options.status);
		}
	});
	
	return {
		render: function(options) {
			var layout = AssetCompanyShareView.create(options);
			return layout;
		}		
	};
});