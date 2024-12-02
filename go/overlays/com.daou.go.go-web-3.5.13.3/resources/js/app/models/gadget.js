/**
 * @deprecated
 * components/dashboard 로 이동 예정
 */
;(function(undefined) {

    define(["backbone"], function( Backbone ) {
        var GadgetModel = Backbone.Model.extend({
            urlRoot: '/api/gadget', 
            getSpec: function( key ) {
                var spec = this.get('spec');
                return (typeof key === 'undefined' ? spec: spec[key]);
            }, 
            
            getBoxNumber: function() {
                return this.get('boxNumber') + 1;
            }
        });
        
        return GadgetModel;
    });
    
})();