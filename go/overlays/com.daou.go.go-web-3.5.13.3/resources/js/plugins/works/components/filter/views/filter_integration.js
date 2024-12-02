define("works/components/filter/views/filter_integration", function(require) {

    var CONDITION_TYPE = require("works/constants/condition_type");

    var Integration = require('works/components/integration_manager/models/integration');

    var ReferDocs = require('works/collections/docs');
    var Fields = require('works/collections/fields');

    var NameTagView = require('go-nametags');
    var AppletDocSearchView = require('works/components/applet_doc_search/views/applet_doc_search');

    var FilterIntegrationTmpl = require("hgn!works/components/filter/templates/filter_integration");

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "삭제" : commonLang["삭제"],
        "검색" : commonLang["검색"],
        "텍스트 검색": worksLang["텍스트 검색"],
        "데이터 검색": worksLang["데이터 검색"]
    };

    return Backbone.View.extend({
        popupView: null,
        fieldsFetched: null,

        events: {
            "change input[type='radio']" : "_onChangeRadio",
            'click #appletDocSearch': '_onClickSearch'
        },

        initialize: function(options) {
            options = options || {};
            this.fields = options.fields;
            this.appletId = options.fields.appletId;
            this.backupModel = this.model.clone();
            this.fieldsFetched = $.Deferred();

            this.searchText = "";
            this.listItems = [];

            this._initSelectData();
            this._initIntegrationAppletInfo(this.fields.toJSON());

            if (this.model.get('integrationAppletId')) {
                this.integrationFields = new Fields([], {
                    appletId: this.model.get('integrationAppletId'),
                    includeProperty: true,
                    type: 'consumers'
                });
                this.integrationFields.fetch().done($.proxy(function() {
                    this.fieldsFetched.resolve();
                }, this));
            } else {
                this.fieldsFetched.resolve();
            }

            var field = _.find(this.model.get('selectedDisplayFields'), function(field) {
                return field.cid === this.model.get('integrationFieldCid');
            }, this);
            var fieldValueType = field ? field.valueType : '';

            this.docs = new ReferDocs([], {
                type: 'producerDocs',
                appletId: this.appletId,
                referAppletId: this.model.get('integrationAppletId'),
                fieldCid: this.model.get('integrationFieldCid'),
                fieldValueType: fieldValueType
            });

            this.integration = new Integration({
                appletId: this.appletId
            });
            this.integration.fetch();
        },

        render: function() {
            this.$el.html(FilterIntegrationTmpl({
                lang : lang,
                cid : this.cid,
                searchText : this.searchText
            }));

            this._toggleView(this._getTypeByModel());

            this.docTagView = NameTagView.create([], {
                useAddButton: false,
                stopPropagation: true
            });
            _.each(this.listItems, function(item) {
                this._addNameTag(item);
            }, this);
            this.docTagView.$el.on('nametag:removed', _.bind(this._onNameTagRemoved, this));
            this.$('#tagArea').html(this.docTagView.el);
            $.when(this.integration.deferred, this.fieldsFetched).done($.proxy(function() {
                this._renderAppletDocSearch();
            }, this));

            return this;
        },

        /**
         * cancel callback
         */
        resetView: function() {
            this.model = this.backupModel;
            this._initSelectData();
            this._toggleView(this._getTypeByModel());
            this.$('#textValue').val('');
        },

        /**
         * 뷰 데이터를 모델에 set 하는 함수
         */
        setModel: function() {
            var type = {
                id: CONDITION_TYPE.SELECT,
                text: CONDITION_TYPE.TEXT
            }[this._getTypeByView()];
            this.model.set("conditionType", type);
            this.searchText = this._getSearchKeyword();

            if (this._getTypeByView() === 'text') {
                this.model.set("values", {
                    text : this.searchText
                });
            } else {
                this.model.set("values", {
                    values : this.listItems
                });
            }
        },

        getPopupEl: function() {
            return this.popupView;
        },

        _renderAppletDocSearch: function() {
            this.appletDocSearchView = new AppletDocSearchView({
                model: this.model,
                docs: this.docs,
                fieldsOfIntegrationApp: this.integrationFields,
                integration: this.integration,
                useToolbar: false
            });

            this.$('#listArea').html(this.appletDocSearchView.render().el);
            this.appletDocSearchView.$el.on('onClickListItem', $.proxy(function(e, doc) {
                if (this._addDoc(doc)) this.$el.trigger('onClickListItem', doc);
            }, this));
        },

        _initSelectData : function() {
            var values = this.model.get("values").values;
            if (values) {
                this.listItems = values;
            } else {
                this.searchText = this.model.get("values").text;
            }
        },

        _initIntegrationAppletInfo : function(fields) {
            _.each(fields, function(field) {
                if (this.model.get('fieldCid') === field.cid && field.properties) {
                    this.model.set("integrationAppletId", field.properties.integrationAppletId);
                    this.model.set("integrationFieldCid", field.properties.integrationFieldCid);
                    this.model.set("selectedDisplayFields", field.properties.selectedDisplayFields);
                }
            }, this);
        },

        _toggleView: function(type) {
            var method = {
                id: '_activateIntegration',
                text: '_activateText'
            }[type];
            this[method]();
        },

        _getSearchKeyword : function() {
            if(this._getTypeByView() === 'text') {
                return this.$("#textValue").val();
            } else {
                return _.map(this.listItems, function(items) {
                    return items.text;
                }).join(',');
            }
        },

        _activateText: function() {
            this.$("#textFormAbstract" + this.cid).attr("checked", true);
            this.$('[data-type="id"]').hide();
            this.model.set('conditionType', CONDITION_TYPE.TEXT);
        },

        _activateIntegration: function() {
            this.$("#listFormRelative" + this.cid).attr("checked", true);
            this.$('[data-type="id"]').show();
            this.model.set('conditionType', CONDITION_TYPE.SELECT);
        },

        _onClickSearch: function() {
            this.appletDocSearchView.search(this.$('#textValue').val());
        },

        _onChangeRadio: function(event) {
            var searchType = $(event.currentTarget).val();
            this._toggleView(searchType);
            this.$('#textValue').val('');
        },

        _onNameTagRemoved: function() {
            this.listItems = this.docTagView.getNameTagList();
        },

        _addDoc: function(doc) {
            var isAlreadyAdded = this.docTagView.getNameTag(doc.id).length;
            if (isAlreadyAdded) {
                $.goMessage(commonLang['이미 추가되어 있습니다.']);
                return;
            }
            var value = doc.values[this.model.get('integrationFieldCid')];
            var data = {
                id: doc.id,
                text: _.isArray() ? _.map(value, function(val) {
                    return val.text;
                }) : value
            };

            this._addNameTag(data);
            this.listItems.push(data);

            return true;
        },

        _addNameTag: function(data) {
            this.docTagView.addTag(data.id, data.text, {
                attrs: {
                    id: data.id,
                    text: data.text
                },
                removable: true
            });
        },

        _getTypeByView: function() {
            return this.$('input[type="radio"]:checked').val();
        },

        _getTypeByModel: function() {
            //console.log('text applet doc? : ' + this.isTextAppletDocType());
            //console.log('select applet doc? : ' + this.isSelectAppletDocType());
            if (_.isEmpty(this.model.get('values'))) return 'text';
            return _.has(this.model.get('values'), 'text') ? 'text' : 'id';
        }
    });
});