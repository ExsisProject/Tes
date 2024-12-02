(function () {
    define([
            "underscore",
            "backbone",
            "app"
        ],
        function (
            _,
            Backbone,
            GO
        ) {

            var NotificationCollection = Backbone.Collection.extend({

                    category: 'home',
                    conditions: {},

                    categoryUrlInfo: {
                        'home': '/api/home/noti',
                        'all': '/api/my/noti',
                        'unread': '/api/my/noti/unread',
                        'mail': '/api/my/noti/mail',
                        'bbs': '/api/my/noti/bbs',
                        'community': '/api/my/noti/community',
                        'calendar': '/api/my/noti/calendar',
                        'task': '/api/my/noti/task',
                        'todo': '/api/my/noti/todo',
                        'report': '/api/my/noti/report',
                        'survey': '/api/my/noti/survey',
                        'approval': '/api/my/noti/approval',
                        'works': '/api/my/noti/works',
                        'docs': '/api/my/noti/docs',
                        'asset': '/api/my/noti/asset',
                        'webfolder': '/api/my/noti/webfolder',
                        "ehr": '/api/my/noti/ehr',
                        'channel': '/api/my/noti/channel',
                        'manager': '/api/my/noti/manager',
                        'openapi': '/api/my/noti/openapi'
                    },

                    url: function () {
                        var path = this.categoryUrlInfo[this.category],
                            param = $.param(this.conditions);
                        return path + '?' + param;
                    },

                    initialize: function (models, options) {
                        this.conditions = {
                            page: 1,
                            offset: 10
                        };
                        if (options && options.offset) this.conditions['offset'] = options.offset;
                        if (options && options.category) this.category = options.category;
                    },

                    comparator: function (model) {
                        return !model.get("createdAt");
                    },

                    setPage: function (page) {
                        this.conditions.page = page;
                        return this;
                    }
                },
                {
                    getUnreadCount: function (onSuccess) {
                        var count = 0;
                        $.ajax({
                            type: 'GET',
                            async: false,
                            dataType: 'json',
                            url: GO.config("contextRoot") + 'api/home/noti/count',
                            success: function (resp) {
                                var count = resp.data;
                                onSuccess(count);
                            }
                        });
                        return count;
                    },

                    getNewCount: function (onSuccess) {
                        var count = 0;
                        $.ajax({
                            type: 'GET',
                            async: false,
                            dataType: 'json',
                            url: GO.config("contextRoot") + 'api/home/noti/new',
                            success: function (resp) {
                                var count = resp.data;
                                onSuccess(count);
                            }
                        });
                        return count;
                    }
                });

            return NotificationCollection;
        });
}).call(this);
