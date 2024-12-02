(function () {
    define([
            "backbone"
        ],

        function (Backbone) {

            var CommunityInfo = Backbone.Model.extend({
                url: function () {
                    return ["/api/community", this.communityId].join('/');
                },

                setCommunityId: function (options) {
                    this.communityId = options.communityId;
                }

            });

            return {
                __instance: null,
                read: function (opt) {
                    if (this.__instance == null) this.__instance = new CommunityInfo();

                    if (opt.communityId != this.__instance.communityId) {
                        this.__instance.setCommunityId(opt);
                        this.__instance.fetch({
                            async: false,
                            error: function (data, error) {
                                if (GO.util.isMobile()) {
                                    GO.util.linkToErrorPage(error);
                                }
                            }
                        });
                    }
                    return this.__instance;
                }
            }
        });
}).call(this);
