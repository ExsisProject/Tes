define('works/search/views/search_content', function (require) {

    require('jquery.mobile');

    var commonLang = require('i18n!nls/commons');
    var lang = {
        '더보기': commonLang['더보기'],
        '검색결과없음': commonLang['검색결과없음']
    };

    var Template = require('hgn!works/search/templates/search_content');
    var MobileTemplate = require('hgn!works/search/templates/mobile/search_content');
    var ResultItemTemplate = require('hgn!works/search/templates/result_item');
    var MobileResultItemTemplate = require('hgn!works/search/templates/mobile/result_item');

    return Backbone.View.extend({

        events: {
            'vclick [data-id]': '_onClickContent'
        },

        initialize: function (options) {
            options = options || {};
            this.isSimple = options.isSimple;
            this.template = GO.util.isMobile() ? MobileTemplate : Template;
            this.itemTemplate = GO.util.isMobile() ? MobileResultItemTemplate : ResultItemTemplate;
        },

        render: function () {
            this.$el.html(this.template({
                lang: lang,
                isSimple: this.isSimple
            }));

            _.each(this.model.parseViewDatas(), function (data) {
                this.$('[data-el-list]').append(this.itemTemplate({
                    id: data.id,
                    appletId: data.appletId,
                    title: this._highlighting(data.title, this.model.keyword),
                    createdAt: data.createdAt,
                    content: this._highlighting(data.content.join(', '), this.model.keyword),
                    creator: data.creator,
                    appletName: this.model.appletName ? this._highlighting(data.appletName, this.model.appletName) : data.appletName,
                    appletIcon: data.appletIcon
                }));
            }, this);

            return this;
        },

        _highlighting: function (content, keyword) {
            if(_.isUndefined(content) || content == null) {
                return;
            }

            content = content.toString();
            return content.replace(new RegExp(keyword, 'gi'), '<strong class="txt_key">' + keyword + "</strong>");
        },

        _onClickContent: function (e) {
            var $target = $(e.currentTarget);
            var appletId = $target.attr('data-applet-id');
            var docId = $target.attr('data-id');

            if (GO.router.getUrl().split("/")[0] == "works") {
                GO.router.navigate('works/applet/' + appletId + '/doc/' + docId, true);
            } else {
                window.open("/app/works/applet/" + appletId + "/doc/" + docId, "_blank", "scrollbars=yes,resizable=yes,width=1280,height=760");
            }

        }
    });
});
