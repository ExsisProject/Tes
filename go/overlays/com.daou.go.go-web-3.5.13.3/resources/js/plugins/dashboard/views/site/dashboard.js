(function() {
	
	define([
        "backbone", 
        "when", 
        "app", 
        "dashboard/models/dashboard", 
        "dashboard/models/gadget",
        "dashboard/views/site/gadget", 
        "i18n!dashboard/nls/dashboard", 
        "go-webeditor/jquery.go-webeditor"

    ], function(
		Backbone,
		when, 
		GO, 
		Dashboard, 
		Gadget, 
		GadgetView, 
		DashboardLang
	) {
		var 
			INSTANCE_NAME = 'dashboard', 
			GADGETS_SELETOR = '.go-gadget', 
			GADGET_HEADERS_SELETOR = '.go-gadget-header', 
			BOXES_SELETOR = '.go-gadget-column', 
			IDATTR_PREFIX = 'go-dashboard-', 
			BOX_GUIDE_SELECTOR = 'dashboard-box-guide', 
			DASHBOARD_EDIT_SELETOR = 'go-dashboard-editing', 
			BOX_SELETOR_PREFIX = '.gadget-col-', 
			DEFAULT_ADD_TO_BOXNUMBER = 1, 
			DEFAULT_BOX_ORDER = 0, 
			GADGET_DRAG_HELPER_SIZE = { "width": 350, "height": 150 }, 
			GADGET_DRAG_CURSOR_POSITION = { "left": 225, "top": 20 },
			SORTABLE_SCROLL_SESITIVITY = 10,
			SORTABLE_SCROLL_SPEED = 10,
			DASHBOARD_EDITING = {
	            "enable": "dashboard:enable-editing", 
	            "disable": "dashboard:disable-editing"
	        }, 
	        LAYOUT_SPECS = [], 
			DashboardView;
		
		// 레이아웃 스펙
		LAYOUT_SPECS.push({"id": 1, "boxCount": 3, "layout": 1, "desc": "3-1"});
		LAYOUT_SPECS.push({"id": 2, "boxCount": 3, "layout": 2, "desc": "3-2"});
		LAYOUT_SPECS.push({"id": 3, "boxCount": 3, "layout": 3, "desc": "3-3"});
		LAYOUT_SPECS.push({"id": 4, "boxCount": 5, "layout": 1, "desc": "5-1"});
		
		DashboardView = Backbone.View.extend({
			className: 'go-dashboard',
			editingMode: false, 
			layoutTemplate: '',
			
			initialize: function(options) {
				if(!this.id) {
					this.$el.prop("id", getElemenetIdAttrFromModel(this.model));
				}
				
				this.$el.addClass(this.model.getSelectorName());
				this.$el.data(INSTANCE_NAME, this);
				this.layoutTemplate = '';
			}, 
			
			render: function(isforced) {
				var self = this;
				var defer = when.defer();
				var loadLayout = getLayout(this.model);
				var fetchGadgets;

				loadLayout.then(function(template) {
					return renderDashboardLayout.call(self, template());
				}).then(function() {
					return self.model.fetchGadgets(isforced);
				}).then(function(fetchGadgets) {
					// TODO: 코드 리팩토링 필요
					return fetchGadgets.then(function(gadgets) {
						buildGadgets.call(self, gadgets);
						defer.resolve();
					}, defer.reject);
				}, function(err) {
					console.log(err.stack);
					defer.reject();
				});
				
				return defer.promise;
			}, 
			
			
			
			decideActivate: function() {
				if(this.model.activated()) {
					this.$el.addClass('activated').show();
				} else {
					this.$el.removeClass('activated').hide();
				}
			}, 
			
			enableEditingMode: function() {
				if(!this.editingMode) {
                    if(!this.$el.find(BOXES_SELETOR).length) {
                    	renderDashboardLayout.call(this);
                    }
                    
                    this.$el.addClass(DASHBOARD_EDIT_SELETOR);
                    addPlusGagdetWrapper.call(this);
                    this.enableSortable();
                    this.editingMode = true;
				}
			}, 
			            
            enableSortable: function() {
            	var self = this;
            	
            	$(BOXES_SELETOR).sortable({
                    items: GADGETS_SELETOR, 
                    cancel: '.ui-not-sortable', 
                    connectWith: BOXES_SELETOR, 
                    handle: GADGET_HEADERS_SELETOR, 
                    distance: 10, 
                    delay: 250, 
                    placeholder: 'go-gadget-placeholder', 
                    cursorAt: GADGET_DRAG_CURSOR_POSITION, 
                    scrollSensitivity: SORTABLE_SCROLL_SESITIVITY, 
                    scrollSpeed: SORTABLE_SCROLL_SPEED, 
                    
                    helper: function(event, el) {                    	
                    	return buildDragHelper(el);
                    }, 
                    
                    over: function(event, ui) {
                        // plus 버튼을 맨 마지막으로 보낸다.
                        $(this).find('.' + BOX_GUIDE_SELECTOR).appendTo(this);
                    }, 
                    
                    // update 이벤트는 같은 컨테이너안이라면 한번만, 다른 컨테이너로 옮겨졌을 경우 두번 발생하게 된다.
                    // stop과 beforeStop 이벤트가 한번만 발생한다. 
                    stop: function(event, ui) {
                        var 
                        	$el = ui.item, 
                        	parent = $el.parent(), 
                        	gadgetView =  $el.data('view'),
                        	gadgetId = gadgetView.getGadgetId(), 
                        	oldBoxNumber = gadgetView.getBoxNumber() - 1,
                        	newBoxNumber = +parent.data('columnid') - 1, 
                        	newBoxOrder = 0;
                        
                        parent.find(GADGETS_SELETOR).each(function(i, item) {
                            if($(item).data('view').getGadgetId() === gadgetId) {
                            	newBoxOrder = i;
                                return;
                            }
                        });
                        
                        gadgetView.move(newBoxNumber, newBoxOrder)
                        	.done(function(model) {
                        		syncGadgetsPosition.call(self, _.uniq([oldBoxNumber, newBoxNumber]));
                        	})
                        	.fail(function() {
                        		$.goError(DashboardLang["가젯 이동 오류 메시지"]);
                        		$el.sortable('cancel');
                        	});
                    }
                });
                
                $(GADGETS_SELETOR).addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
                    .find(GADGET_HEADERS_SELETOR)
                        .addClass('ui-widget-header ui-corner-all')
                        .end();
                
                disableTextSelect($(BOXES_SELETOR));
            }, 
            
            disableSortable: function() {
            	this.$el.find(GADGETS_SELETOR)
                    .trigger("gadget:disable-editing")
                    .removeClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
                    .find(GADGET_HEADERS_SELETOR)
                    .removeClass('ui-widget-header ui-corner-all')
                    .end();
            	
            	this.$el.find(BOXES_SELETOR).sortable('destroy');
            	
            }, 
            
            disableEditingMode: function() {
            	if(this.editingMode) {
                    var self = this;
                    
                    this.$el.find('.' + BOX_GUIDE_SELECTOR).remove();
                    this.model.fetchGadgets(true).then(function(gadgets){
                    	
                    	if(gadgets.length > 0) {
                        	self.disableSortable();
                        } else {
                        	buildEmptyMessage.call(self);
                        }
                    	
                    	self.$el.removeClass(DASHBOARD_EDIT_SELETOR);
                    	self.editingMode = false;
                    	
                    	if(!!GO.router.getSearch('editmode')) {
                        	GO.router.navigate('home', {trigger: false, replace: true});
                        }
                    });
                }
            },
            
            show: function() {
            	this.$el.show();
            }, 
            
            hide: function() {
            	this.$el.hide();
            }, 
            
            isEditingMode: function() {
            	return this.editingMode;
            }, 
            
            addGadget: function(gadgetSpec) {
            	var newGadgetView, 
            		$targetBox = this.$el.find(getDefaultBoxSeletor()), 
            		boxNumber = +$targetBox.data('columnid') - 1, 
	            	gadgetData = {
	        			"spec": gadgetSpec, 
	        			"type": getGadgetType.call(this),
	        			"dashboard": {
	        				"id": this.model.id
	        			}, 
	        			"boxNumber": boxNumber, 
	        			"boxOrder": DEFAULT_BOX_ORDER
	            	};
            	
            	newGadgetView = buildGadgetView.call(this, gadgetData);
            	$targetBox.prepend(newGadgetView.el);
            	newGadgetView.load();
            	
            	newGadgetView.createGadget().then(_.bind(function() {
            		syncGadgetsPosition.call(this, [boxNumber]);
            	}, this));
            	
            },
            
            hasNoneSavedGadgets: function() {
            	return this.$el.find('.' + GadgetView.NEW_MARK).length > 0;
            }, 
            
            hasGadget: function() {
            	return this.$el.find(GADGETS_SELETOR).length > 0;
            }, 
            
            changeLayout: function(boxCount, layout) {
            	var deferred = $.Deferred(), 
            		boxNumbers = this.model.diffBoxNumbers(boxCount);
            	
            	if(hasGadgetsInBoxes.call(this, boxNumbers)) {
            		$.goConfirm(
						DashboardLang["레이아웃 변경 안내"], 
						DashboardLang["레이아웃 변경 확인 메시지"], 
						_.bind(function() {
							this.model.updateLayout(boxCount, layout).then(deferred.resolve, deferred.reject);
						}, this)
					);            		
            	} else {
            		this.model.changeLayout(boxCount, layout).then(deferred.resolve, deferred.reject);
            	}
            	
            	return deferred;
            }
		}, {
			LAYOUT_SPECS: Dashboard.LAYOUT_SPECS, 
			
			exists: function(dashboardId) {
				return getDashboardElement(dashboardId).length > 0;
			}, 
			
			getInstanceById: function(dashboardId) {
				if(!this.exists(dashboardId)) return undefined;
				return getDashboardElement(dashboardId).data(INSTANCE_NAME);
			}, 
			
			loadTo: function(parent, model) {
				var instance;
				var defer = $.Deferred();
				
				if(this.exists(getDashboardIdFrom(model))) {
					instance = this.getInstanceById(getDashboardIdFrom(model));
					defer.resolve(instance);
				} else {
					instance = new DashboardView({"model": model, "id": IDATTR_PREFIX + model.get('id')});
					$(parent).append(instance.el);
					instance.render().then(function() {
						defer.resolve(instance);
					}, defer.reject);
				}
				
				if(instance.isEditingMode()) {
					instance.enableEditingMode();
				}
				
				return defer;
			},
			forceLoadTo: function(parent,model) {
				var instance;
				var defer = $.Deferred();
				$(parent).find("#"+IDATTR_PREFIX+model.get('id')).remove();
				instance = new DashboardView({"model": model, "id": IDATTR_PREFIX + model.get('id')});
				$(parent).append(instance.el);
				instance.render(true).then(function() {
					defer.resolve(instance);
				}, defer.reject);
				
				return defer;
			}
		});
		
		function hasGadgetsInBoxes(boxNumbers) {
			boxNumbers = boxNumbers || [];
			
			for(var i=0,len=boxNumbers.length; i<len; i++) {
				if(hasGadgetsInBox.call(this, boxNumbers[i])) {
					return true;
					break;
				}
        	}
			
			return false;
		}
		
		function hasGadgetsInBox(boxNumber) {
			return this.$el.find(BOX_SELETOR_PREFIX + boxNumber).has(GADGETS_SELETOR).length > 0;
		}
		
		function buildDragHelper($original) {
    		var $helper = $('<div class="go-gadget-draghelper go_gadget_move_warp"></div>'),
    			gadgetView = $original.data('view'), 
    			title = gadgetView.getSpecName(), 
    			html = [];
    		
    		html.push('<div class="go-gadget">');
    			html.push('<div class="go-gadget-header go_gadget_header">');
    				html.push('<div class="gadget_h1">');
    					html.push('<span class="title">' + title + '</span>');
    				html.push('</div>');
    			html.push('</div>');
    		html.push('</div>');
			
			$helper
				.width(GADGET_DRAG_HELPER_SIZE.width)
				.height(GADGET_DRAG_HELPER_SIZE.height)
				.append(html.join("\n"));
    		
    		return $helper;
    	}
		
		/**
		 * 드래그 대상도 한번더 위치 정보를 업데이트하지만... 큰 문제 없으므로 우선은 이대로 둔다.
		 */
		function syncGadgetsPosition(boxNums) {
			_.map(boxNums || [], function(boxNumber) {
				var columnId = boxNumber + 1;
				this.$el.find(BOX_SELETOR_PREFIX + columnId)
					.find(GADGETS_SELETOR)
					.each(function(boxOrder, gadget){
						var gadgetView = $(gadget).data('view');
						gadgetView.setPosition(boxNumber, boxOrder);
					});
			}, this);
		}
		
		function getGadgetType() {            		
    		return isManagerInCompanyDashboard.call(this) ? Gadget.TYPE_COMPANY : Gadget.TYPE_USER;
    	}
		
		function getBoxElement(boxNumber) {
			return this.$el.find(BOX_SELETOR_PREFIX + (boxNumber + 1));
		}
		
		function getDefaultBoxSeletor() {
			return BOX_SELETOR_PREFIX + DEFAULT_ADD_TO_BOXNUMBER;
		}
		
        function addPlusGagdetWrapper() {
        	var $guide = $('<div class="' + BOX_GUIDE_SELECTOR + '"></div>').css({
        		"border": "1px dashed #AAA", 
        		"min-height": '100px'
			});
        	this.$el.find(BOXES_SELETOR).append($guide);
        }
		
		function renderDashboardLayout(template) {
        	if(!!template) {
        		this.layoutTemplate = template;
        	}
        	
			this.$el.empty().append(this.layoutTemplate);
		}
		
		function disableTextSelect( elem ) {
            elem.attr( 'unselectable', 'on' )
                .css( 'MozUserSelect', 'none' )
                .bind( 'selectstart.ui', function() { return false; } );
        }
		
		function getLayout(model) {
			var deferred = $.Deferred();
			require(["hgn!dashboard/templates/site/layouts/layout-" + model.getBoxCount() + '-' + model.getLayout()], function(template) {
				deferred.resolve(template);
			});
			
			return deferred;
		}
		
		function buildGadgets(gadgets) {
			if(gadgets.length > 0) {
				gadgets
					.rawSort()
					.each(function(gadget) {
						buildGadgetView.call(this, gadget.toJSON(), gadget.getBoxNumber()).load();
					}, this);
				
	            reqLoadGadgetContent.call(this);
			} else {
				buildEmptyMessage.call(this);
			}
		}

		function buildEmptyMessage() {
			var msg = DashboardLang["개인 대시보드 가젯 없음 메시지"], 
				args = [];
			
			
			if(canAddGadgetToDashboard.call(this)) {
				args.push(makeGadgetAddButtonForEmpty());
			} else {
				msg = DashboardLang["가젯 없음 메시지"];
			}
			
			args.unshift(msg);
			
			this.$el.empty().append(makeGadgetEmtpyMessage.apply(this, args));
		}
		
		function canAddGadgetToDashboard() {
			if(this.model.isUserType()) return true;
			if(GO.session('dashboardAdmin')) return true;
			if(this.model.canAddGadget()) return true;
			
			return false;
		}
		
        function makeGadgetEmtpyMessage(message, extra) {
            var html = [];
            
            html.push('<div class="null_data full_page">');
                html.push('<span class="ic_data_type"></span>');
                html.push('<p class="desc">' + message + '</p>');
                if(!!extra) html.push(extra);
            html.push('</div>');
            
            return html.join("\n");
        }
        
        function makeGadgetAddButtonForEmpty() {
        	var html = [];
            
            html.push('<a href="#" class="btn-empty-add-gadget btn_w" data-bypass>');
                html.push('<span class="ic_dashboard2 ic_mgmt_t" title="' + DashboardLang["가젯추가"] + '"></span>');
                html.push('<span class="txt">' + DashboardLang["가젯추가"] + '</span>');
            html.push('</a>');
            
            return html.join("\n");
        }
		
		function reqLoadGadgetContent() {
			if(this.model.activated()) {
				this.$el.find(GADGETS_SELETOR).trigger('gadget:request-content');
			}
		}
		
		function validateBoxNumber(boxNumber) {
			return (typeof boxNumber === 'undefined' ? DEFAULT_ADD_TO_BOXNUMBER : boxNumber);
		}
		
		// TODO: 리팩토링
		function buildGadgetView(gadgetData, boxNumber) {

			var options = {
                "data": gadgetData, 
                "locale": GO.config('locale'), 
                "contextRoot": GO.config('contextRoot'), 
                "canPersonalize": showPersonalizeOption.call(this), 
                "editorRunner": {
                    load: function( el ) {
                        var origName = $(el).attr('name'), 
                            content = $(el).val(), 
                            locale = GO.config('locale'), 
                            idAttr = origName + '-' + (new Date).valueOf();
                                                                                
                        $(el).attr('id', idAttr);
                        
                        $("#"+idAttr).goWebEditor({
                        	contextRoot : GO.config("contextRoot"),
        					lang:locale,
        					editorValue : content,
        					theme: 'simple'
    					});
                    }, 

                    getData: function( el ) {
                        var editorId = $(el).attr('id');
                        var editorInstance = GO.Editor.getInstance(editorId);
                        var result = {};
                        var inputData = '';
                        
//                        editorInstance.exec("UPDATE_CONTENTS_FIELD", []);
                        
                        inputData = editorInstance.getContent();
                        // 스마트 에디터는 내용을 작성하지 않더라도 <br> 태그가 기본으로 들어가 있어서 내용공백 체크를 기존처럼 할 수 없다.
                        // <br>만 리턴되면 공백으로 우선 처리
                        if(inputData === '<br>') inputData = '';
                        if (editorInstance.options.name == "ActiveDesigner") result["isMime"] = true;
                        result[$(el).attr('name')] = inputData;
                        return result;
                    }
                }
            };
			
			// boxNumber가 주어지면 생성즉시 append 시킨다.
			if(typeof boxNumber !== 'undefined') {
				options.appendTo = '#' + IDATTR_PREFIX + gadgetData.dashboardId + ' ' + BOX_SELETOR_PREFIX + validateBoxNumber(boxNumber);
			}
            
            return GadgetView.create(options);
		}
		
		function showPersonalizeOption() {
			// 1.전사대시보드여야 함
			if(this.model.isUserType()) return false;
			// 2.전사대시보드 운영자여야 함
			if(!GO.session('dashboardAdmin')) return false;

			return true;
			// TODO: 확인 후 아래 코드로 변경
//			return isManagerInCompanyDashboard.call(this);
		}
		
		function isManagerInCompanyDashboard() {
			return this.model.isCompanyType() && GO.session('dashboardAdmin');
		}
		
		function getElemenetIdAttrFromModel(model) {
			return 'go-dashboard-' + model.get('id');
		}
		
		function getDashboardElement(dashboardId) {
			return $('#' + IDATTR_PREFIX + dashboardId);
		}
		
		function getDashboardIdFrom(model) {
			return model.get('id');
		}
		
		return DashboardView;
	});
	
})();