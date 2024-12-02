(function() {
define([
		"views/mobile/m_more_list",
		"jquery",
		"backbone",
		"app",
		"i18n!nls/commons",
		"i18n!asset/nls/asset",

		"hgn!asset/templates/mobile/m_asset_item_list_unit",
		"hgn!asset/templates/mobile/m_asset_item_list",
		"views/mobile/header_toolbar",
		"asset/collections/asset_item_list",
		"asset/collections/asset_admin",
		"asset/models/asset_guide",

		"jquery.go-popup",
		"GO.util",
		"jquery.go-validation",
		"jquery.placeholder"
	],
	function(
		MoreView,
		$,
		Backbone,
		App,
		commonLang,
		assetLang,

		ListUnitTpl,
		LayoutTpl,
		HeaderToolbarView,
		assetItemListCollection,
		assetAdminCol,
		guideModel
	) {
		var instance = null;
		var lang = {
			'no_asset' : assetLang['이용가능한 자산이 없습니다.'],
			'rent' : assetLang['대여가능'],
			'no_rent' : assetLang['대여불가']
		};

		var rentalItemList = MoreView.extend({
			el : '#content',
			unbindEvent: function() {
				this.$el.off('vclick', '#rentalTab li');
				this.$el.off('vclick', '#assetItemList li[data-assetid]');
			},
			bindEvent: function() {
				this.$el.on('vclick', '#rentalTab li', $.proxy(this.tabWrap, this));
				this.$el.on('vclick', '#assetItemList li[data-assetid]', $.proxy(this.itemTab, this));
			},
			initialize : function(opt){
				this.tabKind = sessionStorage.getItem("tabKind");
				this.key = opt.queryString || "empty";
				this.assetData = GO.util.store.get(this.key);
				this.assetId = opt.assetId;
				this.type = opt.type;
				this.startTime = opt.startTime;
				this.endTime = opt.endTime;
				this.isRental = true;
				if(this.type == "reservation" || this.type == "calendar"){ //예약이나, 캘린더연동 예약시 상단 대여가능,불가능 탭바 숨김
					this.isRental = false;
				}
				this.attrCol = this.getAttribute();
				this.collection = new assetItemListCollection.init();
				this.collection.setAssetId(this.assetId);
				this.setKind(this.type, this.tabKind !== "RETURN" && this.tabKind !== "NORENTABLE");
				var dataSet = {};
				dataSet.property = 'name';
				dataSet.direction = 'desc';
				if(this.type == "calendar"){
					dataSet.startTime = this.startTime;
					dataSet.endTime = this.endTime;
				}
				this.unbindEvent();
				this.bindEvent();
				this.headerToolbarView = HeaderToolbarView;
				this.guidemodel = new guideModel();
				var renderListFunc = {
					listFunc: $.proxy(function (collection) {
						this.renderList(collection);
					}, this)
				};
				this.setRenderListFunc(renderListFunc);
				this.setFetchInfo(dataSet, this.collection);
			},
			itemTab : function(e){
				this.setSessionInfo(e);
				var target = $(e.currentTarget);
				var assetId = target.attr('data-assetid');
				var itemId = target.attr('data-itemid');
				var url;
				if(target.attr('data-type') == "rent"){
					//대여
					var status = target.attr('data-status');
					if(status == "RENTABLE"){
						//대여하기 페이지
						url = ['asset',assetId,'item',itemId,'create','rental'];
					}else if(status == "RETURN" || status == "NORENTABLE"){
						// 대여 상세보기
						sessionStorage.setItem("tabKind", status);
						url = ['asset',assetId,'item',itemId,'status','rental'];
					}

				}else{
					var assetName = target.attr('data-assetname');
					if(this.type == "calendar"){
						//캘린더에서 예약시
						url = ['asset',assetId,'item',itemId,'create','calreservation',this.startTime,this.endTime,'c',this.key];
					}else{
						// 예약 - 월간뷰로 이동
						url = ['asset/monthly',assetId,itemId,assetName,GO.util.shortDate(new Date)];
					}
				}
				App.router.navigate(url.join('/'),true);
				return false;
			},
			tabWrap : function(e){
				var _this = this;
				this.pageNo = 0;
				var target = $(e.currentTarget);
				$('#rentalTab li').removeClass('on');
				target.addClass('on');
				this.setKind('rental', target.attr('data-type') === 'rentable');
				this.$listEl.empty();
				this.dataFetch()
					.done($.proxy(function (collection) {
						_this.renderListFunc.listFunc(collection);
					}));
				return false;
			},
			renderList: function (collection) {
				var tmpl = makeTemplete({
					collection: this.filterCollection(collection).toJSON(),
					isRental: this.isRental,
					attrCol: this.attrCol.toJSON()[0]
				});
				this.$listEl.append(tmpl);
			},
			filterCollection: function(collection){
				var filteredCollection;
				if (this.type === "calendar") {
					var itemIds = _.map(this.assetData.asset, function (asset) {
						return parseInt(asset.itemId);
					});
					var filteredAssetItems = collection.filter(function (model) {
						return !_.contains(itemIds, model.id);
					});
					filteredCollection = new Backbone.Collection(filteredAssetItems);
				} else {
					filteredCollection = collection;
				}
				return filteredCollection;
			},
	        getAttribute : function(){
				var assetList = new assetAdminCol.prototype.constructor();
				assetList.setUrlPart('info');
				assetList.setAssetId(this.assetId);
				assetList.fetch({async:false,reset:true});
	        	return assetList;
	        },
	        setKind : function(type, isRentable) {
	        	var kind = "";
	        	this.isRental = true;
	        	if(type == "reservation"){
	        		kind = "reservation";
					this.isRental = false;
	        	}else if(type == "rental" && isRentable){
	        		kind = "rentable";
	        	}else if(type == "calendar"){
	        		kind = "calendar";
					this.isRental = false;
	        	}else {
	        		kind = "notavailable";
	        	}
				this.collection.setUrlPart(kind);
	        },

			render : function() {
				var _this = this;
				$('#btnHeaderSearch').show().attr('data-assetid',this.assetId);

				var Tpl = LayoutTpl({
					isRental : this.isRental,
					lang : lang
				});
				this.$el.html(Tpl);
				if(this.tabKind === "RETURN" || this.tabKind === "NORENTABLE") {
					$('li[data-type="norentable"]').addClass('on');
				} else {
					$('li[data-type="rentable"]').addClass('on');
				}
				this.$listEl = this.$el.find('#assetItemList');

				this.dataFetch()
					.done($.proxy(function (collection) {
						_this.renderListFunc.listFunc(collection);
						_this.scrollToEl();
					}, this));

				var toolBarData = {
					title: this.renderTitle(),
					isList : true,
					isSideMenu: true,
					isHome: true
				};
				if(this.key != "empty"){
					toolBarData = {
						title: this.renderTitle(),
						isClose : true,
						closeCallback : function() {
							GO.router.navigate(GO.contextRoot + "calendar/asset/write/" + _this.startTime + "/" + _this.endTime + "/" + _this.key, true);
						}
					};
				}
				this.headerToolbarView.render(toolBarData);
				$('#btnHeaderSearch').show().attr('data-assetid',this.assetId);

				this.renderGuide();
				GO.util.appLoading(false);
			},
			renderTitle : function(){
				this.guidemodel.clear();
				this.guidemodel.set({assetId : this.assetId},{silent:true});
				this.guidemodel.fetch({async : false});
				return this.guidemodel.get('name');
			},
			renderGuide : function(){
				this.guidemodel.clear();
				this.guidemodel.set({assetId : this.assetId},{silent:true});
				this.guidemodel.fetch({async : false});
				$('#titleToolbar h2').text(this.guidemodel.get('name'));
			}
		});
		function makeTemplete(opt){
        	var _this = this;
        	var collection = opt.collection;
        	var isRental = opt.isRental;
        	var attrCol = opt.attrCol;

        	$.each(collection,function(k,v){
        		$.each(v.properties,function(m,n){
        			$.each(attrCol.attributes,function(o,p){
        				if(n.attributeId == p.id){
	        				n.attrName = p.name;
	        			}
        			});
        		});
        	});

        	var parseAttr = function(){
        		var attrArray = [];
        		$.each(this.properties,function(k,v){
        			attrArray.push('<span class="txt">'+v.attrName+' : '+v.content+'</span>');
        		});
        		return attrArray.join('<span class="part">|</span>');
        	};

        	var data = {
        			dataset:collection,
        			isRental:isRental,
        			lang : lang,
        			parseAttr : parseAttr
        	};

			var tpl = ListUnitTpl(data);
			return tpl;
		}
		return {
			render: function(opt) {
				instance = new rentalItemList(opt);
				return instance.render();
			}
		};

	});
}).call(this);