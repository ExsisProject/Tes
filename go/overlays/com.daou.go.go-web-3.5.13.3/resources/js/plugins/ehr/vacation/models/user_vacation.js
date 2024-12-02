define([
    "backbone"
    ],

    function(
		Backbone
		) {
        var UserVacation = Backbone.Model.extend({
            initialize: function(userId){
              if(userId){
                  this.userId = userId;
              }
            },
            url: function(){
                return GO.contextRoot + "api/ehr/vacation/stat" +(this.userId? "/"+this.userId:"") +"?"+ this.getParams();
            },
            setUserId : function(userId){
              this.userId = userId;
            },
            setBaseDate : function(baseDate){
                this.baseDate = baseDate;
            },
            getParams : function(){
                var param = {};
                param["baseDate"] = this.baseDate;
                return $.param(param);
            }
        }, {
        });

        return UserVacation;
    }
);
