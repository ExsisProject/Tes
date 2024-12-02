/**
 * Created by shingoon on 15. 10. 5..
 */
define('works/views/mobile/search_refer_apps', function(require){
    var Backbone = require('backbone');

    var ReferDocs = require('works/collections/docs');
    var Fields = require('works/collections/fields');

    var ListSetting = require("works/components/list_manager/models/list_setting");
    var AppletForm = require('works/models/applet_form');

    var DocListView = require('works/components/doc_list/views/doc_list');
    var AddViewer = require('works/components/add_viewer/views/add_viewer');

    var CommonLang = require('i18n!nls/commons');
    var WorksLang = require('i18n!works/nls/works');
    var Lang = {
        '검색': CommonLang['검색'],
        '데이터 검색': WorksLang['데이터 검색']
    };
    var SearchReferAppsLayerTemplate = require("hgn!works/templates/mobile/search_refer_apps");
    var CellOfDocListTemplate = require("hgn!works/templates/mobile/cell_of_doclist");
    var EmptyDocListTemplate =
        '<li class="creat data_null">' +
        '<span class="subject">' +
        '<span class="txt">' + WorksLang["목록이 없습니다."] + '</span>' +
        '</span>' +
        '</li>';

    return Backbone.View.extend({
        id: 'search_refer_app_view',
        attributes : {
            'data-role' : 'layer',
            'style' : 'background:#fff; position:absolute; width:100%; min-height:100%; top:0; left:0; z-index:999; margin-top:54px'
        },
        events : {
            "click input[type='checkbox']" : "_docListCellInputBoxClicked",
            "vclick a[data-btn='ok']" : "_saveButtonClicked",
            "vclick a[data-btn='cancel']" : "_backButtonClicked",
            "vclick a[id='more_button']" : "_docsMoreButtonClicked",
            "vclick a[id='btnSearch']" : "_searchButtonClicked",
            "keyup #searchKeyword" : "_searchKeyUp",
            "vclick a[id='btnSearchReset']" : "_searchResetButtonClicked"
        },
        appletId:null,//현재 앱 아이디
        referAppletId: null, // 연동 앱 아이디
        referModel: null, // 연동 앱의 모델
        referDocs: null, // 현재 보이는 연동 앱의 문서들 컬랙션
        referDocsAddType: null, // 최근 서버에서 가져온(더보기, 검색등) 연동 앱의 문서들 컬랙션
        fields: null, // 연동 앱의 문서들에 보여줄 항목을 위한 정보
        selectedDocs : null, // 등록 화면에서 선택되어진 연동 앱의 문서들
        optionsForReferModel:null,
        callbackAddDoc:null,//확인 버튼 클릭
        callbackCancel:null,//취소 버튼 클릭
        selectedModels:null, // 연동 앱의 문서들 중에 선택한 문서들
        addViewer: null, // 상단의 선택한 문서를 보여주는 버블 컴포넌트

        initialize : function(options){
            var opts = options || {};
            if (opts.hasOwnProperty('referModel')) {
                this.referModel = opts.referModel;
                this.referAppletId = opts.referModel.attributes.integrationAppletId;
            }
            if(opts.hasOwnProperty('appletId')) this.appletId = opts.appletId;
            if(opts.hasOwnProperty('callbackAddDoc')) this.callbackAddDoc = opts.callbackAddDoc;
            if(opts.hasOwnProperty('callbackCancel')) this.callbackCancel = opts.callbackCancel;
            if(opts.hasOwnProperty('selectedDocs')) this.selectedDocs = opts.selectedDocs;

            this.selectedModels = {};
            this.fieldsOfIntegrationApplet = {};

            this.optionsForReferModel = {
                "title" : WorksLang['데이터 검색'],
                "offset" : 100,
                "btn_ok" : CommonLang['확인'],
                "btn_cancel" : CommonLang['취소'],
                "btn_more" : CommonLang["더보기"],
                "search_result" : CommonLang['검색결과'],
                "search_result_null" : CommonLang['검색결과없음'],
                "type" : opts.type || {},
                "isSingleSelect" : opts.isSingleSelect || false
            };

            this.setting = new ListSetting({}, {appletId : this.referAppletId});
            this.fields = new Fields([], {
                appletId : this.referAppletId,
                includeProperty: true,
                type: 'consumers'
            });
            this.appletForm = new AppletForm({appletId: this.appletId});
            this.referDocs = new ReferDocs([], {
                type: 'producerDocs',
                appletId: this.appletId,
                referAppletId: this.referAppletId,
                fieldCid:this.referModel.get('integrationFieldCid')
            });

            this.referDocsAddType= new ReferDocs([], {
                type: 'producerDocs',
                appletId: this.appletId,
                referAppletId: this.referAppletId,
                fieldCid:this.referModel.get('integrationFieldCid')
            });

            this.listenTo(this.referDocsAddType, 'sync', this._setAddDocsInList);
        },

        render : function() {
            this.$el.html(SearchReferAppsLayerTemplate(this.optionsForReferModel));

            $.when(
                this.referDocs.fetch(),
                this.fields.fetch(),
                this.setting.fetch(),
                this.appletForm.fetch()
            ).then($.proxy(function() {
                return this._fetchIntegrationDatas();
            }, this)).then(_.bind(function() {
                if(this.referDocs === undefined || this.referDocs.length < 1){
                    this.$el.find('#docListElements').append(EmptyDocListTemplate);
                }

                this._setDocsInList(this.referDocs);
                var referenceParentObject = this;
                this.addViewer = new AddViewer({
                    'removeCallBack': function (e) {
                        console.log("_removeCallBackFromAddViewer" + e);

                        var checkBoxs = $("#docListElements").find('input');
                        _.each(checkBoxs, function (checkBox) {
                            var docId = parseInt($(checkBox).val());
                            if (docId === e) {
                                var doc = referenceParentObject._getDoc(docId);
                                $(checkBox).attr("checked", false);
                                delete referenceParentObject.selectedModels[doc.id];
                            }
                        });

                        referenceParentObject.selectedDocs = $.grep(referenceParentObject.selectedDocs , function (doc){
                            return doc.id !== e;
                        });
                    }
                });

                this.$el.find('#addViewer').append(this.addViewer.render().el);

                _.each(this.selectedDocs , function(doc){
                    referenceParentObject.addViewer.add({'id' : doc.id , 'name':doc.name});
                });

            }, this));
        },

        _fetchIntegrationDatas: function() {
            var deferred = $.Deferred();
            this.fields.getFieldsOfIntegrationApplet().done(_.bind(function(fields) {
                this.fieldsOfIntegrationApplet = fields;
                deferred.resolve();
            }, this));
            return deferred;
        },

        _setDocsInList: function(docModel){
            if(docModel !== undefined && docModel.pageInfo().next){
                this.$('#more_button').show();
            }else{
                this.$('#more_button').hide();
            }
            var convertDocList = this._convertDocListFormatting(docModel);

            this.$("#docListElements").empty();

            _.each(convertDocList, function (doc) {
                if(doc.selected) {
                    this.selectedModels[doc.id.toString()] = this._getDoc(doc.id);
                }

                this.$("#docListElements").append(CellOfDocListTemplate({
                    lang: Lang,
                    doc: doc
                }));
            }, this);
        },

        _setSearchDocsInList: function(docModel){
            if(docModel.length === 0){
                this.$el.find('#docListElements').append(EmptyDocListTemplate);
                this.$('#more_button').hide();
                return;
            }

            this._setDocsInList(docModel);
        },

        _setAddDocsInList: function(docModel){
            if(docModel.pageNo === 0 && docModel.getKeyword() !== ""){
                this.referDocs.reset();
                this.referDocs.add(docModel.toJSON());
                this._setSearchDocsInList(docModel);
                return;
            }

            if(this.referDocs.length === 0){
                this.referDocs.reset();
                this.referDocs.add(docModel.toJSON());
            }else{
                _.each(docModel.models , function(model){
                    this.referDocs.models.push(model);
                }, this);
                this.referDocs.length += docModel.length;
            }

            this._setDocsInList(docModel);
        },

        _convertDocListFormatting : function(docs) {
            var clone = _.clone(docs);
            var useTitleID = this.referModel.get('integrationFieldCid');
            var columnFields = new Fields(this.referModel.get('selectedDisplayFields'));
            this.columnFields = this.fields.filter(function(columnField) {
                return columnFields.findWhere({cid: columnField.get('cid')});
            }, this);

            return _.map(clone.models, function (model) {
                var title = "-";
                var columnsInfo = _.map(this.columnFields, function(mergedField) {
                    var label = mergedField.get("columnName") || mergedField.get("label");
                    var columnID = mergedField.get('cid');
                    var data = this.getColumnData(model, mergedField, false, true);
                    if(columnID === useTitleID) title = data;
                    return {
                        visible: true,
                        label: label,
                        data: data
                    }
                }, this);

                var selected = false;
                _.each(this.selectedDocs, function(selectedDoc){
                    if (selectedDoc.id === model.id) selected = true;
                });

                return {
                    id: model.id,
                    selected : selected,
                    columns: columnsInfo,
                    titleText: title
                };
            }, this);
        },

        _gatColumnClass: function (mergedField, isTitle) {
            if (isTitle) return 'tit_word_break';
            if (mergedField.isMultiValueType()) return "item_wrap";
            if (mergedField.isNumberValueType()) return "amount";
            return "";
        },

        _searchInputTmpl: function() {
            return Hogan.compile([
                '<input type="text" id="searchKeyword" class="txt" />',
                '<span class="btn_minor_s" id="searchBtn">',
                '<span class="txt">{{lang.검색}}</span>',
                '</span>'
            ].join('')).render({lang: Lang});
        },

        _saveButtonClicked : function(e) {
            if(e) $(e.currentTarget).blur().trigger('focusout');
            this.callbackAddDoc(_.values(this.selectedModels));

            this._backButtonClicked();
        },

        _backButtonClicked : function(e) {
            var referenceParentsObject = this;
            setTimeout(function(){
                if(typeof referenceParentsObject.options.backCallback == 'function') referenceParentsObject.options.backCallback();
                referenceParentsObject.callbackCancel();
                referenceParentsObject.remove();
                if(e) e.stopImmediatePropagation();
                return false;
            }, 500);
        },

        _docListCellInputBoxClicked: function(e){
            var $target = $(e.currentTarget);
            var subjectText = $target.parent().find('span.subject').text();
            var docId = $target.val();
            var doc = this._getDoc(docId);
            if(_.isNull(doc)) {
                alert(WorksLang['유효하지 않은 연동문서 알림']);
                return false;
            }

            if ($target.is(':checked')) {
                var isExcess = this.selectedDocs.length + 1 > parseInt(this.referModel.get('maxCount'));
                if (isExcess) {
                    alert(WorksLang['최대 선택 개수를 초과하였습니다.']);
                    return false;
                }
                this.selectedModels[doc.id.toString()] = doc;
                var checkedItemArray = {'id': doc.id, 'name': subjectText, 'text': subjectText};
                this.selectedDocs.push(checkedItemArray);
                this.addViewer.add({'id': docId, 'name': subjectText});
                if(this.selectedDocs.length > 0) {
                    this.$el.find('#addViewer').show();
                }
            } else {
                delete this.selectedModels[doc.id.toString()];
                this.addViewer.remove({'id': docId});
                this.selectedDocs = _.filter(this.selectedDocs, function (item) {
                    return item.id !== doc.id;
                });
                if(this.selectedDocs.length <= 0) {
                    this.$el.find('#addViewer').hide();
                }
            }
        },

        _getDoc: function(docId){
            var returnValue = null;
           _.each(this.referDocs.toJSON(), function (model) {
                if (model.id == docId) returnValue = model;
            });
            return returnValue;
        },

        _docsMoreButtonClicked:function(){
            this.referDocsAddType.pageNo = this.referDocsAddType.pageNo + 1;
            this.referDocsAddType.fetch();
        },

        _searchButtonClicked: function(){
            this.referDocs.pageNo = 0;
            this.referDocs.length = 0;

            this.referDocsAddType.pageNo = 0;
            var fields = new Fields(this.columnFields);
            var textFields = fields.getLinkableTextFields();
            this.referDocsAddType.queryString = textFields.map(function(field) {
                return field.get('cid') + ':"' + this.$("#searchKeyword").val() + '"';
            }, this).join(' OR ');
            this.referDocsAddType.fetch();
        },

        _searchResetButtonClicked: function () {
            $("#searchKeyword").val("");
        },

        _getUserLabel : function(user) {
            var position = user.position ? " " + user.position : "";
            return user.name + position;
        },

        _searchKeyUp : function(e){
            if(e.keyCode === 13) this._searchButtonClicked();
            return false;
        },

        getColumnData: DocListView.prototype.getColumnData,
        getProperties: DocListView.prototype.getProperties
    });
});
