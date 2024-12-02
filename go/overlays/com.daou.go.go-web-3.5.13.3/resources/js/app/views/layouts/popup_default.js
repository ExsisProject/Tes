(function() {
    define([
    	"app",
        "views/layouts/default", 
        "hgn!templates/layouts/popup_default",
        "GO.util"
    ], 

    function(
    	GO, 
        DefaultLayout, 
        LayoutTpl
    ) {
        var instance = null,
        	__super__ = DefaultLayout.prototype, 
            _slice = Array.prototype.slice, 
            PopupDefaultLayout,
            tvars = {
                    tpl : {
                        overlay : '<div id="popOverlay" class="overlay"><div class="processing">Processing...</div></div>',
                        //popupTpl : '<div id="content"></div>'
                    },
                };

        PopupDefaultLayout = DefaultLayout.extend({
        	el: "#main", 
            name: "popup_default", 
            className: "go_skin_default", 
            
        	initialize: function() {
        	    var args = _slice.call(arguments);
        	    __super__.initialize.apply(this, args);
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
                //$(document).attr('title', this.getLogoName);
                this.$el.empty().append(LayoutTpl());
               
                // 라우터 이벤트 바인딩
                this._initPageEvents();
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
            }
        });
        
        return new PopupDefaultLayout();
    });
}).call(this);