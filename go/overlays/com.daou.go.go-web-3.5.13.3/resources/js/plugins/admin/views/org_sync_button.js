define('admin/views/org_sync_button', function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');

    var GO = require('app');
    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');
    var Template = Hogan.compile([
        '<span class="ic_adm ic_syn"></span>',
        '<span class="txt">', adminLang['채널 즉시 동기화'], '</span>'
    ].join(''));

    return Backbone.View.extend({

        tagName: 'span',
        className: 'btn_tool',

        events: {
            'click span': 'manualSync'
        },

        initialize: function(options) {
            this.orgSyncable = GO.config('orgSyncWaitMin') > 0;
            this.fetchOrgSyncTask();
            this.description = options.description;
        },

        render: function() {
            this.$el.html(Template.render());
            return this;
        },

        manualSync: function() {
            if (this.$el.hasClass('disabled')) return;
            var self = this;
            $.goPopup({
                title: adminLang['채널 즉시 동기화'],
                message: this.description,
                buttons : [{
                    btype: 'confirm',
                    btext: commonLang['확인'],
                    callback: function() {
                        self.$el.addClass('disabled');
                        $.ajax({
                            url: GO.contextRoot + 'ad/api/oauthsync/manually/' + GO.session('companyId'),
                            success: function() {
                                $.goSlideMessage(adminLang['동기화 요청 완료']);
                            }
                        });
                    }
                }, {
                    btype: 'cancel',
                    btext: commonLang['취소'],
                }]
            });
        },

        disable: function() {
            this.$el.removeClass('disabled');
            console.log('disable');
        },

        fetchOrgSyncTask: function() {
            if (this.orgSyncable) {
                var self = this;
                $.ajax({
                    url: GO.contextRoot + 'ad/api/oauthsync/target/exist/' + GO.session('companyId'),
                    success: function(resp) {
                        self.$el.toggleClass('disabled', !resp.data);
                    }
                });
            }
        }
    });
});
