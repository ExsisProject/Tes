define([
        "backbone",
        "app"
    ],

    function (Backbone, App) {
        var BOARD_TYPE_STREAM = "STREAM",
            BOARD_TYPE_CLASSIC = "CLASSIC";

        var BoardConfig = Backbone.Model.extend({
            url: function () {
                return ["/api/board", this.id].join('/');
            },

            isStreamType: function () {
                return (this.get("type") === BOARD_TYPE_STREAM);
            },
            isClassicType: function () {
                return (this.get("type") === BOARD_TYPE_CLASSIC);
            },
            isDetail: function () {

            },
            isWritable: function () {
                return this._hasAction() ? this.get("actions").writable : false;
            },
            isManageable: function () {
                return this._hasAction() ? this.get("actions").managable : false;
            },
            isClose: function () {
                return this.get("status") == "CLOSED";
            },
            isActive: function () {
                return this.get("status") == "ACTIVE";
            },

            _hasAction: function () {
                return !!this.get('actions');
            }

        }, {
            get: function (boardId, refresh) {
                var instance = new BoardConfig();

                if (instance.id != boardId || true) {

                    instance.set("id", boardId, {silent: true});
                    // Cache 처리 필요
                    instance.fetch({
                        async: false,
                        error: function (data, error) {
                            if (GO.util.isMobile()) {
                                GO.util.linkToErrorPage(error);
                            } else {
                                var _error = JSON.parse(error.responseText);
                                GO.util.error(_error.code, _error.code === "500" ? {} : {"msgCode": "400-board"})
                            }
                        }
                    });
                }
                return instance;
            }
        });

        return BoardConfig;
    });