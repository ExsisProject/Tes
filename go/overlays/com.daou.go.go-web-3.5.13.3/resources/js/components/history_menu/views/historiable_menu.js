define("components/history_menu/views/historiable_menu", [
    "backbone"
], function(Backbone) {

    var HistoriableMenuView;

    HistoriableMenuView = Backbone.View.extend({
        name: null, 
        title: 'Menu', 
        __historyMenu__: null, 
        __rendered__: false, 
        __menuClasses__: '', 

        connectWith: null, 

        initialize: function(options) {
            options = options || {};
            this.connectWith = options.connectWith || null;

            // 객체 생성 후 바로 그려지도록 한다.
            // this.render();
        }, 

        activate: function() {
            this.delegateEvents();
            // model에 바인딩 해둔 것은 상속받은 객체에서 구현해야 한다.
            this.render();
        }, 

        deactivate: function() {
            this.off();
            this.undelegateEvents();
            this.stopListening();
            // 그외 model에 직접 바인딩 한 것은 직접 구현해야 한다.
        }, 

        forward: function(nextView) {
            if(this.__historyMenu__) {
                this.__historyMenu__.forward(nextView);    
            }
        }, 

        back: function() {
            if(this.__historyMenu__) {
                this.__historyMenu__.back();
            }
        }, 

        close: function() {
            if(this.__historyMenu__) {
                this.__historyMenu__.close();
            }
        }, 

        setMenuClass: function(classnames) {
            this.__menuClasses__ = classnames;
        }
    });

    return HistoriableMenuView;
});