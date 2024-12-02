define('works/components/similar_layer/views/similar_layer', function(require) {
    var BackdropView = require('components/backdrop/backdrop');
    var Templates = require('hgn!works/components/similar_layer/templates/similar_layer');
    var Docs = require('works/collections/similar_docs');
    var worksLang = require('i18n!works/nls/works');
    var commonLang = require('i18n!nls/commons');

    var SearchItemTemplate = Hogan.compile([
        '<li>',
            '<strong>{{label}}</strong>',
            '<a><span class="btn_wrap">',
                '<span class="{{cssClass}} ic_blank" data-id="{{id}}" title="{{title}}"></span>',
            '</span></a>',
        '</li>'
    ].join(''));

    return BackdropView.extend({

        className: 'similar_data',
        attributes: {'style': 'display: none;'},

        events: {
            'mousedown span[data-id]': '_onMouseDown',
            'click span[data-id]': '_onClickDoc',
            'click li': '_onClickItem'
        },

        initialize: function(options) {
            this.backdropToggleEl = this.$el;
            this.bindBackdrop();

            this.linkEl = options.linkEl;
            this.label = options.label;
            this.clientId = options.clientId;
            this.docs = new Docs([], {
                type: 'score',
                appletId: options.appletId,
                fieldCid: options.clientId
            });
            this.listenTo(this.docs, 'sync', this._onSyncDocs);
            this.listenToOnce(this.docs, 'sync', this._linkBackdrop);

        },

        render: function() {
            this.$el.html(Templates({
                text: GO.i18n(worksLang['유사한 {{arg1}}이(가) 있습니다.'], {arg1: this.label})
            }));
            return this;
        },

        search: function(keyword) {
            if (keyword) {
                this.docs.similarSearch(keyword);
            } else {
                this.docs.reset([]);
                this.toggle(false);
            }
        },

        toggle: function(toggleFlag) {
            BackdropView.prototype.toggle.call(this, toggleFlag);
            if (!this.docs.length) this.backdropToggleEl.hide();
        },

        /**
         * focusout 이벤트가 걸릴 수 있어 지연 가능하도록 하자.
         * absolute 옵션이 있는 경우 타이머를 해제할수없다.
         */
        timerToggle: function(flag, delay, absolute) {
            var timer = setTimeout($.proxy(function() {
                this.toggle(flag);
            }, this), delay);
            if (!absolute ) this.timer = timer;
        },

        _onSyncDocs: function() {
            this.toggle(!!this.docs.length);
            this._renderList();
        },

        _renderList : function() {
            this.$('ul').empty();
            this.docs.each(function(doc) {
                this.$('ul').append(SearchItemTemplate.render({
                    title: commonLang['팝업보기'],
                    id: doc.id,
                    label: doc.get('values')[this.clientId] || '-',
                    cssClass: GO.util.isMobile() ? 'ic_v2' : 'ic_classic'
                }))
            }, this);
        },

        _linkBackdrop: function() {
            this.linkBackdrop(this.linkEl);
        },

        _onBackdrop: function(e) {
            if ($(e.relatedTarget).closest(this.backdropToggleEl).length > 0) {
                clearTimeout(this.timer);
            }
            BackdropView.prototype._onBackdrop.call(this, e);
            if (!this.docs.length) this.toggle(false);
        },

        /**
         * click 이벤트 때 focusout 이벤트을 막기위해 mousedown 에 preventDefault 를 걸어 준다.
         */
        _onMouseDown: function(e) {
            e.preventDefault();
        },

        _onClickDoc: function(e) {
            var docId = $(e.currentTarget).attr('data-id');
            var doc = this.docs.get(docId);
            var popupOption = "width=1280,height=700,status=yes,scrollbars=yes,resizable=yes";
            window.open(GO.contextRoot + 'app/works/applet/' + doc.get('appletId') + '/doc/' + doc.id, "help", popupOption);
        },

        _onClickItem: function(e) {
            this.$el.trigger('clickSimilarItem', $(e.currentTarget).find('strong').text());
        }
    });
});