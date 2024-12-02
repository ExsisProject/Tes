(function () {
    define([
            "jquery",
            "backbone",
            "app",
            'when',
            "admin/models/profile_config",

            "hgn!admin/templates/profile/profile_card_config",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "jquery.go-grid",
            "GO.util"

        ],

        function ($,
                  Backbone,
                  App,
                  When,
                  ProfileConfigModel,
                  ProfileCardConfigTmpl,
                  CommonLang,
                  AdminLang) {

            var lang = {
                "exposure_item": AdminLang["추가 노출 항목"],
                "select_item": AdminLang["항목 선택"],
                "select_item_tool_tip": AdminLang["기본정보 외 웹 페이지 조직도 프로필, 메신저 프로필, 모바일 프로필에 노출되는 항목을 설정합니다."],
                "decorate_profile": AdminLang["화면 꾸미기"],
                "confirm": CommonLang["확인"],
                "cancel": CommonLang["취소"],

                photo: CommonLang["사진"],
                name: CommonLang["이름"],
                grade: AdminLang["직급"],
                company_name: AdminLang["회사명"],
                duty: CommonLang['직책부서'],
                position: AdminLang["직위"],
                job: AdminLang["직무"],
                employee_no: CommonLang['인식번호'],
                email: CommonLang["이메일"],
                direct_tel: AdminLang["직통전화"],
                phone: AdminLang["핸드폰"],
                representive_tel: AdminLang["대표전화"],
                fax: AdminLang["팩스"],
                selfInfo: AdminLang["자기소개"],
                location: AdminLang["위치"],
                homepage: AdminLang["홈페이지"],
                messanger: AdminLang["메신저"],
                birthday: AdminLang["생일"],
                anniversary: AdminLang["기념일"],
                address: AdminLang["주소"],
                memo: AdminLang["메모"],

                "account_profile_modification_title" : AdminLang["개인 정보 수정"],
                "account_profile_modification_sub_title" : AdminLang["기본정보 수정"],
                "account_profile_modification_allow" : AdminLang["개인 수정 허용"],
                "account_profile_modification_not_allow" : AdminLang["개인 수정 허용하지 않음"],
            };

            var Promise = function () {
                return When.promise.apply(this, arguments);
            };

            var ProfileCardConfig = Backbone.View.extend({
                el: '#layoutContent',

                initialize: function () {
                    this.profileConfigModel = new ProfileConfigModel();
                    this.unbindEvent();
                    this.bindEvent();
                },

                unbindEvent : function() {
                    this.$el.off("click.account", "#update_profile_card_config");
                    this.$el.off("click.account", "#cancel");
                },
                bindEvent : function() {
                    this.$el.on("click.account", "#update_profile_card_config", $.proxy(this.saveProfileExposureInfo, this));
                    this.$el.on("click.account", "#cancel", $.proxy(this.cancel, this));
                },

                render: function () {
                    /**
                     * 순서
                     자기소개, 회사명, 소속+직책, 직무, 직급, 직통전화, 휴대전화, 대표전화, 팩스, 위치, 인식번호(사번),
                     생일, 홈페이지, 메신저, 기념일, 주소, 메모
                     */
                    this.$el.html(ProfileCardConfigTmpl({
                        lang: lang
                    }));

                    this.loadProfileExposureInfo();
                },

                cancel: function() {
                    //수정하고 있던 값이 아닌 DB에 저장된 초기값으로 다시 render(spec)
                    this.render();
                },

                loadProfileExposureInfo: function() {

                    this.asyncFetch(this.profileConfigModel)
                        .then(_.bind(function() {

                            var data = this.profileConfigModel.toJSON();

                            $("input[name=allowed]").filter('[value=' + data.allowed + ']').prop('checked', true);

                            var visibleProfileItems = data.visibleProfileItems.split(",");
                            _.each(visibleProfileItems, function(item) {
                                $("input[type=checkbox]").filter('[value=' + item + ']').prop('checked', true);
                            });

                        }, this))
                        .otherwise(function printError(err) {
                            console.log(err.stack);
                        });
                },

                saveProfileExposureInfo: function(evnet) {

                    var allowed = $('input:radio[name="allowed"]:checked').val();
                    var checkboxs = $("input[type=checkbox]");
                    var checkedKeys = ["thumbSmall"];             // Default Parameter
                    _.each(checkboxs, function(element) {
                        if ($(element).is(":checked")) {
                            checkedKeys.push($(element).val());
                        }
                    });

                    var self = this;
                    this.profileConfigModel.set({
                        "allowed": allowed,
                        "visibleProfileItems": checkedKeys.join(",")
                    });
                    this.profileConfigModel.save({}, {
                        type: 'PUT',
                        success: function (model, response) {
                            $.goMessage(CommonLang["저장되었습니다."]);
                            self.render();
                        },
                        error: function (model, rs) {
                            $.goMessage(CommonLang["저장에 실패 하였습니다."]);
                        }
                    });
                },

                asyncFetch: function (model) {
                    return new Promise(function (resolve, reject, notify) {
                        model.fetch({
                            success: resolve,
                            error: reject,
                            statusCode: {
                                400: function () {
                                    $.goError(CommonLang['500 오류페이지 내용']);
                                },
                                403: function () {
                                    $.goError(CommonLang['권한이 없습니다.']);
                                },
                                404: function () {
                                    $.goError(CommonLang['500 오류페이지 내용']);
                                },
                                500: function () {
                                    $.goError(CommonLang['500 오류페이지 내용']);
                                }
                            }
                        });
                    });
                }
            }, {
                render: function () {
                    var profileCardConfig = new ProfileCardConfig();
                    return profileCardConfig.render();
                }
            });

            return ProfileCardConfig;

        });
})();