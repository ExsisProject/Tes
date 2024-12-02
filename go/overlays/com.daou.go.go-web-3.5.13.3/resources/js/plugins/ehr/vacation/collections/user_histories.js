define(
    [
      "backbone"
    ],
    function(
            Backbone
        ) {
        var UserHistories = Backbone.Collection.extend({
            url: function(){
                return GO.contextRoot + "api/ehr/vacation/my/histories?year=" + this.year;
            },
            setYear : function(year){
                this.year = year;
            }
        }, {

        });
        return UserHistories;
    }
);
