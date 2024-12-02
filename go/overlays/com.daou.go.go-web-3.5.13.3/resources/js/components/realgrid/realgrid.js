define([
    "i18n!nls/commons",
    "i18n!board/nls/board",
    "i18n!works/nls/works",

    "hgn!go-realgrid/templates/realgrid",

    "views/profile_card",
    "grid/views/pagesize",
    "views/pagination",
	"components/realgrid/data_type"
],
function(
	commonLang,
	boardLang,
	worksLang,

	Template,

	ProfileView,
	PageSizeView,
	PaginationView,
	DataType
) {
	var lang = {
		'search_all' : boardLang['전체기간'],
		'search_month' : boardLang['개월'],
		'search_year' : boardLang['년'],
		'search_input' : boardLang['기간입력'],
		'search' : commonLang['검색']
	};

	return Backbone.View.extend({
		className : "grid_view",

		initialize: function(options) {
			this.options = options;
			this.columns = options.columns;
			this.gridClass = options.gridClass;
			this.doms = options.doms;
			this.htmlDatas = options.htmlDatas;
			this.buttons = options.buttons || [];
			this.searchOptions = options.searchOptions || [];
			this.usePeriod = options.usePeriod;
			this.readOnly = options.readOnly;
			this.emptyMessage = options.emptyMessage;
			this.useCheckbox = options.checkbox !== false; // 이름 다름 주의.
			this.usePageSize = options.usePageSize !== false;
			this.useTopButton = options.useTopButton !== false;
			this.useBottomButton = options.useBottomButton !== false;
			this.useToolbar = options.useToolbar !== false;
			this.isAdmin = options.isAdmin === true;

			this.DataType = DataType;

			this.licenseCheck();

			this.collection.on("fetching", this._showProgress, this);
			this.collection.on("sync", this._onSyncCollection, this);

			if (this.provider) {
				this.provider.clearRows();
				this.provider.destroy();
				this.provider = null;
			}

			this.provider = new RealGrid.LocalDataProvider(false);
		},

		events: {
			"click #searchBtn" : "_search",
			"change #duration" : "_changeDuration",
			"keypress #searchKeyword" : "_keyEventHandler",
			"click [data-profile]" : "_profile",
			"click [el-grid-list-item]" : "_onClickGridListItem"
		},

		render: function() {
			this.$el.html(Template({
				useSearch : this.searchOptions.length > 0,
				search : this.searchOptions,
				usePeriod : this.usePeriod,
				lang : lang,
				useToolbar: this.useToolbar,
				isAdmin : this.isAdmin
			}));

			this.$pageSize = this.$('.optional');
			this._initListView();
			this._setFieldsNColumns();
			this._renderListView();
			this._renderPageSizeView();
			this._renderPageView();
			this._markHeader();
			this._renderButton();
			this._setSearchData();
			this._setGridEvent();

			this.$el.addClass(this.className);
			if (this.gridClass) {
				this.$el.addClass(this.gridClass);
			}

			return this;
		},

		licenseCheck: function() {
			$.ajax({
				url: GO.contextRoot + "api/realgrid/license",
				async: false,
				type : 'GET',
			}).done(function(res){
				var licenseKey = $.trim(res.data);
				if (licenseKey != '') {
					realGrid2Lic = licenseKey;
				}
			});
		},

		getCheckedData: function() {
			return _.map(this.getCheckedIds(), function(id) {
				return this.collection.get(id).toJSON();
			}, this);
		},

		getCheckedIds: function() {
			var items = this.gridView.getCheckedItems();
			return _.map(items, function(item) {
				return this.provider.getJsonRow(item).docId;
			}, this);
		},

		_initListView: function() {
			this.container = this.$el.find("[data-el-realgrid]");
			this.container.empty();
			this.gridView = new RealGrid.GridView(this.container[0]);
			this.gridView.setStateBar({visible: false});
			this.gridView.setCheckBar({visible: this.useCheckbox});
			this.gridView.setSortingOptions({enabled: false});
			this.gridView.setCopyOptions({copyDisplayText: true});
			this.gridView.setDataSource(this.provider);
			this.gridView.setHeaderSummaries({visible:true,items:[{height:30},{height:30}]});
			this.gridView.rowIndicator.visible = true;
			this.gridView.rowIndicator.width = 50;
			this.gridView.rowIndicator.displayValue = 'row';
			this.gridView.footers.visible = false;
			this.gridView.editOptions.commitByCell = true;
			this.gridView.displayOptions.fitStyle = "even";
			this.gridView.displayOptions.showEmptyMessage = true;
			this.gridView.displayOptions.minCellWidth = 150;
			this.gridView.displayOptions.rowHeight = 30;
			this.gridView.displayOptions.emptyMessage = this.emptyMessage || worksLang["목록이 없습니다."];
			this.gridView.header.height = 30;

			var rowHeight = GO.util.store.get('gridview-rowHeight');
			rowHeight = (rowHeight && rowHeight > 0) ? rowHeight : 30;
			this._setRowHeight(rowHeight);

			var visibleHeaderSummary = GO.util.store.get('gridview-headerSummary');
			this.gridView.headerSummaries.visible = (visibleHeaderSummary) ? true : false;

			if (this.readOnly) {
				this.gridView.editOptions.editable = false;
				this.gridView.editOptions.updatable = false;
				this.gridView.displayOptions.columnMovable = false;
				this.gridView.headerSummaries.visible = false;
			}

			this._registerCustomRenderer();
		},
		_registerCustomRenderer: function() {
			this.gridView.registerCustomRenderer("renderer_html", {
				initContent: function (parent) {
					this.renderParent = parent;
					$(this.renderParent).addClass("renderer-html");
				},
				canClick: function() {
					return true;
				},
				clearContent: function(parent) {
					parent.innerHTML = "";
				},
				render: function(grid, model) {
					$(this.renderParent).html(model.value);
				}
			});

			var self = this;
			this.gridView.registerCustomRenderer("renderer_view", {
				initContent: function (parent) {
					this.renderParent = parent;
					$(this.renderParent).addClass("renderer-view");
				},
				canClick: function() {
					return true;
				},
				clearContent: function(parent) {
					parent.innerHTML = "";
				},
				render: function(grid, model) {
					var columnDataView = self.columnDataView[model.value];
					if (columnDataView && columnDataView.render) {
						$(this.renderParent).empty();
						$(this.renderParent).html(columnDataView.render().el);
					}
				}
			});
		},

		_setFieldsNColumns: function() {
			var fields = [];
			var columns = [];
			_.each(this.columns, function (column) {
				fields.push({fieldName:column.name, dataType:column.dataType})
				columns.push({name:column.label, fieldName:column.name, type:'data', header:{text:column.label}})
			});
			this.provider.setFields(fields);
			this.gridView.setColumns(columns);
		},

		_renderListView: function() {
			this.provider.clearRows();
			this.collection.each(function (model) {
				var columnsData = {docId:model.id};
				_.each(this.columns, function(column) {
					columnsData[column.fieldName] = column.render(model);
				}, this);
				this.provider.addRow(columnsData);
			}, this);
		},

		_renderPageSizeView: function() {
			if (!this.usePageSize) return;

			_.each(this.$pageSize, function(el) {
				var pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
				pageSizeView.setElement($(el));
				pageSizeView.render();
				pageSizeView.bind('changePageSize', this._selectPageSize, this);
			}, this);
		},

		_renderPageView: function() {
			if (this.pageView) this.pageView.remove();
			var pageInfo = this.collection.pageInfo();
			this.pageView = new PaginationView({
				pageInfo: pageInfo,
				useBottomButton: this.useBottomButton
			});
			if (this.gridView) {
				this.gridView.rowIndicator.rowOffset = pageInfo.pageNo * pageInfo.pageSize;
			}
			this.pageView.bind("paging", this._selectPage, this);
			this.$("#bottomToolbar").append(this.pageView.render().el);
		},

		_selectPageSize: function(pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.setPageNo(0);
			this.collection.fetch();
			this.$('select[data-el-grid-page-size]').val(pageSize);
		},

		_selectPage: function(page) {
			this.collection.setPageNo(page);
			this.collection.fetch();
			this._scrollTop();
			this.$el.trigger('selectPage', page);
		},

		_onClickCheckbox: function(e) {
			e.stopPropagation();
		},

		_setGridEvent: function() {
			this._setOnLoadEvent();
			this._setCellClickEvent();
			this._setColumnEvent();
			this._setEditColumnEvent();
			this._setSelectionEvent();
			this._setContextMenuPopupEvent();
			this._setContextMenuEvent();
			this._setOnCopyEvent();
		},

		_setOnLoadEvent: function() {
			this.gridView.onDataLoadComplated = function(grid){}
		},

		_setCellClickEvent: function() {
			this.gridView.onCellClicked = $.proxy(function (grid, clickData) {
				if (clickData.cellType == 'header') {
					grid.cancel();
					this._sorting(clickData.fieldName);
				} else if (clickData.cellType == 'indicator') {
					grid.cancel();
					this._onClickIndicator(grid);
				}
			}, this);
			this.gridView.onCellButtonClicked = $.proxy(function (grid) {
				grid.cancel();
				this._onClickCellButton(grid);
			}, this);
		},

		_setColumnEvent: function() {
			this.gridView.onColumnPropertyChanged = function (grid, column, property, value) {};
		},

		_setEditColumnEvent: function() {
			this.gridView.onValidateColumn = function(grid, column, inserting, value) {};
		},

		_setSelectionEvent: function() {
			this.gridView.onSelectionChanged = function (grid) {}
		},

		_setContextMenuPopupEvent: function() {
			this.gridView.onContextMenuPopup = function (grid) {};
		},

		_getContextMenu: function() {
			var column = this.gridView.columnByName(this.gridView.getCurrent().column);
			return [
				 {label: commonLang["열 고정"],
				  children: [
					{label: commonLang["첫번째 열"], tag: '1colFixed'},
					{label: commonLang["두번째 열"], tag: '2colFixed'},
					{label: commonLang["현재 열까지"] + " ("+ column.header.text +")", tag: 'colFixed'},
					{label: "-"},
					{label: commonLang["고정 취소"], tag: 'cancelFixed',
						enabled: (this.gridView.fixedOptions.rightCount + this.gridView.fixedOptions.colCount + this.gridView.fixedOptions.rowCount) != 0}
				]},
				{label: commonLang["행 높이"],
				 children: [
				 	{label: commonLang["좁게"] + " (25px)", tag: 'rowSmallHeight', checked: this.gridView.displayOptions.rowHeight == 25},
					{label: commonLang["보통"] + " (30px)", tag: 'rowNormalHeight', checked: this.gridView.displayOptions.rowHeight == 30},
					{label: commonLang["넓게"] + " (35px)", tag: 'rowLargeHeight', checked: this.gridView.displayOptions.rowHeight == 35}
				 ]},
				 {label: commonLang["합계/평균 표시여부"],
				 children: [
					{label: commonLang["표시하기"], tag: 'showHeaderSummary', checked: this.gridView.headerSummaries.visible},
					{label: commonLang["숨기기"], tag: 'hideHeaderSummary', checked: !this.gridView.headerSummaries.visible}
				 ]}
			];
		},

		_setContextMenuEvent: function() {
			this.gridView.onContextMenuItemClicked = $.proxy(function (grid, item) {
				var currentCell = grid.getCurrent();
				var currentColumn = grid.columnByName(currentCell.column);
				var rowHeight = 0;
				var resizeGrid = false;
				switch (item.tag) {
					case "1colFixed" :
						grid.setFixedOptions({colCount: 1});
						break;
					case "2colFixed" :
						grid.setFixedOptions({colCount: 2});
						break;
					case "colFixed" :
						grid.setFixedOptions({colCount: currentColumn.index + 1});
						break;
					case "cancelFixed" :
						grid.setFixedOptions({colCount: 0, rowCount: 0});
						break;
					case "rowNormalHeight" :
						rowHeight = 30;
						resizeGrid = true;
						break;
					case "rowSmallHeight" :
						rowHeight = 25;
						resizeGrid = true;
						break;
					case "rowLargeHeight" :
						rowHeight = 35;
						resizeGrid = true;
						break;
					case "showHeaderSummary" :
						grid.headerSummaries.visible = true;
						resizeGrid = true;
						break;
					case "hideHeaderSummary" :
						grid.headerSummaries.visible = false;
						resizeGrid = true;
						break;
				}
				if (rowHeight > 0) {
					this._setRowHeight(rowHeight);
					GO.util.store.set('gridview-rowHeight', rowHeight);
				}
				if (item.tag == "showHeaderSummary" || item.tag == "hideHeaderSummary") {
					this.$el.trigger('headerSummary:grid', {visible: item.tag == "showHeaderSummary"});
				}
				if (resizeGrid) {
					this._resizeGrid();
				}
				this.$el.trigger('contextMenu:grid', {tag: item.tag});
			}, this);
		},

		_setRowHeight: function(rowHeight) {
			this.gridView.displayOptions.rowHeight = rowHeight;
			var summaryCount = this.gridView.headerSummaries.count;
			for (var i=0; i<summaryCount; i++) {
				this.gridView.headerSummaries.get(i).height = rowHeight;
			}
		},

		_setOnCopyEvent: function() {
			this.gridView.onCopy = function(grid, selection, event) {}
		},

		_sorting: function(fieldName) {
			if (this.isFetching) return;

			var target = this.$el.find("span[data-property='" + fieldName + "']");
			var property = target.attr("data-property");
			var direction = target.attr("data-direction") == "asc" ? "desc" : "asc";

			this._sortRendering(property, direction);

			this.collection.property = property;
			this.collection.direction = direction;

			this.isFetching = true;
			this.collection.fetch({
				success : $.proxy(function() {
					this.isFetching = false;
				}, this),
				error : $.proxy(function() {
					this.isFetching = false;
				}, this)
			});

			this.$el.trigger('sorting:grid', {property: property, direction: direction});
		},

		_sortRendering: function(property, direction) {
			this.$el.find("div.rg-header-renderer .rg-header-sort")
				.removeClass("rg-header-sort-asc rg-header-sort-desc");

			var target = this.$el.find("span[data-property='" + property + "']");
			target.attr("data-direction", direction);
			target.addClass("rg-header-sort-" + direction);
		},

		_changeDuration: function() {
			var duration = this.$("#duration").val();

			if (duration == "period") {
				this._showDurationPeriod();
			} else {
				this.$("#durationPeriod").hide();
				this.collection.setDuration(duration);
			}
		},

		_showDurationPeriod: function() {
			this.$("#durationPeriod").show();
				this.$("#fromDate").datepicker({
		            defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            yearSuffix: "",
		            onSelect: function( selectedDate ) {
		            	self.$("#toDate").datepicker("option", "minDate", selectedDate);
		            }
		        });
				this.$("#toDate").datepicker({
		            defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            yearSuffix: "",
		            onSelect: function( selectedDate ) {
		            	self.$("#fromDate").datepicker("option", "maxDate", selectedDate);
		            }
		        });
		},

		_keyEventHandler: function(e) {
			if (e.which == 13) this._search();
		},

		_search: function() {
    		var $keyword = this.$("#searchKeyword");

    		if ($keyword.val().length > 64 || $keyword.val().length < 2) {
    			$.goMessage(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 2, arg2 : 64}), $keyword, false, true);
    			return;
    		}
    		this.collection.setSearchType(this.$("#searchTypes").val());
    		this.collection.setKeyword(this.$("#searchKeyword").val());
    		this._setDuration();
    		this.collection.setPageNo(0);
    		this.collection.fetch();
    	},

    	_setDuration: function() {
    		var duration = this.$("#duration").val();
    		if (duration == "period") {
    			this.collection.setDuration(duration, {
    				fromDate : this.$("#fromDate").val(),
    				toDate : this.$("#toDate").val()
				});
    		} else {
    			this.collection.setDuration(duration);
    		}
    	},

		_markHeader: function() {
			_.each(this.columns, $.proxy(function (column) {
				if (column.useSort) {
					var header = this.gridView.columnByField(column.fieldName).header;
					if (header) {
						var $template = $('<div></div>');
						$template.append('<span>' + header.text + '</span>');
						var $sortTemplate = $('<span></span>').attr('data-property', column.fieldName);
						$sortTemplate.addClass('rg-header-sort rg-header-sort-icon');
						$sortTemplate.attr('data-direction', (this.collection.property == column.fieldName) ? this.collection.direction : 'desc');
						if (this.collection.property == column.fieldName) {
							$sortTemplate.addClass('rg-header-sort-' + this.collection.direction);
						}
						$template.append($sortTemplate);
						header.template = $template.html();
					}
				}
			}, this));

			this._sortRendering(this.collection.property, this.collection.direction);
		},

		_setSearchData: function() {
			if (this.collection.keyword) {
				this.$("#searchKeyword").val(decodeURIComponent(this.collection.keyword));
			}

			if (this.collection.searchType) {
				this.$("#searchTypes").val(this.collection.searchType);
			}

			if (this.collection.duration) {
				this.$("#duration").val(this.collection.duration);
				if (this.collection.duration == "period") {
					this._showDurationPeriod();
					this.$("#fromDate").val(GO.util.shortDate(this.collection.fromDate));
					this.$("#toDate").val(GO.util.shortDate(this.collection.toDate));
				}
			}
		},

		_renderButton: function() {
			_.each(this.buttons, function(button) {
				_.each(this.$(this._getToolbarSelector()), function(el) { // top and bottom. 옵션으로 구분 가능하게도 해야할듯?
					var buttonEl = $(button.render());	
					$(el).append(buttonEl);
					
					/* 기본 버튼 이벤트 처리 */
					if(typeof button.type === "undefined") {
						if (typeof button.onClick === "function") {
							buttonEl.on("click", button.onClick);
						}
					
					/* submenu가 있는 버튼 이벤트 처리 */
					} else if(typeof button.type === "function" && button.type() === "submenu") {
						if (typeof button.onClick === "function") {
							buttonEl.on("click", "a#downloadBtn", button.onClick);	// 목록 다운로드 버튼 클릭 이벤트
						}
						
						// submenu에 대한 이벤트 및 backdrop
						var view = button.getView();
						var subBtnEl = buttonEl.find("#submenuBtn");
						subBtnEl.append(view.render().el);
						subBtnEl.attr("backdrop-toggle", true);
						view.linkBackdrop(subBtnEl);
						view.toggle(false);
						buttonEl.append(view.$el);
					}
				});
			}, this);
		},

		_getToolbarSelector: function() {
			var selectorStr = 'div.critical';
			if (this.useTopButton && !this.useBottomButton) {
				selectorStr = 'div.custom_header';
			} else if (!this.useTopButton && this.useBottomButton) {
				selectorStr = 'div.custom_bottom';
			}
			return selectorStr;
		},

		_resizeGrid: function() {
			if (!this.gridView) {
				return;
			}

			setTimeout($.proxy(function() {
				var dataCount = this.gridView.getItemCount();
				var rowHeight = this.gridView.displayOptions.rowHeight;
				var headerHeight = this.$el.find("div.rg-header").height();
				var summaryHeight = this.$el.find("div.rg-header-summary").height();
				summaryHeight = (this.gridView.headerSummaries.visible) ? summaryHeight : 0;
				var gridHeight = (rowHeight * ((dataCount <= 0) ? 1 : dataCount)) + headerHeight + summaryHeight + 70;
				this.container.css("height", gridHeight);
				this.gridView.resetSize();
			},this), 100);
		},

		_showProgress: function() {
			this.$("#processing").show();
		},

		hideProgress: function() {
			this.$("#processing").hide();
		},

		_drawCallback: function() {
			if (typeof this.options.drawCallback == "function") {
				this.options.drawCallback(this.collection);
			}
		},

		_profile: function(e) {
			e.stopPropagation();
			var target = e.currentTarget;
			var userId = $(target).attr("data-id");
			if (!userId) return;
			ProfileView.render(userId, target);
		},

		_onSyncCollection: function() {
			this.hideProgress();
			this._renderPageView();
			this._renderListView();
			this._drawCallback();
			this.$el.trigger('renderingComplete');
			this._resizeGrid();
		},

		_scrollTop: function() {
			$(window).scrollTop(this.$el.offset().top);
		},

		_onClickGridListItem: function(e) {
			var target = $(e.target);
			if (target.is('[data-stop-propagation]') || target.parents('[data-stop-propagation]').length) return;

			var id = $(e.currentTarget).attr("data-id");

			this.clickGridListItem(id);
		},

		clickGridListItem: function(id) {
			var model = this.collection.get(id);
			if(model && this.columnFields) {
				model.set("columnFields", this.columnFields);
			}
			this.collection.storeParam();
			this.$el.trigger("navigate:grid", id);

			if(model) {
				this.$el.trigger("onClickListItem", model.toJSON());
			}
		},

		_onClickIndicator: function(grid) {},
		_onClickCellButton: function(grid) {}
	});
});