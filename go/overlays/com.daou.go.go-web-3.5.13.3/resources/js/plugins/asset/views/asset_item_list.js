define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!asset/templates/asset_item_list",
    "asset/collections/asset_admin",
    "asset/models/asset_guide",
    "hgn!asset/templates/asset_attach_file",
    "i18n!nls/commons",
    "i18n!asset/nls/asset",
    "asset/models/asset_manage",
    "asset/views/rental_reserv_create",
    "asset/views/asset_timeline",

    "jquery.go-grid",
    "jquery.go-validation",
    "smarteditor"
], 

function(
	$, 
	Backbone,
	App, 
	TplGuidance,
	assetAdminCol,
	guideModel,
	attachesFileTpl,
	commonLang,
	assetLang,
	managbleModel,
	createView,
    AssetTimelineView
) {
	var lang = {
		'open' : commonLang['열기'],
		'close' : commonLang['닫기'],
		'code' : assetLang['코드'],
		'name' : assetLang['항목'],
		'reservation' : assetLang['예약'],
		'setting' : assetLang['설정'],
		'all' : assetLang['전체'],
		'rent' : assetLang['대여가능'],
		'no_rent' : assetLang['대여불가'],
		'return' : assetLang['반납'],
		'search' : commonLang['검색'],
		'rental' : assetLang['대여'],
		'asset_return' : assetLang['반납'],
		'no_asset' : assetLang['이용가능한 자산이 없습니다.'],
		'alert_keyword' : commonLang['검색어를 입력하세요.'],
		'confirm' : commonLang['확인'],
		'cancel' : commonLang['취소'],
		'preview' : commonLang['미리보기'],
		'download' : commonLang['다운로드']
	};
	var manageList = Backbone.View.extend({
		initialize: function(options) {			
			this.guidemodel = new guideModel();
			this.isManagable = new managbleModel();
			this.assetId = options.assetId; 
			this.type = options.type;
		},
		
		events : {
			"click span.btn_search2" : "search",
			'click div.content_info_wrap span.btn_wrap span.ic_classic' : "setTitleExpander",
			"click a[data-btntype='settingItem']" : "settingItem",
			"click a[data-btntype='reservation']" : "weeklyReserv",
			"click a[data-btntype='rentable']" : "rentable",
			"click a[data-btntype='norentable']" : "returnItem",
			"click a[data-btntype='return']" : "returnItem",
			"click #fileWrap li span.name" : "fileDownload",
			"click li a.preview" : "preview",
			"keydown div.search_wrap input" : "searchKeyboardEvent",
			"change #rentalSelect" : "rentalSelect"
		},
		
		render : function() {
			var _this = this;
			
			this.attributesLen = 0; 
			this.codeVisible = false;
			
			this.isManagable.clear();
			this.isManagable.set({assetId : this.assetId},{silent:true});
			this.isManagable.fetch({async : false});
			this.isManagable = this.isManagable.get('managable');
						
			var itemCol = assetAdminCol.getCollection({assetId : this.assetId, type : 'info'});
			itemCol.on("reset",function(collection,response){	
				_this.codeVisible = collection.models[0].get('useCodeVisibility');
				$.each(collection.models[0].get('attributes'),function(k,v){
					if(v.visibility){
						_this.attributesLen++;
					}
				});
				var tmpl = _this.makeTemplete({
					collection : collection.toJSON()
				});
				_this.$el.html(tmpl);	
				_this.renderDataTables();
				_this.renderGuide();
                if (_this._isReservationType()) _this._renderMatrix();;
			});
		},
		
		preview : function(e){
            var currentEl = $(e.currentTarget);
            GO.util.preview(currentEl.attr("data-id"));
            
            return false;
        },
		// 대여
		rentable : function(e){
			var _this = this;
			var target = $(e.currentTarget);
			var popup = $.goPopup({
				 header : lang.rental,
				 width : 515,
				 top : '40%',
				 pclass : "layer_normal layer_temporary_save",
				 contents : '',
				 modal : true,
				 buttons: [{
							 btext : lang.confirm,
							 btype : "confirm", //초록 버튼
							 autoclose : false,
							 callback : function() {
								 var returnVal = view.reservCreate();
								 if(!returnVal){
									 return;
								 }
								 setTimeout(function(){
									 _this.dataTable.tables.fnSettings().sAjaxSource =  GO.contextRoot + 'api/asset/'+_this.assetId+'/item/rental/ALL';
									 _this.dataTable.tables.fnClearTable();
								 },100);
								 popup.close();
							 }
						 },
						 {
							btext : lang.cancel,
							btype : 'normal'
						 }]
			  });
			
			var view = new createView({
				el: $('#gpopupLayer div.content'),
				assetId : this.assetId,
				itemId : target.attr('data-id'),
				type : 'rental',						
				status : 'create'
			});
			view.render();
		},
		//반납
		returnItem : function(e){
			var target = $(e.currentTarget);
			App.router.navigate('asset/'+ this.assetId+'/item/'+target.attr('data-id')+'/status/rental',true);
		},
		weeklyReserv : function(e){
			var target = $(e.currentTarget);			
			App.router.navigate('asset/'+ this.assetId+'/item/'+target.attr('data-id')+'/weekly/reserve/'+GO.util.toISO8601(GO.util.now()),true);
		},
		settingItem : function(e){
			var target = $(e.currentTarget);
			App.router.navigate('asset/'+ this.assetId+'/modify/'+target.attr('data-id'),true);
		},
		setTitleExpander : function(e){
			var btnExpander = $(e.currentTarget);
			var detailInfo = this.$el.find('ul.detail_info');
			var simpleInfo = this.$el.find('ul.simple_info');
			
			if(btnExpander.hasClass('ic_open')) {
				btnExpander.removeClass('ic_open').addClass('ic_close').attr('title', commonLang['닫기']);
				detailInfo.show();
				simpleInfo.css('height','100%');
			} else {
				btnExpander.removeClass('ic_close').addClass('ic_open').attr('title', assetLang['자세히 보기']);
				detailInfo.hide();
				simpleInfo.css('height','20px');
			}
		},
		fileDownload : function(e){
			var attachId = $(e.currentTarget).parents('li').first().attr('data-id');
			location.href = GO.contextRoot + 'api/asset/'+this.assetId+'/attach/'+attachId;
		},
		
		renderGuide : function(){			 
			this.guidemodel.clear();
			this.guidemodel.set({assetId : this.assetId},{silent:true});
			this.guidemodel.fetch({async : false});
			
			var parseStr = this.guidemodel.get('description');
			$('#guideDescription').html(parseStr);
			$('#guideModifiedAt').html(GO.util.basicDate3(this.guidemodel.get('descLastModifiedAt')));
			
			$('#assetName').text(this.guidemodel.get('name'));
			
			if(this.guidemodel.get('attaches').length > 0){
				this.setAttachFile();
			}			
			
			if(!this.guidemodel.get('description') && this.guidemodel.get('attaches').length == 0){
				$('div.content_info_wrap').hide();
			}
			
		},
		setAttachFile : function(){
			//첨부파일 세팅
			var files = [];
			$.each(this.guidemodel.get('attaches'),function(k,v){
				files.push(v);
			});
			
			//파일 사이즈 계산
			var sizeCal = function(){					
				var data = this.size;
				var size = GO.util.getHumanizedFileSize(data);
				return size;
			};
			
			var isImgFile = function(){
				var reExtImg = new RegExp("(jpeg|jpg|png|gif|tif|bmp)","gi");
				if(reExtImg.test(this.extention)){
					return true;
				}
				return false;
			};
			
			this.$el.find('#fileWrap').html(attachesFileTpl({
				dataset : files,
				sizeCal : sizeCal,
				assetId : this.assetId,
				contextRoot : GO.contextRoot,
				lang: lang,
				isImgFile : isImgFile,
				modify : false
			}));
			
			this.$el.find('#fileWrap span.btn_wrap').hide();
		},
		renderDataTables : function(){
			var _this = this;
			var url = GO.contextRoot + 'api/asset/'+this.assetId+'/item';
			columns = [];
			
			if(this._isReservationType()){
				columns.push({
                    mData : 'name', sClass : 'name', bSortable: false, fnRender: function(obj){
                        return '<a data-bypass class="txt" data-btntype="reservation" data-id="'+obj.aData.id+'">'+obj.aData.name+"</span>";
                    }
                });
			}else{
				columns.push(
						{ mData : 'name', sClass : 'name', bSortable: false, fnRender: function(obj){
							var type;
		            		var title;
		            		if(obj.aData.rentStatus == "RENTABLE"){
		            			type='rentable';
		            			title='<span class="txt_b">'+lang.rental+'</span>';
		            		}else if(obj.aData.rentStatus == "RETURN"){
		            			type='return';
		            			title='<span class="txt_b">'+lang.asset_return+'</span>';
		            		}else{
		            			//NORENTABLE
		            			type='norentable';
		            			title=lang.no_rent;
		            		}
							return '<a data-bypass class="txt" data-btntype="'+type+'" data-id="'+obj.aData.id+'">'+obj.aData.name+"</span>";
						}}
			             );
			}
			
			//코드
			if(this.codeVisible){
				columns.push(
					{ mData : 'code', sClass : 'code', bSortable: true, fnRender: function(obj){
						return '<span class="txt">'+obj.aData.code+"</span>";
					}}
				);
			}
			
			//가변 속성
			var propertiesCnt = this.codeVisible ? 2 : 1; 
			for(var i=0 ; i<this.attributesLen ; i++){
				columns.push(
			    	    { mData: null, bSortable: false, fnRender: function(obj) {
			    	    	return '<span class="txt">'+obj.aData.properties[obj.iDataColumn-propertiesCnt].content+"</span>";
			    	    }} 
					);
			}
			
			if(this._isReservationType()){
				//예약
				columns.push({ 
			            	mData : null, bSortable: false, sClass : 'action', fnRender: function(obj) {
			            		return '<a class="btn_fn7" data-bypass data-btntype="reservation" data-id="'+obj.aData.id+'"><span class="txt_b">'+lang.reservation+'</span></a>';
			            	} 
			            });
				
				if(this.isManagable){
					columns.push({ 
		            	mData : null, bSortable: false, sClass : 'action', fnRender: function(obj) {
		            		return '<a class="btn_fn7" data-bypass data-btntype="settingItem" data-id="'+obj.aData.id+'">'+lang.setting+'</a>';
		            	} 
		            });
				}
			}else{
				url = GO.contextRoot + 'api/asset/'+this.assetId+'/item/rental/ALL';
				//대여
				columns.push({ 
	            	mData : null, bSortable: false, sClass : 'action', fnRender: function(obj) {
	            		var type;
	            		var title;
	            		if(obj.aData.rentStatus == "RENTABLE"){
	            			type='rentable';
	            			title='<span class="txt_b">'+lang.rental+'</span>';
	            		}else if(obj.aData.rentStatus == "RETURN"){
	            			type='return';
	            			title='<span class="txt_b">'+lang.asset_return+'</span>';
	            		}else{
	            			//NORENTABLE
	            			type='norentable';
	            			title=lang.no_rent;
	            		}
	            		return '<a class="btn_fn7" data-bypass data-btntype="'+type+'" data-id="'+obj.aData.id+'">'+title+'</a>';
	            	} 
	            });
			}
			
			var self = this;
			this.dataTable = $.goGrid({
				el : '#assetItemDataTable',
				method : 'GET',
				url :  url,
				emptyMessage : '<tr><td colspan="7" class="code"><p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">'+lang.no_asset+'</span></p></td></tr>',
				columns : columns,
		        fnDrawCallback : function(tables) {
		        	$(window).scrollTop(0);
                    tables.siblings('div.tool_bar').find('div.custom_header').html('<h1 class="s_title">' + assetLang['자산별 상세 정보'] + '</h1>');
		        }
			});
		},
		rentalSelect : function(e){
			var value = $(e.currentTarget).val();
			this.dataTable.tables.fnSettings().sAjaxSource =  GO.contextRoot + 'api/asset/'+this.assetId+'/item/rental/'+value;
			this.dataTable.tables.fnClearTable();
		},
		search : function() {
			var searchForm = this.$el.find('#keyword'),
				keyword = searchForm.val();
			
			if($.trim(keyword) == ''){
				$.goMessage(lang['alert_keyword']);
				return false;
			}
			
			this.dataTable.tables.customParams = { nameKeyword : keyword };
			this.dataTable.tables.fnClearTable();
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.search();
			}
		},
		makeTemplete : function(opt){
			var collection = opt.collection;
			var tpl = TplGuidance({
				dataset:collection,
				isRental : (this.type == "rental") ? true : false,
				lang : lang,
				isManage : this.isManagable
			});
			return tpl;
		},
		assetItemAdd :function(){			
			App.router.navigate('asset/'+ this.assetId+'/create',true);
		},
		settingItem : function(e){
			var target = $(e.currentTarget);
			App.router.navigate('asset/'+ this.assetId+'/modify/'+target.attr('data-id'),true);
		},

        _isReservationType: function() {
            return this.type == 'reservation';
        },

        _renderMatrix: function() {
            this.$('div[data-matrix-area]').html((new AssetTimelineView({assetId: this.assetId})).render().el);
        }
	});
	
	return manageList;
});