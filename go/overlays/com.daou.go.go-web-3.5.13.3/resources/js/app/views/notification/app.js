define("views/notification/app", function(require) {

    var _ = require("underscore");
    var Backbone = require("backbone");
    var moment = require("moment");
    var GO = require("app");
    var Notifications = require("collections/notifications");
    var EmptyListTmpl = require("hgn!templates/notification/empty_list");
    var HeaderView = require("views/notification/header");
    var ListView = require("views/notification/list");
    var commonLang = require("i18n!nls/commons");

    var NotificationAppView = Backbone.View.extend({

        tagName: 'div',
        className: 'portlet_warp',
        container: null,

        config: {},
        defaultConfig: {
            category: "all",
            title: commonLang["최근 알림"],
            useDeleteAllButton: false,
            pageCount: 0,
            pageOffset: 10,
            isPageLoading: false,
            isLastPage: false
        },

        initialize: function(options) {
            this.options = options || {};
            _.bindAll(this, 'deleteAll');
            _.bindAll(this, 'readAll');

            this.config = _.extend({}, this.defaultConfig, this.options.config);

            this.collection = new Notifications([], {
                category: this.config.category,
                offset: this.config.pageOffset
            });
            this._initScrollPagination();
        },

        _initScrollPagination: function() {
            var scrollEventType = "scroll.notificationPagination";
            $(window).unbind(scrollEventType).bind(scrollEventType, $.proxy(function() {
                if (this.config.isPageLoading) return;
                if (this.config.isLastPage) return;
                if ($(window).scrollTop() != $(document).height() - $(window).height()) return;
                this._renderContent();
            }, this));
        },

        render: function() {
            this.$el.empty();
            this.$el.html('<section class="list_item list_item_alarm"></section>');
            this.container = this.$el.find('section');
            this._renderHeader();
            this._renderContent();
            this._renderBrowserTitle();

            // 새로운 알림 카운트 초기화
            this.initNewCount();

            return this.$el;
        },

        initNewCount: function() {
            $.ajax({
                url: GO.config("contextRoot") + 'api/home/noti/new',
                type: 'PUT',
                dataType: 'json',
                success: function(resp) {
                    $('#noti-count-badge').text(0);//리스트 삭제 후 알림 카운트 0으로 변경
                    $('#noti-count-badge').css("display", "none");
                }
            });
        },

        deleteAll: function() {
            var self = this;
            $.goPopup({
                title : commonLang["전체 알림 삭제처리"],
                message : commonLang["알림 전체를 삭제하시겠습니까?"],
                modal : true,
                buttons : [{
                    'btext' : commonLang["확인"],
                    'btype' : 'confirm',
                    'callback' : function(){
                        var url = GO.contextRoot + "api/my/noti";
                        var method = "DELETE";
                        $.ajax({
                            type: method,
                            async: false,
                            dataType: 'application/json',
                            url: url,
                            complete: onComplete
                        });
                    }
                }, {
                    'btext' : commonLang["취소"],
                    'btype' : 'normal'
                }]
            });

            function onComplete() {
                $('#noti-count-badge').text(0);//리스트 삭제 후 알림 카운트 0으로 변경
                self.config.pageCount = 0;//리스트 삭제 후 this._renderEmptyView();를 호출하기 위한 값 초기화
                self.render();
            };
        },

        readAll: function() {
            var self = this;
            $.goPopup({
                title : commonLang["전체 알림 읽음처리"],
                message : commonLang["전체 알림을 읽음으로 하시겠습니까?"],
                modal : true,
                buttons : [{
                    'btext' : commonLang["확인"],
                    'btype' : 'confirm',
                    'callback' : function(){
                        var url = GO.contextRoot + "api/my/noti/readall";
                        var method = "GET";
                        $.ajax({
                            type: method,
                            async: false,
                            dataType: 'application/json',
                            url: url,
                            complete: onComplete
                        });
                    }
                }, {
                    'btext' : commonLang["취소"],
                    'btype' : 'normal'
                }]
            });

            function onComplete() {
                $('#noti-count-badge').text(0);//리스트 삭제 후 알림 카운트 0으로 변경
                self.config.pageCount = 0; //리스트 삭제 후 this._renderEmptyView();를 호출하기 위한 값 초기화
                self.render();
            };
        },
        _renderBrowserTitle : function(){
            $(document).attr('title', this.config.title + ' - ' + GO.config('webTitle'));
        },
        _renderHeader: function() {
            this.config.buttons = [];
            if (this.config.useReadAllNotieButton) {
                this.config.buttons.push({
                    id : 'ReadAll',
                    icontype: "ic_read",
                    label: commonLang["전체 읽음"],
                    action: this.readAll
                });
            }
            if (this.config.useDeleteAllButton) {
                this.config.buttons.push({
                    id : 'DeleteAll',
                    icontype: "ic_del",
                    label: commonLang["전체 삭제"],
                    action: this.deleteAll
                });
            }

            var header = new HeaderView({
                icontype: this.config.icontype,
                title: this.config.title,
                buttons: this.config.buttons,
                arrowButton: this.config.arrowButton
            });

            this.container.empty().append(header.render());
        },

        _renderContent: function() {
            this.config.isPageLoading = true;
            this.collection.setPage(this.config.pageCount);
            this.collection.fetch().done($.proxy(function() {
                if (this.collection.isEmpty()) {
                    if (this.config.pageCount == 0) {
                        this._renderEmptyView();
                    }

                    this.config.isLastPage = true;

                } else {
                    if (this.collection.length == this.config.pageOffset) {
                        this.config.pageCount++;
                    } else {
                        this.config.isLastPage = true;
                    }

                    this._renderListView();
                    this.config.isPageLoading = false;
                }
            }, this));
        },

        _renderEmptyView: function() {
            this.container.append(EmptyListTmpl({
                message: commonLang["최근 알림이 없습니다."]
            }));

            if (this.config.useDeleteAllButton || this.config.useReadAllNotieButton) {
                $('#header_button').hide();
            }
        },

        _renderListView: function() {
            var listView = new ListView({
                collection: this.collection
            });

            this.container.append(listView.render());
        }

    });

    return NotificationAppView;
});
