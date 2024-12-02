(function() {
    define([
        "backbone", 
        "app", 
        "hgn!templates/layouts/install_default", 
        "i18n!nls/commons"
    ], 
    
    function(
        Backbone, 
        GO, 
        LayoutTpl,
        CommonLang 
    ) {

        var LAYOUT_TPL_ROOT = "hgn!templates/layouts/default", 
        	MOVEPAGE_CONFIRM_MSG = (CommonLang['내용 작성 중 이동 경고 메시지']).replace(/<br>/gi, '\n');
    
        var aslice = Array.prototype.slice, 
            tvars = {
                label: {
                    noti_app_title: CommonLang["알림"], 
                    management: CommonLang["개인정보 수정"], 
                    logout: CommonLang["로그아웃"],
                    confirm : CommonLang['확인'],
                    cancel : CommonLang['취소'],
                    view_mobile: CommonLang["모바일 버전으로 보기"]
                },
                tpl : {
                	overlay : '<div id="popOverlay" class="overlay"><div class="processing"></div></div>'
                }
            };
        
        var InstallLayout = Backbone.View.extend({
            el: "#main", 
            name: "default", 
            className: "admin_setting", 
            contentSize: 0,
            contentTopMargin: 0, 
            useRedirectPolicy: true, 
            
            events: {
//            	"click #return_to_mobile_version": 'returnToMobileVersion'
            }, 

            initialize: function(options) {
            	this.options = options || {};
            	
            	this.contentSize = 0;
                this.contentTopMargin = 0;
                
                this.variables = _.extend({}, tvars, {
                });
                
            }, 
            
            render: function() {
            	var self= this,
                	deferred = $.Deferred();
                
                self.resetClassnames();
                self.renderLayout();
                deferred.resolveWith(self, [self]);
                
                self.trigger("rendered:layout", [self]);
                
                return deferred;
            }, 
            
            resetClassnames: function() {
            	this.$el.attr( "class", "" );
                this.$el.addClass( this.className );
            }, 
            
            renderLayout: function(force) {
            	force = force || false;
                // 이미 이 레이아웃을 사용하고 있으면 다시 그리지 않도록 한다.
                if(!force && this.isMe()) {
                	return;
                }
                this.setCurrentLayout();
                this.$el.empty().append(LayoutTpl(this.variables));
                
                this._initPageEvents();

            }, 

            clearContent: function(package) {
            }, 

            clearSide: function() {
                if(this.isMe()) {
                    var $side = this.getSideElement(); 
                    // 모든 이벤트 삭제
                    $side.off();
                    $side.empty();
                }
            }, 
            
            getContentHeight : function() {
            	var wH = $(window).height(), 
                cOH = this.getContentElement().height();
                hOH = this.getHeaderElement().outerHeight(), 
                fOH = 0;
                
                return Math.max(wH - hOH - fOH, cOH);
            },
            
            resizeSide: function() {
            	this.getSideElement().height(this.getContentHeight());
            }, 

            clearAll: function() {
            	this.clearContent();
                this.clearSide();
                this.activateMenu();
            }, 
            
            setOverlay : function() {
            	this.clearOverlay();
            	this.$el.append(tvars.tpl.overlay);
            },
            
            clearOverlay : function() {            	
            	// 클래식 글등록 후 스트림으로 이동하고 바로 글등록 하면 overlay안없어지는 현상 수정 
            	this.$el.find('.overlay').fadeOut(500, function() {
            		$(this).remove();
            	});
            },
            targetSetOverlay : function(target){            	
            	this.clearOverlay();
            	target.append(tvars.tpl.overlay);
            	$('#popOverlay').css({'position':'relative','top':'250px'});
            },
            getHeaderElement: function() {
            	return this.$el.find('header.go_header');
            }, 
            
            getBodyElement: function() {
            	return this.$el.find('.go_body');
            }, 

            getFooterElement: function() {
            	return this.$el.find('footer.go_footer');
            }, 

            getNavigatorElement: function() {
            	return this.$el.find("#navigator");
            }, 

            getSideElement: function() {
            	return this.$el.find('#side');
            }, 

            getContentElement: function() {
            	return this.$el.find('#content');
            },
            
            getCurrentLayout: function() {
            	return $('body').data('layout');
            }, 

            setCurrentLayout: function() {
            	$('body').data('layout', this.name);
            }, 
            
            isMe: function() {
            	return this.getCurrentLayout() === this.name;
            }, 
            
            // 강제 리셋
            reset: function() {
            	this.setLayout(true);
            }, 
            
            _initPageEvents: function() {
            	GO.router.off("change:page", this.clearContent);
                GO.router.off("change:package", this.clearAll);

                GO.router.on("change:page", this.clearContent, this);
                GO.router.on("change:package", this.clearAll, this);
                
                GO.EventEmitter.on('common', 'layout:setOverlay', this.setOverlay, this);
                GO.EventEmitter.on('common', 'layout:clearOverlay', this.clearOverlay, this);
                GO.EventEmitter.on('common', 'layout:targetSetOverlay', this.targetSetOverlay, this);
            }, 

        }, {
            __instance__: null, 

            create: function() {
                if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            }, 

            // 기존 싱글톤 버전 호환성 제공
            render: function() {
                var instance = this.create(), 
                    args = arguments.length > 0 ? aslice.call(arguments) : [];
                    
                return this.prototype.render.apply(instance, args);
            }
        });
        
        return InstallLayout;
    });

}).call(this);