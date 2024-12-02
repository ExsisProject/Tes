(function() {
    define([
    	"app",
        "views/layouts/default", 
        "hgn!templates/layouts/system_default",
        "system/models/licenseModel",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "GO.util"
    ], 

    function(
    	GO, 
        DefaultLayout, 
        LayoutTpl,
        LicenseModel,
        commonLang,
        adminLang
    ) {
        var	__super__ = DefaultLayout.prototype,
            _slice = Array.prototype.slice, 
            AdminDefaultLayout,
            tvars = {
                    tpl : {
                        overlay : '<div id="popOverlay" class="overlay"><div class="processing"></div></div>'
                    }
                };

        AdminDefaultLayout = DefaultLayout.extend({
        	initialize: function() {
        	    var args = _slice.call(arguments);
        	    __super__.initialize.apply(this, args);
                
        	    this.variables = {};
        	    this.licenseModel = LicenseModel.read();
        	    var hasMobilePack = false;
        	    if(this.licenseModel.get('mobileServicePack')){
                	hasMobilePack = true;
                }
                _.extend(this.variables, {
                    contextRoot: GO.config("contextRoot"), 
                    label_logo: this.getLogoName(),
    				label_logout: commonLang["로그아웃"],
    				label_guide: commonLang["도움말"],
    				label_main: adminLang["메인홈"],
    				label_system: adminLang["시스템 관리"],
    				label_site: adminLang["도메인/사이트 관리"],
    				label_security: adminLang["보안 설정"],
    				label_monitor: adminLang["모니터링"],
    				label_mobile: adminLang["모빌리티"],
    				label_etc: adminLang["기타 설정"],
    				label_admin: adminLang["관리자"],
    				label_stat: adminLang["통계"],
    				label_breadcrumb: adminLang["모빌리티 > 모바일 앱 버전 관리"],
    				model : GO.session(),
    				lastLoginedAt : GO.util.basicDate(GO.session().lastLoginedAt),
    				hasMobilePack : hasMobilePack,
    				logoImg : this.getLogoImg()
                });
            }, 
            
            events : {
            	'click #btn_help' : 'viewHelp'
            },
            
            setTitle: function(title) {
            	if(this.isMe()) {
            		this.$el.find("#layoutTitle").empty().html(title);
            	} else {
            		this.variables['title'] = title;
            	}
                return this;
            }, 

            render: function() {
                var deferred = $.Deferred();
                this.renderLayout();
                deferred.resolveWith(this, [this]);
                // 레이아웃 렌더링 끝났음을 알리고 레이아웃 객체를 전달한다.
                this.trigger("rendered:layout", [this]);
                return deferred;
            }, 
            renderLayout: function(force) {
                force = force || false;
                // 이미 이 레이아웃을 사용하고 있으면 다시 그리지 않도록 한다.
                this.clearContent();
                if(!force && this.isMe()) return;
                $(document).attr('title', this.getTitle());
                this.setCurrentLayout();
                //this.setSessionInfo();
                this.$el.empty().append(LayoutTpl(
                   this.variables
                ));
                this.setNavigator();
                this.resizeSide();
                
                // 라우터 이벤트 바인딩
                this._initPageEvents();
            },
            showSettingsMenu : function() {
            	console.log('showSettingsMenu');
            	return false;
            },
            setSessionInfo: function() {
            	this.variables['profile?'] = this.profile.toJSON();
            }, 
            setNavigator: function() {
            	this.$el.find('#mobilty').addClass('on');
            },
            getContentElement: function() {
                return this.$el.find('#layoutContent');
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
            		return "/resources/images/admin/logo_admin_system.png";
            	}
            	return "/resources/images/admin/logo_admin_system_do.png";
            },
            getTitle : function() {
            	if(GO.util.getBrandName(true) == "TMS"){
            		return "TMS System Admin";
            	}
            	return "DO System Admin";
            },
            viewHelp : function() {
            	var locale = jQuery('meta[name="locale"]').attr('content');
            	var brandName = "do";
            	if(locale == 'jp'){
            		locale = 'ja';
            	}
            	if(GO.util.getBrandName(true) == "TMS"){
            		brandName = "tms";
            	}
            	window.open("/go/help/" + brandName+"/" + locale +"/system/pdf/" + brandName + "_system_" + locale + ".pdf", "help", "width=1050,height=700,status=yes,scrollbars=no,resizable=no");
            }
        });
        
        return new AdminDefaultLayout();
    });
}).call(this);