(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "i18n!approval/nls/approval",
            "hgn!admin/templates/appr_official_doc_sender"
        ],
        function ($,
                  Backbone,
                  App,
                  commonLang,
                  adminLang,
                  approvalLang,
                  formTmpl) {

            var lang = {
                'head_title': '발신 명의',
                'title': commonLang['제목'],
                'sign_img': '직인 이미지',
                'creation_success_msg': adminLang['저장되었습니다. 양식 목록으로 이동합니다.'],
                'cancel_and_go_to_list_msg': adminLang['취소하셨습니다. 이전 화면으로 이동합니다.'],
                'creation_fail_msg': adminLang['저장할 수 없습니다.'],
                'upload_sign_img': '직인 올리기',
                'state': adminLang['사용여부'],
                'hidden': adminLang['숨김'],
                'normal': adminLang['정상'],
                'use': approvalLang["사용"],
                'unuse': approvalLang['미사용'],
                'name_invalid_length': adminLang['제목은 100자까지 입력할 수 있습니다.'],
                'name_required': adminLang['제목을 입력하세요.'],
                'duplicated_name': adminLang['제목이 중복되었습니다.'],
                'modify': commonLang['수정'],
                'select': commonLang['선택'],
                'add': commonLang['추가'],
                'delete': commonLang['삭제'],
                'save': commonLang['저장'],
                'cancel': commonLang['취소']
            };

            /**
             *
             * 직인 뷰이다. 생성과 수정에 사용된다.
             *
             */
            var OfficialDocSenderView = Backbone.View.extend({

                el: '#layoutContent',
                model: null,

                initialize: function (options) {
                    this.model = options.model;
                    this.initBindingEvents();
                },

                initBindingEvents: function () {
                    this.$el.off('click', '#save_btn');
                    this.$el.off('click', '#cancel_btn');
                    this.$el.on('click', '#save_btn', $.proxy(this._onSaveClicked, this));
                    this.$el.on('click', '#cancel_btn', $.proxy(this._onCancelClicked, this));
                },

                render: function () {
                    this.$el.html(formTmpl(this._makeTmplData(this.model)));
                },

                _makeTmplData: function (model) {
                    var wrappedState = function () {
                        return function (text) {
                            return text.replace('value="' + this.state + '"', 'value="' + this.state + '" checked');
                        };
                    };

                    var data = {
                        lang: lang,
                        wrappedState: wrappedState
                    };

                    return _.extend(data, model.toJSON());
                },

                _onSaveClicked: function () {
                    var self = this;
                    this.model.set('name', this.$el.find('input[name=name]').val().trim());
                    this.model.set('state', this.$el.find('input[name=state]:checked').val());
                    if (!this.model.isValid()) {
                        if (_.contains(['name_invalid_length', 'name_required'], this.model.validationError)) {
                            $.goMessage(lang[this.model.validationError]);
                            this.$el.find(':input[name=name]').select();
                        } else {
                            $.goMessage(lang[this.model.validationError]);
                        }
                        return false;
                    }

                    if (this.requestProcessing) {
                        return;
                    } else {
                        this.requestProcessing = true;
                    }
                    this.model.save({}, {
                        success: $.proxy(function (model, resp, opts) {
                            $.goAlert(lang['creation_success_msg'], "", this._goToFormListView);
                        }, this),

                        error: function (model, resp, opts) {
                            var message = lang['creation_fail_msg'];
                            if (_.contains(resp['responseJSON']['name'], 'bad.request')) {
                                message = lang['duplicated_name'];
                            }

                            $.goMessage(message);
                            return false;
                        },

                        complete: function () {
                            self.requestProcessing = false;
                        }
                    });
                },

                _onCancelClicked: function () {
                    $.goAlert(lang['cancel_and_go_to_list_msg'], "", $.proxy(this._goToFormListView, this));
                    return false;
                },

                _goToFormListView: function () {
                    GO.router.navigate('approval/manage/official', {trigger: true});
                    return false;
                }
            });

            return OfficialDocSenderView;
        });
}).call(this);