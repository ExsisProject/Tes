define(function(require) {
    var Backbone = require("backbone");
    var Model = require("contact/models/contact");

    var contacts = Backbone.Collection.extend({
        model : Model,
        url: "/api/contact/contacts",

        default : {
            page : 0,
            offset : 20,
            property : 'nameInitialConsonant',
            direction : 'asc',
            keyword : ""
        },

        initialize : function(){

        },
        findAll : function(param){

            var options = $.extend({}, this.default, param);

            if(!options.type){
                throw new Error('require type!!');
            }

            // null 일 경우 빈값으로 변경
            _.each(options, function(value, key){
                if(value == "null"){
                    options[key] = "";
                }
            });

            this.fetch({
                data : options,
                async : false,
                reset : true
            });

            return this;
        }
    });

    return contacts;
});
