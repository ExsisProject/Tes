define('works/views/app/app_layout', function(require) {
    
    // dependency
    var when = require('when');
    var DefaultLayout = require('views/layouts/default');
    
    // subviews
    var WorksSideView = require('works/views/app/layout/side');
    var AppContentTopView = require('works/views/app/layout/app_content_top');
    
    var Promise = function() {
        return when.promise.apply(this, arguments);
    };
    
    // main script
    var AppLayout = DefaultLayout.extend({ 
        className: 'go_works go_skin_default', 
        name: "works-2col", 
        
        sideView: null, 
        contentTopView: null, 
        
        baseConfigModel: null,
        pageName: null, 
        
        initialize: function(options) {
            options = options || {};
            DefaultLayout.prototype.initialize.apply(this, arguments);
            GO.config('workspace_expansion_button_visible', false);
            this.sideView = null;
            this.contentTopView = null;
        },
        
        render: function() {
            var self = this;
            
            if(!this.baseConfigModel) {
                throw new Error('baseConfigModel을 정의해주세요.');
                return;
            }

            self.appName = 'works';
            return new Promise(function(resolve, reject) {
                DefaultLayout.prototype.render.call(self, arguments).then(function() {
                    self.getContentElement().empty();
                    self.getSideElement().empty();
                    self.getContentElement().addClass('go_renew build_situation');
                    renderSideView.call(self);
                    renderContentTop.call(self);
                    
                    resolve(self);
                }, reject);
            });
        },
        
        setBaseConfigModel: function(baseConfigModel) {
            this.baseConfigModel = baseConfigModel;
            return this;
        }, 
        
        setPageName: function(pn) {
            this.pageName = pn;
            return this;
        }
    });
    
    // private methods
    function renderSideView() {
        this.sideView = new WorksSideView({"el": this.getSideElement()});
        this.sideView.render();
    }
    
    function renderContentTop() {
        this.contentTopView = new AppContentTopView({
            baseConfigModel: this.baseConfigModel, 
            pageName: this.pageName
        });
        this.getContentElement().append(this.contentTopView.el);
        this.contentTopView.render();
    }
    
    return AppLayout;
});