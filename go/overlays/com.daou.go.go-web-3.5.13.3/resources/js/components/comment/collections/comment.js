define([
        "backbone"
    ],
    function (Backbone) {
        return Backbone.Model.extend({

            initialize: function () {
            },

            url: function () {
                var url = GO.contextRoot + ["api", this.get("typeUrl"), this.get("typeId"), "comment"].join('/');
                var option = this.isCalendar() ? "" : "/reply";
                var replyUrl = this.get("commentId") && !this.isCalendar() ? "/" + this.get("commentId") + option : "";
                var id = this.id ? "/" + this.id : "";

                return url + replyUrl + id;
            },

            createdAtStr: function () {
                return this.has("createAt") ? GO.util.snsDate(this.get("createdAt")) : "";
            },

            hasAttach: function () {
                return this.has("attaches") && this.get("attaches").length > 0;
            },

            hasEmoticon: function () {
                return this.has("emoticonPath");
            },

            getEmoticonPath: function () {
                return this.has("emoticonPath") ? GO.config('emoticonBaseUrl') + this.get("emoticonPath") : "";
            },

            getFiles: function () {
                return _.filter(this.getIconAttaches(), function (attach) {
                    return !GO.util.isImage(attach.extention);
                });
            },

            getImages: function () {
                return _.filter(this.getIconAttaches(), function (attach) {
                    return GO.util.isImage(attach.extention);
                });
            },

            getIconAttaches: function () {
                return _.each(this.get("attaches"), function (attach) {
                    attach["icon"] = GO.util.getFileIconStyle(attach);
                    attach['formattedSize'] = GO.util.getHumanizedFileSize(attach.size);
                });
            },

            isThread: function () {
                return this.id != this.get("thread");
            },

            isCalendar: function () {
                return this.get("typeUrl").split("/")[0] == "calendar";
            }
        });

    });
