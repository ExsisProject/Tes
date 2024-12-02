(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!system/templates/site_list",
            "hgn!system/templates/list_empty",
            "system/models/licenseModel",
            "system/models/site_control_option",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "jquery.go-grid",
            "jquery.go-sdk",
            "GO.util",
            "jquery.go-validation"
        ],

        function (
            $,
            Backbone,
            App,
            siteListTmpl,
            emptyTmpl,
            LicenseModel,
            SiteControlOptionModel,
            commonLang,
            adminLang
        ) {
            var tmplVal = {
                label_add: commonLang["추가"],
                label_delete: commonLang["삭제"],
                label_company_name: adminLang["사이트명"],
                label_domain_name: adminLang["도메인명"],
                label_user_count: adminLang["총 계정수"],
                label_service: adminLang["사이트 관리"],
                label_confirm_delete: adminLang["삭제하시게습니까?"],
                label_check_delete_item: adminLang["삭제할 항목을 선택하세요."],
                label_move_service: adminLang["사이트로 이동"],
                label_breadcrumb: adminLang["사이트 관리 > 사이트 목록"],
                label_register_user_license: adminLang["사용자 라이선스를 등록해주세요."],
                label_search: commonLang["검색"],
                label_search_domain: adminLang["사이트 검색"],
                label_total_account_quota: adminLang["총 할당 계정 용량"],
                label_total_company_quota: adminLang["공용 용량"],
                label_limitless: adminLang["무제한"],
                label_siteUrl: adminLang["접속 URL"],
                label_move_to_membership_store: adminLang['멤버십스토어로 이동'],
                label_move_to_membership_store_desc: adminLang['멤버십스토어로 이동 설명']

            };
            var siteList = Backbone.View.extend({
                el: '#layoutContent',
                initialize: function () {
                    this.listEl = '#siteList';
                    this.licenseModel = LicenseModel.read();
                    this.siteControlOptionModel = SiteControlOptionModel.read();
                    this.dataTable = null;
                    this.isSaaS = GO.session().brandName == "DO_SAAS";
                    this.unbindEvent();
                    this.bindEvent();
                },
                unbindEvent: function () {
                    this.$el.off("click", "span#btn_add");
                    this.$el.off("click", "span#btn_delete");
                    this.$el.off("click", "span#btn_search");
                    this.$el.off("keydown", "input#search");
                },
                bindEvent: function () {
                    this.$el.on("click", "span#btn_add", $.proxy(this.addSite, this));
                    this.$el.on("click", "span#btn_delete", $.proxy(this.deleteSite, this));
                    this.$el.on("click", "span#btn_search", $.proxy(this.searchSite, this));
                    this.$el.on("keydown", "input#search", $.proxy(this.searchKeyboardEvent, this));
                    this.$el.on("click", "span#goToMembershipStoreBtn", $.proxy(this.goToMembershipStore, this));
                },
                goToMembershipStore: function () {
                    $("#paymentForm").remove();
                    $.ajax({
                        url: GO.contextRoot + 'ad/api/payment/meta',
                        success: function (response) {
                            var data = response.data;
                            var $form = $(
                                "<form action='" + data.url + "/user/sso' target='payment' method='post' id='paymentForm'>" +
                                "   <input type='hidden' name='token' value='" + data.token + "'>" +
                                "</form>"
                            );
                            $("#main").append($form);
                            window.open("about:blank", "payment", "");
                            $form.submit();
                        }
                    });
                },
                addSite: function () {
                    if (this.licenseModel.get('hasUserLicense') == false) {
                        $.goAlert(adminLang["사용자 라이선스를 등록해주세요."]);
                    } else if (this.isExceedLicenseUser()) {
                        $.goAlert(adminLang["최대 사용자 수를 초과하였습니다."]);
                    } else if (!this.isExceedLicenseUser()) {
                        App.router.navigate('system/site/create', true);
                    }
                },
                deleteSite: function (e) {
                    var self = this,
                        checkedEls = $("#siteList input[type=checkbox]:checked");

                    var defaultDomainId = $(e.currentTarget).attr('data-defaultdomain');
                    for (var i = 0; i < checkedEls.length; i++) {
                        if (checkedEls[i].value == defaultDomainId) {
                            $.goAlert(adminLang["디폴트 도메인은 삭제할 수 없습니다."]);
                            $("#siteList input[type=checkbox]:checked").attr('checked', false);
                            return;
                        }
                    }

                    if (checkedEls.length == 0) {
                        return $.goAlert("", adminLang["삭제할 항목을 선택하세요."]);
                    }

                    $.goConfirm(adminLang["삭제하시겠습니까?"], "", function () {
                        var url = GO.contextRoot + "ad/api/system/companies";
                        var options = {
                            ids: []
                        };

                        for (var i = 0; i < checkedEls.length; i++) {
                            if (checkedEls[i].value == "on") {
                                continue;
                            }
                            options.ids.push(checkedEls[i].value);
                        }

                        if (options.ids.length == 0) {
                            return;
                        }

                        $.go(url, JSON.stringify(options), {
                            qryType: 'DELETE',
                            contentType: 'application/json',
                            responseFn: function () {
                                $.goMessage(commonLang["삭제되었습니다."]);
                                self.render();
                            },
                            error: function () {
                                $.goMessage(commonLang["실패했습니다."]);
                            }
                        });
                    });
                },
                render: function (keyword) {
                    $('#site').addClass('on');
                    $('.breadcrumb .path').html(adminLang["사이트 관리 > 사이트 목록"]);
                    this.$el.empty();
                    this.$el.html(siteListTmpl({
                        lang: tmplVal,
                        isSaaS: this.isSaaS
                    }));
                    this.renderSiteList(keyword);
                    $('#search').attr('value', keyword);
                },
                startServiece: function (companySeq) {
                    App.router.navigate('system/site/' + companySeq + "/modify", {trigger: true});
                },
                renderSiteList: function (keyword) {
                    var self = this;
                    var defaultDomainId = null;
                    this.$tableEl = this.$el.find('#siteList');
                    this.dataTable = $.goGrid({
                        el: this.listEl,
                        method: 'GET',
                        url: GO.contextRoot + 'ad/api/system/companies',
                        emptyMessage: emptyTmpl({
                            label_desc: adminLang["표시할 데이터 없음"]
                        }),
                        pageUse: true,
                        sDomUse: true,
                        checkbox: true,
                        sDomType: 'admin',
                        checkboxData: 'id',
                        defaultSorting: [[1, "desc"]],
                        params: {keyword: keyword},
                        displayLength: App.session('adminPageBase'),
                        columns: [
                            {
                                mData: "name", sWidth: '250px', bSortable: true, fnRender: function (obj) {
                                    if (obj.aData.defaultDomain == 'this') {
                                        defaultDomainId = obj.aData.id;
                                    }
                                    var ddayformat = "";
                                    if (obj.aData.companyPeriodEnd != "ulimit") {
                                        var d_day = App.util.getDdayDiff(obj.aData.companyPeriodEnd);
                                        if (d_day <= 7 && d_day >= 0) {
                                            ddayformat = " <span style='color: red;'>(D-" + d_day + ")</span>";
                                        } else if (d_day < 0) {
                                            ddayformat = " <span style='color: red;'>(" + adminLang["서비스 만료"] + ")</span>";
                                        }
                                    }
                                    return "<div id='name" + obj.aData.id + "'>" + obj.aData.name + ddayformat + "</div>";

                                }
                            }, {
                                mData: "siteUrl", sWidth: '250px', bSortable: true, fnRender: function (obj) {
                                    return obj.aData.siteUrl;
                                }
                            }, {
                                mData: "domainName", sWidth: '200px', bSortable: true, fnRender: function (obj) {
                                    return obj.aData.domainName;
                                }
                            }, {
                                mData: "baseCompanyConfig.totalAccountQuota",
                                sWidth: '200px',
                                bSortable: false,
                                fnRender: function (obj) {
                                    return obj.aData.baseCompanyConfig.totalAccountQuota == "0" ? adminLang["무제한"] : self.makeQuotaTmpl(obj.aData.baseCompanyConfig.totalAccountQuota, obj.aData.totalAccountQuota);
                                }
                            }, {
                                mData: "baseCompanyConfig.companyQuota",
                                sWidth: '200px',
                                bSortable: false,
                                fnRender: function (obj) {
                                    return obj.aData.baseCompanyConfig.companyQuota == "0" ? adminLang["무제한"] : self.makeQuotaTmpl(obj.aData.baseCompanyConfig.companyQuota, obj.aData.companyQuota);
                                }
                            }, {
                                mData: "usedCount", sWidth: '150px', bSortable: true, fnRender: function (obj) {
                                    return obj.aData.usedCount - obj.aData.stopUserCount + "/" + obj.aData.userCount;
                                }
                            }, {
                                mData: null, sWidth: '200px', bSortable: false, fnRender: function () {
                                    return (self.isSaaS) ?
                                        "<td></td>" : "<td class='action last'><span class='btn_s'>" + adminLang['사이트로 이동'] + "</span></td>";
                                }
                            }
                        ],
                        fnDrawCallback: function () {
                            self.$el.find('.toolbar_top .custom_header').append(self.siteControlOptionModel.isSiteControlOn() ?
                                self.$el.find('#goToMembershipStore').show() : self.$el.find('#controllButtons').show());

                            self.$el.find(this.el + ' tr>td:nth-child(2)').css('cursor', 'pointer').click(function (e) {
                                App.router.navigate('system/site/' + $(e.currentTarget).parent().find('input').val() + "/modify", {trigger: true});
                            });
                            self.$el.find(this.el + ' tr>td:nth-child(8)').click(function (e) {
                                if (!self.isSaaS) {
                                    self.checkSession($(e.currentTarget).parent().find('input').val());
                                }
                            });
                            self.$tableEl.find('input[type="checkbox"][value="' + defaultDomainId + '"]').parent().parent().addClass("default");
                            self.$el.find('#btn_delete').attr('data-defaultdomain', defaultDomainId);
                        }
                    });
                },
                checkSession: function (companyId) {
                    var url = GO.contextRoot + "ad/api/system/user/session";

                    $.go(url, "", {
                        qryType: 'GET',
                        async: false,
                        responseFn: function () {
                            window.open(GO.contextRoot + "system/gate?companyId=" + companyId, "SiteAdmin", "");
                        },
                        error: function (response) {
                            var responseData = JSON.parse(response.responseText);
                            $.goMessage(responseData.message);
                        }
                    });
                    return false;
                },
                makeQuotaTmpl: function (totalQuota, usedQuota) {
                    var usedRate = (parseInt(usedQuota) / parseInt(totalQuota) * 100).toFixed(0),
                        changedUsedQuota = GO.util.getHumanizedFileSize(usedQuota),
                        changedTotalQuota = GO.util.getHumanizedFileSize(totalQuota);

                    return changedUsedQuota + " / " + changedTotalQuota + " (" + usedRate + "%)";
                },
                isExceedLicenseUser: function () {
                    var isExceed = false;
                    var url = GO.contextRoot + "ad/api/system/company/userstat";

                    $.go(url, "", {
                        qryType: 'GET',
                        async: false,
                        responseFn: function (response) {
                            if (response.code == 200) {
                                if ((response.data.licenseUserCount - response.data.companiesUserCount) <= 0) {
                                    isExceed = true;
                                }
                            }
                        },
                        error: function (response) {
                            var responseData = JSON.parse(response.responseText);
                            $.goMessage(responseData.message);
                        }
                    });
                    return isExceed;
                },
                searchKeyboardEvent: function (e) {
                    if (e.keyCode == 13) {
                        this.searchSite();
                    }
                },
                searchSite: function () {
                    var keyword = $('#search').val();

                    if (keyword == "") {
                        $.goMessage(commonLang['검색어를 입력하세요.']);
                        return false;
                    }

                    if (!$.goValidation.isCheckLength(2, 255, keyword)) {
                        $.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "255"}));
                        return false;
                    }

                    if (!$.goValidation.charValidation("/\\/", keyword)) {
                        $.goMessage(adminLang['입력할 수 없는 문자']);
                        return false;
                    }
                    this.render(keyword);
                }
            }, {
                __instance__: null
            });

            return siteList;
        });
}).call(this);