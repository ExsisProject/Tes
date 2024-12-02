;(function() {
define([
		"views/mobile/m_more_list",
		"jquery",
		"backbone", 
		"app",
		"i18n!nls/commons",
		"views/mobile/header_toolbar",
		"hgn!asset/templates/mobile/m_home_list",
		"hgn!asset/templates/mobile/m_home_list_unit",
		"asset/collections/home_list",
		 "i18n!asset/nls/asset",
		 "i18n!nls/commons",
		"jquery.go-popup",
		"GO.util",
		"jquery.go-validation",
		"jquery.placeholder",
		"jquery.go-sdk"
	],
	function(
		MoreView,
		$,
		Backbone,
		App,
		commonLang,
		HeaderToolBarView,
		LayoutTpl,
		ListUnitTpl,
		assetListCollection,
		assetLang,
		commonLang
	) {			
		var instance = null;
		var lang = {
			'no_content' : assetLang['예약/대여 중인 항목이 없습니다.'],
			'item_count' : commonLang['전체갯수'],
			'admin' : assetLang['운영자'],
			'asset_current' : assetLang['예약/대여 현황'],
			'asset_list' : assetLang['자산목록']
		};
		
		var homeList = Backbone.View.extend({
			el : '#content',
			unbindEvent: function() {
				this.$el.off('vclick', '#tabWrap li');
				this.$el.off('vclick', '#assetHomeList>li.assetList');
				this.$el.off('vclick', '#assetHomeList>li.mycondition');
			},
			bindEvent: function() {
				this.$el.on('vclick', '#tabWrap li', $.proxy(this.tabWrap, this));
				this.$el.on('vclick', '#assetHomeList>li.assetList', $.proxy(this.moveAssetItemList, this));
				this.$el.on('vclick', '#assetHomeList>li.mycondition', $.proxy(this.moveDetail, this));
			},
			initialize : function(){
				this.unbindEvent();
				this.bindEvent();
				this.headerToolBarView = HeaderToolBarView;
				GO.util.appLoading(true);
				var Tpl = LayoutTpl({lang:lang});
				this.$el.html(Tpl);
			},
			appendRenderList:function(){},
			// 기 등록 자산 정보 View 이동
			moveDetail : function(e){
				e.preventDefault();
				e.stopPropagation();
				var target = $(e.currentTarget);
				var assetId = target.attr('data-assetid');
				var itemId = target.attr('data-itemid');
				var reservationId = target.attr('data-reservationid');
				var url;
				var isRental = target.attr('data-isrental');
				var isGroup = target.attr('data-group');
				if(isGroup == "true"){
					this.makeGroupTemplete(e);
					return;
				}
				if(isRental == "true"){
					url = ['asset',assetId,'item',itemId,'status','rental'];
				}else{
					url = ['asset',assetId,'item',itemId,'status','reservation',reservationId];
				}
				App.router.navigate(url.join('/'),	{trigger: true, pushState: true});
			},
			// 자산 예약 리스트 View 이동
			moveAssetItemList : function(e){
				e.preventDefault();
				e.stopPropagation();
				var target = $(e.currentTarget);
				var assetId = target.attr('data-assetid');
				var url = ['asset',assetId,'list'];
				if(target.attr('data-type') == "true"){
					url.push('rental');
				}else{
					url.push('reservation');
				}
				App.router.navigate(url.join('/'),true);
			},
			tabWrap : function(e){
				var target = $(e.currentTarget);
				$('#tabWrap li').removeClass('on');
				target.addClass('on');
				
				if(target.attr('data-type') == 'currentList'){
					this.renderUnit('myReservation');
				}else{
					this.renderUnit('assetList');
				}
			},
			initIscroll : function(){
				var _this = this;
				var opt = {
						pullDownAction : function(){},
						pullUpAction : function(){}
						};
				GO.EventEmitter.trigger('common', 'layout:initIscroll');		
	        	
	        },
	        makeGroupTemplete : function(e) {
	        	var target = $(e.currentTarget);
	        	if(target.find('.ic_arrow3_d').size() > 0){
	        		target.find('.ic_arrow3_d').removeClass('ic_arrow3_d').addClass('ic_arrow3_t');
	        		var reservationId = $(e.currentTarget).attr("data-reservationid");
	    			// GO-18363 NumberFormatException: For input string: "undefined"
	    			if (!reservationId || reservationId == undefined) {
	    				return;
	    			}
	        		$.go(GO.contextRoot + 'api/asset/reservation/' + reservationId, "", {
	        			async : false,
	        			qryType : 'GET',					
	        			contentType : 'application/json',
	        			responseFn : function(response) {
	        				var collection = response.data;
	        				var isCurrent = true;
	        				var data = {
	        						dataset:collection,
	        						isCurrent:isCurrent,
	        						lang : lang,
	        						isSubReservation : true,
	        						groupid : target.attr('data-reservationid')
	        				};
	        				
	        				var parseDate = function(){
	        					var startTime = GO.util.formatDatetime(this.reservedStartTime, null, "MM.DD(ddd) HH:mm");
	        					var endTime = "";
	        					if(this.reservedEndTime){
	        						endTime = " ~ " + GO.util.formatDatetime(this.reservedEndTime, null, "MM.DD(ddd) HH:mm");
	        					}
	        					return startTime + endTime;
	        				};
	        				
	        				var parseManager = function(){
	        					var managerArray = [];
	        					$.each(this.managers, function(k,v) {
	        						managerArray.push(v.user.name);
	        					});
	        					return managerArray.join(',');
	        				};
	        				
	        				var parseItemCount = function() {
	        					return GO.i18n(lang['item_count'], 'num', this.itemCount);
	        				};
	        				
	        				if(isCurrent){
	        					data.parseDate = parseDate;
	        				}else{
	        					data.parseManager = parseManager;
	        				}
	        				data.parseItemCount = parseItemCount;
	        				var tpl = ListUnitTpl(data);
	        				target.after(tpl);
	        			},
	        			error: function(response){
	        			}
	        		});
	        		
	        	}else{
	        		target.find('.ic_arrow3_t').removeClass('ic_arrow3_t').addClass('ic_arrow3_d');
	        		target.parent().find('[data-groupid='+target.attr('data-reservationid')+']').remove();
	        	}
	        },
	        makeTemplete : function(opt) {
	        	var collection = opt.collection;
	        	var isCurrent = opt.isCurrent;
	        	var data = {
	        			dataset:collection,
	        			isCurrent:isCurrent,
	        			lang : lang
	        	};
	        	
	        	var parseDate = function(){
	        		if(this.groupStartTime != undefined){
    					return GO.util.formatDatetime(this.groupStartTime, null, "MM.DD(ddd) HH:mm") + "~ " + GO.util.formatDatetime(this.groupEndTime, null, "MM.DD(ddd) HH:mm"); 
    				}
	        		
    				var startTime = GO.util.formatDatetime(this.reservedStartTime, null, "MM.DD(ddd) HH:mm");
    				var endTime = "";
    				if(this.reservedEndTime){
    					endTime = " ~ " + GO.util.formatDatetime(this.reservedEndTime, null, "MM.DD(ddd) HH:mm");
    				}
    				return startTime + endTime;
    			};
    			
    			var parseManager = function(){
					var managerArray = [];
					$.each(this.managers, function(k,v) {
						managerArray.push(v.user.name);
					});
					return managerArray.join(',');
				};
				
				var parseItemCount = function() {
					return GO.i18n(lang['item_count'], 'num', this.itemCount);
				};
				
				if(isCurrent){
					data.parseDate = parseDate;
				}else{
					data.parseManager = parseManager;
				}
				data.parseItemCount = parseItemCount;
    			var tpl = ListUnitTpl(data);
    			return tpl;
	        },
	        getCollection : function(type){
	        	var col = assetListCollection.getCollection(type);
	        	return col;
	        },
	        renderUnit : function(type){
	        	$('#titleToolbar').html('');
	        	var _this = this;
				var myCondition = this.getCollection(type);
				var isCurrent = (type == "myReservation") ? true : false;
    			myCondition.on("reset",function(collection,response){
    				_this.collection = collection;
					var tmpl = _this.makeTemplete({
						collection : collection.toJSON(),
						isCurrent : isCurrent
					});
					_this.$el.find('#assetHomeList').html(tmpl);		
					_this.initIscroll();
					GO.util.appLoading(false);
				});
	        },
	        
			render : function() {
				GO.util.pageDone();
				var _this = this;
				$('#titleToolbar').hide();

				this.headerToolBarView.render({
					title: assetLang['예약'],
					isList : true,
					isHome: true
				});

				var myCondition = this.getCollection('myReservation');
				myCondition.on("reset",function(collection,response){
					if(collection.toJSON().length < 1){
    					_this.renderUnit('assetList');
    					$('#tabWrap li').removeClass('on');
    					$('#tabWrap li').eq(1).addClass('on');
    				}else{
    					_this.renderUnit('myReservation');
    				}
					$('#btnHeaderSearch').hide();
				});
			}
		});
		
		return {
			render: function() {
				instance = new homeList(); 
				return instance.render();
			}
		};
		
	});
}).call(this);