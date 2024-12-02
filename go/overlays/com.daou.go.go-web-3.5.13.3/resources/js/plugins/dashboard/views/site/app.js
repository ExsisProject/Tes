(function() {
	
	define([
        "backbone", 
        "app", 
        "dashboard/models/dashboards", 
        "dashboard/models/gadget_specs",
        "dashboard/views/site/dashboard", 
        "dashboard/views/search/search",
        "hgn!dashboard/templates/site/app",  
        "helpers/form", 
        "i18n!dashboard/nls/dashboard", 
        "i18n!nls/commons",
        
        "jquery.go-popup", 
        "go-charts", 
        "swipe"
        
    ], function(
		Backbone,
		GO, 
		Dashboards, 
		GadgetSpecs, 
		DashboardView, 
		SearchView,		
		AppTemplate, 
		FormHelper, 
		DashboardLang, 
		CommonLang
	) {
		
		var 
			DASHBOARDS_SELETOR = '.go-dashboard',
			DASHBOARD_TAB_CLASSNAME = 'dashboard-tab', 
			TOOLBAR_SELECTOR = '#dashboard-config-toolbar', 
			OPTION_COMMON_SELECTOR = '#dashboard-option-common', 
			OPTION_LAYOUT_SELECTOR = '#dashboard-option-layout', 
			OPTION_GADGET_SELECTOR = '#dashboard-option-gadget', 
			TOGGLE_BUTTON_SELECTOR = '.btn-add-gadget', 
			DEFAULT_USER_DASHBOARD_BOXCOUNT = 3, 
			DEFAULT_USER_DASHBOARD_LAYOUT = 2,
			DEFAULT_SPEC_THUMBNAIL = 'gadget_bbs.png', 
			MAX_DASHBOARD_COUNT = 5, 
			MIN_TITLE_LENGTH = 1, 
			MAX_TITLE_LENGTH = 32, 
			STORED_DASHBOARD_KEY = GO.session("id") + '-selected-dashboard', 
			DashboardAppView;
		
		/**
		 * TODO: 대시보드 설정부분을 DashboardConfigView로 분리...
		 */
		DashboardAppView = Backbone.View.extend({
			className: 'go-dashboard-app', 
			editingMode: false, 
			
			events: {
				"click .dashboard-tab > a": "_changeDashboard", 
				"click #btn-dashboard-add": "_addDashboard", 
				"click #btn-dashboard-manage": "_setEditMode", 
				"click #dashboard-config-toolbar .btn-common-config": "_openCommonConfigPane",
				"click #dashboard-config-toolbar .btn-change-layout": "_openLayoutPane",
				"click #dashboard-config-toolbar .btn-add-gadget": "_toggleAddGadgetPane", 
				"click #dashboard-config-toolbar #btn-close": "_setRunMode", 
				"click #dashboard-config-toolbar .btn-toggle-config": "_toggleConfigPane",
				
				// TODO: 옵션뷰별 이벤트(추후 분리 대상)
				"click .gadget-spec a": "_addGadget", 
				
				"click #dashboard-title" : "_toggleTitleEditForm",
				"click #dashboard-title-form" : "_toggleTitleEditForm",
				"click #dashboard-title-undo" : "_toggleTitleEditForm",
				"click #dashboard-title-edit" : "_saveDashBoardTitle",
				"click #remove-option-btn": "_removeDashboard",
				"click #gadget-addable-option-row" : "_openGadgetAddablePopup",
				
				"click #btn-change-layout .layout-option": "_changeLayoutOption", 
				
				"click #layer_alarm_top .btn_layer_x": "_closeAlarmLayer",
				
				"click .btn-empty-add-gadget": "_emptyAddGadgetPane"
			}, 
			
			initialize: function(options) {
				if(!this.collection) this.collection = new Dashboards();
				this.editingMode = false;
				
				this.listenTo(this.collection, 'reset', this.render);
				this.reset();
				
				var configBtn = 
					'<span id="btn-dashboard-manage" class="ic_dashboard2 ic_mgmt_t" title="' + DashboardLang["대시보드 관리"] + '">' + 
						'<a href="#" data-bypass></a>' + 
					'</span>';
				
				this.configBtn = Hogan.compile(configBtn).render();
			}, 
			
			render: function() {
				
				initDashboardView.call(this);
				
				this.$el.append(AppTemplate({
					"dashboards": this.collection.toJSON(), 
					"layout_specs": getLayoutList(), 
					"label": {
						"add": DashboardLang["대시보드 추가"], 
						"manage": DashboardLang["대시보드 관리"], 
						"normal_config": DashboardLang["일반설정"], 
						"layout": DashboardLang["레이아웃"], 
						"add_gadget": DashboardLang["가젯추가"], 
						"close_config": DashboardLang["편집닫기"], 
						"add_gaget_accept": DashboardLang["가젯 추가 허용"],
						"open": CommonLang["열기"], 
						"name": CommonLang["이름"], 
						"permit_add_gadget": DashboardLang["가젯 추가 허용"], 
						"permission": CommonLang["허용"], 
						"deny_permission": CommonLang["허용하지 않음"], 
						"remove": CommonLang["삭제"],
						"save": CommonLang["저장"],
						"cancel": CommonLang["취소"],
						"close": CommonLang["닫기"],
						"edit" : CommonLang["수정"],
						"complete" : CommonLang["완료"],
						"edit_complete" : CommonLang["수정완료"],
						"config" : CommonLang["편집"]
					}, 
					"msg": {
						"about_gadget_permission": DashboardLang["가젯 추가 허용 설명"]
					},
					dday : function(){
						var result = "";
						if( GO.session().restrictCompanyPeriodEnd != null ){
							result = "D-"+ GO.util.getDdayDiff(GO.session().restrictCompanyPeriodEnd);
						}
						return result;
					},
					ddaymsg: function(){
						var result = "";
						if( GO.session().restrictCompanyPeriodEnd != null ){
							result = GO.i18n(CommonLang["서비스 종료 {{arg1}}일 전입니다."],{"arg1": GO.util.getDdayDiff(GO.session().restrictCompanyPeriodEnd)});
						}
						return result;
					}
				}));
				
				var self = this;
				loadDashboardView.call(this).done(function() {
					toggleConfigBtn.call(self);
				});
				toggleDashboardAddBtn.call(this);
				var searchView = new SearchView();
				this.$el.find("section.search").html(searchView.render().el);
				
				// TODO: 임시(.go_dashboard div에 overflow-y:auto 속성이 걸려야 함)
				this.$el.find('.go_dashboard_option').css({'overflow-y': 'auto'});
				
				this.checkCompanyPeriod();
			},
			
			checkCompanyPeriod : function(){
				console.log( "app/home rendersession.restrictCompanyPeriodEnd=" + GO.session().restrictCompanyPeriodEnd );
				if( GO.session().restrictCompanyPeriodEnd != null ){
					var d_day = GO.util.getDdayDiff(GO.session().restrictCompanyPeriodEnd);
					if(d_day <= 7){
						$('#layer_alarm_top').show();
					}
				}
			},
			
			_closeAlarmLayer : function(){
				$('#layer_alarm_top').hide();
			},
			
			reset: function() {
				this.collection.fetch({reset: true});
			}, 
			
			_toggleConfigPane: function(e) {				
				toggleConfigPane.call(this, $(e.currentTarget));
			}, 
			
			_changeDashboard: function(e) {
				var selectedId = $(e.currentTarget).parent().data('id');
				return onClickEvent.call(this, e, function(e) {
					activateDashbard.call(this, selectedId);
				});
			}, 
			
			_addDashboard: function(e) {
				return onClickEvent.call(this, e, function(e) {
					if(canAddDashboard.call(this)) {
						this.collection.create({
							"activated": true, 
							"boxCount": DEFAULT_USER_DASHBOARD_BOXCOUNT,
							"layout": DEFAULT_USER_DASHBOARD_LAYOUT
						}, { 
							wait: true, 
							success: _.bind(function(model) {
								addTab.call(this, model.get('id'), model.getTitle());
								toggleDashboardAddBtn.call(this);
							}, this)
						});
					} else {
						$.goSlideMessage(DashboardLang["대시보드 최대갯수 초과메시지"], 'caution');
					}
				});
			}, 
			
			_removeDashboard: function(e) {
				return onClickEvent.call(this, e, function(e) {
					$.goCaution(
						DashboardLang["대시보드 삭제 안내"], 
						DashboardLang["대시보드 삭제 확인 메시지"], 
						_.bind(function() {
							getActiveDashboard.call(this).destroy({
								success: _.bind(function() {
									location.reload();
								}, this)
							});
						}, this)
					);
				});
			}, 
			
			_openCommonConfigPane: function(e) {
				closeOptionPanes.call(this); 
				openOptionPaneBy.call(this, e, 'common');
				setCommonConfig.call(this);
			}, 
			
			_toggleTitleEditForm : function() {
				var activeDashboard = getActiveDashboard.call(this), 
				$pane = $(TOOLBAR_SELECTOR);
				var dashboardUpdatable = isDashboardUpdatable.call(this, activeDashboard);
				if(!dashboardUpdatable) return false;
				$pane.find('#dashboard-title').text(activeDashboard.getTitle());
				$pane.find('input[name=title]').val(activeDashboard.getTitle());
			
				this.$("#titleViewArea").toggle();
				this.$("#titleEditArea").toggle();
			},
			_saveDashBoardTitle : function(e){
				
				var self = this;
				var $pane = $(TOOLBAR_SELECTOR);
				var activeDashboard = getActiveDashboard.call(this);
				if(isValidCommonConfig()) {
					var data = {
							title : $pane.find('input[name=title]').val()	
					};
					activeDashboard.save(data, {
						success: function(model) {
							// 서버에서 activate 를 관리하지 않기 때문에 무조건 false 가 내려온다.
							// 기존엔 reload(reload시 activate 를 재설정함) 를 하였기 때문에 관계 없었지만,  
							// 대시보드 개선 이후 reload 를 하지 않기 때문에 fetch 직후 activate 를 설정해야 한다.
							model.activate();
							//$.goSlideMessage(CommonLang["변경되었습니다."]);
							self._toggleTitleEditForm();
							self.$el.find('.' + DASHBOARD_TAB_CLASSNAME + "[data-id="+model.get('id')+"] a").text(model.get('title'));
						}
					});
				}
				
				function isValidCommonConfig() {
					var $title = $(TOOLBAR_SELECTOR).find('input[name=title]'), 
						title = $title.val();
					
					if(title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
						FormHelper.printError($title, GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {"arg1": MIN_TITLE_LENGTH, "arg2": MAX_TITLE_LENGTH}));
						return false;
					}
					
					return true;
				}
			},
			_saveGadgetAddable : function(){
				var self = this;
				var $pane = $(TOOLBAR_SELECTOR);
				var activeDashboard = getActiveDashboard.call(this);
				var data = {
						gadgetAddable : ($pane.find('input[name=gadgetAddable]:checked').val() === 'Y')
				};
				activeDashboard.save(data, {
					success: function(model) {
						// 서버에서 activate 를 관리하지 않기 때문에 무조건 false 가 내려온다.
						// 기존엔 reload(reload시 activate 를 재설정함) 를 하였기 때문에 관계 없었지만,  
						// 대시보드 개선 이후 reload 를 하지 않기 때문에 fetch 직후 activate 를 설정해야 한다.
						model.activate();
						$.goSlideMessage(CommonLang["변경되었습니다."]);
					}
				});
			},
			_openGadgetAddablePopup : function(e){
				//가젯 추가 허용 팝업 레이어
				var self = this;
				gadgetAddable = $.goPopup({
					"pclass" : "layer_normal gadgetAddable_popup",
					"header" : DashboardLang["가젯 추가 허용"],
					"modal" : true,
					"width" : 300,
					"contents" : self._gadgetAddablePopUpTpl(),
					"buttons" : [
								 {
									 'btext' : CommonLang["취소"],
									 'btype' : 'cancel'
								 },
								 {
									 'btext' : CommonLang["저장"],
									 'btype' : 'confirm',
									 'callback' : function(rs) {										 
										 self._saveGadgetAddable();
									 }
								 }
							 ],
					"openCallback" : function(){
						var activeDashboard = getActiveDashboard.call(self);
						$('#gadgetAddable_' + (activeDashboard.canAddGadget() ? 'Y' : 'N')).prop('checked', true);
					},
					"appendTarget" : "#dashboard-config-toolbar",
					"offset" : {"position":"relative"}
					
				});
				gadgetAddable.reoffset();
			},
			_gadgetAddablePopUpTpl : function(){
				var tmpl = [];
                tmpl.push('<p class="desc">'+DashboardLang["가젯 추가 허용 설명"]+'</p>');
                tmpl.push('<span class="wrap_option">');
                tmpl.push('		<input id="gadgetAddable_Y" type="radio" name="gadgetAddable" value="Y"><label for="gadgetAddable_Y">'+CommonLang["허용"]+'</label>');
                tmpl.push('</span>');
                tmpl.push('<span class="horspace2"></span>');
                tmpl.push('<span class="wrap_option">');
                tmpl.push('		<input id="gadgetAddable_N" type="radio" name="gadgetAddable" value="N"><label for="gadgetAddable_N">'+CommonLang["허용하지 않음"]+'</label>');
                tmpl.push('</span>');
                return tmpl.join("\n");
			},
			_openLayoutPane: function(e) {
				closeOptionPanes.call(this); 
				openOptionPaneBy.call(this, e, 'layout');
				setOnLayoutOption.call(this);
			}, 
			
			_changeLayoutOption: function(e) {
				if(!isDashboardUpdatable.call(this)) return;
				
				$(TOOLBAR_SELECTOR).find('.layout-option').removeClass('on');
				$(e.currentTarget).addClass('on');
				this._saveLayoutConfig();
			}, 
			
			_saveLayoutConfig: function() {
				var _self = this;
				var dashboardView = getActiveDashboardView.call(this), 
					options = getUserSelectedLayoutOption();
				
				//사용자 대시보드에서 changeLayout시 model정보가 초기화 되기때문에 forceLoadDashboardView에서 사용할 모델을 만들어둔다.
				var activeDashboard = getActiveDashboard.call(this)
				
				dashboardView.changeLayout(options.boxCount, options.layout).done(function() {
					//changeLayout수행 후 모델의 activated가 false로 강제 변환되기 때문에 true로 설정
					activeDashboard.activate();
					forceLoadDashboardView.call(_self,activeDashboard).done(function(dashboard) {
						dashboard.enableEditingMode();
					});
				});
			}, 
			
			_cancelLayoutConfig: function(e) {
				setOnLayoutOption.call(this);
				closeOptionPanes.call(this); 
			}, 
			
			_toggleAddGadgetPane: function(e) {
				return onClickEvent.call(this, e, function(e) {
					e.preventDefault();
					validateAccessDashboard.call(this, function() {
						this._toggleAddGadget();
					});
				});
			}, 
			_emptyAddGadgetPane : function(e) {
				enableEditingMode.call(this);
				this._toggleAddGadget();
			},
			_toggleAddGadget : function(){
				var $optionPane = $(OPTION_GADGET_SELECTOR);
				cleanErrors.call(this);
				if($optionPane.is(":visible")) {
					//열기
					setOpenOptionBtnByState.call(this, 'closed');
					$optionPane.hide();
				}else{
					//닫기
					if(!$optionPane.data('gadget-specs')) {
						fetchGadgetSpecs.call(this);
					} else {
						this.$("#dashboard-config-toolbar").show();
						$optionPane.show();
						setOpenOptionBtnByState.call(this, 'opened');
					}
				}
			},
			_addGadget: function(e) {
				var $li = $(e.currentTarget).closest('li.gadget-spec'), 
					spec = $li.data('spec'), 
					activeDashboarView = getActiveDashboardView.call(this);
					
				e.preventDefault();
				
				if(isDashboardConfigurable.call(this)) {
					activeDashboarView.addGadget(spec);
					$.goSlideMessage(GO.i18n(DashboardLang["가젯 추가 메시지"], { "gadget_name": spec.name}));
				}				
			}, 
			
			_setRunMode: function(e) {
				this.$el.find('.toolbar-btn').removeClass('on');
				disableEditingMode.call(this);
			},
			
			/*리팩토링*/
			_setEditMode: function(e) {
				return onClickEvent.call(this, e, function(e) {
					enableEditingMode.call(this);
					if(isDashboardConfigurable.call(this)) {
						this.$(".btn-add-gadget").trigger("click");
					}
				});
			}
		});
		
		function toggleConfigPane($btn) {
			var currentState = $btn.data('state');
			
			if(currentState === 'closed') {
				openDefaultOptionPane.call(this);
			} else {
				closeOptionPanes.call(this);
			}
		}
		
		function initDashboardView() {
			var storedId = GO.util.store.get(STORED_DASHBOARD_KEY), 
				dashboard;

			if(!storedId) {
				storeCurrentDashboard.call(this);
				return;
			}
			
			dashboard = this.collection.get(storedId);
			
			if(!dashboard) {
				this.collection.resetActivated();
				storeCurrentDashboard.call(this);
			} else {
				this.collection.activate(storedId);
			}
			
			this.$el.empty();
			
			return;
		}
		
		function validateDashboard(dashboardId) {
			var dashboard;
			
			if(typeof dashboardId === "undefined") {
				storeCurrentDashboard.call(this);
				return;
			}
			
			dashboard = this.collection.get(dashboardId);
			
			if(!dashboard) {
				this.collection.resetActivated();
				storeCurrentDashboard.call(this);
			} else {
				this.collection.activate(dashboardId);
			}
		}
		
		function storeCurrentDashboard() {
			GO.util.store.set(STORED_DASHBOARD_KEY, getActiveDashboard.call(this).id);
		}		
		
		function setOpenOptionBtnByState(nextState) {
			var $button = this.$el.find(TOGGLE_BUTTON_SELECTOR), 
				curClass = {"closed": 'ic_ctrl_close', "opened": 'ic_ctrl_open'}[nextState], 
				nextClass = {"closed": 'ic_ctrl_open', "opened": 'ic_ctrl_close'}[nextState], 
				nextText = {"closed": CommonLang["열기"], "opened": CommonLang["닫기"]}[nextState];
			
			$button.find('.' + curClass).removeClass(curClass).addClass(nextClass);
			$button.prop('title', nextText);
			$button.data('state', nextState);
		}
		
		function canAddDashboard() {
			return this.collection.length < MAX_DASHBOARD_COUNT;
		}
		
		function toggleDashboardAddBtn() {
			if(canAddDashboard.call(this)) {
				$('#btn-dashboard-add').closest('li').show();
			} else {
				$('#btn-dashboard-add').closest('li').hide();
			}
		}
		
		function setCommonConfig() {
			var activeDashboard = getActiveDashboard.call(this), 
				$pane = $(OPTION_COMMON_SELECTOR);
			
			$pane.find('#dashboard-title').text(activeDashboard.getTitle());
			$pane.find('input[name=title]').val(activeDashboard.getTitle());
			$('#gadgetAddable_' + (activeDashboard.canAddGadget() ? 'Y' : 'N')).prop('checked', true);
			
			//가젯추가허용부분, 가젯삭제부분 활성화
			toggleCommonConfigRow.call(this, activeDashboard);
			//대시보드 이름변경 권한 없을때 처리
			setCommonConfigByPermission.call(this);
		}
		
		function setCommonConfigByPermission(dashboard) {
			if(!isDashboardUpdatable.call(this, dashboard)) {
				$(OPTION_COMMON_SELECTOR).find('input').prop('disabled', true);
			}
		}
		
		function toggleCommonConfigRow(dashboard) {			
			if(dashboard.isCompanyType()) {
				$('#gadget-addable-option-row').show();				
				$('#remove-option-row').hide();
			} else {
				$('#gadget-addable-option-row').hide();
				$('#remove-option-row').show();
			}
		}
		
		function getUserUpdatedCommonConfig() {
			var activeDashboard = getActiveDashboard.call(this), 
				$pane = $(OPTION_COMMON_SELECTOR), 
				config = {};
			
			config.title = $pane.find('input[name=title]').val();
			
			if(activeDashboard.isCompanyType()) {
				config.gadgetAddable = ($pane.find('input[name=gadgetAddable]:checked').val() === 'Y');
			}
			
			return config;
		}
		
		function getUserSelectedLayoutOption() {
			var $pane = $(TOOLBAR_SELECTOR), 
				$on = $pane.find('.layout-option.on');
			
			return {
				"boxCount": $on.data('boxcount'), 
				"layout": $on.data('layout')
			};
		}
		
		function setOnLayoutOption() {
			var activeDashboard = getActiveDashboard.call(this), 
				$pane = $(OPTION_LAYOUT_SELECTOR);
			
			$pane.find('.layout-option').removeClass('on');
			$pane.find('.layout-' + activeDashboard.getBoxCount() + '-' + activeDashboard.getLayout()).addClass('on');
			
			return true;
		}
		
		function openDefaultOptionPane() {
			setOpenOptionBtnByState.call(this, 'opened');
			$(TOOLBAR_SELECTOR).find('.btn-add-gadget').trigger('click');
		}
		
		function closeOptionPanes() {
			setOpenOptionBtnByState.call(this, 'closed');
			cleanErrors.call(this);
			
			this.$el.find('.toolbar-btn').removeClass('on');
			this.$el.find('.dashboard-option-pane').hide();
		}
		
		function openOptionPaneBy(e, type) {			
			validateAccessDashboard.call(this, function() {
				setOpenOptionBtnByState.call(this, 'opened');
				
				$('#dashboard-option-' + type).show();
				$(e.currentTarget).addClass('on');
			})
		}
		
		function validateAccessDashboard(callback) {
			if(isDashboardConfigurable.call(this)) {
				callback.call(this);
			} else {
				$.goMessage(DashboardLang["전사대시보드 설정 접근오류 메시지"], "caution");
			}
		}
		
		function fetchGadgetSpecs() {
			var self = this, 
				$optionPane = $(OPTION_GADGET_SELECTOR);
			
			(new GadgetSpecs).fetch({
				"success": function(specs) {
					specs.each(function(spec) {
						$optionPane.find('.gadget_list').append(buildGadgetSpecItemTemplate(spec));
					}, self);
					$optionPane.data('gadget-specs', specs);
					this.$("#dashboard-config-toolbar").show();
					$optionPane.show();
					
					setOpenOptionBtnByState.call(self, 'opened');
				}
			});
		}
		
		function buildGadgetSpecItemTemplate(spec) {
			var $li = $('<li class="gadget-spec"></li>'), 
				thumbnail = getGadgetSpecThumbnail(spec), 
				html = [];
			
			html.push('<div class="wrap">');
				html.push('<a href="#" data-bypass>');
					html.push('<div class="on">' + DashboardLang["대시보드에 추가"] + '</div>');
					html.push('<img src="' + thumbnail + '" alt="' + DashboardLang["대시보드에 추가"] + '">');
					html.push('<p class="txt">' + spec.get('name') + '</p>');
				html.push('</a>');
			html.push('</div>');
			
			$li.append(html.join("\n"));
			$li.data('spec', spec.toJSON());
			
			function getGadgetSpecThumbnail(spec) {
				var path = GO.config('contextRoot') + 'resources/images/gadget/';
				return getLocalizedPath(path) + (spec.get('thumbnail') || DEFAULT_SPEC_THUMBNAIL);
			}
			
			function getLocalizedPath(path) {
				var result = path, 
					locale = GO.config('locale');
				
				if(locale === 'ja') {
					result = result + 'ja/';
				} else if(locale === 'zh_CN' || locale === 'zh_TW') {
					result = result + 'cn/';
				} else if(locale === 'en') {
					result = result + 'en/';
				} else if(locale === 'vi') {
					result = result + 'vi/';
				}
				
				return result;
			}
			
			return $li;
		}

		function getLayoutList() {
			return DashboardView.LAYOUT_SPECS;
		}
		
		function addTab(dashboardId, title) {
			activateDashbard.call(this, dashboardId, function(dashboardId) {
				var tab = ['<li class="', DASHBOARD_TAB_CLASSNAME ,'" data-id="', dashboardId,'"><a href="#" data-bypass>', title, '</a></li>'].join('');
				this.$el.find('.dashboad-tabs li.dashboard-tab').last().after(tab);
			});
		}
		
		function reloadTabs() {
			var activeDashbard = getActiveDashboard.call(this);
			var self = this; 
			
			this.$el.find("#btn-dashboard-manage").remove();
			this.$el.find('.' + DASHBOARD_TAB_CLASSNAME)
				.removeClass('on mgmt')
				.each(function(i, el) {
					var dashboardId = $(el).data('id');
					if(activeDashbard.id === parseInt(dashboardId)) {
						$(el).addClass('on');
						if (isEditableDashboard.call(self)) $(el).addClass('mgmt').append(self.configBtn);
					}
				});
		}
		
		function activateDashbard(dashboardId, callback) {
			if(this.editingMode) {
				$.goConfirm(
					DashboardLang["대시보드 전환 안내"], 
					DashboardLang["대시보드 전환 확인 메시지"], 
					_.bind(function() {
						changeDashbardTab.call(this, dashboardId, callback);
					}, this)
				);
			} else {
				changeDashbardTab.call(this, dashboardId, callback);
			}
		}
		
		function changeDashbardTab(dashboardId, callback) {				
			disableEditingMode.call(this);
			this.$el.find(DASHBOARDS_SELETOR).hide();
			this.collection.activate(dashboardId);
			var self = this;
			loadDashboardView.call(this).done(function(dashboard) {
				reloadTabs.call(self);
				dashboard.show();
			});
			$(window).trigger('activator');
			
			if(callback && _.isFunction(callback)) {
				callback.call(this, dashboardId);
			}
			
			cleanErrors.call(this);
			storeCurrentDashboard.call(this);
		}
		
		function cleanErrors() {
			$(OPTION_COMMON_SELECTOR)
				.find('input.error').removeClass('error')
				.andSelf()
				.find('.go_error').remove();
		}
		
		function enableEditingMode() {
			this.editingMode = true;
			toggleToolbar.call(this);
			return loadDashboardView.call(this).done(function(dashboard) {
				dashboard.enableEditingMode();
			});
		}
		
		function toggleToolbar() {
			var activeDashboard = getActiveDashboard.call(this);
			var hasEditableGadget = activeDashboard.hasEditableGadget();
			var canAddGadget = activeDashboard.canAddGadget();
			
			if (!hasEditableGadget && !canAddGadget) return;
			
			var toolbar = $(TOOLBAR_SELECTOR);
			var toolbarUl = toolbar.find("ul");
			toolbar.show().find("li").show();
			toolbarUl.removeClass("ctrl_2mode ctrl_1mode");
			
			this.$("div.ctrl_side").show();
			
			var dashboardUpdatable = isDashboardUpdatable.call(this, activeDashboard);
			
			setDashBoardTitle(dashboardUpdatable,activeDashboard);
			setGadgetAddableSetting(dashboardUpdatable,activeDashboard);
			setDashboardDeleteSetting(dashboardUpdatable,activeDashboard);
			setGadgetLayOutChangeSetting(dashboardUpdatable,activeDashboard);
			setGadgetAddSetting(dashboardUpdatable,canAddGadget);
			
			
			//일반사용자가 전사대시보드에 들어왔을때
			/*if(!dashboardUpdatable) {
				hideUpdatableTool.call(this);
				// canAddGadget 이 admin 인경우에 대한 보장을 해주지 않으므로 updatable 에 종속시켜야 한다.
				if(!canAddGadget) hideAddGadgetTool.call(this);
			}*/
			
			if(!dashboardUpdatable && !canAddGadget && !hasEditableGadget) hideEditGadgetTool.call(this);
			
			var toolCount = toolbar.find("li:visible").length;
			toolbarUl.addClass("ctrl_" + toolCount + "mode");
		}
		
		function setDashBoardTitle(dashboardUpdatable,activeDashboard) {
			var $pane = $(TOOLBAR_SELECTOR);
			if(dashboardUpdatable){
				$pane.find('#dashboard-title').text(activeDashboard.getTitle());
				$pane.find('input[name=title]').val(activeDashboard.getTitle());
				$pane.find('#dashboard-title-form').show();
			}else{
				//TODO. 대시보드 이름 수정 불가처리
				$pane.find('#dashboard-title').text(activeDashboard.getTitle());
				$pane.find('input[name=title]').val(activeDashboard.getTitle());
				$pane.find('#dashboard-title-form').hide();
			}
		}
		
		// 가젯 추가허용 옵션 버튼
		function setGadgetAddableSetting(dashboardUpdatable,activeDashboard) {
			var $pane = $(TOOLBAR_SELECTOR);
			if(dashboardUpdatable){
				if(activeDashboard.isCompanyType()){
					$pane.find("#gadget-addable-option-row").show();
				}else{
					$pane.find("#gadget-addable-option-row").hide();
				}
			}else{
				$pane.find("#gadget-addable-option-row").hide();
			}
		}
		
		//대시보드 삭제 허용
		function setDashboardDeleteSetting(dashboardUpdatable,activeDashboard) {
			var $pane = $(TOOLBAR_SELECTOR);
			if(dashboardUpdatable){
				if(activeDashboard.isCompanyType()){
					$pane.find("#remove-option-btn").hide();
				}else{
					$pane.find("#remove-option-btn").show();
				}
			}else{
				$pane.find("#remove-option-btn").hide();
			}
		}
		
		//레이아웃 변경 버튼
		function setGadgetLayOutChangeSetting(dashboardUpdatable,activeDashboard) {
			var $pane = $(TOOLBAR_SELECTOR);
			if(!dashboardUpdatable){
				$pane.find("#btn-change-layout").hide();
				return;
			}
		
			$pane.find('.layout-option').removeClass('on');
			$pane.find('.layout-' + activeDashboard.getBoxCount() + '-' + activeDashboard.getLayout()).addClass('on');
			
		}
		
		function setGadgetAddSetting(dashboardUpdatable,canAddGadget) {
			//일반사용자가 전사대시보드에 들어왔을때
			if(!dashboardUpdatable) {
				// canAddGadget 이 admin 인경우에 대한 보장을 해주지 않으므로 updatable 에 종속시켜야 한다.
				if(!canAddGadget){
					//가젯추가버튼 숨김.
					this.$("span.btn-add-gadget").hide();
				}
			}
		}
		
		//레이아웃탭
		function hideUpdatableTool() {
			this.$("li.btn-common-config").hide();
			this.$("li.btn-change-layout").hide();
		}
		
		//가젯추가탭
		function hideAddGadgetTool() {
			this.$("li.btn-add-gadget").hide();
			this.$("div.ctrl_side").hide();
		}
		
		//닫기탭
		function hideEditGadgetTool() {
			this.$("li.btn-close").hide();
		}
		
		function isEditableDashboard() {
			var activeDashboard = getActiveDashboard.call(this);
			
			return activeDashboard.isEditable(); 
		}
		
		function toggleConfigBtn() {
			if (!isEditableDashboard.call(this)) {
				this.$("li.dashboard-tab.on").removeClass("mgmt");
				this.$("#btn-dashboard-manage").remove();
			}
		}
		
		function disableEditingMode() {
			if(!this.editingMode) return false;
			
			confirmNoneSavedGadget.call(this).then(_.bind(function() {
				this.editingMode = false;
				closeOptionPanes.call(this);
				$(TOOLBAR_SELECTOR).hide();
				loadDashboardView.call(this).done(function(dashboard) {
					dashboard.disableEditingMode();
				});
			}, this));
		}
		
		function confirmNoneSavedGadget() {
			var deferred = $.Deferred();
			
			if(getActiveDashboardView.call(this).hasNoneSavedGadgets()) {
				$.goConfirm(
					DashboardLang["대시보드 미저장 가젯 안내"], 
					DashboardLang["대시보드 미저장 가젯 확인 메시지"], 
					_.bind(function() {
						deferred.resolve();
					}, this)
				);
			} else {
				deferred.resolve();
			}
			
			return deferred; 
		}
		
		function getActiveDashboard() {
			return this.collection.getActiveDashboard();
		}
		
		function getActiveDashboardView() {
			return DashboardView.getInstanceById(getActiveDashboard.call(this).id);
		}
		
		function isDashboardConfigurable() {
			var activeDashboard = getActiveDashboard.call(this);
						
			if(isDashboardUpdatable.call(this, activeDashboard)) return true;
			
			// 일반 사용자이지만, 전사 대시보드에 가젯을 추가할 수 있으면 보임
			if(activeDashboard.canAddGadget()) return true;
			
			// 그 외는 툴바 숨김
			return false;
		}
		
		function isDashboardUpdatable(dashboard) {
			var activeDashboard = dashboard || getActiveDashboard.call(this);
			
			// 사용자 대시보드이면 업데이트 가능
			if(activeDashboard.isUserType()) return true;
			
			// 전사 대시보드 일 때, 전사 대시보드 운영자이면 업데이트 가능
			if(GO.session('dashboardAdmin')) return true;
			
			return false;
		}
		
		// TODO: 공통 유틸로 분리할 것...
		function onClickEvent(e, callback) {
			e.preventDefault();
			if(_.isFunction(callback)) {
				callback.call(this, e);
			}
			
			return false;
		}
		
		function loadDashboardView() {
			return DashboardView.loadTo(this.$el, getActiveDashboard.call(this));
		}
		
		function forceLoadDashboardView(activeDashboard) {
			return DashboardView.forceLoadTo(this.$el, activeDashboard);
		}
		
		return DashboardAppView;
		
	});
	
})();