define('works/components/list_manager/views/list_setting', function (require) {

    var worksLang = require("i18n!works/nls/works");
    var docsLang = require("i18n!docs/nls/docs");

    var Column = require("works/components/list_manager/models/list_column");

    var ColumnItemView = require('works/components/list_manager/views/list_manager_column_item');
    var ColumnAddButtonView = require('works/components/list_manager/views/list_manager_column_add_button');

    var Template = require('hgn!works/components/list_manager/templates/list_setting');
    var lang = {
    		"문서번호 사용유무" : worksLang["문서번호 사용유무"],
    		"문서번호 직접 설정" : worksLang["문서번호 직접 설정"],
    		"문서번호 자동 설정" : worksLang["문서번호 자동 설정"],
    		"숫자 1부터 자동 등록" : worksLang["숫자 1부터 자동 등록"],
    		"2자리" : worksLang["2자리"],
    		"3자리" : worksLang["3자리"],
    		"4자리" : worksLang["4자리"],
    		"5자리" : worksLang["5자리"]
    	};
    var DOC_NO_FIELD = {
        "cid" : "docNo",
        "label" : docsLang["문서번호"],
        "fieldType" : "docNo",
        "valueType" : "STEXT",
        "options" : [ ],
        "multiple" : false
    };
    
    return Backbone.View.extend({

        events: {
            'change #notUseDocNo': '_onChangeIsUseDocNo'
        },
    	
        initialize: function (options) {
            this.isPrivate = options.isPrivate;

            this.columns = options.columns;
            this.fields = options.fields;
            this.setting = options.setting;
            this.docNoConfig = options.setting.get("docNoConfig");

            this.columns.reset(this.setting.get("columns"));
            this.columns.setTitleColumnByIndex(this.setting.get("titleColumnIndex"));
            this.columns.setSortColumnByIndex(this.setting.get("sortColumnIndex"), this.setting.get("sortDirection"));
            this.columns.reset(this.columns.filterByFields(this.fields.toJSON())); // 안쓰이는 데이터 필터링
            this.columns.mergeFromFields(this.fields.toJSON());
            this.columns.on("unuseColumn", this._onUnuseColumn, this);

            this.columnFields = this.fields.getColumnFields();
            this.columnFields.mergeFromColumns(this.columns.toJSON());

            this.fields.off('toggleOption'); // TODO..
            this.fields.on("toggleOption", this._onToggleFieldOption, this);
            this.$el.on("setTitleColumn", $.proxy(function(event, fieldCid) {
                this._setTitleColumn(fieldCid);
            }, this));
            this.$el.on("setSortColumn", $.proxy(function(event, fieldCid, sortDirection) {
                this._setSortColumn(fieldCid, sortDirection);
            }, this));
        },

        render: function () {
            this.$el.html(Template({
            	lang : lang,
            	useDocNo: this.docNoConfig.useDocNo,
                isPrivate: this.isPrivate
            }));

            this._renderColumns();
            this._renderColumnAddButton();
            this._renderDocNoConfig();
            this._initColumnSortable();

            return this;
        },

        getSetting: function() {
            this.setting.set("sortColumnIndex", this.columns.getSortColumnIndex());
            this.setting.set("sortDirection", this.columns.getSortDirection());
            this.setting.set("columns", this.columns.toJSON());
        },

        _renderColumns: function() {
            this.$('#columns').empty();
            var filteredColumns = this.columns.filterByFields(this.fields.toJSON());
            _.each(filteredColumns, function(column) {
            	this._addColumn(column, this.columns);
            }, this);
        },

        _renderColumnAddButton : function() {
            var view = new ColumnAddButtonView({
                collection : this.columnFields
            });

            this.$('div[el-button-area]').html(view.render().el);
        },

        _renderDocNoConfig: function() {
        	var docNoType = this.docNoConfig.docNoType || "simple";
        	if(docNoType == "simple"){
        		this.$('#simple').prop('checked', true).trigger('change');
        	} else{
        		this.$('#custom').prop('checked', true).trigger('change');
        	}
        	
        	this.$('#customPrefix').val(this.docNoConfig.customPrefix);
        	this.$('#customDigit').val(this.docNoConfig.customDigit);
        },
        
        _initColumnSortable : function() {
            this.$("#columns").sortable({
                axis : "x",
                tolerance: "pointer",
                cursor: "move",
                placeholder: {
                    element : function() {
                        return "<td class='blank_box'><div><span></span></div></td>";
                    },
                    update : function() {
                        return;
                    }
                },
                stop : $.proxy(function() {
                    var cIds = _.map(this.$("#columns").find("[el-cid]"), function(column) {
                        return $(column).attr("el-cid");
                    }, this);
                    this.columns.reIndex(cIds);
                }, this)
            });
            this.$("#columns").find("td").css("cursor", "move");
        },

        _addColumn : function(columnModel, columns) {
            var view = new ColumnItemView({
                model : columnModel,
                isPrivate: this.isPrivate,
                columns: columns
            });
            this.$('#columns').append(view.render().el);
        },

        _onUnuseColumn : function(columnModel) {
            var field = this.columnFields.findWhere({cid : columnModel.get('fieldCid')});
            field.set('isUsed', false);
            this.columns.remove([columnModel]);
        },

        _onToggleFieldOption : function(fieldModel) {
            var model;
            var isUsed = fieldModel.get('isUsed');
            if (isUsed) {
                var column = fieldModel.fieldToColumn();
                model = new Column(column);
                this.columns.push(model);

                this._addColumn(model, this.columns);
            } else {
                model = this.columns.findWhere({fieldCid : fieldModel.get('cid')});
                if (model) model.trigger('unusedItem', [model]);
            }
        },

        _setTitleColumn : function(fieldCid) {
            this.columns.setTitleColumnByFieldCid(fieldCid);
            this._renderColumns();
            $.goMessage(worksLang['선택한 항목이 제목 속성으로 지정되었습니다.']);
        },

        _setSortColumn : function(fieldCid, sortDirection) {
            this.columns.setSortColumnByFieldCid(fieldCid, sortDirection);
            this._renderColumns();
        },

        _onChangeIsUseDocNo: function(e) {
            var isUseDocNo = !$(e.currentTarget).is(':checked');
            if (isUseDocNo) {
                this.fields.add([DOC_NO_FIELD]);
            } else {
                var docNoModel = this.fields.findWhere({cid: DOC_NO_FIELD.cid});
                docNoModel.set({isUsed: false});
                this._onToggleFieldOption(docNoModel);
                this.fields.remove([docNoModel]);
            }
            this.columnFields = this.fields.getColumnFields();
            this.columnFields.mergeFromColumns(this.columns.toJSON());
            this._renderColumnAddButton();
            this._renderColumns();
        }
    });
});