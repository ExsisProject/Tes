define('works/views/app/doc_detail/doc_log', function (require) {
    // dependency
    var DocLogs = require('works/models/applet_doc_logs');
    var DocLogItemView = require('works/views/app/doc_detail/doc_log_item');
    var renderDocLogTpl = require('hgn!works/templates/app/doc_detail/doc_log');
    var taskLang = require("i18n!task/nls/task");

    var lang = {
        "history": taskLang["변경이력"],
        "showMore": taskLang["더 보기"]
    };

    return Backbone.View.extend({

        events: {
            "click #moreLog": "moreLog"
        },

        initialize: function (options) {
            this.options = options || {};
            this.docId = options.docId;
            this.appletId = options.appletId;
            this.mainForm = options.mainForm;
            this.logs = new DocLogs({appletId: this.appletId, docId: this.docId, mainForm: this.mainForm});
        },

        moreLog: function () {
            var self = this;
            var page = this.logs.page.page;
            this.logs.setPage(page + 1);
            this.logs.fetch({
                success: function () {
                    renderLogs.call(self);
                }
            });
        },

        render: function () {
            var self = this;
            this.logs.fetch({
                success: function () {
                    self.$el.html(renderDocLogTpl({
                        count: self.logs.models.length,
                        lang: lang
                    }));
                    renderLogs.call(self);
                }
            });
            return this;
        }
    });

    function renderLogs() {
        var $logList = this.$("#logList");
        _.each(this.logs.models, function (log) {
            var logItemView = new DocLogItemView(log);
            $logList.append(logItemView.render().el);
        }, this);
        this.$("#logCount").text(this.logs.page.total);
        if (isEnd.call(this)) {
            this.$("#moreLog").hide();
        }
    }

    function isEnd() {
        return this.$("#logList").find("li").length == this.logs.page.total;
    }
});
