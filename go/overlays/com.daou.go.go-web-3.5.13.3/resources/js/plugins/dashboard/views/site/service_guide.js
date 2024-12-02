define('dashboard/views/site/service_guide', [
    'backbone', 
    'app', 
    'hgn!dashboard/templates/site/service_guide',
    'jquery.go-popup', 
    'jquery.cookie'
], 

function(
    Backbone,
    GO, 
    renderTemplate
) {
    var SEMVERS = '20000';
    var COOKIE_ID = 'service-guide-' + SEMVERS + '-' + GO.session('id');
    var COOKIE_EXPIRES_DAY = 365;
    
    /**
     * 신규 앱에 대한 서비스 가이드 레이어(대시보드에서만 노출됨)
     * 
     * [history]
     *  - 2015-07-31: Works 서비스 출시 가이드 레이어로 사용(강봉수 선임)
     */
    var ServiceGuideView = Backbone.View.extend({
        events: {
            'click .btn-close': '_closePopup', 
            'click .help_view1': '_goToHelpView', 
            'click .help_view2': '_goToHelpView'
        },
        
        initialize: function() {
            this.popupEl = null;
        }, 
        
        render: function() {
            var savedCookie = $.cookie(COOKIE_ID);
            
            if(savedCookie && savedCookie === 'DONE') {
                return;
            }
            
            this.popupEl = $.goPopup({
                title : '',
                pclass : 'notice_help',
                width: '953px', 
                height: '589px', 
                modal : true,
                contents : renderTemplate()
            });
            this.popupEl.find("header:first").remove();
            this.popupEl.find('.content').addClass('contents');
            this.popupEl.reoffset();
            
            this.setElement(this.popupEl);
        }, 
        
        /**
         * @Override
         */
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            this.popupEl.close();
            this.popupEl = null;
        }, 
        
        _closePopup: function(event) {
            event.preventDefault();
            // 1. 쿠키 남기고...(1년 정도 길게..)
            $.cookie(COOKIE_ID, "DONE" , {expires: COOKIE_EXPIRES_DAY, path: "/"});
            // 뷰를 삭제(팝업 close도 같이 호출됨)
            this.remove();
        }, 
        
        _goToHelpView: function(event) {
            event.preventDefault();
            
            $.post("/api/help/meta", {}).done(function(resp) {
                if (resp.data.available) {
                    window.open(
                        resp.data.mainContents.url,
                        'help', 
                        'width=1280,height=760,status=yes,scrollbars=no,resizable=no'
                    );
                }
            });
        }
    });
    
    return ServiceGuideView;
    
});