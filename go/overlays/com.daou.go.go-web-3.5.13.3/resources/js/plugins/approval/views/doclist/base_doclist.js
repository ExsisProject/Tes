// 기안문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "when",
    "approval/models/doc_list_field",
    "approval/views/doclist/doclist_docfiled_setting",
    "hgn!approval/templates/document/doclist_period",
    "hgn!approval/templates/doclist_field_column",
    "hgn!approval/templates/select_all_layout",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
    $, 
    _, 
    Backbone, 
    GO,
    when,
    DocListFieldModel,
    DocListDocFieldSettingView,
    PeriodTpl,
    DocListFieldColumnTpl,
    SelectAllTpl,
    commonLang,
    approvalLang
) {
	
	var PeriodView = Backbone.View.extend({
        initialize: function(options) {
        	this.options = options || {};
    		this.duration = this.options.duration;
    		this.fromDate = this.options.fromDate;
    		this.toDate = this.options.toDate;
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
        
		_changeDuration : function() {
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

    var selectAllLang = {
        'all_select_page' : approvalLang['현재 페이지에 있는 모든 문서들이 선택되었습니다.'],
        'count_msg' : approvalLang['해당 문서함의 모든 문서 0개를 선택메시지'],
        'select_all' : approvalLang['모든 문서 선택'],
        'all_select_folder' : approvalLang['해당 문서함의 모든 문서들이 선택되었습니다.'],
        'cancel_msg' : approvalLang['해당 문서함의 선택 취소메시지'],
        'select_cancel' : approvalLang['선택 해제']
    };

    var BaseDocListView = Backbone.View.extend({
        
    	checkboxColumn : null,
    	toRemoveColumns : null,
        initialize: function(options) {
            this.options = options || {};
            this.toRemoveColumns = this.options.toRemoveColumns || [];
            this.collection.usePeriod = this.usePeriod || false;
        },
        
        events : {
    		'click .btn_search2' : 'search',
            'click p#allSelectMsg3' : 'toggleSelectScope',
    		'keypress input#keyword': 'searchByEnter'
        },
        
        render: function() { //필요하면 ovveride
        	if(this.usePeriod){
                when(this.fetchDocField.call(this)) //super method
                .then(_.bind(this.renderLayout, this)) //to override method
                .then(_.bind(this.renderPeriodView, this))//super method
                .then(_.bind(this.renderDocFieldSettingView, this))//super method
                .then(_.bind(this.renderDocFieldColumnTpl, this))//super method            
                .then(_.bind(this.fetchDocList, this))//super method
                .then(_.bind(this.setInitSort, this))
    			.otherwise(function printError(err) {
                    console.log(err.stack);
                });	
        	}else{
                when(this.fetchDocField.call(this)) //super method
                .then(_.bind(this.renderLayout, this)) //to override method
                .then(_.bind(this.renderDocFieldSettingView, this))//super method
                .then(_.bind(this.renderDocFieldColumnTpl, this))//super method            
                .then(_.bind(this.fetchDocList, this))//super method
                .then(_.bind(this.setInitSort, this))
    			.otherwise(function printError(err) {
                    console.log(err.stack);
                });        		
        	}
        },
        
        renderPeriodView : function(){
        	this.periodView = new PeriodView({
        		duration : this.duration || 'all',
        		fromDate : this.fromDate,
        		toDate : this.toDate
        	});
        	this.periodView.setElement(this.$el.find('.table_search')).render();
        	this.periodView._setDuration();
        },
        
        fetchDocList : function(){
			var deffered = when.defer();
            this.collection.fetch({
            	success : deffered.resolve,
            	error : deffered.reject,
                statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
            });
			return deffered.promise;
        },
        
        fetchDocField : function(){
        	var self = this;
        	this.docFieldModel = new DocListFieldModel({
		    	docFolderType : this.docFolderType
        	});
			var deffered = when.defer();
			this.docFieldModel.fetch({
				success : function(model){
					var collection = model.getCollection();
					self.columns = collection.makeDoclistColumn(self.columns);
					self.sorts = collection.makeDoclistSort();
					if(self.checkboxColumn){
						self.addCheckboxColumn(self.checkboxColumn);
					}
					deffered.resolve();
				},
				error : deffered.reject
			});
			return deffered.promise;
        },
        
        renderDocFieldSettingView : function(){
        	if(this.docFieldModel.isUserType()){
	            new DocListDocFieldSettingView({
	            	docFolderType: this.docFolderType,
	            	targetView : this,
	            	toRemoveColumns : this.toRemoveColumns,
	                appendTarget: this.$el.find('div#docFieldArea')
	            }).render();
        	}
        },
        
        renderDocFieldColumnTpl : function(){
            this.$('#doclist_field_header').html(DocListFieldColumnTpl({
                columns: this.columns,
                sorts: this.sorts,
                checkboxColumn : this.checkboxColumn
            }));
        },
        
        renderLayout : function(){
        	console.log('개별뷰에서 override 한다');
        },
        
        addCheckboxColumn : function(checkboxColumn){
        	this.columns['선택'] = approvalLang['선택'];
			this.columns['count'] = parseInt(this.columns['count']) + 1;
        	this.checkboxColumn.id = checkboxColumn.id;
        	this.checkboxColumn.name = checkboxColumn.name;
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
    		}
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
	    			this.$('#searchtype').val(this.initSearchtype);
	    		}
			}
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

        completeDocumentCount: function() {
            var result;
            $.ajax({
                type: "GET",
                async: false,
                dataType: "json",
                url: this.makeCompleteDocumentCountingUrl(),
                success: function (resp) {
                    result = resp.data.docCount;
                },
                error: function (resp) {
                    $.goError(resp.responseJSON.message);
                }
            });
            return result;
        },

        makeParams : function(){
            var params = {};
            if(!_.isUndefined(this.collection.keyword) && this.collection.keyword.trim().length > 0){
            	params["searchtype"] = this.collection.searchtype;
            	params["keyword"] = this.collection.keyword;
            	
                if(!_.isUndefined(this.collection.duration)){
                	params["duration"] = this.collection.duration;
                    if(this.collection.duration == "period"){
                    	params["fromDate"] = GO.util.toISO8601(this.collection.fromDate);
                        params["toDate"] = GO.util.searchEndDate(this.collection.toDate);
                    }
                }
            }
            return $.param(params);
        },

        renderSelectAllTpl : function(){
            $('.list_approval > tbody').append(SelectAllTpl({
                columnCount: this.columns.count,
                lang : selectAllLang,
                totalCount : GO.i18n(selectAllLang['count_msg'],{"totalCount" : this.completeDocumentTotal})
            }));
        },

        toggleSelectAllTpl : function(isSelect){
            var hasMorePage = this.completeDocumentTotal > this.collection.pageSize || this.completeDocumentTotal > this.collection.getCompletedDocumentCount();
            if(isSelect && hasMorePage){
                $('#allSelectTr').show();
            }else{
                $('#allSelectTr').hide();
                this.toggleSelectAllMsg('folder');
            }
        },

        toggleSelectScope : function(e){
            var target = $(e.target).parent();
            var presentScope = target.attr("data-value");

            if(_.isUndefined(presentScope)){
                return;
            }
            this.toggleSelectAllMsg(presentScope);
        },

        toggleSelectAllMsg: function (presentScope) {
            var allSelectMsg1 = $("#allSelectMsg1").empty();
            var allSelectMsg2 = $("#allSelectMsg2").empty();
            var allSelectMsg3 = $("#allSelectMsg3").find('a').empty();
            if(presentScope == 'page'){
                $("#allSelectMsg3").attr("data-value", "folder");
                allSelectMsg1.append(selectAllLang['all_select_folder']);
                allSelectMsg2.append(selectAllLang['cancel_msg']);
                allSelectMsg3.append(selectAllLang['select_cancel']);
            }else if(presentScope == 'folder'){
                $("#allSelectMsg3").attr("data-value", "page");
                allSelectMsg1.append(selectAllLang['all_select_page']);
                allSelectMsg2.append(GO.i18n(selectAllLang['count_msg'],{"totalCount" : this.completeDocumentTotal}));
                allSelectMsg3.append(selectAllLang['select_all']);
            }
        }
 });
    
    return BaseDocListView;
});