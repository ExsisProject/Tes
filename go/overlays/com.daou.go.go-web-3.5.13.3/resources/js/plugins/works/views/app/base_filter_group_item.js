define('works/views/app/base_filter_group_item', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');

    var CircleView = require('views/circle');

    var Template = require('hgn!works/templates/app/base_filter_group_item');

    return Backbone.View.extend({

        tagName: 'tr',

        events: {
            'click [data-delete]': '_onClickDelete',
            'click [data-edit-circle]': '_onClickCirclePopup',
            'blur input[data-attr]': '_onBlur'
            //'keyup [data-attr="rule"]': '_onKeyUpFilterRule'
        },

        initialize: function () {
            this.isDefault = _.isUndefined(this.model.get('circle'));
        },

        render: function () {
            this.$el.html(Template({
                circle: this.model.get('circle'),
                isDefault: this.isDefault,
                model: this.model.toJSON()
            }));

            this._renderCircleLabel();
            GO.util.bindVirtualKeyEvent(this.$('[data-attr="rule"]'));

            return this;
        },

        _onClickDelete: function() {
            this.model.destroy();
            this.remove();
        },

        _onClickCirclePopup: function() {
            this._renderCirclePopup();
        },

        _onBlur: function(e) {
            var $target = $(e.currentTarget);
            var attr = $target.attr('data-attr');
            this.model.set(attr, $.trim($target.val()));
        },

        //_onKeyUpFilterRule: function(e) {
        //   console.log(e);
        //},

        _renderCirclePopup: function() {
            var circleView = new CircleView({
                isAdmin: false,
                nodeTypes: ['user', 'department', 'position', 'grade', 'duty', 'usergroup'],
                circleJSON: this.model.get('circle')
            });
            var popup = $.goPopup({
            	pclass : "layer_normal layer_filterAdd",
            	header : worksLang['필터 조건 대상 설정'],
                contents: '<span data-circle></span>',
                modal: false,
                buttons: [{
                    btype: 'normal',
                    btext: commonLang['확인'],
                    callback: $.proxy(function() {
                        this.model.set('circle', circleView.getData());
                        this._renderCircleLabel();
                    }, this)
                }]
            });
            circleView.setElement(popup.find('[data-circle]'));
            circleView.render();
        },

        _renderCircleLabel: function() {
            this.$('[data-circle-column]').text(this._parseCircleLabel());
        },

        _parseCircleLabel: function() {
            var circle = this.model.get('circle');
            if (this.isDefault) return commonLang['전체 사용자'];
            if (!this.isDefault && _.isEmpty(circle.nodes)) return commonLang['대상 없음'];
            return _.map(circle.nodes, function(node) {
                return node.nodeValue + (node.nodeType === 'subdepartment' ? ' (' + commonLang['하위부서포함'] + ')' : '');
            }, this).join(', ');
        }
    });
});