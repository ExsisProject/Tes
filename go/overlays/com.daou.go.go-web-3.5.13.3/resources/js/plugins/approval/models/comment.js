(function () {
    define([
            "backbone"
        ],

        function (Backbone) {
            var CommentModel = Backbone.Model.extend({
                url: function () {
                    this.docId = this.get('docId');
                    this.commentId = this.get('commentId');
                    var url = '/api/approval/document/' + this.docId + '/comment';
                    if (this.commentId) url += ('?commentId=' + this.commentId);

                    return url;
                },
                validate: function (attrs) {
                    if (attrs.message == '') {
                        return '';
                    }
                },
                hasEmoticon: function () {
                    return this.has("emoticonPath");
                },
            });

            return CommentModel;
        });
}).call(this);