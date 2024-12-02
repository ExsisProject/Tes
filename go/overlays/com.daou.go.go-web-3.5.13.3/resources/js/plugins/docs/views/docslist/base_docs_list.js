define("docs/views/docslist/base_docs_list" , function(require){

    var Backbone = require("backbone");
    
    var DocListItemView = require("docs/views/docslist/doclist_item");
    
    var BaseListTpl = require("hgn!docs/templates/docslist/base_docs_list");
    var DocListEmptyTpl = require("hgn!docs/templates/docslist/docslist_empty");
    var PeriodTpl = require("hgn!approval/templates/document/doclist_period");

    var approvalLang = require("i18n!approval/nls/approval");
    var docsLang = require('i18n!docs/nls/docs');
    var HomeSide = require("docs/views/side");

    var PeriodView = Backbone.View.extend({
        initialize: function(options) {
        	this.options = options || {};
    		this.duration = this.options.duration,
    		this.fromDate = this.options.fromDate,
    		this.toDate = this.options.toDate
        },
        
        events : {
        	"change #duration" : "_changeDuration"
        },
        
        render : function(){
			var lang = {
					'search_all' : approvalLang['전체기간'],
					'search_month' : approvalLang['개월'],
					'search_year' : approvalLang['년'],
					'search_input' : approvalLang['기간입력']
				};
        	this.$el.prepend(PeriodTpl({lang : lang}));
        	this.initDatePicker();
        	return this;
        },
        
        initDatePicker : function(){
        	var self = this;
			$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
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
        
		_changeDuration : function(e) {
			var duration = this.$("#duration").val();
			if (duration == "period") {
				this.$("#durationPeriod").show();
			} else {
				this.$("#durationPeriod").hide();
			}
		},
		
		_setDuration: function() {
			var duration = this.duration;
			var fromDate = this.fromDate;
			var toDate = this.toDate;
			this.$("#duration").val(duration);
			if (duration == "period") {
				this.$("#durationPeriod").show();
				this.$("#fromDate").val(GO.util.toMoment(fromDate).format("YYYY-MM-DD"));
				this.$("#toDate").val(GO.util.toMoment(toDate).format("YYYY-MM-DD"));
			}
		}
	});

    var BaseDocListView = Backbone.View.extend({
    	
    	checkboxColumn : null,
    	
        initialize: function(options) {
            this.options = options || {};
            this.collection = options.collection;
            this.initSearchtype = this.collection.searchtype;
            this.ckeyword = this.collection.keyword;
            this.initProperty = this.collection.property;
            this.initDirection = this.collection.direction;
            this.columns = options.columns;
            this.sorts = options.sorts;
    		this.duration = this.options.duration,
    		this.fromDate = this.options.fromDate,
    		this.toDate = this.options.toDate
            this.usePeriod = options.usePeriod ? options.usePeriod : false;
    		this.usePage = options.usePage ? options.usePage : false;
    		this.checkboxColumn = options.checkboxColumn;
    		this.isCheckboxVisible = options.isCheckboxVisible ? options.isCheckboxVisible : false;
            this.collection.bind('reset', this.generateList, this);
            this.collection.fetch({reset:true});
        },
        events: {
        	'keypress input#keyword': 'searchByEnter',
        	'click .btn_search2' : 'search',
			'click .sorting' : 'sort',
			'click .sorting_desc' : 'sort',
			'click .sorting_asc' : 'sort',
			'click input:checkbox' : 'toggleCheckbox'
        },
        render: function() {
            var lang = {};
        	this.$el.html(BaseListTpl({
        		lang: lang,
        		columns: this.columns,
        		sorts: this.sorts,
        		usePage : this.usePage,
        		checkboxColumn : this.checkboxColumn
        	}));
        	if(this.usePeriod) {
        		this._renderPeriodView();
        	}
        	this.setInitSort();
            return this;
        },
        _renderPeriodView : function() {
        	this.periodView = new PeriodView({
        		duration : this.duration || 'all',
        		fromDate : this.fromDate,
        		toDate : this.toDate
        	});
        	this.periodView.setElement($('.table_search')).render();
        	this.periodView._setDuration();
        },
        generateList: function() {
            var viewEl = this.$el;
            viewEl.find('.list_docs > tbody').empty();
            var columns = this.columns,
            	isCheckboxVisible = this.isCheckboxVisible;
            var listType = "docs";
            var self = this;
            this.collection.each(function(doc){
                doc.folderType = self.collection.folderType;
                var docListItemView = new DocListItemView({
                    model: doc,
                    listType : listType,
                    columns: columns,
                    isCheckboxVisible : isCheckboxVisible
                });
                viewEl.find('.list_docs > tbody').append(docListItemView.render().el);
            });
            if (this.collection.length == 0) {
                viewEl.find('.list_docs > tbody').html(DocListEmptyTpl({
                    columns: columns,
                    lang: { 'doclist_empty': docsLang['문서없음'] }
                }));
            }
        },
		renderPages: function() {
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind('paging', this.selectPage, this);
			this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
			this.$el.find('div.tool_absolute').append(this.pageView.render().el);
		},
        search: function() {
			var searchtype = $('#searchtype').val();
    		var keyword =  $.trim($('#keyword').val());
    		var fromDate, toDate, duration;
    		duration = $("#duration").val();
    		if(this.usePeriod){
    			fromDate = $("#fromDate").val() || "";
    			toDate = $("#toDate").val() || "";
        		if (duration == "period" && (fromDate == "" || toDate == "")) {
        			$.goMessage(approvalLang["검색기간을 입력하세요."]);
        			if (fromDate != "" && toDate == "") {
        				$('#toDate').focus();
        			}
        			if (fromDate == "") {
        				$('#fromDate').focus();
        			}
        			return false;
        		}    			
    		}

    		if($('input#keyword').attr('placeholder') === this.$el.find('input#keyword').val()){
				keyword = '';
			}
    		if( !keyword ){
    			$.goMessage(approvalLang["검색어를 입력하세요."]);
    			$('#keyword').focus();
    			return false;
    		}
    		if (!$.goValidation.isCheckLength(2, 64, keyword)) {
    			$.goMessage(GO.i18n(approvalLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "2","arg2" : "64"}));
    			$('#keyword').focus();
    			return false;
    		}
    		if(this.usePeriod){
    			if(duration == "period"){
        			this.collection.setDuration({
        				duration : duration,
        				fromDate : GO.util.toISO8601(fromDate),
        				toDate : GO.util.searchEndDate(toDate)
        			});
    			}else{
        			this.collection.setDuration({
        				duration : duration
        			});
    			}
    		};
    		this.collection.setSearch(searchtype,keyword);
    		this.collection.fetch();
		},


		// 엔터 검색
		searchByEnter: function(e) {
	    	if (e.keyCode != 13) return;
			if(e){
				e.preventDefault();
			}
	    	$(e.currentTarget).focusout().blur();    	
	    	this.search();
	    },
	    // 정렬
		sort: function(e){
    		var id = '#'+$(e.currentTarget).attr('id');
    		var property = $(id).attr('sort-id');
    		var direction= 'desc';
    		var removeClassName = "";
    		var addClassName = "";
    		if ( $(id).hasClass('sorting')) {
    			removeClassName = 'sorting';
    			addClassName = 'sorting_desc';
    		}
    		if ( $(id).hasClass('sorting_desc')) {
    			removeClassName = 'sorting_desc';
    			addClassName = 'sorting_asc';
    			direction= 'asc';
    		}
    		if ( $(id).hasClass('sorting_asc')) {
    			removeClassName = 'sorting_asc';
    			addClassName = 'sorting_desc';
    		}
    		$(id).removeClass(removeClassName).addClass(addClassName);
    		var sortPart = this.$el.find('th');
    		sortPart.each(function(){
    			if( !$(this).hasClass('sorting_disabled') && ( '#'+$(this).attr('id') != id )) {
    				$(this).removeClass('sorting').addClass('sorting');
    				$(this).removeClass('sorting_desc').addClass('sorting');
    				$(this).removeClass('sorting_asc').addClass('sorting');
    			} 
    		});
    		this.collection.setSort(property,direction);
    		this.collection.fetch();
    	},
    	//  초기sort 표기
	    setInitSort: function(){
			var property = this.initProperty;
			var direction = this.initDirection;
			if(property && direction){
				var dataId = null;
				var sortPart = this.$el.find('th');
	    		sortPart.each(function(){
	    			if ( $(this).attr('sort-id') == property ) {
	    				dataId = $(this).attr('id');
	    			} 
	    			if( !$(this).hasClass('sorting_disabled') ) {
	    				$(this).removeClass('sorting').addClass('sorting');
	    				$(this).removeClass('sorting_desc').addClass('sorting');
	    				$(this).removeClass('sorting_asc').addClass('sorting');
	    			} 
	    		});
	    		$("#"+dataId).removeClass('sorting').addClass('sorting_'+direction);
	    		$('#keyword').val(this.ckeyword);
	    		if(this.initSearchtype){
	    			$('#searchtype').val(this.initSearchtype);
	    		}
			}
		},
		toggleCheckbox: function(e) {
			var checkboxColumnId = this.checkboxColumn.id,
				checkboxColumnName = this.checkboxColumn.name;
			
			var $target = $(e.currentTarget),
	            $checkAllBox = $('input#' + checkboxColumnId),
	            targetChecked = $target.is(':checked');
	        
	        if ($target.attr('id') == $checkAllBox.attr('id')) {
	            $('input[type="checkbox"][name="checkbox"]').attr('checked', targetChecked);
	        }
	        
	        if ($target.hasClass('doclist_item_checkbox')) {
	            if (!targetChecked) {
	                $checkAllBox.attr('checked', targetChecked);
	            }
	        }
		},

		_renderSide: function (layoutView) {
			this.sideView = new HomeSide({});
			if(!layoutView.getSideElement().find(".docs_side").length){

				layoutView.getSideElement().empty().append(this.sideView.el);
				this.sideView.render();
			}else{
				this.sideView.refreshWaitingCount();
			}
		}
    });

    return BaseDocListView;
});