define([
    "backbone"
    ],

    function(
		Backbone
		) {
		var instance = null;
        var VacationList = Backbone.Collection.extend({
            initialize: function(userId){
              if(userId){
                  this.userId = userId;
              }
            },
            url: function(){
            	if(this.userId) {            		
            		return GO.contextRoot + "api/ehr/vacation/" + this.userId +"/terms";
            	} else {
            		return GO.contextRoot + "api/ehr/vacation/my/terms";
            	}
            	
            },
            setUserId : function(userId){
              this.userId = userId;
            }
        }, {
        	setFetch: function(opt) {
    			instance = new VacationList(opt);
    			instance.fetch({async:false});
    			
    			return instance;
    		}
        });

        return {
        	getVacationList: function(opt) {
    			var vacationList = VacationList.setFetch(opt);
    			return vacationList;
    		},
    		init : function(opt) {
    			return new VacationList(opt);
    		}
        };
    }
);
