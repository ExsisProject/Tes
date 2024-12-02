define('works/components/doc_list/views/status_column', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var Actions = require('works/collections/actions');
    var Action = require('works/models/action');
    var BackdropView = require('components/backdrop/backdrop');
    var Template = Hogan.compile([
        '<div class="btn_submenu" data-stop-propagation>',
            '<span class="state bgcolor{{statusColor}}" data-el-status backdrop-toggle="true">',
                '<span class="txt" data-el-status-label>{{{statusLabel}}}</span> ',
                '<span class="ic ic_drop_d"></span>',
            '</span>',
            '<div class="array_option opt_state" data-el-backdrop style="display: none;">',
                '<ul data-el-actions class="array_type"></ul>',
            '</div>',
        '</div>'
    ].join(' '));

    return Backbone.View.extend({

        tagName: 'div',

        initialize: function () {
            this.backdrop = new BackdropView();
            this.actions = new Actions([], {
                appletId: this.options.appletId,
                docId: this.options.docId
            });
            this.listenTo(this.actions, 'sync', this._onSyncActions);
            this.action = new Action({}, {
                appletId: this.options.appletId,
                docId: this.options.docId
            });
        },

        render: function () {
            this.$el.html(Template.render({
            	statusColor: this.options.color,
                statusLabel: this.options.statusLabel
            }));
            this.backdrop.setBackdropElement(this.$('[data-el-backdrop]'));
            this.backdrop.linkBackdrop(this.$('[data-el-status]'));
            this.unbindEvent();
            this.bindEvent();
            return this;
        },

        unbindEvent: function () {
            this.$el.off("click", "[data-el-status]");
            this.$el.off("click", "[data-action-id]");
        },
        bindEvent: function () {
            this.$el.on("click", "[data-el-status]", $.proxy(this._onClickStatus, this));
            this.$el.on("click", "[data-action-id]", $.proxy(this._onClickAction, this));
        },

        _onClickStatus: function() {
            this.actions.fetch();
        },

        _onSyncActions: function() {
            this._renderActions();
        },

        _renderActions: function() {
            this.$('[data-el-actions]').empty();
            this.actions.each(function(action) {
                this.$('[data-el-actions]').append('<li data-action-id="' + action.get('id') + '"><span>' + action.get('name') + '</span></li>')
            }, this);
            if (!this.actions.length) {
                this.$('[data-el-actions]').append('<li data-action-id><span>' + worksLang['변경 가능한 상태가 없습니다'] + '</span></li>');
            }
        },

        _onClickAction: function(e) {
            var $target = $(e.currentTarget);
            var actionId = $target.attr('data-action-id');
            if (!actionId) {
                this.backdrop.toggle(false);
                e.stopPropagation();
                return;
            }
            this.action.setActionId(actionId);
            this.action.save({}, {
                type: 'PUT',
                success: _.bind(function(docModel) {
                    this._renderStatusLabel(docModel.get('status'));
                    this.actions.fetch();
                    $.goMessage(commonLang['변경되었습니다.']);
                    this.backdrop.toggle(false);
                }, this)
            });
        },

        _renderStatusLabel: function(status) {
            this.options.statusLabel = status.name;
            this.options.color = status.color;
            this.$('[data-el-status-label]').text(status.name);
            this.$('[data-el-status]').attr("class", "state");
            this.$('[data-el-status]').addClass("bgcolor" + status.color);
        }
    });
});