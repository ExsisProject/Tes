(function() {
    define([
            "jquery", 
            "underscore", 
            "app", 
            "backbone", 
            "hogan", 

            "asset/models/asset_user_create", 
            "asset/collections/asset_admin",
            
            "text!calendar/templates/_asset_base.html",
            "text!calendar/templates/_asset_list.html",
            "text!calendar/templates/_asset_alert.html",
            
            "i18n!nls/commons", 
            "i18n!asset/nls/asset", 
            "go-nametags", 
            
            "jquery.go-popup"
        ], 
        
        function( 
            $, 
            _, 
            GO,
            Backbone, 
            Hogan, 

            AssetReservationModel, 
            AssetAttrs, 
            
            assetBaseTpl,
            assetListTpl,
            assetAlertTpl,
            
            commonLang, 
            assetLang, 
            NameTagListView
    ) {
    	var lang = {
            'rental': assetLang["대여"], 
            'item': assetLang["항목"], 
            'reservation': assetLang["예약"],
            'no_assetitem': assetLang["이용가능한 자산이 없습니다."],
            'confirm': commonLang['확인'],
            'cancel': commonLang['취소'],
            'close': commonLang["닫기"], 
            'open': commonLang["열기"],
            'alert_length': commonLang["0자이상 0이하 입력해야합니다."]
    	};
    	
    	// TODO : 일정 등록시 Asset Model 정보 관리 변수, beforeReseveAssetItems
    	var beforeReseveAssetItems = [];
    	var saveFlag = false;
    	
    	// Model : CalendarAsset - 캘린더 연동 가능 자산
        var CalendarAsset = Backbone.Model.extend({});
        // Collection : CalendarAssets
        var CalendarAssets = Backbone.Collection.extend({
            model: CalendarAsset, 
            url: '/api/asset/calendar'
        });
        
        // Model : ReservedAssetItem
        // - 나의 캘린더 연동 예약 현황 
        var ReservedAssetItem = Backbone.Model.extend({});
        // Collection : ReservedAssetItems
        var ReservedAssetItems = Backbone.Collection.extend({
            model: ReservedAssetItem, 
            url: function() {
                return '/api/asset/my/reservation/calendar/' + this.eventId;
            }, 
            
            initialize: function() {
                this.eventId = -1;
            }, 
            
            setEventId: function(id) {
                this.eventId = id;
                return this;
            }
        })
        
        // Collection : AssetAvailableItems - 자산(예약) 분류별 예약가능한 항목 목록 호출
        var AssetAvailableItems = Backbone.Collection.extend({
            
            assetId: null, 
            params: {
                "startTime": undefined, 
                "endTime": undefined
            }, 
            
            url: function() {
                return '/api/asset/' + this.assetId + '/item/reservation/availability?' + $.param(this.params);
            }, 
            
            initialize: function() {
            }, 
            
            setAssetId: function( id ) {
                this.assetId = id;
                return this;
            },  
            
            setAssetStartTime: function( assetStartTime ) {
            	this.assetStartTime = assetStartTime;
            	return this;
            },
            
            setAssetEndTime: function( assetEndTime ) {
            	this.assetEndTime = assetEndTime;
            	return this;
            },
            
            setStartTime: function( datetime ) {
                this.params.startTime = datetime;
                return this;
            }, 
            
            setEndTime: function( datetime ) {
                this.params.endTime = datetime;
                return this;
            }
        });
        
        
        // View : AssetAvailableItemsView - 자산 분류별 예약가능한 자산 목록 View
        var AssetAvailableItemsView = Backbone.View.extend({
            tagName: 'table', 
            className: 'type_normal tb_list_sub list_reser007', 
            sortDirection: 1, 
            
            events: {
               // "click .sorting_asc": "sortByName",
               // "click .sorting_desc": "sortByName", 
                "click .btn-reservation": "reserve"
            }, 
            
            initialize: function(options) {
            	this.options = options || {};
            	////////////////////////////////////
            	// API Request List
            	this.assetId = this.options.assetId;
                this.startTime = GO.util.toISO8601(this.options.startTime);
                this.endTime = GO.util.toISO8601(this.options.endTime);
                
                // Result
                this.availableItems = this.collection;
                this.sortDirection = 1;
                
                // asset에 대한 속성을 받아둔다.
                this.assetAttrs = new AssetAttrs();
                this.assetAttrs.setUrlPart('info');
                this.assetAttrs.setAssetId(this.assetId);
                this.assetAttrs.fetch({async: false});
                
                if (!this.saveFlag) {
                	this.availableItems.sortBy(function(item) { 
                   		return item.name; 
                	});
                }
            }, 
            
            render: function() {
                var assetAttrs = this.assetAttrs.at(0).get('attributes'),
                	assetAvailableListTpl = Hogan.compile(assetListTpl); // makeAvailableListTemplate();
                
                this.$el
                    .empty()
                    .append(assetAvailableListTpl.render({
                    	// 자산 항목 정보 설정
                        "label": {
                            "rental": lang.rental, 
                            "item": lang.item, 
                            "reservation": lang.reservation
                        },
                        "asset_option_headers": assetAttrs, 
                        "column_counts": assetAttrs.length + 2,
                        "asset_item_list": this.availableItems.toJSON(),
                        emptyMessage: makeListEmptyMessage()
                    }));
            }, 
            
            setStartTime: function( datetime ) {
                this.startTime = datetime;
                return this;
            }, 
            
            setEndTime: function( datetime ) {
                this.endTime = datetime;
                return this;
            }, 
            
            // reload : Collection 정보 Fetch
            reload: function(model) {
                var self = this;
                
                self.availableItems.fetch({
                    success: function(assetItems) {
                    }
                })
            }, 
            
            // 20150121.CCH - 사용하지 않음
            sortByName: function(e) {
                var self = this, 
                    $el = $(e.currentTarget), 
                    trList = this.$el.find('tbody').children().get();
                
                trList.sort(function(el1, el2) {
                    var t1 = $(el1).find('td.name > span.txt').text(), 
                        t2 = $(el2).find('td.name > span.txt').text(), 
                        result;
                    
                    if(self.sortDirection === -1) {
                        result = (t1 > t2);
                    } else {
                        result = (t1 < t2);
                    }
                    
                    return result;
                });
                
                this.$el.find('tbody')
                    .empty()
                    .append(trList);
                
                this.sortDirection *= -1;
                
                if($el.hasClass('sorting_asc')) {
                    $el.removeClass('sorting_asc').addClass('sorting_desc');
                } else {
                    $el.removeClass('sorting_desc').addClass('sorting_asc');
                }
            }, 
            
            // 예약버튼 - Event
            reserve: function(e) {
            	e.stopPropagation();
            	
                var self = this, 
                    $tr = $(e.currentTarget).parent().parent(), 
                    assetId = this.assetId, 
                    assetItemId = $tr.data('id'),
                    assetItemName = $tr.data('name');

            	var reserveAttrs = new AssetAttrs();
                reserveAttrs.setUrlPart('reservation');
                reserveAttrs.setAssetId(assetId);
                //확인필요
                             
                reserveAttrs.fetch({
                    success: function(attrs) {                        
                        if(attrs.length > 0) {
                            self.showReservationLayer(assetItemId, assetItemName, attrs.toJSON(), $tr);
                        } else {
                        	self.reserveAssetItem(assetItemId, assetItemName, attrs.toJSON(), $tr);
                        }
                    }
                });
            }, 
                       
            // 이용목적 정보 Pop-Up : 이용정보 설명 기입
            showReservationLayer: function(id, name, attrs, tr) {
                var self = this, 
                    template = Hogan.compile(assetAlertTpl), 	// makeReservationLayerTemplate(), 
                    $tr = tr,
                    popupEl;
                
                popupEl = $.goPopup({
                    header: name, 
                    pclass: "layer_normal layer_reser", 
                    contents: template.render({
                        "attributes": attrs
                    }), 
                    buttons : [{
                        'btext' : lang.confirm,
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback' : _.bind(submitForm, this)
                    }, {
                        'btext' : lang.cancel, 
                        'btyle' : 'cancel'
                    }]
                });

                // 이용목적 Pop-Up Layout 호출
                $(popupEl).on('submit', "form[name=form-reserv]", function(e) {
                	e.preventDefault();
                	submitForm.call(self, popupEl);
                });
                
                // 이용목적 Pop-Up Layout
                function submitForm(el) {
                	var formData = $(el).find('form[name=form-reserv]').serializeArray(), 
	                    props = [], 
	                    isValidate = true;
                
	                _.each(formData, function(item) {
	                    var $el = $(el).find('input[name=' + item.name + ']'), 
	                        tok = item.name.split('_'), 
	                        attrId = tok[1], 
	                        content = item.value;
	                    
	                    if(content.length < 1 || content.length > 255) {
	                        $.goError(GO.i18n(lang.alert_length, { "arg1": "1", "arg2": "255" }),  $el);
	                        $el.addClass('enter error');
	                        isValidate = false;
	                        return;
	                    } 
	                    
	                    props.push({ "attributeId": attrId, "content": content });
	                }, this);
	                
	                if(isValidate) {
	                    this.reserveAssetItem(id, name, props, $tr).done(function() {
	                    	popupEl.close();
	                    });
	                }
                }
            }, 
            
            // 자산정보 예약 - 공통
            // ParamInfo
            // - itemId : 자산 ID
            // - itemName : 자산이름
            // - attrs(옵션) : 추가 정보 Mapping
            reserveAssetItem: function( itemId, itemName, attrs, tr ) {
                var self = this,
                	deferred = $.Deferred(),
                	$tr = tr,
                	isDuplication = false,
                    newModel = new AssetReservationModel({ 
                        "assetId": this.assetId,
                        "itemId": itemId, 
                        "itemName": itemName, 
                        "type": "reserve", 
                        "startTime": GO.util.toISO8601(this.startTime), 
                        "endTime": GO.util.toISO8601(this.endTime)
                    });
                
                if(typeof attrs !== 'undefined') {
                    newModel.set( 'properties', attrs );
                } 
                
                // 예약된 AssetItem의 tr을 hidden 처리
                $tr.hide();
                // 중복데이터 체크
            	$.each(beforeReseveAssetItems, function(i){
            		if (itemName == beforeReseveAssetItems[0].get('itemName')) {
            			isDuplication = true;
            		}
        		});
                
                // AssetReservationModel을 beforeReseveAssetItems에 push
            	if (!isDuplication) {
            		beforeReseveAssetItems.push(newModel);
            	}
        		
                // { GO-15500.CCH View NameTag 표시
                self.triggerReservedItem( newModel );
                deferred.resolve();
                // }

                return deferred;
            }, 
            
            triggerReservedItem: function( itemModel ) {
            	// event_detail > formspy trigger 등록
                this.$el.trigger("asset-item:reserved", [itemModel.toJSON()]);
            }
        });
        
        
        // View : AssetView
        // - 자산 상세 Item View
        var AssetView = Backbone.View.extend({
            className: "flexable_box asset-reservation", 
            
            assetId: 0, 
            startTime: new Date(), 
            endTime: new Date(),
            listView: null, 
            nameTagView: null,
            events: {
                "click .ic_openbox": "openFolder", 
                "click .ic_closebox": "closeFolder"
            }, 
            
            initialize: function(options) {
            	this.options = options || {};
            	
                this.listView = null;
                this.nameTagView = null;
                this.assetId = this.model.id;
                this.assetStartTime = this.model.get('startTime');
                this.assetEndTime = this.model.get('endTime') == "2400" ? "2359" : this.model.get('endTime');
                this.startTime = GO.util.toISO8601(this.options.startTime);
                this.endTime = GO.util.toISO8601(this.options.endTime);
                this.eventId = this.options.eventId || null;
                this.allday = this.options.allday || false;
                
                this.availableItems = new AssetAvailableItems();
                this.availableItems.setAssetId(this.assetId);
                this.availableItems.setAssetStartTime(this.assetStartTime);
                this.availableItems.setAssetEndTime(this.assetEndTime);
                this.setStartTime(this.startTime);
                this.setEndTime(this.endTime);
                
                this.$el.data( 'asset-id', this.model.id );
                this.$el.on('asset-item:reserved', $.proxy(function(e, attr) {
            		this.addNameTag(attr.id, attr.itemName);
                }, this));
            }, 
            
            render: function() {
                var self = this, 
                  template = Hogan.compile(assetBaseTpl);
//                template = makeBaseTemplate();
                var asset_name = this.model.get('name');
                if(this.model.get('otherCompany')){
                	var companyName = this.model.get('companyName') || '';
                	asset_name = companyName + ' ' + asset_name;
                };
                
                this.$el.append(template.render({
                    "asset_name": asset_name, 
                    "label": {
                        "close": lang.close,
                        "open": lang.open
                    }
                }));
                
                if(!this.nameTagView) {
                    this.nameTagView = NameTagListView.create();
                    this.$el.find('.wrap_name_tag').append(this.nameTagView.el);
                    
                    // { 20150121.CCH 통신 요청 별도 구현으로 로직 제외 처리
                    this.nameTagView.$el.on("nametag:removed", $.proxy(this.removeAssetItem, self));
                    // }
                }
                
                this.$el.data( 'asset-view', this );
            },
            
            setStartTime: function( datetime ) {
            	if(this.allday){
            		datetime = GO.util.toISO8601(GO.util.toMoment(datetime.split("T")[0] + " " + this.assetStartTime.substring(0,2) + ":" + this.assetStartTime.substring(2,4), "YYYY-MM-DD HH:mm")); 
                }
                this.startTime = datetime;
                this.availableItems.setStartTime(this.startTime);
                return this;
            }, 
            
            setEndTime: function( datetime ) {
            	if(this.allday){
            		datetime = GO.util.toISO8601(GO.util.toMoment(datetime.split("T")[0] + " " + this.assetEndTime.substring(0,2) + ":" + this.assetEndTime.substring(2,4), "YYYY-MM-DD HH:mm"));
                }
                this.endTime = datetime;
                this.availableItems.setEndTime(this.endTime);
                return this;
            }, 
            
            changeTime: function( startTime, endTime, allday ) {
            if(allday){
            	startTime = startTime.split("T")[0] + "T" + this.assetStartTime.substring(0,2) + ":" + this.assetStartTime.substring(2,4);
            	endTime = endTime.split("T")[0] + "T" + this.assetEndTime.substring(0,2) + ":" + this.assetEndTime.substring(2,4);
            }
            	var needChange = !(this.startTime === GO.util.toISO8601(startTime) &&  this.endTime === GO.util.toISO8601(endTime));
            	if(needChange) {
            		this.setStartTime( GO.util.toISO8601(startTime) ).setEndTime( GO.util.toISO8601(endTime) );
	                this.loadItems(true);
            	}                
            }, 
            
            loadItems: function( force , itemId ) {            
                var self = this;
                if(!this.listView || (force || false)) {
                	this.availableItems.setStartTime(self.startTime);
                	this.availableItems.setEndTime(self.endTime);
                    this.availableItems.fetch({
                        success: function(assetItems) {
                            
	                        if(!self.listView) {
	                            self.listView = new AssetAvailableItemsView({
	                                "assetId": self.assetId, 
	                                "collection": assetItems
	                            });
	                            
	                            self.$el.find('.flexable_content')
	                                .empty()
	                                .append(self.listView.el);
	                        }
	                        
	                        self.listView.setStartTime(self.startTime);
	                        self.listView.setEndTime(self.endTime);
	                        _.each(assetItems.models, function(model, idx) {
	                        	if(model) {
		                        	$('.reserved-asset-item').each(function(i, el) {
		                        		var assetItemName = model.get("name") || {};
		                        		if ($(el).find(".name").text() == assetItemName) {      
		                        			// Backbone Model을 삭제 (without jqXHR)
		                        			model.trigger('destroy', model);
		                        		}
		                        	});
	                        	}
	                        });
	                        self.listView.render();
                        }
                    });
                }
            },
            
            // NameTag Setting & Add
            addNameTag: function(id, title, reservedId, itemIsMine) {
                var options = {
                    "removable": true,
                    "onCreate": function( el ) {
                        $(el).addClass('reserved-asset-item');
                    },
                    "itemIsMine": itemIsMine
                };
                if (id) {
                    options["onDelete"] = function(id, title) {
                        var deferred = $.Deferred();
                        $.goConfirm(
                            "",
                            assetLang["캘린더 예약 자산 취소 안내"],
                            function() {
                                deferred.resolve();
                            },
                            function() {
                                deferred.reject();
                            }
                        );
                        return deferred.promise();
                    }
                }
                this.nameTagView.addTag(id, title, options, reservedId);
            }, 
            
            // 한개의 자산 아이템 삭제
            // Case 1 : 최초 등록시
            // Case 2 : 캘린더 일정 수정시
            // Case 3 : 캘린더 일정 수정시 기등록된 자산이 있을 경우 처리
            removeAssetItem: function(e, id, li) {
                var self = this,
                	reservedId = $(li).data('user'),
                	itemName = $(li).find('.name').text();
                
                // 캘린더 일정 수정 및 삭제일 경우
                if(reservedId) { // 수정상태에서 예약된 자산아이템 일때
                    
                	if(!$.isArray(reservedId)) {
                        reservedId = [reservedId];
                    }
                    
                    $.ajax({
                        "url": GO.config("contextRoot") + 'api/asset/item/reservation',
                        "contentType": 'application/json', 
                        "dataType": "json", 
                        "data": JSON.stringify({ "ids": reservedId }), 
                        "type": "DELETE", 
                        "success": function() {
                        	// event_detail > formspy trigger 등록
                        	self.$el.trigger("asset-item:destroy", reservedId);
                        	// 자산 정보 render
                            self.loadItems(true);
                        },
                        "error": function() {
                        	console.log("Asset Reservation : error!");
                        	self.loadItems(true);
                        }
                    });
                } 
                
            	// { 캘린더 일정 신규등록시 삭제일 경우
                // 1. NameTag > Element 삭제
            	// 2. $(el)의 display-Hidden 속성 해제 (assetId > assetItemId 기준)
        		for (var i=0; i < beforeReseveAssetItems.length; i++) {
        			if (beforeReseveAssetItems[i].get('itemName') === itemName) {
        				beforeReseveAssetItems.splice(i,1);
        			}
        		}
        		
            	$trs = $('tbody#data-assetItems').find('tr[data-assetid]');
            	$trs.each(function(index, trsub){
            		var itemN = $(trsub).attr('data-name');
            		if (itemN === itemName) {
            			$(trsub).show();
            		}
            	})
            }, 
            
            // NameTag List Getter
            getReservedItems: function() {
                return this.nameTagView.getNameTagList();
            }, 
            
            openFolder: function() {
                this.$el.find('.foldable').show();
                this.$el.find('.ic_openbox')
                    .removeClass('ic_openbox')
                    .addClass('ic_closebox');
                
                this.loadItems();
            }, 
            
            closeFolder: function() {
                this.$el.find('.foldable').hide();
                this.$el.find('.ic_closebox')
                    .removeClass('ic_closebox')
                    .addClass('ic_openbox');
            }
        });
        
        function assetViewLoad( parent, startTime, endTime, allday, reservedItems, recurrence ) {
            var assets = new CalendarAssets(), 
                $parent = $(parent);
            
            // Asset Model 정보 초기화
            resetAssetItemList();
            
            // 기 등록된 예약자산의 반복일정 등록/해제시의 Side Effect 발생 이슈 처리
            var pLength = $(parent).children().length;
            if (pLength > 0 || !recurrence) {            	
            	for(var i=0; i < pLength; i++) {
            		$(parent).children().remove();
            	}
            }

            assets.fetch({
                success: function(collection) {                    
                    if(collection.length > 0) {
                        // TODO: 여기서 form 요소를 핸들링하는건 좀 아니지 않을까? 리팩토링 필요
                        // render된 자산 정보가 없을 때만 로드
                        $('#asset-list-row').show();
                        collection.each(function(model) {
                        	
                        	// 중복 랜더링 제거 -> 
                        	// 원인검토 (recurrence 체크 해제시 > regist_form.js > loadAsset() 중복호출됨)
                        	var isViewDuplication = false;
                        		assetViewList = $($('.flexable_title').find('.txt'));

                        	_.each(assetViewList, function(asset, index) {
                        		if (model.get('name') == $(asset).text()) {
                        			isViewDuplication = true;
                        		}
                        	});
                        	
                        	if (!isViewDuplication) {
                        		var view = new AssetView( {"model": model, "startTime": startTime, "endTime": endTime , "allday" : allday} );
                        		$parent.append(view.el);
                        		view.render();                        		
                        	}
                            
                            // 수정시 : 기존 예약 자산 존재시 NameTag 추가
                            if(reservedItems && reservedItems[model.id]) {
                                _.each(reservedItems[model.id], function(reservedItem) {                                	
                                    view.addNameTag(reservedItem.get('itemId'), reservedItem.get('itemName'), reservedItem.get('id'), true);
                                    
                                    var isDuplication = false;
                                	$.each(beforeReseveAssetItems, function(i){
                                		if (reservedItem.get('itemName') == beforeReseveAssetItems[0].get('itemName')) {
                                			isDuplication = true;
                                		}
                            		});
                                                                    	
                                    // AssetReservationModel을 beforeReseveAssetItems에 push
                                	if (!isDuplication) {
                                		beforeReseveAssetItems.push(reservedItem);
                                	}
                                });
                                view.openFolder();
                            }
                        });
                    } else {
                        // TODO: 여기서 form 요소를 핸들링하는건 좀 아니지 않을까? 리팩토링 필요
                        $('#asset-list-row').remove();
                    }
                    
                }
            });
        }
        
        function makeListEmptyMessage() {            
        	var html = [];
            html.push(assetLang["이용가능한 자산이 없습니다."]);
            return html.join("\n");
        }
        
        function getForReserveAssetItems() {
        	var assetItems = [],
        		len = 0; 

//        	var isExist = false;
//        	if (!isExist) {
//				isExist = true;
//    			cancelReservationAll().done(function() {
//                	console.log("cancelReservationAll complete!!!");
//                });
//			}
        	
        	_.each(beforeReseveAssetItems, function(val, index) {
        		if (val.id) {
        			var startTime = val.get('reservedStartTime') || GO.util.toISO8601(GO.util.toMoment($("#startDate").val() +" "+ $("#startTime").val(), "YYYY-MM-DD HH:mm"));
        			var endTime = val.get('reservedEndTime') || GO.util.toISO8601(GO.util.toMoment($("#endDate").val() +" "+ $("endTime").val(), "YYYY-MM-DD HH:mm"));
                    var newModel = new AssetReservationModel({ 
                        "assetId": val.get("assetId"),
                        "itemId": val.get("itemId"), 
                        "itemName": val.get("itemName"), 
                        "type": "reserve", 
                        "startTime": startTime, 
                        "endTime": endTime
                    });
                    
                    assetItems.push(newModel);
                    console.log("ReservedAssetItems complete!!!");
                    
        		} else {
        			assetItems.push(val);
        		}
        	});
        	
        	//resetAssetItemList();
        	
        	return assetItems;
        }

        /**
         * 예약 자산 초기화 
         */
        function resetAssetItemList() {
        	_.each(beforeReseveAssetItems, function(model, idx) {
        		beforeReseveAssetItems.splice(idx, 1);
        	});

        	beforeReseveAssetItems = [];
        }
        
        /**
         * 모든 예약 자산 삭제 처리
         */
        function cancelReservationAll(callback) {
            var self = this,
            	reservedIds = [], 
                deferred = $.Deferred();
            
            $('.reserved-asset-item').each(function(i, el) {
            	if ($(el).data("user")) {
            		// NameTag의 사용자 정보(user)에 예약 데이터 저장되어 있음
                    reservedIds.push($(el).data('user'));
            	}
            	$(el).remove();
            	$trs = $('tbody#data-assetItems').find("tr[data-assetid]");
            	$trs.each(function(index, trsub){
            		var itemN = $(trsub).attr('data-name');
            		if (itemN === $(el).find('span.name').text()) {
            			$(trsub).show();
            		}
            	})
            });
            
            if(reservedIds.length > 0) {
            	deferred = $.ajax({
                    "url": GO.config("contextRoot") + 'api/asset/item/reservation/force',
                    "contentType": 'application/json', 
                    "dataType": "json", 
                    "data": JSON.stringify({ "ids": reservedIds }), 
                    "type": "DELETE",
                    "async" : false,
                    "success": function() {
                    	console.log("All Asset Reservation Delete : success!");
                    	deferred.done();
                   },
                    "error": function() {
                    	console.log("All Asset Reservation Delete : error!");
                    }
                });
            } else {
            	// 기 등록되어 있는 예약정보가 없을 경우 Asset.reolad 처리
            	deferred.resolve();
            }
            return deferred;
        }
        
        return {
        	// Static Function 
        	// + Call : /calendar/helpers/regist_form.js
        	// + Param 
        	// - parent    : '#asset-wrapper'
        	// - startTime : timeInfo.startTime
        	// - endTime   : timeInfo.endTime
        	// - eventId   : undefined or eventId
            load: function( parent, startTime, endTime, eventId, allday, recurrence) {
            	// render된 자산정보 개수 
            	var pLength = $(parent).children().length;
                if(eventId) {
                    var reservedItems = new ReservedAssetItems();
                    reservedItems.setEventId(eventId);
                    reservedItems.fetch({
                        success: function(collection) {
                        	
                        	// groupedItems : itemId
                            var groupedItems = collection.groupBy(function(model) {
                                return model.get('assetId');
                            });
                            // render된 자산 정보가 없을 때만 로드
                        	assetViewLoad(parent, startTime, endTime, allday, groupedItems );
                        }, 
                        fail: function(response) {
                        	console.log(response);
                        }
                    });
                } else {
                	// render된 자산 정보가 없을 때만 로드
                	if ( pLength == 0 || !recurrence) {
                		assetViewLoad(parent, startTime, endTime, allday, null, recurrence);	                		
                	}
                }
            }, 
            
            cancelReservationAll: cancelReservationAll,
            resetAssetItemList: resetAssetItemList,
            getForReserveAssetItems: getForReserveAssetItems
        };
    });
})();