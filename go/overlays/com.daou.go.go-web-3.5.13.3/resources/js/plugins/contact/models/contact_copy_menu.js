define([
        "backbone"
    ],

    function(Backbone) {
    	
    	var ContactCopyMenus = Backbone.Model.extend({
    		url: "/api/contact/copy/menu",

    		/**
    		 * side 우선순위 설정에 따른 정렬
    		 * @returns {Array}
    		 */

            initialize : function(){

            }

    	}, {
    		get: function() {
    			var instance = new ContactCopyMenus();
    			instance.fetch({async:false});
    			return instance;
    		},
			fetch: function() {
				var deferred = $.Deferred();

				var instance = new ContactCopyMenus();
				instance
					.fetch({async:true, reset : true})
					.then(function(){
							deferred.resolve(instance);
						}
					);

				return deferred;
			},

            init : function(){
                return new ContactCopyMenus();
            }
    	}); 
    	
    	return {
    		read : function(){
				return ContactCopyMenus.get();
			},
			promiseAsync : function() {
				return ContactCopyMenus.fetch();
			},
            init : function(){
                return ContactCopyMenus.init();
            }
    	};
    });