define([
    "backbone"
],
function(Backbone) {
    var Form = Backbone.Model.extend({
        
        initialize : function(options){
            this.options = options;
        },
        url: function(){
            return this.options.url + "/" +this.get('id');
        }
    }, {
    }); 
    return Form;
});
