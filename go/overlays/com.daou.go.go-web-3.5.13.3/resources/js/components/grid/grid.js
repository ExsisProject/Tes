/**
 * grid 컴포넌트
 *
 * @param {String} el
 * <table> 태그의 상위 element 를 지정해야 한다.
 * element 의 id 속성을 지정해주는 것이 좋다.
 *
 * @param {Boolean} checkbox
 * default true.
 *
 * @param {Backbone Collection} collection
 * paginate_collection 을 상속 받아 사용해야 한다.
 *
 * @param {Array} columns
 * name : sort property
 * className : td의 클래스
 * label : th 의 text
 * sortable : sort 가능 여부. default false
 * render : template
 *
 * @param {Array} buttons
 * buttons 가 없으면 버튼을 그리지 않는다. 상위뷰에서 그려도 된다. 올바른 방법인지는?
 * render : 템플릿.
 * onClick : 흔히 사용하는 callback이다. click 이벤트로 바인드 한다.
 *
 * @param {Array} searchOptions
 * searchOptions 가 없으면 검색창을 노출하지 않는다. options 는 검색 옵션이다.
 * value : 검색 searchType
 * label : 노출되는 text
 *
 */

define([
    "i18n!nls/commons",
    "i18n!board/nls/board",
    "i18n!task/nls/task",

    "hgn!grid/templates/grid",
    "hgn!grid/templates/grid_list",

    "views/profile_card",
    "grid/views/pagesize",
    "views/pagination"
],
function(
	commonLang,
	boardLang,
	taskLang,

	Template,
	ListTmpl,

	ProfileView,
	PageSizeView,
	PaginationView
) {
	var lang = {
		'search_all' : boardLang['전체기간'],
		'search_month' : boardLang['개월'],
		'search_year' : boardLang['년'],
		'search_input' : boardLang['기간입력'],
		'search' : commonLang['검색']
	};

	return Backbone.View.extend({
		className : "dataTables_wrapper",

		initialize: function(options) {
			this.options = options;
			this.tableClass = options.tableClass || "type_normal dataTable";
			this.trClass = options.trClass || '';
			this.columns = options.columns;
			this.buttons = options.buttons || [];
			this.searchOptions = options.searchOptions || [];
			this.usePeriod = options.usePeriod;
			this.emptyContent = options.emptyContent;
			this.useTableScroll = options.useTableScroll;
			this.useCheckbox = options.checkbox !== false; // 이름 다름 주의.
			this.usePageSize = options.usePageSize !== false;
			this.useTopButton = options.useTopButton !== false;
			this.useBottomButton = options.useBottomButton !== false;
			this.useToolbar = options.useToolbar !== false;
			this.isAdmin = options.isAdmin === true;

			this.collection.on("fetching", this._showProgress, this);
			this.collection.on("sync", this._onSyncCollection, this);
		},

		events: {
			"click #checkAll" : "_checkAll",
			"click #searchBtn" : "_search",
			"click th[data-property]" : "_sorting",
			"change tbody input" : "_toggleCheckAll",
			"change #duration" : "_changeDuration",
			"keypress #searchKeyword" : "_keyEventHandler",
			"click [data-profile]" : "_profile",
			"click [el-checkbox]" : "_onClickCheckbox",
			"click [el-grid-list-item]" : "_onClickGridListItem"
		},

		render: function() {
			this.$el.html(Template({
				tableClass : this.tableClass,
				useCheckbox : this.useCheckbox,
				columns : this.columns,
				useSearch : this.searchOptions.length > 0,
				search : this.searchOptions,
				usePeriod : this.usePeriod,
				lang : lang,
				emptyContent : this.emptyContent,
				useTableScroll: this.useTableScroll,
				useToolbar: this.useToolbar,
				isAdmin : this.isAdmin
			}));

			this.$pageSize = this.$('.optional');

			this._renderListView();
			this._renderPageSizeView();
			this._renderPageView();
			this._markHeader();
			this._renderButton();
			this._setSearchData();

			this.$el.addClass(this.className);

			return this;
		},

		getCheckedData : function() {
			return _.map(this.getCheckedIds(), function(id) {
				return this.collection.get(id).toJSON();
			}, this);
		},

		getCheckedIds : function() {
			return _.map(this.$("input[type=checkbox][data-id]:checked"), function(input) {
				return $(input).attr("data-id");
			});
		},

		_renderListView : function() {
			this.$("tbody").html(ListTmpl({
				trClass: this.trClass,
				useCheckbox : this.useCheckbox,
				columns : this.columns,
				collection : this._parseCollection(),
				columnLength : this.columns.length + (this.useCheckbox ? 1 : 0),
				emptyContent : this.emptyContent || this._defaultEmptyContent()
			}));
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
			this.pageView = new PaginationView({
				pageInfo: this.collection.pageInfo(),
				useBottomButton: this.useBottomButton
			});
			this.pageView.bind("paging", this._selectPage, this);
			this.$("#bottomToolbar").append(this.pageView.render().el);
		},

		_selectPageSize : function(pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.setPageNo(0);
			this.collection.fetch();
			this.$('select[data-el-grid-page-size]').val(pageSize);
		},

		_selectPage : function(page) {
			this.collection.setPageNo(page);
			this.collection.fetch();
			this._scrollTop();
			this.$el.trigger('selectPage', page);
		},

		_checkAll : function(e) {
    		var isChecked = $(e.currentTarget).is(":checked");
    		this.$("input[type=checkbox]").prop("checked", isChecked);
		},

		_toggleCheckAll : function() {
			var isCheckAll = true;
			_.each(this.$("tbody").find("input"), function(input) {
				if (!$(input).is(":checked")) isCheckAll = false;
			});

			this.$("#checkAll").prop("checked", isCheckAll);
		},

		_onClickCheckbox : function(e) {
			e.stopPropagation();
		},

		_sorting : function(e) {
			if (this.isFetching) return;

			_.each(this.$("th[el-sortable]"), function(el) {
				$(el).attr("class", $(el).attr("el-sortable"));
			}, this);

			var target = $(e.currentTarget);
			var property = target.attr("data-property");
			var direction = target.attr("data-direction") == "asc" ? "desc" : "asc";
			target.attr("data-direction", direction);
			target.removeClass("sorting");
			target.addClass("sorting_" + direction);

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

		_changeDuration : function() {
			var duration = this.$("#duration").val();

			if (duration == "period") {
				this._showDurationPeriod();
			} else {
				this.$("#durationPeriod").hide();
				this.collection.setDuration(duration);
			}

		},

		_showDurationPeriod : function() {
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

		_keyEventHandler : function(e) {
			if (e.which == 13) this._search();
		},

		_search : function() {
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

    	_setDuration : function() {
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

		_markHeader : function() {
			var target = this.$("th[data-property='" + this.collection.property + "']");
			target.attr("data-direction", this.collection.direction);
			target.removeClass("sorting");
			target.addClass("sorting_" + this.collection.direction);
		},

		_setSearchData : function() {
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

		_renderButton : function() {
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

		_showProgress : function() {
			this.$("#processing").show();
		},


		hideProgress : function() {
			this.$("#processing").hide();
		},

		_uncheck : function() {
			this.$("#checkAll").prop("checked", false);
		},

		_drawCallback : function() {
			if (typeof this.options.drawCallback == "function") {
				this.options.drawCallback(this.collection);
			}
		},

		_parseCollection : function() {
			var clone = _.clone(this.collection);
			return _.map(clone.models, function(model) {
				var columns = _.map(this.columns, function(column) {
					return {
						className : column.className,
						data : column.render(model)
					};
				});

				return {
					id : model.id,
					columns : columns
				};
			}, this);
		},

		_profile : function(e) {
			e.stopPropagation();
			var target = e.currentTarget;
			var userId = $(target).attr("data-id");
			if (!userId) return;
			ProfileView.render(userId, target);
		},

		_onSyncCollection : function() {
			this.hideProgress();
			this._renderPageView();
			this._uncheck();
			this._renderListView();
			this._drawCallback();
			this.$el.trigger('renderingComplete');
		},

		_scrollTop : function() {
			$(window).scrollTop(this.$el.offset().top);
		},

		_onClickGridListItem : function(e) {
			var target = $(e.target);
			if (target.is('[data-stop-propagation]') || target.parents('[data-stop-propagation]').length) return;

			var id = $(e.currentTarget).attr("data-id");
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

		_defaultEmptyContent: function() {
			return Hogan.compile([
				'<p class="data_null">',
				'<span class="ic_data_type ic_no_contents"></span>',
				'<span class="txt">{{emptyMessage}}</span>',
				'</p>'
			].join("")).render({
				emptyMessage : taskLang["목록이 없습니다"] // 문구를 결정해서 common에 두자.
			});
		}
	});
});