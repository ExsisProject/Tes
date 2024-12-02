define("works/components/filter/views/filter", function (require) {

    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "전체": worksLang["전체"],
        "필터 저장": worksLang["필터 저장"],
        "필터 삭제": worksLang["필터 삭제"],
        "필터를 삭제하시겠습니까?": worksLang["필터를 삭제하시겠습니까?"],
        "새 필터 저장": worksLang["새 필터 저장"],
        "새 필터 저장 설명": worksLang["새 필터 저장 설명"],
        "필터 이름 변경": worksLang["필터 이름 변경"],
        "변경할 필터 이름을 입력하세요.": worksLang["변경할 필터 이름을 입력하세요."],
        "조건을 추가해주세요.": worksLang["조건을 추가해주세요."],
        "새 필터": worksLang["새 필터"],
        "텍스트 검색": worksLang["텍스트 검색"],
        "개의 데이터가 있습니다": worksLang["개의 데이터가 있습니다"],
        '기본 필터로 저장': worksLang['기본 필터로 저장'],
        "차트접기": worksLang["차트접기"],
        "기본형": worksLang['기본형'],
        "목록관리": worksLang['목록 관리'],
        "필터조건설명": worksLang['필터조건설명']
    };
    var VALUE_TYPE = require('works/constants/value_type');
    var CONDITION_TYPE = require("works/constants/condition_type");
    var commonLang = require("i18n!nls/commons");

    var FieldAddButtonView = require("works/components/filter/views/filter_condition_add_button");
    var ConditionButtonView = require("works/components/filter/views/filter_condition_button");
    var FilterManagerLayerView = require("works/components/filter/views/filter_manager_layer");

    var Conditions = require("works/components/filter/collections/filter_conditions");

    var Filter = require("works/components/filter/models/filter");
    var Condition = require("works/components/filter/models/filter_condition");

    var FilterTemplate = require("hgn!works/components/filter/templates/filter");

    var BackdropView = require("components/backdrop/backdrop");

    return Backbone.View.extend({

        className: "wrap_filter",

        events: {
            "click #filterManagerLayerToggleButton": "_onClickFilterManagerToggle",
            "click [el-save-filter]": "_onClickSaveFilter",
            "click [el-save-as-filter]": "_onClickSaveAsFilter",
            "click [el-rename-filter]": "_onClickRenameFilter",
            "click [el-delete-filter]": "_onClickDeleteFilter",
            "click #search": "_onClickSearch",
            "keydown #searchText": "_onKeydownSearch",
            "change #searchText": "_onChangeSearch",
            "click #filterDesc": '_toggleDesc',
        },

        initialize: function (options) {
            this.appletId = options.appletId;
            this.mainForm = options.hasOwnProperty('mainForm') ? options.mainForm : true;
            this.isAdmin = options.isAdmin;
            this.useCachedCondition = options.useCachedCondition;

            this.fields = options.fields;

            this.filters = options.filters;
            if (this.filters) {
                this.filters.on("changeFilter.filters", this._onChangeFilter, this);
                this.filters.on("remove", this._onRemoveFilter, this);
                this.filters.on("change:name", this._onChangeFilterName, this);
            }

            this.conditions = options.conditions || new Conditions();
            this.conditions.on("unuseCondition", this._onUnuseCondition, this);

            this.template = options.template || FilterTemplate;
            this.templateParam = options.templateParam || {};
            this.useStore = options.store !== false;
            this.useDocNo = options.useDocNo || false;

            var isLinkFilter = (options.refLink === undefined) ? false : options.refLink.isLinkFilter;
            this.useCheckbox = options.useCheckbox !== false;
            this.collection = options.collection;
            /**
             * 연동앱 바로가기 링크로 앱홈에 접속한 경우 contions이 없으므로 만들어 줘야함
             * 그리고 연동앱 바로가기 링크는 producer doc가 하나임
             */
            if (isLinkFilter) {
                var keyName = this.options.refLink.appletId + '-' + this.options.refLink.docId + '-linkfilterData-' + this.appletId;
                var linkfilterData = GO.util.store.get(keyName);
                var conditionObj = {
                    conditionType: CONDITION_TYPE.SELECT,
                    fieldCid: linkfilterData.fieldCid[0],
                    values: {
                        isRelative: true,
                        values: [{id: linkfilterData.values.values[0].id, text: linkfilterData.values.values[0].text}]
                    }
                };
                var condition = new Condition(conditionObj);

                var field = this.fields.findWhere({cid: condition.fieldCid});
                condition.mergeFromFields(this.fields.toJSON());
                this.conditions.push(condition);
            }

            /**
             * @param filterObject => filter model (object) / filterId (string number) / undefined
             * 연동앱 바로가기 링크로 앱홈에 접속한 경우 기존 필터들 무시하고 링크필터로 적용
             */
            var filterObject = isLinkFilter ? undefined : (this.useStore ? this._getStoredFilter() : {conditions: this.conditions.toJSON()});

            this._initFilter(filterObject);
            this.hasInitFilterId = parseInt(filterObject) > 0;
            if (this.hasInitFilterId) this.filter.fetch();

            /**
             * add 될 땐 불필요한 요청을 보내지 않기 위해
             * 결과가 똑같을 것으로 예상되는 조건이 추가되면 search trigger 를 하지 않는다. ex) checkbox options: []
             * remove 는 search trigger 쪽에서 잡기 때문에 listen 하지 않아도 된다.
             */
            this.listenTo(this.conditions, 'add', this._onUpdateConditions);
        },

        render: function () {
            this.fields.deferred.done($.proxy(function () {
                this.$el.html(this.template(_.extend({
                    lang: lang,
                    model: this.filter.toJSON(),
                    collection: this.collection,
                    mainForm: this.mainForm
                }, this.templateParam)));

                this.$listEl = this.$("#fieldManagerAndConditionsArea");

                this._renderManagerLayer();
                this._renderFieldAddButton();
                if (!this.hasInitFilterId) this._filterProcess();
            }, this));

            return this;
        },

        addConditionButton: function (options) {
            this._renderConditionButton(options);
        },

        /**
         * @param data => filter model (object) / filterId (string number) / undefined
         * @param type: default mine
         */
        _initFilter: function (data, type) {
            var filterOption = {
                appletId: this.appletId,
                type: type || 'mine',
                useDocNo: this.useDocNo || false
            };
            if (_.isObject(data)) {
                this.filter = new Filter(_.extend(data, {useDocNo: this.useDocNo || false}));
                this.conditions.reset(data.conditions);
            } else if (data === 'createdBy') {	// '내가등록한데이터' 필터
                this.filter = new Filter(_.extend(filterOption, Filter.getCreatedByFilterOptions()));
                this.conditions.reset(this.filter.get("conditions"));
            } else {
                if (parseInt(data) > 0) filterOption['id'] = parseInt(data);
                this.filter = new Filter(filterOption);
            }

            this.filter.off("sync");
            this.filter.on("sync", this._onSyncFilter, this);
            this.filter.off("change:name");
            this.filter.on("change:name", this._onChangeNameOfFilter, this);
        },

        _renderManagerLayer: function () {
            this.managerLayer = new FilterManagerLayerView({
                model: this.filter,
                parentCid: this.cid
            });
            var $backdropButton = this.$("#filterManagerLayerToggleButton");
            $backdropButton.attr("backdrop-toggle", true);
            this.managerLayer.linkBackdrop($backdropButton);
            this.managerLayer.toggle(false);
            $backdropButton.append(this.managerLayer.render().el);
        },

        _renderFieldAddButton: function () {
            var view = new FieldAddButtonView({
                useCheckbox: this.useCheckbox,
                type: VALUE_TYPE.SELECT,
                collection: this.fields.getFilterFields()
            });
            view.$el.on('addCondition', _.bind(this._onToggleFieldOption, this));

            this.$listEl.append(view.render().el);
        },

        _renderConditionButton: function (options, isInstantSearch) {
            var view = new ConditionButtonView(_.extend(options, {fields: this.fields}));

            this.$("#fieldManagerAndConditionsArea").append(view.render().el);
            // 타입에따라 서치를 바로 수행해줘야한다.
            if (isInstantSearch && _.contains(VALUE_TYPE.INSTANT_SEARCH_TYPES, options.valueType)) {
                this._triggerSearch();
            }
        },

        _clearConditionButtons: function () {
            if (this.$listEl) {
                this.$listEl.find("div[el-condition]").remove();
            }
        },

        _onUnuseCondition: function (conditionModel) {
            var field = this.fields.findWhere({cid: conditionModel.get("fieldCid")});
            field.set("isUsed", false);
            this.conditions.remove([conditionModel]);
            this.filter.set('conditions', this.conditions.toJSON());
        },

        _onToggleFieldOption: function (e, fieldModel) {
            var condition;
            var isUsed = fieldModel.get("isUsed");
            if (isUsed) {
                var conditionObj = fieldModel.fieldToCondition();
                condition = new Condition(conditionObj);
                var field = this.fields.findWhere({cid: condition.get("fieldCid")});

                condition.setDefaultValues();
                condition.mergeFromFields(this.fields.toJSON());

                this.conditions.push(condition);
                this._renderConditionButton({
                    type: field.get('fieldType'),
                    valueType: field.get('valueType'),
                    model: condition
                }, true);
            } else {
                condition = this.conditions.findWhere({fieldCid: fieldModel.get("cid")});
                condition.trigger("unusedItem", [condition]);
            }
        },

        _onChangeFilter: function (selectedFilterId, type) {
            this._changeFilter(selectedFilterId, type);
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-last-filter-id', selectedFilterId);
        },

        _changeFilter: function (selectedFilterId, type) {
            this._initFilter(selectedFilterId, type);

            this.managerLayer.model = this.filter;
            this.managerLayer.render();

            if (selectedFilterId == "all") {
                this._toggleSaveAndLayerButton();
                this.fields.unuseAllField();

                this.conditions.reset([]);
                this._clearConditionButtons();
                this._setFilterValue();

                this._triggerSearch();
            } else {
                this.filter.fetch();
            }
        },

        _filterProcess: function () {
            if (this.filter.isOthersFilter()) this.filter.set('id', undefined);
            this._toggleSaveAndLayerButton();
            this._setFilterValue();
            //this.conditions.reset(this.filter.get("conditions"));
            //this.conditions.mergeFromFields(this.fields.toJSON());
            this.fields.mergeFromConditions(this.conditions.toJSON());
            this._renderConditions(this.conditions);
            this._triggerSearch(true);
        },

        _onSyncFilter: function () {
            this.conditions.reset(this.filter.get("conditions"));
            this.conditions.mergeFromFields(this.fields.toJSON());
            this._filterProcess();
        },

        _renderConditions: function (conditions) {
            this._clearConditionButtons();

            conditions.each(function (condition) {
                var field = this.fields.findWhere({cid: condition.get("fieldCid")});
                // 서버에서 내려온 condition 은 없어진 값일수도 있다. fields 에 없는 condition 이면 무시하도록 한다.
                if (!field) return;
                var fieldType = field.get('fieldType');
                var valueType = field.get('valueType');
                if (!fieldType) return;

                this._renderConditionButton({
                    type: fieldType, // @deprecated
                    valueType: valueType,
                    model: condition
                });
            }, this);
            this.$el.off('changeFilter');
            this.$el.on('changeFilter', _.bind(function () {
                this._triggerSearch();
            }, this));
        },

        _onClickSaveFilter: function () {
            this.filter.save({
                searchKeyword: this.$("#searchText").val(),
                conditions: this.conditions.toJSON()
            }, {
                success: function () {
                    $.goMessage(commonLang["저장되었습니다."]);
                }
            });
        },

        _onClickSaveAsFilter: function (e) {
            e.stopPropagation();

            this.managerLayer.toggle(false);

            function baseOption() {
                var option = '';
                if (this.isAdmin) {
                    option = [
                        '<span class="option_wrap">',
                        '<input type="checkbox" id="saveAsBaseFilter">',
                        '<label for="saveAsBaseFilter">', lang['기본 필터로 저장'], '</label>',
                        '</span>'
                    ].join('');
                }
                return option;
            }

            var contentTemplate = [
                '<div class="content">',
                '<p class="desc">',
                lang["새 필터 저장 설명"],
                '</p>',
                '<div class="form_type">',
                '<input el-new-name class="txt_mini w_max" type="text" value="' + lang["새 필터"] + '">',
                '</div>',
                baseOption.call(this),
                '</div>'
            ].join("");
            this.popup = $.goPopup({
                modal: true,
                pclass: "layer_normal layer_public_list",
                header: lang["필터 저장"],
                width: 500,
                contents: contentTemplate,
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    autoclose: false,
                    callback: $.proxy(function () {
                        var $newName = this.popup.find("input[el-new-name]");
                        var newName = $newName.val();
                        if (newName.length > 64 || newName.length < 1) {
                            $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {
                                arg1: 1,
                                arg2: 64
                            }), $newName, false, true);
                            return false;
                        }
                        var isBaseFilter = this.popup.find('#saveAsBaseFilter').is(':checked');
                        this._saveAsFilter(newName, isBaseFilter);
                        this.popup.close();
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal"
                }]
            });
            this.popup.find("input").focus();
        },

        _saveAsFilter: function (newName, isBaseFilter) {
            this._initFilter();
            this._saveFilter(newName, isBaseFilter).done(_.bind(function (resp) {
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-last-filter-id', resp.data.id);
            }, this));
        },

        _saveFilter: function (newName, isBaseFilter) {
            if (isBaseFilter) this.filter.setType('base');
            return this.filter.save({
                searchKeyword: this.$("#searchText").val(),
                name: newName,
                conditions: this.conditions.toJSON()
            }, {
                success: $.proxy(function () {
                    this.filters.fetch();
                    $.goMessage(commonLang["저장되었습니다."]);
                }, this)
            });
        },

        _onClickRenameFilter: function (event) {
            event.stopPropagation();
            this.managerLayer.toggle(false);

            var contentTmpl = [
                '<div class="content">',
                '<p class="desc">',
                lang["변경할 필터 이름을 입력하세요."],
                '</p>',
                '<div class="form_type">',
                '<input el-new-name class="txt_mini w_max" type="text" value="' + this.filter.get("name") + '">',
                '</div>',
                '</div>'
            ].join("");
            this.popup = $.goPopup({
                modal: true,
                pclass: "layer_normal layer_public_list",
                header: lang["필터 이름 변경"],
                width: 500,
                contents: contentTmpl,
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    autoclose: false,
                    callback: $.proxy(function () {
                        var $newName = this.popup.find("input[el-new-name]");
                        var newName = $newName.val();
                        if (newName.length > 64 || newName.length < 1) {
                            $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {
                                arg1: 1,
                                arg2: 64
                            }), $newName, false, true);
                            return false;
                        }
                        this._saveFilter(newName);
                        this.managerLayer.toggle(false);
                        this.popup.close();
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal",
                    callback: $.proxy(function () {
                        this.managerLayer.toggle(false);
                    }, this)
                }]
            });
        },

        _onClickDeleteFilter: function (event) {
            event.stopPropagation();
            this.managerLayer.toggle(false);

            $.goConfirm(lang["필터를 삭제하시겠습니까?"], "", $.proxy(this._deleteFilter, this));
        },

        _deleteFilter: function () {
            var filterId = this.filter.get("id");
            this.filter.destroy({
                success: $.proxy(function () {
                    this._changeFilter("all");
                    this.filters.remove([this.filters.findWhere({id: filterId})]);
                    GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-last-filter-id', null);
                    GO.router.navigate('works/applet/' + this.appletId + '/home', {replace: true});
                    //WorksUtil.saveFilterStorage("works/applet/" + this.appletId + "/filter", null);
                }, this)
            });
        },

        _onClickFilterManagerToggle: function () {
            this.$("#filterManagerLayer").toggle();
        },

        _setFilterValue: function () {
            this.$("span[el-filter-name]").text(this.filter.get("name"));
            this.$("#searchText").val(this.filter.get("searchKeyword"));
        },

        _search: function () {
            var searchText = $.trim(this.$("#searchText").val());
            this.filter.set("searchKeyword", searchText);
            GO.router.navigate('works/applet/' + this.appletId + '/home/search', {replace: true});
            this._triggerSearch();
        },

        _onClickSearch: function () {
            this._search();
        },

        _onKeydownSearch: function (event) {
            if (event.keyCode != 13) return;

            this._search();
        },

        _triggerSearch: function (useStorePage) {
            this._storeConditions();
            var filterQuery;

            if (this.options.refLink) {
                var keyName = this.options.refLink.appletId + '-' + this.options.refLink.docId + '-linkFilterQuery-' + this.appletId;
                filterQuery = GO.util.store.get(keyName);
                if (_.isUndefined(filterQuery)) {
                    filterQuery = "";
                }
                // 연동앱 바로가기 링크로 최초 접속한 경우만 링크필터로 앱홈 문서 render
                this.options.refLink = undefined;

            } else {
                filterQuery = this.filter.getSearchQuery();
            }

            this.$el.trigger("searchByFilter", {
                queryString: filterQuery,
                useStorePage: useStorePage
            });
        },

        _onRemoveFilter: function (filter) {
            if (this.filter && (this.filter.id == filter.id)) {
                this._changeFilter("all");
            }
        },

        _onChangeSearch: function () {
            var searchText = $.trim(this.$("#searchText").val());
            this.filter.set("searchKeyword", searchText);
        },

        _onChangeFilterName: function (model) {
            if (this.filter.id == model.id) {
                this.filter.set("name", model.get("name"));
            }
        },

        _onChangeNameOfFilter: function () {
            this._setFilterValue();
        },

        _toggleSaveAndLayerButton: function () {
            var auth = this.filter.get("id") > 0 && !(this.filter.get('type') === 'base' && !this.isAdmin);
            this.$("#filterManagerLayerToggleButton").toggle(auth);
            this.$("a[el-save-as-filter]").toggle(!auth);
            this.$("a[el-save-filter]").toggle(auth);
        },

        _onUpdateConditions: function () {
            this._storeConditions();
        },

        _storeConditions: function () {
            if (this.useStore) {
                this.filter.set('conditions', this.conditions.toJSON());
                this.$el.trigger('storeConditions', this.filter.toJSON());
            }
        },

        _getStoredFilter: function () {
            var object = this.useCachedCondition ? GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') : null;
            if (!object) return GO.util.store.get(GO.session('id') + '-' + this.appletId + '-works-last-filter-id');
            return object && object.filter && parseInt(object.filter.appletId) === parseInt(this.appletId) ? object.filter : null;
        },

        _getConditions: function () {
            return this.conditions;
        },
        _toggleDesc: function () {
            if (!this.backdropView) {
                this.backdropView = new BackdropView();
                this.backdropView.backdropToggleEl = this.$("span[el-backdrop]");
                this.backdropView.linkBackdrop(this.$("span[el-backdrop-link]"));
            }
        },

    });
});
