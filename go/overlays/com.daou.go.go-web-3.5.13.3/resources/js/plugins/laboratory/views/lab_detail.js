define('laboratory/views/lab_detail', function (require) {
    var Backbone = require('backbone');
    var Template = require('hgn!laboratory/templates/lab_detail');
    var commonLang = require('i18n!nls/commons');

    var lang = {
        'close': commonLang['닫기'],
        'move_to_home': commonLang['홈으로 이동'],
        'before_comment_desc': commonLang['이 기능이 도움이 되셨나요'],
        'after_comment_desc': commonLang['소중한 의견 감사합니다.'],
        'before_thanks_desc': commonLang['여러분의 의견으로 더 편리한 기능을 만들겠습니다.'],
        'after_thanks_desc': commonLang['더 편리한 기능을 만들 수 있도록 노력하겠습니다.']
    };

    return Backbone.View.extend({

        events: {
            'click [data-feedback-like]': '_onClickFeedback',
            'click [data-go-home]': '_goHome',
        },

        initialize: function () {
            this.data = GO.util.getLocalStorage("lab-feedback-config");
            this.feedbackDoneData = this._getFeedbackDoneData();
        },

        render: function (options) {
            this.$el.html(Template({
                data: this.data,
                isFeedbackDone: this.feedbackDoneData.isDone,
                lang: lang
            }));

            if (this.feedbackDoneData.isDone) {
                this._renderForFeedbackDone();
            }
        },

        _renderForFeedbackDone: function () {
            $('[data-feedback-like]').prop('disabled', true);

            $('[data-feedback-img]').empty().append('<img class="" src="/resources/images/wooram_good.gif">');
            $('[data-reault-comment]').text(lang.after_comment_desc);
            $('[data-reault-comment-side]').html(lang.after_comment_desc);
            $('[data-thanks-desc]').text(lang.after_thanks_desc);
        },

        _onClickFeedback: function (e) {
            e.preventDefault();

            var _this = this;
            var point = $(e.currentTarget).attr("data-value") || 1;
            $.ajax({
                type: "POST",
                url: GO.contextRoot + "api/laboratory/feedback/likes",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    labConfigId: _this.data.id,
                    title: _this.data.title,
                    appliedVersion: _this.data.appliedVersion,
                    point: point
                }),
                success: function (resp) {
                    if (resp.code !== '200') {
                        $.goAlert(resp.message);
                        return false;
                    }

                    GO.util.setLocalStorage('lab-user-feedback-done-' + GO.session('id'), {
                        isDone: true,
                        point: point,
                        configId: _this.data.id
                    });
                    _this._renderForFeedbackDone();
                },
                error: function (e) {
                    $.goAlert(commonLang['저장에 실패 하였습니다.']);
                }
            });
        },

        _getFeedbackDoneData: function () {
            var data = GO.util.getLocalStorage('lab-user-feedback-done-' + GO.session('id'));
            return _.isEmpty(data) || data.configId !== this.data.id ? {isDone: false} : data;
        },

        _goHome: function () {
            GO.router.navigate('home', {trigger: true});
        },

    });
});