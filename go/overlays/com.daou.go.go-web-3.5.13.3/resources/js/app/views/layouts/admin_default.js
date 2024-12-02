(function() {
    define([
        "app",
		"views/layouts/default",
		'admin/views/layout/side_menu_new',
		'admin/views/layout/top_menu',
		"hgn!templates/layouts/admin_default",
		"admin/models/system_menu_list",
		"admin/models/display_config",
        "models/site_config",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
		'admin/views/layout/sitemap',
		'admin/collections/side_menu_collection',
		'admin/views/layout/admin_guide',
        "GO.util"
    ],

    function(
        GO,
        DefaultLayout,
		SideMenuView,
		TopMenuView,
		LayoutTpl,
        SystemMenuConfig,
        DisplayConfig,
        SiteConfigModel,
        commonLang,
        adminLang,
		SiteMapView,
		MenuCollection,
		AdminGuide

    ) {
        var instance = null,
        	__super__ = DefaultLayout.prototype,
            _slice = Array.prototype.slice,
            AdminDefaultLayout,
            tvars = {
                    tpl : {
                        overlay : '<div id="popOverlay" class="overlay"><div class="processing"></div></div>'
                    }
                };

        var AdminDefaultLayout = DefaultLayout.extend({
        	initialize: function() {
        	    var args = _slice.call(arguments);
        	    __super__.initialize.apply(this, args);

        	    this.variables = {};
        	    var displayConfig = DisplayConfig.read({admin:true});
				var mobileServiceModel = new Backbone.Model();
				mobileServiceModel.url = "/ad/api/mobile/service";
        		mobileServiceModel.fetch({async : false});
        		var mobileService = mobileServiceModel.toJSON();

				var serviceConfigs = SiteConfigModel.read({isAdmin:true});
				var systemMenuList = SystemMenuConfig.read();
				var hasBoard = systemMenuList.hasApp("board"),
					hasCalendar = systemMenuList.hasApp("calendar"),
					hasCommunity = systemMenuList.hasApp("community"),
					hasContact = systemMenuList.hasApp("contact"),
					hasFile = systemMenuList.hasApp("webfolder"),
					hasAsset = systemMenuList.hasApp("asset"),
					hasReport = systemMenuList.hasApp("report"),
					hasTask = systemMenuList.hasApp("task"),
					hasWorks = systemMenuList.hasApp("works"),
					hasSurvey = systemMenuList.hasApp("survey"),
					hasApproval = systemMenuList.hasApp("approval"),
					hasMobile = false,
					hasSocial = false,
					hasCollaboration = false,
					hasApprovalLicense = false,
					hasMobileApp = false,
				    hasEhr = false,
				    hasSms = false,
				    hasDocs = systemMenuList.hasApp("docs");

				if (hasBoard || hasCommunity || hasAsset || hasSurvey) {
					hasSocial = true;
				}
				if (hasReport || hasTask || hasWorks) {
					hasCollaboration = true;
				}
				if (hasApproval) {
					hasApprovalLicense = true;
				}

				if(mobileService.configValue == 'on'){
					hasMobile = true;
				}

				if(serviceConfigs.toJSON().mobileAppService == 'on'){
					hasMobileApp = true;
				}

				if(serviceConfigs.toJSON().ehrService =='on'){
				    hasEhr = true;
				}

				if(serviceConfigs.toJSON().smsService == 'on') {
					hasSms = true;
				}

                _.extend(this.variables, {
                    contextRoot: GO.config("contextRoot"),
                    label_logo: this.getLogoName(),
                	label_setting: adminLang["설정"],
    				label_account: adminLang["계정관리"],
    				label_dept: adminLang["부서관리"],
    				label_statistics: adminLang["통계"],
    				label_mail: commonLang["메일"],
    				label_file: commonLang["자료실"],
    				label_address: adminLang["주소록"],
                    label_appr: adminLang["전자결재"],
    				label_calendar: commonLang["캘린더"],
    				label_board: commonLang["게시판"],
    				label_community: commonLang["커뮤니티"],
    				label_asset: adminLang["예약"],
    				label_mobile: adminLang["모빌리티"],
    				label_admin: adminLang["관리자 :"],
    				label_logout: commonLang["로그아웃"],
    				label_guide: commonLang["도움말"],
    				label_survey: commonLang["설문"],
    				label_report: adminLang["보고"],
    				label_task: commonLang["업무"],
    				label_approval: commonLang["전자결재"],
    				label_top_base_setting: adminLang["일반"],
    				label_top_account: adminLang["계정"],
    				label_top_communication: adminLang["커뮤니케이션"],
    				label_top_collaboration: adminLang["협업"],
    				label_top_social: adminLang["소셜"],
    				label_top_approval: adminLang["전자결재_탑메뉴"],
    				label_attendance : adminLang["e-HR"],
    				label_sms : adminLang['문자발송'],
    				label_docs : adminLang['문서관리'],
    				model : GO.session(),
    				lastLoginedAt : GO.util.basicDate(GO.session().lastLoginedAt),
    				displayConfig : displayConfig.toJSON(),
    				hasBoard : hasBoard,
    				hasCommunity : hasCommunity,
    				hasContact : hasContact,
    				hasCalendar : hasCalendar,
    				hasFile : hasFile,
    				hasAsset : hasAsset,
    				hasReport : hasReport,
    				hasTask : hasTask,
    				hasWorks : hasWorks,
    				hasSurvey : hasSurvey,
    				hasApproval : hasApproval,
    				hasMobile : hasMobile,
					hasSocial : hasSocial,
					hasCollaboration : hasCollaboration,
					hasApprovalLicense : hasApprovalLicense,
					hasOrg : GO.util.isUseOrgService(true),
					logoImg : this.getLogoImg(),
					hasMobileApp : hasMobileApp,
					siteName : GO.session().companyName,
					hasEhr : hasEhr,
					hasSms : hasSms,
					hasDocs : hasDocs,
					isLocaleKo : GO.session().locale === "ko",
					iframeSrc : GO.contextRoot + "resources/guide/admin_dostart/admin/start.html",
					removeDoStartDone : $.cookie("REMOVE_DO_START" + GO.session().id) ? true : false,
					removeLookAroundOrgDone : $.cookie("REMOVE_LOOK_AROUND_ORG" + GO.session().id) ? true : false
			});
            },

            events : {
            	'click .btn_ic_help3' : 'viewHelp',
				'click .sitemap' : 'sitemap',
				'click .popup_admin_gide': 'popupAdminGuide',
				'click #do_start_btn, .popup_do_start' : 'showDoStartLayer',
				'click #do_start_layer .btn_area' : 'hideDoStartLayer',
				'click #look_around_org_btn' : 'showLookAroundOrg',
				'click #do_start_btn .ic_cancel_s_w' : 'removeDoStart',
				'click #look_around_org_btn .ic_cancel_s_w' : 'removeLookAroundOrg'
            },

            render: function() {
                var deferred = $.Deferred();
                this.renderLayout();
                deferred.resolveWith(this, [this]);

                // 레이아웃 렌더링 끝났음을 알리고 레이아웃 객체를 전달한다.
                this.trigger("rendered:layout", [this]);
                return deferred;
            },


            // 임시처리
            setBrowserTitle : function() {
            	var self = this;
            	setTimeout(function() {
            		var title = self.getTitle();
            		sessionStorage.setItem('browserTitle', title);
            		document.title = title;
            	}, 500);
            },
            renderLayout: function(force) {
            	this.setBrowserTitle();
                force = force || false;
                // 이미 이 레이아웃을 사용하고 있으면 다시 그리지 않도록 한다.
                if(!force && this.isMe()) return;
                this.setCurrentLayout();
                // 기존 컨텐츠 삭제
                this.getPopupElement().remove();
                this.$el.find('.tWrap').remove();
				this.$el.find('.layer_dostart').remove();
				this.$el.find('.btn_dostart').remove();
                this.$el.prepend(LayoutTpl(
                	this.variables
                ));
                this.resizeSide();

                // 라우터 이벤트 바인딩
                this._initPageEvents();
                if(true){
                	$('li.more').hide();
            	}

                this.makeSideMenu();
                this.makeTopMenu();
            },
			makeTopMenu:function(){
				var topMenuView= new TopMenuView();
				this.$el.find("#top_menu").append(topMenuView.$el);
				topMenuView.render();
			},
			makeSideMenu : function(){
        		var sideView = new SideMenuView();
				this.$el.find(".admin_side_new").append(sideView.$el);
				sideView.render();

			},

            setSessionInfo: function() {
            	this.variables['profile?'] = this.profile.toJSON();
            },
            getContentElement: function() {
                return this.$el.find('#layoutContent');
            },
            getTitleElement: function() {
                return this.$el.find('#layoutTitle');
            },
            getSideElement: function() {
            	return this.$('.admin_side');
            },
			_initPageEvents : function(){
                GO.EventEmitter.on('common', 'layout:setOverlay', this.setOverlay, this);
                GO.EventEmitter.on('common', 'layout:clearOverlay', this.clearOverlay, this);
            },
            setOverlay : function() {
                this.clearOverlay();
                this.$el.append(tvars.tpl.overlay);
            },
            clearOverlay : function() {
                this.$el.find('#popOverlay').fadeOut(1000, function() {
                    $(this).remove();
                });
            },
            clearContent: function(package) {
                var $content = this.getContentElement(),
                	$popup = this.getPopupElement();

                $content.empty();
                $popup.remove();
            },
            getLogoName : function() {
            	if(GO.util.getBrandName(true) == "TMS"){
            		return adminLang["TMS Service Admin"];
            	}
            	return adminLang["DO Service Admin"];
            },
            getLogoImg : function() {
            	if(GO.util.getBrandName(true) == "TMS"){
            		return "/resources/images/admin/logo_admin_site.png";
            	}
            	return "/resources/images/admin/logo_admin_site_do.png";
            },
            getTitle : function() {
            	if(GO.util.getBrandName(true) == "TMS"){
            		return "TMS Site Admin";
            	}
            	return "DO Site Admin";
            },
            viewHelp : function() {
            	var locale = jQuery('meta[name="locale"]').attr('content');
            	var helpType = "do";
            	if(locale == 'jp'){
            		locale = 'ja';
            	}
            	if(GO.util.getBrandName(true) == "TMS"){
            		helpType = "tms";
            	}

            	if(GO.util.getServiceType() == "cloud"){
            		helpType = "cloud";
            	}
            	window.open("/go/help/"+ helpType + "/" + locale +"/site/pdf/" + helpType + "_site_" + locale + ".pdf", "help", "width=1050,height=700,status=yes,scrollbars=no,resizable=no");
            },
			popupAdminGuide:function(){
				this.renderAdminGuideByStep();
			},
			renderAdminGuideByStep: function(options) {
				this.adminGuide = new AdminGuide(options);
				this.adminGuide.render();
			},
			showDoStartLayer: function() {
        		this.$el.find("#do_start_layer").show();
			},
			showLookAroundOrg: function() {
				this.renderAdminGuideByStep({step : "stepOrg1"});
			},
			hideDoStartLayer: function() {
				this.$el.find("#do_start_layer").hide();
			},
			removeDoStart: function(e) {
				e.stopPropagation();
				this.hideDoStartLayer();
				this.$el.find("#do_start_btn").remove();
				this.$el.find("#top_menu_help_sub_menu .popup_do_start").parent('li').show();
				$.cookie("REMOVE_DO_START" + GO.session().id, "done" , {expires: 3650/*10년*/, path: "/"});
			},
			removeLookAroundOrg: function(e) {
				e.stopPropagation();
				this.$el.find("#look_around_org_btn").remove();
				$.cookie("REMOVE_LOOK_AROUND_ORG" + GO.session().id, "done" , {expires: 3650/*10년*/, path: "/"});
			},
			sitemap:function(){
				if( !this.menuCollection) {
					this.menuCollection = new MenuCollection();
				}
				var siteMapView = new SiteMapView(this.menuCollection);
				siteMapView.render();
			},
            selectTopMenu : function(preUrl){
                    selectedGroup = "",
                    groupItem = preUrl.split("?")[0];
                //IE #붙는 것 처리
                	var groupItems = groupItem.split("#");
                	if(groupItems.length > 1 ){
                		groupItem = groupItems[1];
                	}else{
                		groupItem = groupItems[0];
                	}
                $.each(topMenu, function(key, value){
                	if($.inArray(groupItem, value) > -1){
                           selectedGroup = key;
                           return false;
                	}
                });

                $("#adminTopMenu li").removeClass("on");
                $("#adminTopMenu li[data-type='"+ selectedGroup +"']").addClass("on");

                this.originMenu = groupItem;
                this.originGroup = selectedGroup;
            }
        });

        return new AdminDefaultLayout();
    });

}).call(this);