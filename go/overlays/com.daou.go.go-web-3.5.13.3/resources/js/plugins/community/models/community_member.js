(function() {
    define([
        "backbone",
        "app"
    ],

    function(
        Backbone,
        GO
    ) {
        var CommunityMember = GO.BaseModel.extend({
            url: function() {
                return "/api/community/"+this.options.communityId+"/member/"+this.options.subType+"/"+this.options.memberId;
            },

            initialize: function(options) {
                this.options = options;
            }
        });

        return CommunityMember;
    });
}).call(this);