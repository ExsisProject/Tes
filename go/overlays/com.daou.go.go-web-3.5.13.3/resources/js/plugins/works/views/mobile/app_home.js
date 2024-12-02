define('works/views/mobile/app_home', function (require) {

    /***
     * 작성자 : 곽준영
     * 최초 목록을 불러오는 액션을 하는 페이지는 FilterView에서 컨트롤한다.
     */
    var FIELD_TYPE = require('works/constants/field_type');

    require('jquery.bxslider');
    var Backbone = require('backbone');
    var when = require('when');

    var WorksUtil = require('works/libs/util');

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");

    var Share = require('works/models/applet_share');
    var ListSetting = require('works/components/list_manager/models/list_setting');
    var FilterManager = require('works/components/filter/models/filter_manager');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var Masking = require('works/components/masking_manager/models/masking');

    var Docs = require("works/collections/docs");
    var Fields = require("works/collections/fields");
    var ChartSettings = require("works/components/chart/collections/chart_settings");
    var ListSettings = require('works/personal_list_manager/collections/personal_list_settings');

    var HeaderToolbarView = require('views/mobile/header_toolbar');
    var FilterView = require("works/views/mobile/app_home_filter");
    var ChartView = require("works/components/chart/views/chart");
    var DocListView = require('works/components/doc_list/views/doc_list');

    var AppHomeTpl = require("hgn!works/templates/mobile/app_home");
    var FormTabTemplate = require("hgn!works/templates/mobile/app_home_form_tab");

    var SettingListTemplate = Hogan.compile([
        '<select id="settingList" style="width: 69px">',
        '<option value="0">' + worksLang['기본형'] + '</option>',
        '{{#collection}}',
        '<option value="{{id}}">{{name}}</option>',
        '{{/collection}}',
        '</a>'
    ].join(''));

    var PageDocs = Docs.extend({

        isEmpty: function () {
            return this.models.length === 0;
        },

        mobilePageInfo: function () {
            var pageInfo = this.pageInfo();
            var page = pageInfo.pageNo;
            var total = pageInfo.total;
            var offset = pageInfo.pageSize;
            var isLastPage = pageInfo.pageNo === pageInfo.lastPageNo;
            var firstIndex = (page * offset) + 1;
            var lastIndex = isLastPage ? total : (page + 1) * offset;

            return {
                lastIndex: lastIndex,
                firstIndex: firstIndex
            };
        }
    });

    var lang = {
        "total": worksLang["총"],
        "count": worksLang["건"],
        "addr": worksLang["폴더 주소"],
        "copy": commonLang["복사"],
        "showShareInfo": worksLang["공개/공유 현황 보기"],
        "admin": worksLang["운영자"],
        "state": commonLang["상태"],
        "title": commonLang["제목"],
        "dueDate": worksLang["기한"],
        "assignee": worksLang["담당자"],
        "activity": worksLang["활동기록"],
        "prev": commonLang["이전"],
        "next": commonLang["다음"],
        "notReadable": worksLang["열람 권한이 없는 업무입니다"],
        "empty": worksLang["미지정"]
    };

    var emptyList =
        '<li class="creat data_null">' +
        '<span class="subject">' +
        '<span class="txt">' + worksLang["목록이 없습니다."] + '</span>' +
        '</span>' +
        '</li>';

    var DocItemTmpl = Hogan.compile(
        '<li data-id="{{doc.id}}" data-type="doc" data-bypass="">' +
        '<a href="#" class="tit" data-bypass="">' +
        '{{#doc.titleIsMasking}}' +
        '<span class="ic_hidden_data"></span>' +
        '{{/doc.titleIsMasking}}' +
        '{{^doc.titleIsMasking}}' +
        '<span class="subject">' + '{{{doc.titleText}}}' + '</span>' +
        '{{/doc.titleIsMasking}}' +
        '<ul class="info">' +
        '{{#doc.columns}}' +
        '{{#visible}}' +
        '<li>' +
        '<span class="txt">' +
        '- {{label}}' + ' : ' +
        '{{^isMasking}}' +
        '{{{data}}}' +
        '{{/isMasking}}' +
        '{{#isMasking}}' +
        '<span class="ic_hidden_data"></span>' +
        '{{/isMasking}}' +
        '</span>' +
        '</li>' +
        '{{/visible}}' +
        '{{/doc.columns}}' +
        '</ul>' +
        '</a>' +
        '</li>'
    );

    return Backbone.View.extend({
        el: "#content",
        events: {
            "vclick li[data-type=doc]": "goAppDetail",
            "vclick a[data-value]": "paging",
            'vclick [el-form-tab]': '_onChangeForm',
            'change #settingList': '_onChangeSettingList',
        },
        initialize: function (options) {
            this.$el.off();
            this.$el.removeClass('bg_card_type go_works_home list_type');
            this.options = options;
            this.appletId = options.appletId;

            this.filterId = options.filterId || WorksUtil.getFilterStorage("works/applet/" + this.appletId + "/filter/mobile");
            this.charts = new ChartSettings();
            if (options.hasOwnProperty('appletId')) {
                this.baseConfigModel = new AppletBaseConfigModel(options.hasOwnProperty('appletId') ? {"id": options.appletId} : null);
            }
            this.filters = new FilterManager({appletId: this.appletId});
            this.baseSetting = new ListSetting({}, {appletId: this.appletId});
            this.share = new Share({id: this.appletId});
            this.fields = new Fields([], {
                appletId: this.appletId,
                subFormId: this.subFormId,
                includeProperty: true
            });
            this.masking = new Masking({appletId: this.appletId});
            this.masking.fetch();
            this.maskings = {};
            this.fieldsOfIntegrationApplet = {};
            this.docs = new PageDocs([], {
                appletId: this.appletId,
                subFormId: this.subFormId,
                includeActivityCount: true
            });

            this.settingId = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-works-list-setting', null) || '0';
            this.setting = new ListSetting({}, {appletId: this.appletId});

            this.settings = new ListSettings([], {appletId: this.appletId});
            this.settings.fetch();

            $.when(
                this.fields.deferred,
                this.baseSetting.deferred,
                this.settings.deferred
            ).then($.proxy(function () {
                this._initSetting();
            }, this));

            this.$el.html(AppHomeTpl({
                lang: lang,
                list: this.docs.toJSON(),
                page: _.extend(this.docs.pageInfo(), this.docs.mobilePageInfo())
            }));

            this.$el.on("searchByFilter", $.proxy(function (event, param) {
                this._search(param);
            }, this));
            this.docs.bind("reset", this.renderList, this);

            this.$el.on('searchByKeyword', $.proxy(function (event, keyword) {
                this._search({queryString: 'textContent:"' + keyword + '"'}).done($.proxy(function () {
                    this._highlighting(keyword);
                }, this));
            }, this));
        },

        dataFetch: function () {
            var defer = $.Deferred();
            GO.util.preloader(defer);

            $.when(
                this.setAccessibleForms()
            ).then($.proxy(function () {
                    return $.when(
                        this.baseConfigModel.fetch(),
                        this.fields.fetch(),
                        this.baseSetting.fetch(),
                        this.share.fetch(),
                        this.settings.deferred,
                        this.masking.deferred
                    )
                }, this)
            ).done($.proxy(function () {
                    return this.fetchIntegrationDatas();
                }, this)
            ).done($.proxy(function () {
                    var fieldCid = this.baseSetting.getSortColumnFieldCid();
                    this.docs.property = this.fields.getPropertyByFieldCid(fieldCid);
                    this.docs.direction = this.baseSetting.getSortDirection();
                    this.charts.reset(this.setting.get("charts"));
                    this._renderChartsView();
                    defer.resolve(this);
                    this._renderSettingList();
                }, this)
            ).fail(function () {
                GO.util.linkToCustomError({
                    code: 404,
                    message: worksLang['삭제된 폼 접근']
                });
            });
            return defer;
        },

        fetchIntegrationDatas: function () {
            var deferred = $.Deferred();
            this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                this.fieldsOfIntegrationApplet = fields;
                deferred.resolve();
            }, this));
            return deferred;
        },

        render: function () {

            var self = this;
            var toolbarData = {
                title: this.baseConfigModel.get('name'),
                isList: true,
                isSideMenu: true,
                isHome: true,
                isSearch: true
            };
            if (this._isWritable()) {
                toolbarData.isWriteBtn = true;
                toolbarData.writeBtnCallback = function () {
                    if (GO.util.isValidValue(self.subFormId)) {
                        GO.router.navigate("works/applet/" + self.appletId + "/doc/new/" + self.subFormId, {
                            trigger: true,
                            pushState: true
                        });
                    } else {
                        GO.router.navigate("works/applet/" + self.appletId + "/doc/new", {
                            trigger: true,
                            pushState: true
                        });
                    }
                }
            }
            HeaderToolbarView.render(toolbarData);
            $('#titleToolbar').hide();

            var self = this;
            var selectTab = false;

            this.$("div.content_tab").remove();
            this.$("#filterSection").after(FormTabTemplate({
                forms: this.accessibleForms,
                isSelect: function () {
                    if (this.mainForm) {
                        if (GO.util.isInvalidValue(self.subFormId)) {
                            selectTab = true;
                            return true;
                        } else {
                            return false;
                        }
                    }
                    if (this.id == self.subFormId) {
                        selectTab = true;
                        return true;
                    }
                    return false;
                }
            }));

            if (!selectTab) {
                $(".tab_menu>li").first().addClass("active");
            }

            $(".tab_menu_wrap").animate({
                scrollLeft: $("li.active").attr('data-id') == 'tab_main' ? 0 : $("li.active").offset().left - 100
            }, 200);

            this.renderFilterView();
            return this;
        },

        goAppDetail: function (e) {
            var docId = e.currentTarget.getAttribute("data-id");

            e.preventDefault();
            this.docs.storeParam();
            var idsTable = this.docs.map(function (doc) {
                return doc.id;
            });
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-docIdsTable', idsTable, {type: 'session'});
            if (GO.util.isValidValue(this.subFormId)) {
                GO.router.navigate("works/applet/" + this.appletId + "/doc/" + docId + '/navigate/' + this.subFormId, true);
            } else {
                GO.router.navigate("works/applet/" + this.appletId + "/doc/" + docId + '/navigate', true);
            }
        },

        renderFilterView: function () {
            this.filterView = new FilterView({
                appletId: this.appletId,
                filters: this.filters,
                filterId: this.filterId,
                fields: this.fields
            });
            this.$("#filterSection").append(this.filterView.el);
            this.filterView.render();
        },

        renderList: function () {
            this.$("#docList").find("li").remove();

            if (this.docs.isEmpty()) {
                this.$("#docList").append(emptyList);
                return;
            }

            var collection = this._parseCollection(this.docs);
            _.each(collection, function (doc) {
                this.$("#docList").append(DocItemTmpl.render({
                    lang: lang,
                    doc: doc
                }));
            }, this);

            var pageInfo = this.docs.pageInfo();
            pageInfo.prev ? this.$("#prev").show() : this.$("#prev").hide();
            pageInfo.next ? this.$("#next").show() : this.$("#next").hide();
        },

        _renderChartsView: function () {
            this.charts.mergeFromFields(this.fields);
            this.$("div.card_item_wrapper").empty();
            this.charts.each(function (chartSetting) {
                if (chartSetting.get("hasDeletedField")) return;

                var chartView = new ChartView({
                    model: chartSetting,
                    appletId: this.appletId,
                    chartFields: this.fields.getChartFields(),
                    numberFields: this.fields.getNumberFields(),
                    useToolbox: false
                });
                this.$("div.card_item_wrapper").append(chartView.el);
                chartView.render();
                chartView.fetchChartDatas();
            }, this);

            if (!this.charts.length) {
                this.$("div[el-chart-wrapper]").hide();
                return;
            } else {
                this.$("div[el-chart-wrapper]").show();
            }

            //화면사이즈에 맞춰 슬라이드 갯수 조정 width 최소 350px
            var slide = parseInt(($(window).width() - 40) / 350);
            var slideWidth = (slide > 1) ? 350 : 0;
            var slideMargin = (slide > 1) ? 10 : 0;

            var bxSliderOption = {
                pager: false,
                hideControlOnEnd: true,
                infiniteLoop: false,
                minSlides: slide,
                maxSlides: slide + 1,
                slideWidth: slideWidth,
                slideMargin: slideMargin,

                onSliderLoad: function () {
                    $('div.bx-viewport').css('height', '');
                    $('div.bx-viewport').removeClass();
                    $('div.bx-controls').css({"background-color": "transparent"});
                    $('a.bx-prev').css({"margin-top": "-215px"});
                    $('a.bx-next').css({"margin-top": "-215px"});
                    $('a.bx-prev').attr('href', 'javascript:void(0);');
                    $('a.bx-next').attr('href', 'javascript:void(0);');
                }
            };
            if (!this.slider) {
                this.slider = this.$("div.card_item_wrapper").bxSlider(bxSliderOption);
            } else {
                this.slider.reloadSlider(bxSliderOption);
            }

            if (this.$('.card_item_wrapper').children().length < 1) {
                this.$("div[el-chart-wrapper]").hide();
            }

        },

        _search: function (param) {
            this.docs.queryString = param.queryString;
            if (!param.useStorePage) this.docs.pageNo = 0;
            return this.docs.fetch({
                success: $.proxy(function () {
                    this.setCurrentPage();
                    this.charts.setQueryString(param.queryString);
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                }, this)
            });
        },

        paging: function (e) {
            var target = $(e.currentTarget);
            var type = target.attr("data-type");
            var pageInfo = this.docs.pageInfo();
            if (type === "prev" && !pageInfo.prev) return;
            if (type === "next" && !pageInfo.next) return;

            var self = this;
            var value = target.attr("data-value");
            this.docs.setPageNo(this.docs.pageInfo().pageNo + parseInt(value));
            this.docs.fetch({
                success: function () {
                    self.setCurrentPage();
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                }
            });
        },

        setCurrentPage: function () {
            var pageInfo = _.extend(this.docs.pageInfo(), this.docs.mobilePageInfo());
            this.$("#listCurrent").text(pageInfo.firstIndex);
            this.$("#listMax").text(pageInfo.lastIndex);
            this.$('#listTotal').text(' / ' + pageInfo.total);
        },

        setAccessibleForms: function () {
            var self = this;
            var deferred = $.Deferred();
            $.ajax({
                type: "GET",
                dataType: "json",
                url: GO.config('contextRoot') + "api/works/applets/" + this.appletId + "/accessible/form/list",
                success: function (resp) {
                    var data = GO.util.store.get(GO.session('id') + '-' + self.appletId + '-works-mobile-subform') || {};
                    self.accessibleForms = resp.data;

                    if (self.accessibleForms.length < 1) {
                        GO.util.linkToCustomError({
                            code: 403,
                            message: worksLang['폼 접근권한이 없습니다.'] + ' ' + worksLang['폼 접근권한 없음 설명']
                        });
                        return;
                    }

                    if (data.subFormId) {
                        self.subFormId = data.subFormId;
                    } else {
                        var firstForm = self.accessibleForms[0];
                        if (firstForm.mainForm) {
                            self.subFormId = null;
                        } else {
                            self.subFormId = firstForm.id;
                        }
                        data.subFormId = self.subFormId;
                    }
                    GO.util.store.set(GO.session('id') + '-' + self.appletId + '-works-mobile-subform', data, {type: 'session'});
                    deferred.resolve();
                },
                error: deferred.reject
            });
            return deferred;
        },

        _getUserLabel: function (user) {
            var position = user.position ? " " + user.position : "";
            return user.name + position;
        },

        _renderMasking: function () {
            return (
                '<div class="hidden_data">' +
                '<span class="help" title="' + worksLang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                '</div>'
            );
        },

        _parseCollection: function (docs) {
            var clone = _.clone(docs);
            var columnFields = this.fields.getColumnFields();
            var fields = this.setting.getColumns(columnFields);
            fields = this._setMasking(fields);
            return _.map(clone.models, function (model) {
                var columns = _.map(fields, function (mergedField) {
                    var label = mergedField.get("columnName") || mergedField.get("label");
                    var isMasking = mergedField.get('isMasking') && !model.isCreator(GO.session('id'));
                    return {
                        visible: true,
                        label: label,
                        data: isMasking ? this._renderMasking() : this.getColumnData(model, mergedField, false, true),
                        isMasking: isMasking
                    };
                }, this);

                var titleColumn = columns[this.baseSetting.get('titleColumnIndex')];
                if (GO.util.isValidValue(titleColumn)) {
                    titleColumn.visible = false;
                }

                if (model.has('activityCount')) {
                    columns.push({
                        label: worksLang['활동기록'],
                        data: model.get('activityCount'),
                        visible: true
                    });
                }

                return {
                    id: model.id,
                    columns: columns,
                    titleText: (!titleColumn || _.isEmpty(titleColumn.data)) ? '-' : titleColumn.data,
                    titleIsMasking: (GO.util.isInvalidValue(titleColumn)) ? false : titleColumn.isMasking
                };
            }, this);
        },

        _isWritable: function () {
            var isAdmin = this.baseConfigModel.isAdmin(GO.session("id"));
            var role = this.share.get('addDocRoles');
            var isWritable = _.contains(role, 'MEMBER');
            return isAdmin || isWritable;
        },

        _highlighting: function (keyword) {
            var $contentEl = this.$('span.subject');
            _.each($contentEl.contents(), function (textNode) {
                if (textNode.data)
                    textNode.parentNode.innerHTML = textNode.data.replace(new RegExp(keyword, 'gi'), '<strong class="txt_key">' + keyword + "</strong>");
            });
        },

        _renderSettingList: function () {
            this.$('.btn_submenu').append(SettingListTemplate.render({
                collection: this.settings.toJSON()
            }));
            var $select = this.$('#settingList');
            var settingId = $select.find('[value="' + this.settingId + '"]').length ? this.settingId : '0';
            this.$('#settingList').val(settingId);
        },

        _initSetting: function () {
            if (parseInt(this.settingId)) {
                var setting = this.settings.get(this.settingId);
                if (!setting) {
                    this.setting.set(this.baseSetting.toJSON());
                } else {
                    this.setting.set(_.extend(setting.get('view'), {id: setting.id}));
                }
            } else {
                this.setting.set(this.baseSetting.toJSON());
            }
        },

        _setMasking: function (fields) {
            var maskingFields = this.masking.get('fieldCids');
            _.each(fields, function (field) {
                var isMasking;
                if (field.get('fieldType') === FIELD_TYPE.FIELD_MAPPING) {
                    maskingFields = this._getIntegrationAppletMaskingByFieldMappingCid(field.get('cid'));
                    var properties = field.get('properties') || {};
                    isMasking = _.contains(maskingFields, properties.targetFieldCid);
                } else {
                    isMasking = _.contains(maskingFields, field.get('cid'));
                }
                field.set('isMasking', isMasking);
            }, this);
            return fields;
        },

        _getIntegrationAppletMaskingByFieldMappingCid: function (cid) {
            var fieldMapping = this.fields.findWhere({cid: cid});
            var fieldMappingProperties = fieldMapping ? fieldMapping.get('properties') || {} : {};
            var appletDocCid = fieldMappingProperties.targetComponentCid;
            var appletDoc = this.fields.findWhere({cid: appletDocCid});
            var appletDocProperties = appletDoc ? appletDoc.get('properties') || {} : {};
            var integrationAppletId = appletDocProperties.integrationAppletId;
            var masking = this.maskings[integrationAppletId];
            return masking ? masking.get('fieldCids') : [];
        },

        _onChangeSettingList: function (e) {
            var settingId = $(e.currentTarget).val();
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-list-setting', settingId);
            this.settingId = settingId;
            this._initSetting();
            //this._setColumns();
            this.charts.reset(this.setting.get("charts"));
            this._renderChartsView();
            this.renderList();
        },

        _onChangeForm: function (e) {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-works-mobile-subform') || {};

            var selectFormId = $(e.currentTarget).attr('data-id');
            if (selectFormId === 'tab_main') {
                delete data.subFormId;
            } else {
                data.subFormId = selectFormId;
                this.subFormId = selectFormId;
            }
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-mobile-subform', data, {type: 'session'});

            GO.router.navigate('works/applet/' + this.appletId + '/home', {
                trigger: true,
                pushState: false,
                replace: true
            });
        },


        _onClickMoveTab: function (e) {
            var next = $(e.currentTarget).hasClass('ic_arrow_next');
            if (next) {
                $(".tab_menu_wrap").animate({scrollLeft: '+=460'}, 200);
            } else {
                $(".tab_menu_wrap").animate({scrollLeft: '-=460'}, 200);
            }
        },

        getColumnData: DocListView.prototype.getColumnData,
        getProperties: DocListView.prototype.getProperties
    });
});
